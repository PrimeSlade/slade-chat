"use client";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "@/lib/api/messages";
import { GetMessagesDto } from "@backend/shared/index";
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
import { UseFormReturn } from "react-hook-form";

type UseMessagesProps = Omit<GetMessagesDto, "cursor">;

export function useMessages({ roomId, limit = 20 }: UseMessagesProps) {
  return useInfiniteQuery({
    queryKey: ["messages", roomId, limit],
    queryFn: ({ pageParam }) =>
      getMessages({ roomId, cursor: pageParam, limit }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor ?? null,
    enabled: !!roomId,
  });
}

interface UseMessageMutationsProps {
  roomId?: string;
  session: any;
  form?: UseFormReturn<any>;
  editingMessage?: { id: string; content: string } | null;
}

export function useMessageMutations({
  roomId,
  session,
  form,
  editingMessage,
}: UseMessageMutationsProps) {
  const queryClient = useQueryClient();

  const createMessageMutation = useMutation({
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
        deletedAt: null,
        updatedAt: null,
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
            updatedAt: optimisticMessage.updatedAt,
            deletedAt: optimisticMessage.deletedAt,
          });
        }
      );

      form?.reset();

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

      form?.reset();
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId, 20] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const updateMessageMutation = useMutation({
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

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) =>
      deleteMessage({ roomId: roomId!, messageId }),
    onMutate: async (messageId) => {
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

      const isLatestMessage = sortedMessages[0]?.id === messageId;

      // Optimistically update to show message as deleted
      queryClient.setQueryData(["messages", roomId, 20], (oldData: any) => {
        if (!oldData) return oldData;

        return updateMessageInPages(
          oldData,
          messageId,
          null,
          new Date().toISOString(),
          new Date().toISOString()
        );
      });

      // Update rooms list if this is the latest message
      if (isLatestMessage) {
        const currentMessage = sortedMessages[0];
        if (currentMessage) {
          queryClient.setQueryData(
            ["rooms"],
            (oldData: ResponseFormat<RoomParticipantWithRoom[]>) => {
              if (!oldData) return oldData;

              return updateRoomMessages(oldData, roomId!, {
                ...currentMessage,
                content: null,
                deletedAt: new Date(),
                updatedAt: new Date(),
              });
            }
          );
        }
      }
    },
    onSuccess: (response, messageId) => {
      // Update with actual server response
      if (response?.data) {
        queryClient.setQueryData(["messages", roomId, 20], (oldData: any) => {
          if (!oldData) return oldData;

          return updateMessageInPages(
            oldData,
            messageId,
            null,
            response.data.updatedAt!,
            response.data.deletedAt
          );
        });

        // Check if deleted message was the latest one
        const messagesData = queryClient.getQueryData<any>([
          "messages",
          roomId,
          20,
        ]);

        const sortedMessages = getSortedMessages<MessageWithSender>(
          messagesData,
          "desc"
        );

        const isLatestMessage = sortedMessages[0]?.id === messageId;

        if (isLatestMessage) {
          queryClient.setQueryData(
            ["rooms"],
            (oldData: ResponseFormat<RoomParticipantWithRoom[]>) => {
              if (!oldData) return oldData;

              return updateRoomMessages(oldData, roomId!, response.data);
            }
          );
        }
      }
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId, 20] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      console.error("Failed to delete message:", error);
    },
  });

  return {
    createMessageMutate: createMessageMutation.mutate,
    updateMessageMutate: updateMessageMutation.mutate,
    deleteMessageMutate: deleteMessageMutation.mutate,
  };
}
