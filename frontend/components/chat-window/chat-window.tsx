"use client";
import React from "react";
import ChatHeader from "./chat-header";
import { useUserById } from "@/hooks/use-friends";
import { useRoomByUserId } from "@/hooks/use-rooms";
import ChatInput from "./chat-input";
import { MessageList } from "../message/message-list";

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
  // const { data: roomData } = useRoomByUserId(roomId!);

  const messages = [
    {
      id: "1",
      content: "Hey! How are you?",
      createdAt: new Date(Date.now() - 3600000),
      senderId: "user1",
      sender: {
        id: "user1",
        name: "John Doe",
        email: "john@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: "Software developer",
        username: "johndoe",
      },
      roomId: roomId || "room1",
    },
    {
      id: "2",
      content: "I'm doing great, thanks! How about you?",
      createdAt: new Date(Date.now() - 3000000),
      senderId: "e6vGwkzyi4mAt418HLFs9teBRtGeCY86",
      sender: {
        id: "e6vGwkzyi4mAt418HLFs9teBRtGeCY86",
        name: "Jane Smith",
        email: "jane@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: "Designer",
        username: "janesmith",
      },
      roomId: roomId || "room1",
    },
    {
      id: "3",
      content: "Pretty good! Want to grab coffee later?",
      createdAt: new Date(Date.now() - 1800000),
      senderId: "user1",
      sender: {
        id: "user1",
        name: "John Doe",
        email: "john@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: "Software developer",
        username: "johndoe",
      },
      roomId: roomId || "room1",
    },
    {
      id: "4",
      content: "Sure! What time works for you?",
      createdAt: new Date(Date.now() - 900000),
      senderId: "user1",
      sender: {
        id: "user1",
        name: "John Doe",
        email: "jane@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: "Designer",
        username: "janesmith",
      },
      roomId: roomId || "room1",
    },
  ];

  let name;
  let image;

  if (isGhostMode && ghostUser) {
    name = ghostUser?.data.name;
    image = ghostUser?.data.image;
  } else {
    // name = roomData?.data.room.participants[0].user.name;
    // image = roomData?.data.room.participants[0].user.image;
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b">
        <ChatHeader />
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <MessageList messages={messages} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            {isGhostMode ? "Start a new conversation" : "No messages yet"}
          </div>
        )}
      </div>

      {/* Input at bottom */}
      <div className="border-t">
        <ChatInput isGhostMode userId={userId} />
      </div>
    </div>
  );
}
