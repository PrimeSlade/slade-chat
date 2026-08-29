"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addFriend } from "@/lib/api/friends";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function AddFriendDialog() {
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addFriend,
    onSuccess: (data) => {
      setUsername("");
      setOpen(false);
      toast.success(data!.message);

      // Invalidate queries to refetch friends/strangers list
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["strangers"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    mutation.mutate({ username });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // Reset mutation state when dialog is closed
        if (!isOpen) {
          mutation.reset();
        }
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="text-xl font-bold">
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSendRequest} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add friend</DialogTitle>
            <DialogDescription>
              Enter your friend's username to send a request.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              id="username"
              className="col-span-3"
              placeholder="user@123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
