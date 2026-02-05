import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RoomType } from 'generated/prisma/enums';

import { PrismaService } from 'src/prisma.service';
import {
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
  Room,
  RoomParticipantWithRoomByRoomId,
  CreateGroupRoomDto,
  RoomIdsByUserId,
  RoomParticipantsByRoomId,
  RoomParticipant,
} from 'src/shared';

@Injectable()
export class RoomsReposiory {
  constructor(private readonly prismaService: PrismaService) {}

  async findRooms(myId: string): Promise<RoomParticipantWithRoom[]> {
    return this.prismaService.roomParticipant.findMany({
      where: {
        userId: myId,
      },
      orderBy: {
        room: {
          updatedAt: 'desc',
        },
      },
      take: 50,
      include: {
        room: {
          include: {
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            participants: {
              where: {
                userId: { not: myId },
              },
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findMyRoombyRoomId(
    myId: string,
    roomId: string,
  ): Promise<RoomParticipantWithRoomByRoomId> {
    return this.prismaService.roomParticipant.findFirstOrThrow({
      where: {
        userId: myId,
        roomId,
      },
      include: {
        room: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
      },
    });
  }

  async findRoomByUserId(
    myId: string,
    userId: string,
  ): Promise<RoomParticipantWithRoomByUserId | null> {
    return this.prismaService.roomParticipant.findFirst({
      where: {
        userId: myId,
        room: {
          type: RoomType.DIRECT,
          participants: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        room: {
          include: {
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            participants: {
              where: {
                userId,
              },
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findRoomIdsByUserId(userId: string): Promise<RoomIdsByUserId[]> {
    return this.prismaService.roomParticipant.findMany({
      where: {
        userId,
      },
      select: {
        roomId: true,
      },
    });
  }

  async findRoomParticipantsByRoomId(
    roomId: string,
    myId: string,
  ): Promise<RoomParticipantsByRoomId[]> {
    return this.prismaService.roomParticipant.findMany({
      where: {
        roomId,
        userId: { not: myId },
      },
      select: {
        userId: true,
      },
    });
  }

  async createDirectRoom(
    data: { myId: string; otherId: string },
    trx?: Prisma.TransactionClient,
  ): Promise<Room> {
    const db = trx || this.prismaService;

    return db.room.create({
      data: {
        type: RoomType.DIRECT,
        participants: {
          create: [{ userId: data.myId }, { userId: data.otherId }],
        },
      },
    });
  }

  async createGroupRoom(data: CreateGroupRoomDto, myId: string): Promise<Room> {
    const allParticipantIds = [myId, ...data.friendIds];

    return this.prismaService.room.create({
      data: {
        type: RoomType.GROUP,
        name: data.groupName,
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
      },
    });
  }

  async updateLastReadAt(
    userId: string,
    roomId: string,
    lastReadAt: Date,
  ): Promise<RoomParticipant> {
    return this.prismaService.roomParticipant.update({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
      data: {
        lastReadAt,
      },
    });
  }
}
