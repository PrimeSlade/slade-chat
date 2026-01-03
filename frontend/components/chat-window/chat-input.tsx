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
import { createMessage } from "@/lib/api/messages";

interface ChatInputProps {
  isGhostMode?: boolean;
  userId?: string;
  roomId?: string;
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
}: ChatInputProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { message: "" },
  });

  const { mutate: directRoomMutate } = useMutation({
    mutationFn: createDirectRoom,
    onSuccess: (data) => {
      router.replace(`/chat/${data!.data.id}`);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const { mutate: createMessageMutate } = useMutation({
    mutationFn: createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      form.reset();
    },
  });

  const messageValue = form.watch("message");
  const charCount = messageValue?.length || 0;
  const isExceeded = charCount > 2000;
  const remainingChars = 2000 - charCount;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (isExceeded || !data.message.trim()) return;

    if (isGhostMode && userId) {
      directRoomMutate({ content: data.message, otherId: userId });
    } else if (roomId) {
      createMessageMutate({ roomId, content: data.message });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
      <div className="flex items-center gap-2">
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
