"use client";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { Ellipsis, Info, LogOut, Trash2, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { GroupMembersDialog } from "./group-members-dialog";
import { RoomWithParticipantStatus } from "@backend/shared";

interface ChatHeaderGroupProps {
  roomId: string;
  name: string;
  image: string;
  totalMembers: number;
  participants: RoomWithParticipantStatus["room"]["participants"];
}

export default function ChatHeaderGroup({
  roomId,
  name,
  image,
  totalMembers,
  participants,
}: ChatHeaderGroupProps) {
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  // Calculate online members from participants
  const onlineMembers = useMemo(() => {
    return participants.reduce(
      (acc, participant) =>
        participant.user.status === "online" ? acc + 1 : acc,
      0
    );
  }, [participants]);

  return (
    <div className="flex p-4 justify-between">
      <div className="flex gap-4 ">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={image} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h1 className="font-semibold">{name}</h1>
          <div className="text-xs text-muted-foreground/70">
            {totalMembers} members
            {onlineMembers > 0 && `, ${onlineMembers} online`}
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-center cursor-pointer">
            <Ellipsis />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-5">
          <DropdownMenuItem className="group">
            <Info className="mr-2 h-4 w-4 group-hover:animate-[shake_0.5s_ease-in-out]" />
            <span>View info</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="group"
            onClick={() => setIsAddMembersOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4 group-hover:animate-[shake_0.5s_ease-in-out]" />
            <span>Add members</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <LogOut className="mr-2 h-4 w-4 group-hover:animate-[shake_0.5s_ease-in-out]" />
            <span>Leave chat</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Trash2 className="mr-2 h-4 w-4 group-hover:animate-[shake_0.5s_ease-in-out] text-destructive" />
            <span className="text-destructive">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GroupMembersDialog
        open={isAddMembersOpen}
        onOpenChange={setIsAddMembersOpen}
        roomId={roomId}
        isInviteMode={true}
      />
    </div>
  );
}
