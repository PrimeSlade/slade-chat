// components/message-list.tsx
import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import { useSession } from "@/lib/auth-client";
import { useMessages } from "@/hooks/use-messages";
import { useInView } from "react-intersection-observer";

interface MessageListProps {
  roomId?: string;
  isGhostMode: boolean;
}

export function MessageList({ roomId, isGhostMode }: MessageListProps) {
  const { ref, inView } = useInView();

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  const { data: session } = useSession();
  const {
    data: messagesData,
    isLoading,
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
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {isLoading ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          Loading messages...
        </div>
      ) : messages.length > 0 ? (
        <>
          <div ref={ref}></div>
          {messages.map((msg) => {
            const isMine = msg.senderId === session?.user?.id;

            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                createdAt={msg.createdAt}
                isMine={isMine}
                senderName={msg.sender.name}
                senderAvatar={msg.sender.image}
                showAvatar={!isMine}
              />
            );
          })}
          <div ref={bottomRef}></div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400">
          {isGhostMode ? "Start a new conversation" : "No messages yet"}
        </div>
      )}
    </div>
  );
}
