import { cn, getInitials } from "@/lib/utils"; // shadcn helper for classes
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  createdAt: Date;
  isMine: boolean;
  senderName?: string;
  senderAvatar?: string;
  showAvatar?: boolean;
  isPending?: boolean;
}

export default function MessageBubble({
  content,
  createdAt,
  isMine,
  senderName,
  senderAvatar,
  showAvatar = true,
  isPending = false,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full items-end gap-2",
        isMine ? "justify-end" : "justify-start" // 👈 ALIGNMENT LOGIC
      )}
    >
      {/* 1. AVATAR (Only for other people) */}
      {!isMine && (
        <div className="w-8 flex-shrink-0">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={senderAvatar} />
              <AvatarFallback>{getInitials(senderName!)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8" /> // Spacer to keep alignment if avatar is hidden
          )}
        </div>
      )}

      {/* 2. THE BUBBLE ITSELF */}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm",
          isMine
            ? "bg-black text-white rounded-br-none " // My Style
            : "bg-gray-100 text-gray-900 rounded-bl-none" // Their Style
        )}
      >
        <p>{content}</p>
        {isToday(new Date(createdAt)) && (
          <span
            className={cn(
              "text-[10px] mt-1 flex items-center gap-1",
              isMine
                ? "text-blue-100 justify-end"
                : "text-gray-400 justify-start"
            )}
          >
            {format(new Date(createdAt), "HH:mm")}
            {isMine && (
              <span className="inline-flex -space-x-1">
                {isPending ? (
                  // Single tick for pending
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  // Double tick for sent
                  <>
                    <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </>
                )}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
