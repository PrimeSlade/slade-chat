"use client";
import { useState } from "react";
import { useFriends } from "@/hooks/use-friends";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupRoom } from "@/lib/api/rooms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Users } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { chooseFriends } from "@/lib/hanldeFriends";
import { getInitials } from "@/lib/utils";

interface GroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherUserName?: string;
  roomId?: string;
  isInviteMode?: boolean; // true = invite members, false = create group
}

export function GroupMembersDialog({
  open,
  onOpenChange,
  otherUserName,
  roomId,
  isInviteMode = false,
}: GroupMembersDialogProps) {
  const queryClient = useQueryClient();

  const { data: friendsData } = useFriends();
  const { data: session } = useSession();

  const friends =
    friendsData?.data && session?.user.id
      ? chooseFriends({
          userId: session.user.id,
          friends: friendsData.data,
        })
      : [];

  const [groupName, setGroupName] = useState(
    `${session?.user.name} & ${otherUserName}`
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );

  const { mutate: createGroup, isPending: isCreating } = useMutation({
    mutationFn: createGroupRoom,
    onSuccess: () => {
      onOpenChange(false);
      setGroupName(`${session?.user.name} & ${otherUserName}`);
      setSelectedFriends(new Set());
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error) => {
      console.error("Failed to create group:", error);
    },
  });

  // TODO: Add invite members mutation
  const { mutate: inviteMembers, isPending: isInviting } = useMutation({
    mutationFn: async (data: { roomId: string; memberIds: string[] }) => {
      // Add your invite members API call here
      throw new Error("Not implemented");
    },
    onSuccess: () => {
      onOpenChange(false);
      setSelectedFriends(new Set());
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error) => {
      console.error("Failed to invite members:", error);
    },
  });

  const isPending = isCreating || isInviting;

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleSubmit = () => {
    if (selectedFriends.size === 0) return;

    if (isInviteMode) {
      if (!roomId) return;
      inviteMembers({
        roomId,
        memberIds: Array.from(selectedFriends),
      });
    } else {
      if (!groupName.trim()) return;
      createGroup({
        groupName: groupName,
        friendIds: Array.from(selectedFriends),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isInviteMode ? "Add Members" : "Create Group"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isInviteMode && (
            <>
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>{isInviteMode ? "Select Members" : "Add Members"}</Label>
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto border rounded-md">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => toggleFriend(friend.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.image!} />
                    <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{friend.name}</span>
                    <span className="text-xs text-muted-foreground">
                      @{friend.username}
                    </span>
                  </div>
                </div>
                <Checkbox
                  checked={selectedFriends.has(friend.id)}
                  onCheckedChange={() => toggleFriend(friend.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={
              isPending ||
              selectedFriends.size === 0 ||
              (!isInviteMode && !groupName.trim())
            }
          >
            {isPending
              ? isInviteMode
                ? "Adding..."
                : "Creating..."
              : isInviteMode
              ? "Add Members"
              : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
