import { FriendBox, Status } from "@/components/people/friend-box";
import React from "react";

const mockStrangers = [
  {
    id: "4",
    name: "Emily White",
    username: "emilywhite",
    image: "https://github.com/shadcn.png",
  },
  {
    id: "5",
    name: "Chris Green",
    username: "chrisgreen",
    image: "https://github.com/shadcn.png",
  },
];

export default function StrangerPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {mockStrangers.map((stranger) => (
        <FriendBox key={stranger.id} user={stranger} variant="stranger" />
      ))}
    </div>
  );
}
