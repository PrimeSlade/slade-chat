"use client";
import { FriendBox, Status } from "@/components/people/friend-box";
import { useFriends } from "@/hooks/use-friends";
import { useSession } from "@/lib/auth-client";
import { chooseFriends } from "@/lib/hanldeFriends";

export default function FriendPage() {
  const { data: friendData, isLoading } = useFriends();
  const { data: session, isPending, error } = useSession();

  if (!session) return null;

  const friends = chooseFriends({
    userId: session?.user.id!,
    friends: friendData!.data,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {friends.map((friend) => (
        <FriendBox key={friend.id} user={friend} variant="friend" />
      ))}
    </div>
  );
}
