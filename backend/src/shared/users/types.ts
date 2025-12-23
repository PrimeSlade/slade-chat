import { Prisma } from 'generated/prisma/client';

export type { User } from 'generated/prisma/client';
export type { Friendship } from 'generated/prisma/client';

export type FriendshipWithUsers = Prisma.FriendshipGetPayload<{
  include: {
    sender: true;
    receiver: true;
  };
}>;

export type FriendshipWithSenders = Prisma.FriendshipGetPayload<{
  include: {
    sender: true;
  };
}>;
