import { FriendshipWithUsers } from "@backend/shared";

interface chooseFriendsProps {
  userId: string;
  friends: FriendshipWithUsers[];
}

export const chooseFriends = ({ userId, friends }: chooseFriendsProps) => {
  return friends.map((friend) =>
    friend.receiverId === userId ? friend.sender : friend.receiver
  );
};
