import { Friendship } from 'generated/prisma/client';

export const extractFriendIds = (
  friendships: Friendship[],
  myId: string,
): string[] => {
  return friendships.map((relation) =>
    relation.senderId === myId ? relation.receiverId : relation.senderId,
  );
};
