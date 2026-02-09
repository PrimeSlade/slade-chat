import { cn, getInitials } from "@/lib/utils"; // shadcn helper for classes
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { MessageActionsDropdown } from "./message-actions-dropdown";
import { RoomWithParticipantStatus } from "@backend/shared";
import { useSession } from "@/lib/auth-client";

interface MessageBubbleProps {
  messageId: string;
  content: string;
  createdAt: Date;
  isMine: boolean;
  senderName?: string;
  senderAvatar?: string;
  showAvatar?: boolean;
  isPending?: boolean;
  isLast?: boolean;
  lastMessageRef?: (node: HTMLDivElement | null) => void;
  participants?: RoomWithParticipantStatus["room"]["participants"];
  onEditMessage?: (message: { id: string; content: string }) => void;
}

export default function MessageBubble({
  messageId,
  content,
  createdAt,
  isMine,
  senderName,
  senderAvatar,
  showAvatar = true,
  isPending = false,
  isLast = false,
  lastMessageRef,
  participants = [],
  onEditMessage,
}: MessageBubbleProps) {
  const { data: session } = useSession();

  const getUsersWhoSeen = () => {
    if (!participants || !session?.user?.id) return [];

    return participants.filter(
      (participant) =>
        participant.userId !== session.user.id &&
        new Date(participant.lastReadAt) >= new Date(createdAt)
    );
  };

  const isSeenByOthers = () => {
    const seenUsers = getUsersWhoSeen();
    return seenUsers.length > 0;
  };

  const handleReply = () => {
    console.log("Reply to message:", messageId);
    // TODO: Implement reply functionality
  };

  const handleEdit = () => {
    if (onEditMessage) {
      onEditMessage({ id: messageId, content });
    }
  };

  const handleDelete = () => {
    console.log("Delete message:", messageId);
    // TODO: Implement delete functionality
  };

  return (
    <div
      ref={isLast ? lastMessageRef : null}
      className={cn(
        "flex w-full items-end gap-2",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      {/* AVATAR (Only for other people) */}
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

      {/* THE BUBBLE ITSELF */}
      <MessageActionsDropdown
        isMine={isMine}
        seenUsers={getUsersWhoSeen()}
        onReply={handleReply}
        onEdit={isMine ? handleEdit : undefined}
        onDelete={isMine ? handleDelete : undefined}
      >
        <div
          className={cn(
            "max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm cursor-pointer transition-all hover:shadow-md",
            isMine
              ? "bg-black text-white rounded-br-none " // My Style
              : "bg-gray-100 text-gray-900 rounded-bl-none" // Their Style
          )}
        >
          <p>{content}</p>
          {
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
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    // Double tick for sent, green if seen by others
                    <CheckCheck
                      className={cn(
                        "w-3.5 h-3.5",
                        isSeenByOthers() && "text-(--primary-color)"
                      )}
                      strokeWidth={2.5}
                    />
                  )}
                </span>
              )}
            </span>
          }
        </div>
      </MessageActionsDropdown>
    </div>
  );
}
