"use client";
import ChatHeader from "./chat-header";
import { useUserById } from "@/hooks/use-friends";
import { useMyRoomByRoomId } from "@/hooks/use-rooms";
import ChatInput from "./chat-input";
import { MessageList } from "../message/message-list";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { getInitials, getRoomDisplay } from "@/lib/utils";
import { useMessages } from "@/hooks/use-messages";

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
  const { data: ghostUser, isLoading: isLoadingGhostUser } = useUserById(
    userId!
  );
  const { data: roomData } = useMyRoomByRoomId(roomId!);

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMessages({
    roomId: roomId!,
    limit: 20,
  });

  const messages =
    messagesData?.pages
      .flatMap((page) => page?.data)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)) ?? [];

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

  const isLoading = isLoadingMessages || (isGhostMode && isLoadingGhostUser);

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

      {isLoading && messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="h-full flex items-center justify-center text-gray-400">
            Loading messages...
          </div>
        </div>
      ) : messages.length > 0 ? (
        <MessageList
          messages={messages}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="h-full flex items-center justify-center text-gray-400">
            {isGhostMode ? "Start a new conversation" : "No messages yet"}
          </div>
        </div>
      )}

      {/* Input at bottom */}
      <div className="border-t">
        <ChatInput isGhostMode userId={userId} roomId={roomId} />
      </div>
    </div>
  );
}
