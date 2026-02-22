import { Controller, Get, Post, Body, Param, Session } from '@nestjs/common';
import { RoomsService } from './rooms.service';

import { UserSession } from '@thallesp/nestjs-better-auth';
import {
  Room,
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
  CreateDirectRoomDto,
  createDirectRoomSchema,
  CreateGroupRoomDto,
  createGroupRoomSchema,
  RoomWithParticipantStatus,
  InviteCandidateUser,
  addRoomMembersSchema,
  AddRoomMembersDto,
  AddRoomMembersResult,
} from 'src/shared';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { ControllerResponse } from 'src/common/types/responce.type';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('direct-room')
  async createDirectRoom(
    @Body(new ZodValidationPipe(createDirectRoomSchema))
    body: CreateDirectRoomDto,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Room | RoomParticipantWithRoomByUserId>> {
    const room = await this.roomsService.createDirectRoom(
      body,
      session.user.id,
    );

    return { data: room, message: 'Room created successfully' };
  }

  @Post('group-room')
  async createGroupRoom(
    @Body(new ZodValidationPipe(createGroupRoomSchema))
    body: CreateGroupRoomDto,
    @Session() session: UserSession,
  ) {
    const room = await this.roomsService.createGroupRoom(body, session.user.id);
    return { data: room, message: 'Group room created successfully' };
  }

  @Get(':roomId/invite-candidates')
  async getInviteCandidates(
    @Param('roomId') roomId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<InviteCandidateUser[]>> {
    const candidates = await this.roomsService.getInviteCandidates(
      roomId,
      session.user.id,
    );

    return {
      data: candidates,
      message: 'Invite candidates fetched successfully',
    };
  }

  @Post(':roomId/members')
  async addMembers(
    @Param('roomId') roomId: string,
    @Body(new ZodValidationPipe(addRoomMembersSchema)) body: AddRoomMembersDto,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<AddRoomMembersResult>> {
    const result = await this.roomsService.addMembersToRoom(
      roomId,
      body,
      session.user.id,
    );

    return { data: result, message: 'Room members added successfully' };
  }

  @Get('me')
  async getRooms(
    @Session() session: UserSession,
  ): Promise<ControllerResponse<RoomParticipantWithRoom[]>> {
    const rooms = await this.roomsService.getRooms(session.user.id);

    return { data: rooms, message: 'Rooms fetched successfully' };
  }

  @Get('me/:roomId')
  async getMyRoomByRoomId(
    @Param('roomId') roomId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<RoomWithParticipantStatus>> {
    const room = await this.roomsService.getMyRoomByRoomId(
      session.user.id,
      roomId,
    );

    return { data: room, message: 'Room fetched successfully' };
  }

  @Get(':userId')
  async getRoomByUserId(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<RoomParticipantWithRoomByUserId | null>> {
    const room = await this.roomsService.getRoomByUserId(
      session.user.id,
      userId,
    );

    return { data: room, message: 'Room fetched successfully' };
  }
}
