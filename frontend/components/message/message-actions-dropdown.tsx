import { Edit, Reply, Trash2, Eye, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ReactNode } from "react";
import { RoomWithParticipantStatus } from "@backend/shared";
import { SeenUsersList } from "./seen-users-list";

interface MessageActionsDropdownProps {
  children: ReactNode;
  isMine: boolean;
  seenUsers?: RoomWithParticipantStatus["room"]["participants"];
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MessageActionsDropdown({
  children,
  isMine,
  seenUsers = [],
  onReply,
  onEdit,
  onDelete,
}: MessageActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={isMine ? "end" : "start"} className="w-40">
        {onReply && (
          <DropdownMenuItem onClick={onReply}>
            <Reply className="mr-2 h-4 w-4" />
            <span>Reply</span>
          </DropdownMenuItem>
        )}
        {isMine && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}
        {isMine && (
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <CheckCheck
                  className="mr-2 h-4 w-4 text-(--primary-color)"
                  strokeWidth={2.5}
                />
                <span>{seenUsers.length} Seen</span>
              </DropdownMenuItem>
            </HoverCardTrigger>
            <HoverCardContent side="left" align="start" className="w-64">
              <SeenUsersList seenUsers={seenUsers} />
            </HoverCardContent>
          </HoverCard>
        )}
        {isMine && onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
