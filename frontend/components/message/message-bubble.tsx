import { cn, getInitials } from "@/lib/utils"; // shadcn helper for classes
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { MessageActionsDropdown } from "./message-actions-dropdown";
import { MessageWithSender, RoomWithParticipantStatus } from "@backend/shared";
import { useSession } from "@/lib/auth-client";

interface MessageBubbleProps {
  message: MessageWithSender & { isPending?: boolean };
  isMine: boolean;
  showAvatar?: boolean;
  isLast?: boolean;
  lastMessageRef?: (node: HTMLDivElement | null) => void;
  participants?: RoomWithParticipantStatus["room"]["participants"];
  onEditMessage?: (message: { id: string; content: string }) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isMine,
  showAvatar = true,
  isLast = false,
  lastMessageRef,
  participants = [],
  onEditMessage,
  onDeleteMessage,
}: MessageBubbleProps) {
  const { data: session } = useSession();

  const isDeleted = message.deletedAt !== null || message.content === null;

  const getUsersWhoSeen = () => {
    if (!participants || !session?.user?.id) return [];

    return participants.filter(
      (participant) =>
        participant.userId !== session.user.id &&
        new Date(participant.lastReadAt) >= new Date(message.createdAt)
    );
  };

  const isSeenByOthers = () => {
    const seenUsers = getUsersWhoSeen();
    return seenUsers.length > 0;
  };

  const handleReply = () => {
    console.log("Reply to message:", message.id);
    // TODO: Implement reply functionality
  };

  const handleEdit = () => {
    if (onEditMessage) {
      onEditMessage({ id: message.id, content: message.content! });
    }
  };

  const handleDelete = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    }
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
              <AvatarImage src={message.sender.image || undefined} />
              <AvatarFallback>
                {getInitials(message.sender.name!)}
              </AvatarFallback>
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
        onReply={!isDeleted ? handleReply : undefined}
        onEdit={isMine && !isDeleted ? handleEdit : undefined}
        onDelete={isMine && !isDeleted ? handleDelete : undefined}
      >
        <div
          className={cn(
            "max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm cursor-pointer transition-all hover:shadow-md",
            isMine
              ? "bg-black text-white rounded-br-none " // My Style
              : "bg-gray-100 text-gray-900 rounded-bl-none", // Their Style
            isDeleted && "opacity-70"
          )}
        >
          <p className={cn(isDeleted && "italic text-gray-400")}>
            {isDeleted ? "Message deleted" : message.content}
          </p>
          {
            <span
              className={cn(
                "text-[10px] mt-1 flex items-center gap-1",
                isMine
                  ? "text-blue-100 justify-end"
                  : "text-gray-400 justify-start"
              )}
            >
              {isMine &&
                !isDeleted &&
                message.updatedAt &&
                new Date(message.updatedAt).getTime() >
                  new Date(message.createdAt).getTime() && <span>edited</span>}
              {format(new Date(message.createdAt), "HH:mm")}
              {!isMine &&
                !isDeleted &&
                message.updatedAt &&
                new Date(message.updatedAt).getTime() >
                  new Date(message.createdAt).getTime() && <span>edited</span>}
              {isMine && (
                <span className="inline-flex -space-x-1">
                  {message.isPending ? (
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
