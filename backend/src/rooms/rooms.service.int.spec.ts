import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { FriendStatus, RoomType } from '../../generated/prisma/enums';
import { MessagesRepository } from 'src/messages/messages.repository';
import { PrismaService } from 'src/prisma.service';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';
import { RoomsReposiory } from './rooms.repository';
import { RoomsService } from './rooms.service';

describe('RoomsService integration (addMembersToRoom)', () => {
  const suitePrefix = `rooms-add-members-int-${Date.now()}`;

  const createUser = async (
    prisma: PrismaService,
    id: string,
  ): Promise<void> => {
    await prisma.user.create({
      data: {
        id,
        name: `name-${id}`,
        email: `${id}@test.local`,
        username: `username-${id}`,
      },
    });
  };

  const createRoom = async (
    prisma: PrismaService,
    roomId: string,
    type: RoomType,
    participantIds: string[],
  ): Promise<void> => {
    await prisma.room.create({
      data: {
        id: roomId,
        type,
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
    });
  };

  const cleanupByPrefix = async (
    prisma: PrismaService,
    prefix: string,
  ): Promise<void> => {
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: { startsWith: prefix } },
          { roomId: { startsWith: prefix } },
        ],
      },
    });

    await prisma.roomParticipant.deleteMany({
      where: {
        OR: [
          { userId: { startsWith: prefix } },
          { roomId: { startsWith: prefix } },
        ],
      },
    });

    await prisma.room.deleteMany({
      where: {
        id: { startsWith: prefix },
      },
    });

    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { senderId: { startsWith: prefix } },
          { receiverId: { startsWith: prefix } },
        ],
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { startsWith: prefix },
      },
    });
  };

  let module: TestingModule;
  let service: RoomsService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let caseCounter = 0;
  let isDbConnected = false;

  const nextPrefix = (): string => {
    caseCounter += 1;
    return `${suitePrefix}-${caseCounter}`;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        PrismaService,
        RoomsReposiory,
        UsersRepository,
        UsersService,
        RoomsService,
        {
          provide: MessagesRepository,
          useValue: {
            createMessage: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            mget: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for integration test');
    }
    await prismaService.$connect();
    isDbConnected = true;
  });

  afterAll(async () => {
    if (isDbConnected) {
      await cleanupByPrefix(prismaService, suitePrefix);
      await prismaService.$disconnect();
    }
    await module.close();
  });

  it('returns addedIds: [] and alreadyMemberIds when candidateIds is empty', async () => {
    const prefix = nextPrefix();
    const myId = `${prefix}-owner`;
    const existingMemberId = `${prefix}-existing-member`;
    const roomId = `${prefix}-group-room`;

    await createUser(prismaService, myId);
    await createUser(prismaService, existingMemberId);
    await createRoom(prismaService, roomId, RoomType.GROUP, [
      myId,
      existingMemberId,
    ]);

    const result = await service.addMembersToRoom(
      roomId,
      { memberIds: [existingMemberId] },
      myId,
    );

    expect(result).toEqual({
      addedIds: [],
      alreadyMemberIds: [existingMemberId],
    });
  });

  it('throws BadRequestException for non-group rooms', async () => {
    const prefix = nextPrefix();
    const myId = `${prefix}-owner`;
    const otherMemberId = `${prefix}-direct-member`;
    const roomId = `${prefix}-direct-room`;

    await createUser(prismaService, myId);
    await createUser(prismaService, otherMemberId);
    await createRoom(prismaService, roomId, RoomType.DIRECT, [
      myId,
      otherMemberId,
    ]);

    try {
      await service.addMembersToRoom(
        roomId,
        { memberIds: [otherMemberId] },
        myId,
      );
      fail('Expected addMembersToRoom to throw BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).message).toBe(
        'Adding members is only available for group rooms',
      );
    }
  });

  it('creates members and returns created ids in addedIds', async () => {
    const prefix = nextPrefix();
    const myId = `${prefix}-owner`;
    const existingMemberId = `${prefix}-existing-member`;
    const eligibleFriendId = `${prefix}-eligible-friend`;
    const nonFriendId = `${prefix}-not-friend`;
    const roomId = `${prefix}-group-room`;

    await createUser(prismaService, myId);
    await createUser(prismaService, existingMemberId);
    await createUser(prismaService, eligibleFriendId);
    await createUser(prismaService, nonFriendId);

    await prismaService.friendship.create({
      data: {
        senderId: myId,
        receiverId: eligibleFriendId,
        status: FriendStatus.ACCEPTED,
      },
    });

    await createRoom(prismaService, roomId, RoomType.GROUP, [
      myId,
      existingMemberId,
    ]);

    const result = await service.addMembersToRoom(
      roomId,
      { memberIds: [eligibleFriendId, nonFriendId] },
      myId,
    );

    expect(result).toEqual({
      addedIds: [eligibleFriendId],
      alreadyMemberIds: [],
    });

    const roomParticipants = await prismaService.roomParticipant.findMany({
      where: { roomId },
      select: { userId: true },
    });

    const participantIds = roomParticipants
      .map((participant) => participant.userId)
      .sort();

    expect(participantIds).toEqual(
      [myId, existingMemberId, eligibleFriendId].sort(),
    );
  });
});
