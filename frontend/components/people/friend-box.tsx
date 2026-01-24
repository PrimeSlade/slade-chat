"use client";

import { Check, MessageSquare, MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@backend/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriend,
  blockUser,
  declineFriend,
  unfriend,
} from "@/lib/api/friends";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { useRoomByUserId } from "@/hooks/use-rooms";

interface FriendBoxProps {
  user: User;
  variant: "friend" | "stranger";
  status?: "online" | "offline";
}

export function FriendBox({ user, variant, status }: FriendBoxProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: roomData } = useRoomByUserId(user.id);

  const acceptMutation = useMutation({
    mutationFn: acceptFriend,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["strangers"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success(data?.message);
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineFriend,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["strangers"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success(data?.message);
    },
  });

  const unfriendMutation = useMutation({
    mutationFn: unfriend,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success(data?.message);
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success(data?.message);
    },
  });

  const mutations = {
    acceptMutation,
    declineMutation,
    unfriendMutation,
    blockUserMutation,
  } as const;

  const handleClick = (type: keyof typeof mutations) => {
    mutations[type].mutate({ id: user.id });
  };

  const handleMessageClick = () => {
    const targetPath = roomData?.data?.roomId
      ? `/chat/${roomData.data.roomId}`
      : `/chat/dm/${user.id}`;
    router.push(targetPath);
  };

  return (
    <div className="p-4 rounded-lg cursor-pointer transition-colors flex items-center space-x-4 border">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image!} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        {status === "online" && <StatusBadge />}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm">@{user.username}</p>
      </div>
      {variant === "friend" && (
        <div>
          <Button variant="ghost" size="icon" onClick={handleMessageClick}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleClick("unfriendMutation")}>
                Unfriend
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleClick("blockUserMutation")}
              >
                Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {variant === "stranger" && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleClick("declineMutation")}
            disabled={declineMutation.isPending || acceptMutation.isPending}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleClick("acceptMutation")}
            disabled={declineMutation.isPending || acceptMutation.isPending}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
