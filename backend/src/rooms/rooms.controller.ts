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
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UserSession } from '@thallesp/nestjs-better-auth';
import {
  ResponseType,
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
} from 'src/shared';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {}

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
