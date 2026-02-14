"use client";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import SendButton from "./send-button";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { createDirectRoom } from "@/lib/api/rooms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { MessageIndicator } from "./message-indicator";
import { useSession } from "@/lib/auth-client";
import { useMessageMutations } from "@/hooks/use-messages";

interface ChatInputProps {
  isGhostMode?: boolean;
  userId?: string;
  roomId?: string;
  editingMessage?: { id: string; content: string } | null;
  replyingToMessage?: {
    id: string;
    content: string;
    senderName: string;
  } | null;
  onCancelEdit?: () => void;
  onCancelReply?: () => void;
}

const FormSchema = z.object({
  message: z.string().max(2000, {
    message: "Message must not exceed 2000 characters.",
  }),
});

export default function ChatInput({
  isGhostMode,
  userId,
  roomId,
  editingMessage,
  replyingToMessage,
  onCancelEdit,
  onCancelReply,
}: ChatInputProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: session, isPending, error } = useSession();

  if (isPending) return;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { message: "" },
  });

  //create directRoom
  const { mutate: directRoomMutate } = useMutation({
    mutationFn: createDirectRoom,
    onSuccess: (data) => {
      router.replace(`/chat/${data!.data.id}`);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const { createMessageMutate, updateMessageMutate } = useMessageMutations({
    roomId,
    session,
    form,
    editingMessage,
  });

  const messageValue = form.watch("message");
  const charCount = messageValue?.length || 0;
  const isExceeded = charCount > 2000;
  const remainingChars = 2000 - charCount;

  const lastTypingTime = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!messageValue || !roomId || !session?.user.id || editingMessage) return;

    const now = Date.now();

    if (now - lastTypingTime.current > 2000) {
      socket.emit("user_typing", { roomId, userId: session.user.id });

      // Update the timestamp
      lastTypingTime.current = now;
    }
  }, [messageValue, roomId, session?.user.id]);

  //if I click edit
  useEffect(() => {
    if (editingMessage) {
      form.setValue("message", editingMessage.content);
      // Focus the input after setting the value
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }

    if (replyingToMessage) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [editingMessage, replyingToMessage, form]);

  const handleCancel = () => {
    if (editingMessage && onCancelEdit) {
      onCancelEdit();
      form.reset();
    } else if (replyingToMessage && onCancelReply) {
      onCancelReply();
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (isExceeded || !data.message.trim()) return;

    if (editingMessage) {
      if (data.message.trim() !== editingMessage.content.trim()) {
        updateMessageMutate({
          roomId: roomId!,
          messageId: editingMessage.id,
          content: data.message,
        });
      }
      //clear state
      if (onCancelEdit) {
        onCancelEdit();
      }
    }

    if (isGhostMode && userId) {
      directRoomMutate({ content: data.message, otherId: userId });
    } else if (roomId) {
      createMessageMutate({
        roomId,
        content: data.message,
        parentId: replyingToMessage?.id,
      });

      // Clear reply state after sending
      if (replyingToMessage && onCancelReply) {
        onCancelReply();
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {editingMessage && (
        <MessageIndicator
          mode="edit"
          text={editingMessage.content}
          onCancel={handleCancel}
        />
      )}
      {replyingToMessage && !editingMessage && (
        <MessageIndicator
          mode="reply"
          text={replyingToMessage.content}
          senderName={replyingToMessage.senderName}
          onCancel={handleCancel}
        />
      )}
      <div className="flex items-center gap-2 p-4">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-6 w-6" />
        </Button>
        <div className="flex-1 relative">
          <Controller
            name="message"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                ref={inputRef}
                type="text"
                placeholder="Type a message"
                className="focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none pr-20"
                autoComplete="off"
              />
            )}
          />
          {charCount > 0 && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                isExceeded ? "text-red-500 font-semibold" : "text-gray-400"
              }`}
            >
              {isExceeded ? `+${Math.abs(remainingChars)}` : ""}
            </div>
          )}
        </div>
        <SendButton disabled={isExceeded || !messageValue.trim()} />
      </div>
    </form>
  );
}
