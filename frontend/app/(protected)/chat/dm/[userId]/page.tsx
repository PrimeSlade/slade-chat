"use client";
import { ChatWindow } from "@/components/chat-window/chat-window";
import { useRoomByUserId } from "@/hooks/use-rooms";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function DmPage() {
  const { userId } = useParams();

  const router = useRouter();

  const { data: roomData, isLoading } = useRoomByUserId(userId as string);

  useEffect(() => {
    // If we have a valid room ID, go there.
    if (roomData?.data?.roomId) {
      router.replace(`/chat/${roomData.data.roomId}`);
    }
  }, [roomData, router]);

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <ChatWindow isGhostMode={true} userId={userId as string} />
    </div>
  );
}
