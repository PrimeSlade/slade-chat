import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  CreateMessageBodyDto,
  createMessageBodySchema,
  CreateMessageDto,
  createMessageSchema,
  GetMessagesBodyDto,
  getMessagesBodySchema,
  GetMessagesDto,
  getMessagesSchema,
  Message,
} from '../shared';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { RoomGuard } from './guards/room.guard';
import { ControllerResponse } from 'src/common/types/responce.type';

@UseGuards(RoomGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('room/:roomId')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query(new ZodValidationPipe(getMessagesBodySchema))
    query: GetMessagesBodyDto,
  ): Promise<ControllerResponse<Message[]>> {
    const { messages, nextCursor } = await this.messagesService.getMessages({
      roomId,
      ...query,
    });
    return {
      data: messages,
      message: 'Messages fetched sucessfully',
      pagination: {
        nextCursor,
      },
    };
  }

  @Post('room/:roomId')
  async createMessage(
    @Param('roomId') roomId: string,
    @Body(new ZodValidationPipe(createMessageBodySchema))
    body: CreateMessageBodyDto,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Message>> {
    const message = await this.messagesService.createMessage({
      senderId: session.user.id,
      ...body,
      roomId,
    });

    return { data: message, message: 'Message created sucessfully' };
  }
}
