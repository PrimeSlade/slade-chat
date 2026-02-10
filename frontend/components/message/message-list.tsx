import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import { useSession } from "@/lib/auth-client";
import { useInView } from "react-intersection-observer";
import { MessageWithSender, RoomWithParticipantStatus } from "@backend/shared";
import { Spinner } from "../ui/spinner";
import { formatDateLabelForChatWindow } from "@/lib/utils";
import { TypingIndicator } from "../chat-window/typing-indicator";
import { useMarkAsSeen } from "@/hooks/use-mark-as-seen";

interface MessageListProps {
  messages: (MessageWithSender & { isPending?: boolean })[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  isTypingUsers?: Set<string>;
  participants?: RoomWithParticipantStatus["room"]["participants"];
  roomId?: string;
  onEditMessage?: (message: { id: string; content: string }) => void;
}

export function MessageList({
  messages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isTypingUsers,
  participants,
  roomId,
  onEditMessage,
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
      100;

    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTypingUsers]);

  const lastMessage = messages[messages.length - 1];

  const lastMessageRef = useMarkAsSeen(roomId, lastMessage?.id);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 space-y-4">
      <div ref={topRef} />
      {hasNextPage && isFetchingNextPage && (
        <div className="flex justify-center">
          <Spinner className="size-8" />
        </div>
      )}
      {messages.map((msg, index) => {
        const isMine = msg.senderId === session?.user?.id;

        const previousMessage = messages[index - 1];

        const currentDateLabel = formatDateLabelForChatWindow(msg.createdAt);

        const previousDateLabel = previousMessage
          ? formatDateLabelForChatWindow(previousMessage.createdAt)
          : null;

        const showDate = currentDateLabel !== previousDateLabel;

        const isLast = index === messages.length - 1;

        return (
          <div key={index}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="text-xs text-muted-foreground px-2 py-1 rounded-full">
                  {currentDateLabel}
                </span>
              </div>
            )}
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={isMine}
              showAvatar={!isMine}
              isLast={isLast}
              lastMessageRef={lastMessageRef}
              participants={participants}
              onEditMessage={onEditMessage}
            />
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isTypingUsers && (
        <TypingIndicator
          typingUsers={isTypingUsers}
          participants={participants}
        />
      )}

      {/* BOTTOM ANCHOR */}
      <div ref={bottomRef} />
    </div>
  );
}
