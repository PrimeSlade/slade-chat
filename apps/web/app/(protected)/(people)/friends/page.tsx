"use client";
import { FriendBox } from "@/components/people/friend-box";
import { useFriends, useFriendsStatus } from "@/hooks/use-friends";
import { useSession } from "@/lib/auth-client";
import { chooseFriends } from "@/lib/hanldeFriends";

export default function FriendPage() {
  const { data: friendData } = useFriends();
  const { data: userStatuses } = useFriendsStatus();

  const { data: session } = useSession();

  if (!session || !friendData?.data) return null;

  const friends = chooseFriends({
    userId: session.user.id,
    friends: friendData.data,
  });

  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center h-full mt-90">
        <p className="text-muted-foreground">You have no friends yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {friends.map((friend) => {
        const userStatus = userStatuses?.data?.find(
          (status) => status.userId === friend.id
        );

        return (
          <FriendBox
            key={friend.id}
            user={friend}
            variant="friend"
            status={userStatus?.status}
          />
        );
      })}
    </div>
  );
}
