// components/message-list.tsx
import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import { useSession } from "@/lib/auth-client";
import { useInView } from "react-intersection-observer";
import { MessageWithSender } from "@backend/shared";
import { Spinner } from "../ui/spinner";

interface MessageListProps {
  messages: MessageWithSender[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
}

export function MessageList({
  messages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: MessageListProps) {
  const { data: session } = useSession();

  // scroll container
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: topRef, inView } = useInView();
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!inView || !hasNextPage || !containerRef.current) return;

    //store height
    prevScrollHeightRef.current = containerRef.current.scrollHeight;
    fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  // Restore scroll position after prepend
  useEffect(() => {
    const container = containerRef.current;
    const prevScrollHeight = prevScrollHeightRef.current;

    if (!container || prevScrollHeight === null) return;

    const newScrollHeight = container.scrollHeight;
    container.scrollTop =
      newScrollHeight - prevScrollHeight + container.scrollTop;

    prevScrollHeightRef.current = null;
  }, [messages]);

  // Auto-scroll only if user is at bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;

    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 space-y-4">
      <div ref={topRef} />
      {hasNextPage && isFetchingNextPage && (
        <div className="flex justify-center">
          <Spinner className="size-8" />
        </div>
      )}
      {messages.map((msg) => {
        const isMine = msg.senderId === session?.user?.id;

        return (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            createdAt={msg.createdAt}
            isMine={isMine}
            senderName={msg.sender.name}
            senderAvatar={msg.sender.image!}
            showAvatar={!isMine}
          />
        );
      })}

      {/* BOTTOM ANCHOR */}
      <div ref={bottomRef} />
    </div>
  );
}
