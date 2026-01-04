import { FriendBoxSkeleton } from "@/components/people/friend-box-skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <FriendBoxSkeleton key={i} />
      ))}
    </div>
  );
}
