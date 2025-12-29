"use client";

import { useEffect, useState } from "react";
import { ChatItem } from "./chat-item";
import { getInitials, getRoomDisplay } from "@/lib/utils";
import { RoomParticipantWithRoom } from "@backend/shared";
import { useRoomByUserId, useRooms } from "@/hooks/use-rooms";
import { ChatItemSkeleton } from "./chat-skeletons";
import { useFriends, useUserById } from "@/hooks/use-friends";
import { Button } from "../ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// This is a mock ID for the currently logged-in user.
// In a real app, you'd get this from your auth context.
const currentUserId = "user-c";

// MOCK DATA STRUCTURE based on backend type
const mockUsers = {
  "user-c": { id: "user-c", name: "You", image: null },
  "user-a": {
    id: "user-a",
    name: "Alice Wonder",
    image: "https://github.com/shadcn.png",
  },
  "user-b": { id: "user-b", name: "Bob Builder", image: null },
  "user-d": {
    id: "user-d",
    name: "Design Team",
    image: "https://github.com/vercel.png",
  },
};

const mockChatData: RoomParticipantWithRoom[] = [
  // Chat with Alice
  {
    userId: "user-c",
    roomId: "room-1",
    joinedAt: new Date("2024-12-20T10:00:00"),
    lastReadAt: new Date("2024-12-25T17:00:00"),
    room: {
      id: "room-1",
      name: null,
      type: "DIRECT",
      createdAt: new Date("2024-12-20T10:00:00"),
      updatedAt: new Date("2024-12-25T18:04:00"),
      messages: [
        {
          id: "msg-1",
          content: "Hey! How are you doing?",
          createdAt: new Date("2024-12-25T18:04:00"),
          senderId: "user-a",
          roomId: "room-1",
        },
      ],
      participants: [
        {
          userId: "user-a",
          roomId: "room-1",
          joinedAt: new Date("2024-12-20T10:00:00"),
          lastReadAt: new Date("2024-12-25T18:04:00"),
          user: mockUsers["user-a"],
        },
      ],
    },
  },
  // Chat with Bob
  {
    userId: "user-c",
    roomId: "room-2",
    joinedAt: new Date("2024-12-24T10:00:00"),
    lastReadAt: new Date("2024-12-25T17:39:00"),
    room: {
      id: "room-2",
      name: null,
      type: "DIRECT",
      createdAt: new Date("2024-12-24T10:00:00"),
      updatedAt: new Date("2024-12-25T17:39:00"),
      messages: [
        {
          id: "msg-3",
          content: "Can we fix it?",
          createdAt: new Date("2024-12-25T17:39:00"),
          senderId: "user-b",
          roomId: "room-2",
        },
      ],
      participants: [
        {
          userId: "user-b",
          roomId: "room-2",
          joinedAt: new Date("2024-12-24T10:00:00"),
          lastReadAt: new Date("2024-12-25T17:39:00"),
          user: mockUsers["user-b"],
        },
      ],
    },
  },
  // Group Chat
  {
    userId: "user-c",
    roomId: "room-3",
    joinedAt: new Date("2024-12-23T10:00:00"),
    lastReadAt: new Date("2024-12-25T16:00:00"),
    room: {
      id: "room-3",
      name: "Design Team",
      type: "GROUP",
      createdAt: new Date("2024-12-23T10:00:00"),
      updatedAt: new Date("2024-12-25T17:09:00"),
      messages: [
        {
          id: "msg-4",
          content: "The new mockups look great!",
          createdAt: new Date("2024-12-25T17:09:00"),
          senderId: "user-d",
          roomId: "room-3",
        },
      ],
      participants: [
        {
          userId: "user-d",
          roomId: "room-3",
          joinedAt: new Date("2024-12-23T10:00:00"),
          lastReadAt: new Date("2024-12-25T17:09:00"),
          user: mockUsers["user-d"],
        },
      ],
    },
  },
  // Empty Room
  {
    userId: "user-c",
    roomId: "room-4",
    joinedAt: new Date("2024-12-23T10:00:00"),
    lastReadAt: new Date("2024-12-25T18:00:00"),
    room: {
      id: "room-4",
      name: "Empty Room",
      type: "GROUP",
      createdAt: new Date("2024-12-23T10:00:00"),
      updatedAt: new Date("2024-12-24T11:09:00"),
      messages: [],
      participants: [],
    },
  },
];

export function ChatList() {
  const { userId, roomId } = useParams();

  const router = useRouter();

  const activeRoomId = roomId;

  const { data: roomsData, isLoading: isRoomsLoading } = useRooms();

  const { data: userData } = useUserById(userId as string);

  const handleItemClick = (url: string) => {
    router.push(url);
  };

  if (!userId && roomsData?.data && roomsData.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">
          No chats yet
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Add some friends to start a conversation.
        </p>
        <Button asChild variant={"outline"}>
          <Link href="/friends">Find Friends</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {/* Ghost Room */}
      {userId && userData?.data && (
        <ChatItem
          key={userData.data.id}
          roomId={userData.data.id}
          name={userData.data.name}
          lastMessage="Click to start a conversation"
          initials={getInitials(userData.data.name)}
          avatarUrl={userData.data.image || undefined}
          isActive={!activeRoomId}
          onClick={() => handleItemClick(`/chat/dm/${userData.data.id}`)}
          timestamp={new Date()}
          unreadCount={0}
        />
      )}

      {/* Rooms */}
      {roomsData?.data.map((participant) => {
        const { room } = participant;

        const lastMessage = room.messages?.[0];

        const { displayName, avatarUrl } = getRoomDisplay(room);

        const initials = getInitials(displayName);

        return (
          <ChatItem
            key={room.id}
            roomId={room.id}
            name={displayName}
            lastMessage={lastMessage?.content || "No messages yet"}
            timestamp={new Date(room.updatedAt)}
            unreadCount={0}
            initials={initials}
            avatarUrl={avatarUrl}
            isActive={activeRoomId === room.id}
            onClick={() => handleItemClick(`/chat/${room.id}`)}
          />
        );
      })}
    </div>
  );
}
