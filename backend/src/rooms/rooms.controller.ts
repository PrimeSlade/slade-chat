import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Session,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';

import { UserSession } from '@thallesp/nestjs-better-auth';
import {
  ResponseType,
  Room,
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
} from 'src/shared';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import {
  CreateDirectRoomDto,
  createDirectRoomSchema,
} from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('direct-room')
  async createDirectRoom(
    @Body(new ZodValidationPipe(createDirectRoomSchema))
    body: CreateDirectRoomDto,
    @Session() session: UserSession,
  ): Promise<ResponseType<Room | RoomParticipantWithRoomByUserId>> {
    const room = await this.roomsService.createDirectRoom(
      body,
      session.user.id,
    );

    return { data: room, message: 'Room created successfully' };
  }

  @Get('me')
  async getRooms(
    @Session() session: UserSession,
  ): Promise<ResponseType<RoomParticipantWithRoom[]>> {
    const rooms = await this.roomsService.getRooms(session.user.id);

    return { data: rooms, message: 'Rooms fetched successfully' };
  }

  @Get(':userId')
  async getRoomByUserId(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ResponseType<RoomParticipantWithRoomByUserId | null>> {
    const room = await this.roomsService.getRoomByUserId(
      session.user.id,
      userId,
    );

    return { data: room, message: 'Room fetched successfully' };
  }
}
