import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsReposiory } from './rooms.repository';
import {
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
} from 'src/shared';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsReposiory) {}

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
