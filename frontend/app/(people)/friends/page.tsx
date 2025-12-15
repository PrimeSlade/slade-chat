import { FriendBox, Status } from "@/components/people/friend-box";
import Link from "next/link";
import React from "react";

const mockFriends = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    image: "https://github.com/shadcn.png",
    status: "online" as Status,
  },
  {
    id: "2",
    name: "Jane Doe",
    username: "janedoe",
    image: "https://github.com/shadcn.png",
    status: "away" as Status,
  },
  {
    id: "3",
    name: "John Doe",
    username: "peterjones",
    image: "https://github.com/shadcn.png",
    status: "idle" as Status,
  },
];

export default function FriendPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {mockFriends.map((friend) => (
        <FriendBox key={friend.id} user={friend} variant="friend" />
      ))}
    </div>
  );
}
