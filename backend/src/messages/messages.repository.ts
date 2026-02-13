import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  CreateMessageDto,
  GetMessagesDto,
  Message,
  MessageWithSender,
  UpdateMessageDto,
} from '../shared';

@Injectable()
export class MessagesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getMessages({ roomId, cursor, limit }: GetMessagesDto): Promise<{
    messages: MessageWithSender[];
    nextCursor: string | null;
  }> {
    const messages = await this.prismaService.message.findMany({
      where: {
        roomId,
      },
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        sender: true,
        parent: {
          include: {
            sender: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    let hasNextPage = messages.length > limit;

    let nextCursor: string | null = null;

    if (hasNextPage) {
      nextCursor = messages.pop()!.id;
    }

    return {
      messages,
      nextCursor,
    };
  }

  async createMessage(
    data: CreateMessageDto,
    trx?: Prisma.TransactionClient,
  ): Promise<MessageWithSender> {
    const db = trx || this.prismaService;

    return db.message.create({
      data: {
        ...data,
      },
      include: {
        sender: true,
        parent: {
          include: {
            sender: true,
          },
        },
      },
    });
  }

  async getMessageByMessageId(messageId: string): Promise<Message | null> {
    return this.prismaService.message.findUnique({
      where: {
        id: messageId,
      },
    });
  }

  async updateMessage(data: UpdateMessageDto): Promise<MessageWithSender> {
    return this.prismaService.message.update({
      where: {
        id: data.messageId,
        senderId: data.senderId,
        roomId: data.roomId,
      },
      data: {
        content: data.content,
        parentId: data.parentId,
      },
      include: {
        sender: true,
        parent: {
          include: {
            sender: true,
          },
        },
      },
    });
  }

  async softDeleteMessage(
    messageId: string,
    roomId: string,
    senderId: string,
    trx?: Prisma.TransactionClient,
  ): Promise<MessageWithSender> {
    const db = trx || this.prismaService;

    return db.message.update({
      where: {
        id: messageId,
        senderId: senderId,
        roomId: roomId,
      },
      data: {
        deletedAt: new Date(),
      },
      include: {
        sender: true,
        parent: {
          include: {
            sender: true,
          },
        },
      },
    });
  }
}
