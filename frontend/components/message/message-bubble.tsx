import { cn, getInitials } from "@/lib/utils"; // shadcn helper for classes
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday } from "date-fns";
import { Check, CheckCheck, Reply } from "lucide-react";
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
  onReplyMessage?: (message: { id: string; content: string; senderName: string }) => void;
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
  onReplyMessage,
}: MessageBubbleProps) {
  const { data: session } = useSession();

  // Computed values
  const isDeleted = message.deletedAt !== null || message.content === null;
  const isEdited =
    !isDeleted &&
    message.updatedAt &&
    new Date(message.updatedAt).getTime() >
      new Date(message.createdAt).getTime();
  const cornerClass = isMine ? "rounded-br-none" : "rounded-bl-none";
  const replySenderName =
    message.parent?.sender.id === session?.user?.id
      ? "You"
      : message.parent?.sender.name;

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
    if (onReplyMessage) {
      onReplyMessage({ 
        id: message.id, 
        content: message.content!,
        senderName: message.sender.name
      });
    }
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

      {/* OVERLAPPING BUBBLES */}
      <MessageActionsDropdown
        isMine={isMine}
        seenUsers={getUsersWhoSeen()}
        onReply={!isDeleted ? handleReply : undefined}
        onEdit={isMine && !isDeleted ? handleEdit : undefined}
        onDelete={isMine && !isDeleted ? handleDelete : undefined}
      >
        <div className="flex flex-col max-w-[70%]">
          {/* Reply Bubble - Behind */}
          {message.parent && (
            <div className="flex flex-col">
              {/* Reply info - Outside the bubble */}
              <div className="flex items-center gap-1 mb-1 px-1">
                <Reply className="w-3 h-3 text-gray-500" />
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    isMine ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {replySenderName}
                </span>
              </div>

              {/* Reply bubble content - Same size as main bubble */}
              <div
                className={cn(
                  "px-4 pt-2 pb-4 rounded-2xl text-sm",
                  isMine
                    ? "bg-gray-800 border-gray-600 text-gray-300"
                    : "bg-gray-200 border-gray-500 text-gray-700",
                  cornerClass
                )}
              >
                <p
                  className={cn(
                    "line-clamp-2 ",
                    message.parent.deletedAt && "italic opacity-60"
                  )}
                >
                  {message.parent.deletedAt || !message.parent.content
                    ? "Message deleted"
                    : message.parent.content}
                </p>
              </div>
            </div>
          )}

          {/* Main Message Bubble - Overlapping on top */}
          <div
            className={cn(
              "px-4 py-2 text-sm rounded-2xl shadow-md cursor-pointer transition-all hover:shadow-lg",
              message.parent && "-mt-3",
              isMine ? "bg-black text-white" : "bg-gray-100 text-gray-900",
              cornerClass
            )}
          >
            <p className={cn(isDeleted && "italic text-gray-400")}>
              {isDeleted ? "Message deleted" : message.content}
            </p>

            {/* Metadata: timestamp + edited + checkmarks */}
            <span
              className={cn(
                "text-[10px] mt-1 flex items-center gap-1",
                isMine
                  ? "text-blue-100 justify-end"
                  : "text-gray-400 justify-start"
              )}
            >
              {isMine && isEdited && <span>edited</span>}
              {format(new Date(message.createdAt), "HH:mm")}
              {!isMine && isEdited && <span>edited</span>}
              {isMine && (
                <span className="inline-flex -space-x-1">
                  {message.isPending ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
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
          </div>
        </div>
      </MessageActionsDropdown>
    </div>
  );
}
