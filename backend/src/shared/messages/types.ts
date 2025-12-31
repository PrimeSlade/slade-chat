import { Prisma } from 'generated/prisma/client';

export type { Message } from 'generated/prisma/client';

export type MessageWithSender = Prisma.MessageGetPayload<{
  include: {
    sender: true;
  };
}>;
