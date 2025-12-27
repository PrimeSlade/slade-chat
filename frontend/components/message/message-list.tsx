// components/message-list.tsx
import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import { useSession } from "@/lib/auth-client";

export function MessageList({ messages }: { messages: any }) {
  const { data: session } = useSession();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => {
        // Logic: Is this message sent by me?
        const isMine = msg.senderId === session?.user?.id;

        return (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            createdAt={msg.createdAt}
            isMine={isMine}
            senderName={msg.sender.name}
            senderAvatar={msg.sender.image}
            showAvatar={!isMine} // Only show avatar for others, once per group
          />
        );
      })}
      {/* Invisible element to scroll to */}
      <div ref={scrollRef} />
    </div>
  );
}
