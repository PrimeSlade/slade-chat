"use client";
import { useFriendsStatus } from "@/hooks/use-friends";
import { useSocket } from "@/hooks/use-socket";
import { ResponseFormat, UserStatus } from "@backend/shared";
import { useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, useEffect } from "react";

export default function UserStatusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const handleStatus = (payload: UserStatus) => {
      queryClient.setQueryData(
        ["friends-status"],
        (oldData: ResponseFormat<UserStatus[]>) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((friend) =>
              friend.userId === payload.userId
                ? { ...friend, status: payload.status }
                : friend
            ),
          };
        }
      );
    };

    const handleRoomInvalidate = () => {
      console.log("Called");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    };

    socket.on("user_status", handleStatus);
    socket.on("room_invalidate", handleRoomInvalidate);

    return () => {
      socket.off("user_status", handleStatus);
      socket.off("room_invalidate", handleRoomInvalidate);
    };
  }, [socket, queryClient]);

  return <div>{children}</div>;
}
