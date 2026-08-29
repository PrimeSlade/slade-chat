"use client";
import { useState } from "react";
import { useFriendsStatus, useUserLastSeen } from "@/hooks/use-friends";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { StatusBadge } from "../ui/status-badge";
import { formatlastSeen, getInitials } from "@/lib/utils";
import { Ellipsis, Users, Trash2, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { GroupMembersDialog } from "./group-members-dialog";

interface ChatHeaderProps {
  userId?: string | null;
  name: string;
  image: string;
}

export default function ChatHeader({ userId, name, image }: ChatHeaderProps) {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { data: userLastSeen } = useUserLastSeen(userId!);
  const { data: userStatuses } = useFriendsStatus();

  const userStatus = userStatuses?.data.find((user) => userId === user.userId);

  return (
    <div className="flex p-4 justify-between">
      <div className="flex gap-4 ">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={image} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          {userStatus?.status === "online" && <StatusBadge size="md" />}
        </div>
        <div>
          <h1 className="font-semibold">{name}</h1>
          {userLastSeen?.data && (
            <div className="text-xs text-muted-foreground/70">
              Last seen {formatlastSeen(userLastSeen.data)}
            </div>
          )}
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
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <Users className="mr-2 h-4 w-4 group-hover:animate-[shake_0.5s_ease-in-out]" />
            <span>Create group</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Trash2 className="mr-2 h-4 w-4 group-hover:animate-[shake_0.5s_ease-in-out] text-destructive" />
            <span className="text-destructive">Delete chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GroupMembersDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        otherUserName={name}
      />
    </div>
  );
}
