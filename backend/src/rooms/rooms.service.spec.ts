import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessagesRepository } from 'src/messages/messages.repository';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { RoomsReposiory } from './rooms.repository';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
        {
          provide: RoomsReposiory,
          useValue: {},
        },
        {
          provide: MessagesRepository,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {
            findFriends: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
