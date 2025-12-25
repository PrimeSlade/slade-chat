"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatTimestamp, truncate } from "@/lib/utils";
import { useState } from "react";

type ChatItemProps = {
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  initials: string;
  roomId: string;
  avatarUrl?: string; // Optional avatar image
  isActive: boolean;
  onClick: (roomId: string) => void;
};

export function ChatItem({
  name,
  lastMessage,
  timestamp,
  unreadCount,
  initials,
  roomId,
  avatarUrl,
  isActive,
  onClick,
}: ChatItemProps) {
  return (
    <div
      onClick={() => onClick(roomId)}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors",
        isActive ? "bg-border" : "hover:bg-border/70"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(timestamp)}
          </p>
        </div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground truncate">
            {truncate(lastMessage, 50)}
          </p>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full p-1 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
