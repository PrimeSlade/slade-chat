import Image from "next/image";
import { Check, MessageSquare, MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { User } from "@backend/shared";

export type Status = "online" | "away" | "idle";

interface FriendBoxProps {
  user: User;
  variant: "friend" | "stranger";
}

export function FriendBox({ user, variant }: FriendBoxProps) {
  // const statusClasses = {
  //   online: "bg-green-500",
  //   away: "bg-yellow-500",
  //   idle: "bg-gray-500",
  // };

  return (
    <div className="p-4 rounded-lg cursor-pointer transition-colors flex items-center space-x-4 border">
      <div className="relative">
        <Image
          src={user.image || "https://github.com/shadcn.png"}
          alt={user.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        {/* Status */}
        {/* {user.status && (
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              statusClasses[user.status]
            }`}
          ></div>
        )} */}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm">@{user.username}</p>
      </div>
      {variant === "friend" && (
        <div>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Unfriend</DropdownMenuItem>
              <DropdownMenuItem>Block</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {variant === "stranger" && (
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <X className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="outline" size="icon">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
