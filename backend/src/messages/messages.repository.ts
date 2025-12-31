import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { GetMessagesDto, Message, MessageWithSender } from '../shared';

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
    data: { content: string; senderId: string; roomId: string },
    trx?: Prisma.TransactionClient,
  ): Promise<Message> {
    const db = trx || this.prismaService;

    return db.message.create({
      data: {
        ...data,
      },
    });
  }
}
