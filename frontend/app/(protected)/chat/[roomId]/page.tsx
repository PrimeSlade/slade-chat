"use client";
import { ChatWindow } from "@/components/chat-window/chat-window";
import { useSocket } from "@/hooks/use-socket";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ResponseFormat,
  RoomWithParticipantStatus,
  UserStatus,
} from "@backend/shared";

export default function ChatPage() {
  const { roomId } = useParams();
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    console.log("📍 Joining room:", roomId);
    socket.emit("join_room", { roomId });

    const handleUserJoin = (payload: UserStatus) => {
      queryClient.setQueryData<ResponseFormat<RoomWithParticipantStatus>>(
        ["room", "me", roomId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              room: {
                ...oldData.data.room,
                participants: oldData.data.room.participants.map(
                  (participant) => {
                    if (participant.userId === payload.userId) {
                      return {
                        ...participant,
                        user: {
                          ...participant.user,
                          status: payload.status, // Update status
                        },
                      };
                    }

                    return participant;
                  }
                ),
              },
            },
          };
        }
      );
    };

    const handleUserLeave = (payload: UserStatus) => {
      queryClient.setQueryData<ResponseFormat<RoomWithParticipantStatus>>(
        ["room", "me", roomId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              room: {
                ...oldData.data.room,
                participants: oldData.data.room.participants.map(
                  (participant) => {
                    if (participant.userId === payload.userId) {
                      return {
                        ...participant,
                        user: {
                          ...participant.user,
                          status: payload.status, // Update status
                        },
                      };
                    }

                    return participant;
                  }
                ),
              },
            },
          };
        }
      );
    };

    socket.on("user_status_room_inc", handleUserJoin);
    socket.on("user_status_room_dec", handleUserLeave);

    return () => {
      console.log("📍 Leaving room:", roomId);
      socket.emit("leave_room", { roomId });
      socket.off("user_status_room_inc", handleUserJoin);
      socket.off("user_status_room_dec", handleUserLeave);
    };
  }, [roomId, queryClient]);

  return (
    <div>
      <ChatWindow roomId={roomId as string} />
    </div>
  );
}
