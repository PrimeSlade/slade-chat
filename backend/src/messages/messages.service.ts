import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import {
  GetMessagesDto,
  Message,
  MessageWithSender,
  UpdateMessageDto,
} from 'src/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getMessages(query: GetMessagesDto): Promise<{
    messages: MessageWithSender[];
    nextCursor: string | null;
  }> {
    return this.messagesRepository.getMessages(query);
  }

  async createMessage(data: {
    content: string;
    senderId: string;
    roomId: string;
  }): Promise<MessageWithSender> {
    const message = await this.messagesRepository.createMessage(data);

    this.eventEmitter.emit('message_created', message.roomId, message);

    return message;
  }

  async getMessageByMessageId(messageId: string): Promise<Message | null> {
    return this.messagesRepository.getMessageByMessageId(messageId);
  }

  async updateMessage(
    data: UpdateMessageDto,
    senderId: string,
  ): Promise<MessageWithSender> {
    const message = await this.messagesRepository.updateMessage(
      data,
      senderId,
    );

    // TODO: Emit event for message update
    // this.eventEmitter.emit('message_updated', message.roomId, message);

    return message;
  }
}
