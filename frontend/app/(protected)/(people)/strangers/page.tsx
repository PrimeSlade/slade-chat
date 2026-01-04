"use client";
import { FriendBox, Status } from "@/components/people/friend-box";
import { useStrangers } from "@/hooks/use-friends";
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
  const { data: strangerData } = useStrangers();

  if (strangerData!.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full mt-90">
        <p className="text-muted-foreground">You have no requests yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {strangerData!.data.map((stranger) => (
        <FriendBox
          key={stranger.id}
          user={stranger.sender}
          variant="stranger"
        />
      ))}
    </div>
  );
}
