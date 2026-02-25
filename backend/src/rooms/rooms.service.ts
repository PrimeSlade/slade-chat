import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RoomsReposiory } from './rooms.repository';
import {
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
  Room,
  CreateDirectRoomDto,
  RoomParticipantWithRoomByRoomId,
  CreateGroupRoomDto,
  RoomIdsByUserId,
  RoomWithParticipantStatus,
  RoomParticipantsByRoomId,
  RoomParticipant,
  InviteCandidateUser,
  AddRoomMembersResult,
  AddRoomMembersDto,
} from 'src/shared';
import { MessagesRepository } from 'src/messages/messages.repository';
import { PrismaService } from 'src/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { transformSoftDeletedMessage } from 'src/common/helpers/soft-delete.helper';
import { RoomType } from 'generated/prisma/enums';
import { UsersService } from 'src/users/users.service';
import { extractFriendIds } from 'src/common/helpers/friendship.helper';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomsRepository: RoomsReposiory,
    private readonly messagesRepositroy: MessagesRepository,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
      const message = await this.messagesRepositroy.createMessage({
        content: data.content,
        senderId: myId,
        roomId: existingRoom.roomId,
      });

      this.eventEmitter.emit('message_created', existingRoom.roomId, message);

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

      const message = await this.messagesRepositroy.createMessage(
        {
          content: data.content,
          senderId: myId,
          roomId: room.id,
        },
        trx,
      );

      //web socket
      // console.log(`📤 Emitting new_message to room: ${room.id}`, message);

      this.eventEmitter.emit('message_created', room.id, message);
      this.eventEmitter.emit('room_created', data.otherId);

      return room;
    });
  }

  async getRooms(myId: string): Promise<RoomParticipantWithRoom[]> {
    const rooms = await this.roomsRepository.findRooms(myId);

    // Transform soft-deleted messages
    return rooms.map((room) => ({
      ...room,
      room: {
        ...room.room,
        messages: room.room.messages.map(transformSoftDeletedMessage),
      },
    }));
  }

  async getMyRoomByRoomId(
    myId: string,
    roomId: string,
  ): Promise<RoomWithParticipantStatus> {
    const data = await this.roomsRepository.findMyRoombyRoomId(myId, roomId);

    const memberIds = data.room.participants.map(
      (participant) => `user:${participant.userId}:count`,
    );

    const counts = await this.cacheManager.mget(memberIds);

    const participantsWithStatus = data.room.participants.map(
      (participant, i) => {
        const count = (counts[i] as number) ?? 0;

        const status: 'online' | 'offline' = count >= 1 ? 'online' : 'offline';

        return {
          ...participant,
          user: {
            ...participant.user,
            status,
          },
        };
      },
    );

    return {
      ...data,
      room: {
        ...data.room,
        participants: participantsWithStatus,
      },
    };
  }

  async getRoomByUserId(
    myId: string,
    userId: string,
  ): Promise<RoomParticipantWithRoomByUserId | null> {
    return this.roomsRepository.findRoomByUserId(myId, userId);
  }

  async getRoomIdsByUserId(userId: string): Promise<RoomIdsByUserId[]> {
    return this.roomsRepository.findRoomIdsByUserId(userId);
  }

  async getRoomParticipantsByRoomId(
    roomId: string,
    myId: string,
  ): Promise<RoomParticipantsByRoomId[]> {
    return this.roomsRepository.findRoomParticipantsByRoomId(roomId, myId);
  }

  async createGroupRoom(data: CreateGroupRoomDto, myId: string): Promise<Room> {
    const createdRoom = await this.roomsRepository.createGroupRoom(data, myId);

    this.eventEmitter.emit('room_created', data.friendIds);

    return createdRoom;
  }

  async getInviteCandidates(
    roomId: string,
    myId: string,
  ): Promise<InviteCandidateUser[]> {
    //check existing users
    const roomData = await this.roomsRepository.findMyRoombyRoomId(
      myId,
      roomId,
    );

    if (roomData.room.type !== RoomType.GROUP) {
      throw new BadRequestException('Invite is only available for group rooms');
    }

    const participantIds = new Set(
      roomData.room.participants.map((participant) => participant.userId),
    );

    const friendships = await this.usersService.findFriends(myId);
    const friendIds = extractFriendIds(friendships, myId);

    const eligibleIds = friendIds.filter(
      (friendId) => !participantIds.has(friendId),
    );

    if (eligibleIds.length === 0) return [];

    return this.roomsRepository.findUsersByIds(eligibleIds);
  }

  async addMembersToRoom(
    roomId: string,
    data: AddRoomMembersDto,
    myId: string,
  ): Promise<AddRoomMembersResult> {
    const roomData = await this.roomsRepository.findMyRoombyRoomId(
      myId,
      roomId,
    );

    if (roomData.room.type !== RoomType.GROUP) {
      throw new BadRequestException(
        'Adding members is only available for group rooms',
      );
    }

    const existingMemberIds = new Set(
      roomData.room.participants.map((participant) => participant.userId),
    );

    //Already in room
    const alreadyMemberIds = data.memberIds.filter((id) =>
      existingMemberIds.has(id),
    );

    //Not in room yet
    const candidateIds = data.memberIds.filter(
      (id) => !existingMemberIds.has(id),
    );

    if (candidateIds.length === 0) {
      return {
        addedIds: [],
        alreadyMemberIds,
      };
    }

    const friendships = await this.usersService.findFriends(myId);
    const friendIds = extractFriendIds(friendships, myId);

    const friendIdSet = new Set(friendIds);
    const eligibleFriendIds = candidateIds.filter((id) => friendIdSet.has(id));

    if (eligibleFriendIds.length > 0) {
      await this.roomsRepository.createRoomParticipants(
        roomId,
        eligibleFriendIds,
      );

      this.eventEmitter.emit('room_created', eligibleFriendIds);
    }

    return {
      addedIds: eligibleFriendIds,
      alreadyMemberIds,
    };
  }

  async updateLastReadAt(
    userId: string,
    roomId: string,
    lastReadAt: Date,
  ): Promise<RoomParticipant> {
    return this.roomsRepository.updateLastReadAt(userId, roomId, lastReadAt);
  }
}
