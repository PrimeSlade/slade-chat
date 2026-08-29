import { Prisma } from 'generated/prisma/client';

export type { User, Friendship } from 'generated/prisma/client';

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

export type UserStatus = {
  userId: string;
  status: 'online' | 'offline';
};
