import { BadRequestException, Injectable } from '@nestjs/common';

import { RoomsReposiory } from './rooms.repository';
import {
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
  Room,
} from 'src/shared';
import { CreateDirectRoomDto } from './dto/create-room.dto';
import { MessagesRepository } from 'src/messages/messages.repository';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomsRepository: RoomsReposiory,
    private readonly messagesRepositroy: MessagesRepository,
  ) {}

  async createDirectRoom(
    data: CreateDirectRoomDto,
    myId: string,
  ): Promise<Room | RoomParticipantWithRoomByUserId> {
    const existingRoom = await this.roomsRepository.findRoomByUserId(
      myId,
      data.otherId,
    );

    if (existingRoom) {
      await this.messagesRepositroy.createMessage({
        content: data.content,
        senderId: myId,
        roomId: existingRoom.roomId,
      });

      return existingRoom;
    }

    if (myId === data.otherId) {
      throw new BadRequestException('Cannot create room with yourself');
    }

    return this.prismaService.$transaction(async (trx) => {
      const room = await this.roomsRepository.createDirectRoom(
        {
          myId,
          otherId: data.otherId,
        },
        trx,
      );

      await this.messagesRepositroy.createMessage(
        {
          content: data.content,
          senderId: myId,
          roomId: room.id,
        },
        trx,
      );

      return room;
    });
  }

  async getRooms(myId: string): Promise<RoomParticipantWithRoom[]> {
    return this.roomsRepository.findRooms(myId);
  }

  async getRoomByUserId(
    myId: string,
    userId: string,
  ): Promise<RoomParticipantWithRoomByUserId | null> {
    return this.roomsRepository.findRoomByUserId(myId, userId);
  }
}
