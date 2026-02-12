"use client";

import { ChatItem } from "./chat-item";
import { getInitials, getRoomDisplay } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponseFormat,
  RoomParticipantWithRoom,
  User,
  UserStatus,
} from "@backend/shared";

interface ChatListProps {
  roomsData: ResponseFormat<RoomParticipantWithRoom[]> | undefined;
  userData: ResponseFormat<User> | undefined;
  userStatuses: ResponseFormat<UserStatus[]> | undefined;
  userId: string;
  roomId?: string;
}

export function ChatList({
  roomsData,
  userData,
  userStatuses,
  userId,
  roomId,
}: ChatListProps) {
  const router = useRouter();

  const activeRoomId = roomId;

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
          status={
            userStatuses?.data?.find(
              (status) => status.userId === userData.data.id
            )?.status
          }
        />
      )}

      {/* Rooms */}
      {roomsData?.data.map((participant) => {
        const { room } = participant;

        const lastMessage = room.messages?.[0];

        const { displayName, avatarUrl } = getRoomDisplay(room);

        const initials = getInitials(displayName);

        const userStatus = userStatuses?.data?.find(
          (status) => status.userId === room.participants[0].userId
        );

        return (
          <ChatItem
            key={room.id}
            roomId={room.id}
            name={displayName}
            lastMessage={
              lastMessage?.content === null && lastMessage?.deletedAt
                ? "Message deleted"
                : lastMessage?.content || "No messages yet"
            }
            timestamp={
              lastMessage?.createdAt ? new Date(lastMessage?.createdAt) : null
            }
            unreadCount={0}
            initials={initials}
            avatarUrl={avatarUrl}
            isActive={activeRoomId === room.id}
            onClick={() => handleItemClick(`/chat/${room.id}`)}
            status={room.type === "GROUP" ? "offline" : userStatus?.status}
          />
        );
      })}
    </div>
  );
}
