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
import { Spinner } from "../ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { MessageWithSender, ResponseFormat } from "@backend/shared";
import { useRouter } from "next/navigation";
import axios from "axios";

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
  const router = useRouter();

  const { data: ghostUser, isLoading: isLoadingGhostUser } = useUserById(
    userId!
  );
  const { data: roomData, error: fetchRoomError } = useMyRoomByRoomId(roomId!);

  const queryClient = useQueryClient();

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error: fetchMessageError,
  } = useMessages({
    roomId: roomId!,
    limit: 20,
  });

  const error = fetchMessageError || fetchRoomError;

  useEffect(() => {
    if (error && axios.isAxiosError(error)) {
      const statusCode = error.response?.data?.statusCode;

      if (statusCode === 403 || statusCode === 404) {
        router.replace("/chat");
      }
    }
  }, [error, router]);

  const messages =
    messagesData?.pages
      .flatMap((page) => page?.data)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)) ?? [];

  useEffect(() => {
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);

    const handleNewMessage = (message: ResponseFormat<MessageWithSender>) => {
      queryClient.setQueryData(["messages", roomId, 20], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              data: [...oldData.pages[0].data, message.data],
            },
            ...oldData.pages.slice(1), //restoring old pages
          ],
        };
      });
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
          <div className="h-full flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        </div>
      ) : messages.length > 0 ? (
        <MessageList
          messages={messages}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
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
