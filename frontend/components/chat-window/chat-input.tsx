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
  messageAction?: {
    mode: "edit" | "reply";
    id: string;
    content: string;
    senderName?: string;
  } | null;
  onCancelAction?: () => void;
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
  messageAction,
  onCancelAction,
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
    editingMessage: messageAction?.mode === "edit" ? messageAction : null,
  });

  const messageValue = form.watch("message");
  const charCount = messageValue?.length || 0;
  const isExceeded = charCount > 2000;
  const remainingChars = 2000 - charCount;

  const lastTypingTime = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      !messageValue ||
      !roomId ||
      !session?.user.id ||
      messageAction?.mode === "edit"
    )
      return;

    const now = Date.now();

    if (now - lastTypingTime.current > 2000) {
      socket.emit("user_typing", { roomId, userId: session.user.id });

      // Update the timestamp
      lastTypingTime.current = now;
    }
  }, [messageValue, roomId, session?.user.id, messageAction]);

  // Handle edit or reply - set input value and focus
  useEffect(() => {
    if (messageAction?.mode === "edit") {
      form.setValue("message", messageAction.content);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else if (messageAction?.mode === "reply") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [messageAction, form]);

  const handleCancel = () => {
    if (onCancelAction) {
      onCancelAction();
    }
    if (messageAction?.mode === "edit") {
      form.reset();
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (isExceeded || !data.message.trim()) return;

    if (messageAction?.mode === "edit") {
      if (data.message.trim() !== messageAction.content.trim()) {
        updateMessageMutate({
          roomId: roomId!,
          messageId: messageAction.id,
          content: data.message,
        });
      }
      // Clear state
      if (onCancelAction) {
        onCancelAction();
      }
    }

    if (isGhostMode && userId) {
      directRoomMutate({ content: data.message, otherId: userId });
    } else if (roomId) {
      createMessageMutate({
        roomId,
        content: data.message,
        parentId:
          messageAction?.mode === "reply" ? messageAction.id : undefined,
      });

      // Clear reply state after sending
      if (messageAction?.mode === "reply" && onCancelAction) {
        onCancelAction();
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {messageAction && (
        <MessageIndicator
          mode={messageAction.mode}
          text={messageAction.content}
          senderName={messageAction.senderName}
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
