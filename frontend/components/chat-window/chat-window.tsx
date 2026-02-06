"use client";
import ChatHeader from "./chat-header";
import { useUserById } from "@/hooks/use-friends";
import { useMyRoomByRoomId } from "@/hooks/use-rooms";
import ChatInput from "./chat-input";
import { MessageList } from "../message/message-list";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { addToFirstPage, getInitials, getRoomDisplay } from "@/lib/utils";
import { useMessages } from "@/hooks/use-messages";
import { useQueryClient } from "@tanstack/react-query";
import {
  MessageWithSender,
  ResponseFormat,
  RoomWithParticipantStatus,
} from "@backend/shared";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MessageSkeletonLoader } from "./message-skeleton-loader";
import { ChatHeaderSkeleton } from "../chat-list/chat-skeletons";
import ChatHeaderGroup from "./chat-header-group";
import { useSession } from "@/lib/auth-client";

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
  const queryClient = useQueryClient();
  const socket = useSocket();

  const [isTypingUsers, setIsTypingUsers] = useState<Set<string>>(new Set());

  const timeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const { data: ghostUser, isLoading: isLoadingGhostUser } = useUserById(
    userId!
  );

  const { data: session } = useSession();

  const {
    data: roomData,
    isLoading: isFetchingRoom,
    error: fetchRoomError,
  } = useMyRoomByRoomId(roomId!);

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

  const messages = useMemo(() => {
    return (
      messagesData?.pages
        .flatMap((page) => page?.data)
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)) ?? []
    );
  }, [messagesData]);

  useEffect(() => {
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);

    const handleNewMessage = (message: ResponseFormat<MessageWithSender>) => {
      if (message.data.senderId !== session?.user.id) {
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      }

      queryClient.setQueryData(["messages", roomId, 20], (oldData: any) => {
        if (!oldData) return oldData;

        return addToFirstPage(oldData, message.data);
      });

      //Immediately remove this user from the typing list if new message arrives before it is expired
      setIsTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(message.data.senderId);
        return next;
      });
    };

    const handleTyping = (userId: string) => {
      setIsTypingUsers((prev) => new Set(prev).add(userId));

      if (timeouts.current[userId]) {
        clearTimeout(timeouts.current[userId]);
      }

      timeouts.current[userId] = setTimeout(() => {
        setIsTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        delete timeouts.current[userId];
      }, 3000);
    };

    const handleReadUpdate = (data: { userId: string; lastReadAt: string }) => {
      queryClient.setQueryData(
        ["room", "me", roomId],
        (oldData: ResponseFormat<RoomWithParticipantStatus>) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              room: {
                ...oldData.data.room,
                participants: oldData.data.room.participants.map((p) =>
                  p.userId === data.userId
                    ? { ...p, lastReadAt: new Date(data.lastReadAt) }
                    : p
                ),
              },
            },
          };
        }
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_read_update", handleReadUpdate);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_read_update", handleReadUpdate);
    };
  }, [socket, roomId, queryClient]);

  const isLoading =
    isLoadingMessages ||
    (isGhostMode && isLoadingGhostUser) ||
    isFetchingRoom ||
    (!isGhostMode && !roomData);

  // Show unified loading state
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b">
          <ChatHeaderSkeleton />
        </div>
        <MessageSkeletonLoader />
      </div>
    );
  }

  const { displayUserId, displayName, avatarUrl } =
    isGhostMode && ghostUser
      ? {
          displayUserId: ghostUser.data.id,
          displayName: ghostUser.data.name,
          avatarUrl: ghostUser.data.image ?? getInitials(ghostUser.data.name),
        }
      : getRoomDisplay(roomData?.data.room!);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b">
        {isGhostMode ? (
          <ChatHeader
            userId={displayUserId}
            name={displayName}
            image={avatarUrl}
          />
        ) : roomData!.data.room.type === "DIRECT" ? (
          <ChatHeader
            userId={displayUserId}
            name={displayName}
            image={avatarUrl}
          />
        ) : (
          <ChatHeaderGroup
            roomId={roomData!.data.roomId}
            name={roomData!.data.room.name!}
            image={roomData!.data.room.image!}
            totalMembers={roomData!.data.room._count.participants ?? 0}
            participants={roomData!.data.room.participants}
          />
        )}
      </div>

      {messages.length > 0 ? (
        <MessageList
          messages={messages}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isTypingUsers={isTypingUsers}
          participants={roomData?.data.room?.participants}
          roomId={roomId}
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
