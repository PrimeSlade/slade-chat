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
  Put,
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
  UpdateMessageBodyDto,
  updateMessageBodySchema,
  UpdateMessageDto,
  Message,
  MessageWithSender,
} from '../shared';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ControllerResponse } from 'src/common/types/responce.type';
import { HttpRoomGuard } from 'src/common/guards/http-room.guard';
import { MessageSenderGuard } from 'src/common/guards/message-sender.guard';

@UseGuards(HttpRoomGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('room/:roomId')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query(new ZodValidationPipe(getMessagesBodySchema))
    query: GetMessagesBodyDto,
  ): Promise<ControllerResponse<MessageWithSender[]>> {
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
  ): Promise<ControllerResponse<MessageWithSender>> {
    const message = await this.messagesService.createMessage({
      senderId: session.user.id,
      ...body,
      roomId,
    });

    return { data: message, message: 'Message created sucessfully' };
  }

  @UseGuards(MessageSenderGuard)
  @Patch('room/:roomId/:messageId')
  async updateMessage(
    @Param('roomId') roomId: string,
    @Param('messageId') messageId: string,
    @Body(new ZodValidationPipe(updateMessageBodySchema))
    body: UpdateMessageBodyDto,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<MessageWithSender>> {
    const updateData: UpdateMessageDto = {
      roomId,
      messageId,
      ...body,
    };

    const message = await this.messagesService.updateMessage(
      updateData,
      session.user.id,
    );

    return { data: message, message: 'Message updated sucessfully' };
  }
}
