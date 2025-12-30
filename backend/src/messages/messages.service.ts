import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { GetMessagesDto, Message } from 'src/shared';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getMessages(query: GetMessagesDto): Promise<{
    messages: Message[];
    nextCursor: string | null;
  }> {
    return this.messagesRepository.getMessages(query);
  }

  async createMessage(data: {
    content: string;
    senderId: string;
    roomId: string;
  }): Promise<Message> {
    const message = await this.messagesRepository.createMessage(data);

    this.chatGateway.server
      .to(message.roomId)
      .emit('new_message', { data: message });

    return message;
  }
}
