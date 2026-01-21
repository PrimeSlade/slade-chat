import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { GetMessagesDto, Message, MessageWithSender } from 'src/shared';
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

    this.eventEmitter.emit('message.created', message.roomId, message);

    return message;
  }
}
