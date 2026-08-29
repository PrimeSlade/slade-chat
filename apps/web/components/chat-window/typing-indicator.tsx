"use client";

import { getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  typingUsers: Set<string>;
  participants?: {
    user: {
      id: string;
      name?: string | null;
      image?: string | null;
    };
  }[];
}

export function TypingIndicator({
  typingUsers,
  participants,
}: TypingIndicatorProps) {
  return (
    <div className="pb-2">
      <div className="flex flex-col gap-2">
        {Array.from(typingUsers).map((userId) => {
          const participant = participants?.find((p) => p.user.id === userId);
          return (
            <div
              key={userId}
              className="flex w-full items-end gap-2 justify-start"
            >
              <div className="w-8 flex-shrink-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant?.user.image ?? undefined} />
                  <AvatarFallback>
                    {getInitials(participant?.user.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="max-w-[70%] rounded-2xl rounded-bl-none px-4 py-2 bg-gray-100 text-gray-900 shadow-sm flex items-center gap-1 text-sm min-h-[2.25rem]">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
