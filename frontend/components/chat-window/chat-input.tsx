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
import { createMessage, updateMessage } from "@/lib/api/messages";
import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { EditIndicator } from "../ui/edit-indicator";
import { useSession } from "@/lib/auth-client";
import {
  addToFirstPage,
  updateFirstPage,
  updateRoomMessages,
  updateMessageInPages,
  getSortedMessages,
} from "@/lib/utils";
import {
  ResponseFormat,
  RoomParticipantWithRoom,
  MessageWithSender,
} from "@backend/shared/index";

interface ChatInputProps {
  isGhostMode?: boolean;
  userId?: string;
  roomId?: string;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
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
  onCancelEdit,
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

  //create message
  const { mutate: createMessageMutate } = useMutation({
    mutationFn: createMessage,
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ["messages", roomId, 20] });
      await queryClient.cancelQueries({ queryKey: ["rooms"] });

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.content,
        createdAt: new Date().toISOString(),
        roomId: roomId,
        senderId: session!.user.id,
        sender: session!.user,
        isPending: true,
      };

      queryClient.setQueryData(["messages", roomId, 20], (oldData: any) => {
        if (!oldData) return oldData;
        return addToFirstPage(oldData, optimisticMessage);
      });

      queryClient.setQueryData(
        ["rooms"],
        (oldData: ResponseFormat<RoomParticipantWithRoom[]>) => {
          if (!oldData) return oldData;

          return updateRoomMessages(oldData, roomId!, {
            id: optimisticMessage.id,
            content: optimisticMessage.content,
            createdAt: new Date(optimisticMessage.createdAt),
            senderId: optimisticMessage.senderId,
            roomId: roomId!,
            updatedAt: null,
            deletedAt: null,
          });
        }
      );

      form.reset();

      return { optimisticMessage };
    },
    onSuccess: (savedMessage, newContent, context) => {
      queryClient.setQueriesData(
        { queryKey: ["messages", roomId] },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          const updatedFirstPageData = oldData.pages[0].data.map((msg: any) => {
            if (msg.id === context?.optimisticMessage.id) {
              return savedMessage!.data;
            }
            return msg;
          });

          return updateFirstPage(oldData, updatedFirstPageData);
        }
      );

      queryClient.setQueryData(
        ["rooms"],
        (oldData: ResponseFormat<RoomParticipantWithRoom[]>) => {
          if (!oldData) return oldData;

          return updateRoomMessages(oldData, roomId!, {
            id: savedMessage!.data.id,
            content: savedMessage!.data.content,
            createdAt: savedMessage!.data.createdAt,
            senderId: savedMessage!.data.senderId,
            roomId: roomId!,
            updatedAt: null,
            deletedAt: null,
          });
        }
      );

      form.reset();
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId, 20] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  //edit message
  const { mutate: updateMessageMutate } = useMutation({
    mutationFn: updateMessage,
    onMutate: async (updatedMessage) => {
      await queryClient.cancelQueries({ queryKey: ["messages", roomId, 20] });
      await queryClient.cancelQueries({ queryKey: ["rooms"] });

      const messagesData = queryClient.getQueryData<any>([
        "messages",
        roomId,
        20,
      ]);

      const sortedMessages = getSortedMessages<MessageWithSender>(
        messagesData,
        "desc"
      );

      const isLatestMessage =
        sortedMessages[0]?.id === updatedMessage.messageId;

      queryClient.setQueryData(["messages", roomId, 20], (oldData: any) => {
        return updateMessageInPages(
          oldData,
          updatedMessage.messageId,
          updatedMessage.content,
          new Date().toISOString()
        );
      });

      if (isLatestMessage) {
        const currentMessage = sortedMessages[0];
        if (currentMessage) {
          queryClient.setQueryData(
            ["rooms"],
            (oldData: ResponseFormat<RoomParticipantWithRoom[]>) => {
              if (!oldData) return oldData;

              return updateRoomMessages(oldData, roomId!, {
                ...currentMessage,
                content: updatedMessage.content,
                updatedAt: new Date(),
              });
            }
          );
        }
      }

      return { previousContent: editingMessage?.content };
    },
    onSuccess: (savedMessage) => {
      queryClient.setQueryData(["messages", roomId, 20], (oldData: any) => {
        return updateMessageInPages(
          oldData,
          savedMessage!.data.id,
          savedMessage!.data.content!,
          savedMessage!.data.updatedAt!
        );
      });

      const messagesData = queryClient.getQueryData<any>([
        "messages",
        roomId,
        20,
      ]);

      const sortedMessages = getSortedMessages<MessageWithSender>(
        messagesData,
        "desc"
      );

      const isLatestMessage = sortedMessages[0]?.id === savedMessage?.data.id;

      if (isLatestMessage) {
        queryClient.setQueryData(
          ["rooms"],
          (oldData: ResponseFormat<RoomParticipantWithRoom[]>) => {
            if (!oldData) return oldData;

            return updateRoomMessages(oldData, roomId!, savedMessage!.data);
          }
        );
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId, 20] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
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
  }, [editingMessage, form]);

  const handleCancelEdit = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    form.setValue("message", "");
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
      form.reset();
      return;
    }

    if (isGhostMode && userId) {
      directRoomMutate({ content: data.message, otherId: userId });
    } else if (roomId) {
      createMessageMutate({ roomId, content: data.message });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {editingMessage && (
        <EditIndicator
          editText={editingMessage.content}
          onCancel={handleCancelEdit}
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
