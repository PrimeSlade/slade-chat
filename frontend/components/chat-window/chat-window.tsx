"use client";
import ChatHeader from "./chat-header";
import { useUserById } from "@/hooks/use-friends";
import { useMyRoomByRoomId } from "@/hooks/use-rooms";
import ChatInput from "./chat-input";
import { MessageList } from "../message/message-list";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { getInitials, getRoomDisplay } from "@/lib/utils";
import { useMessages } from "@/hooks/use-messages";
import { useInView } from "react-intersection-observer";

interface ChatWindowProps {
  roomId?: string;
  userId?: string;
  isGhostMode?: boolean;
}

export function ChatWindow({
  roomId,
  userId,
  isGhostMode = false,
}: ChatWindowProps) {
  const { data: ghostUser } = useUserById(userId!);
  const { data: roomData } = useMyRoomByRoomId(roomId!);

  useEffect(() => {
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);

    const handleNewMessage = (data: any) => {
      console.log("✅ Received new_message:", data);
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, []);

  const { displayName, avatarUrl } =
    isGhostMode && ghostUser
      ? {
          displayName: ghostUser.data.name,
          avatarUrl: ghostUser.data.image ?? getInitials(ghostUser.data.name),
        }
      : getRoomDisplay(roomData?.data.room!);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b">
        <ChatHeader name={displayName} image={avatarUrl} />
      </div>
      <MessageList roomId={roomId} isGhostMode />

      {/* Input at bottom */}
      <div className="border-t">
        <ChatInput isGhostMode userId={userId} roomId={roomId} />
      </div>
    </div>
  );
}
