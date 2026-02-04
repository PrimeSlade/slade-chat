"use client";

import { ReactNode, useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { authClient } from "@/lib/auth-client";
import { SocketContext } from "@/contexts/socket-context";

//TODO: handle loading state later if anything happens related to websocket / handle re connecting once we have deployed
export default function SocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const connectSocket = async () => {
      try {
        const { data } = await authClient.token();
        if (!data?.token) return;

        socket.auth = {
          token: data.token,
        };

        if (!socket.connected) {
          socket.connect();
        }
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    connectSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !socket.connected) {
        connectSocket();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // socket.disconnect(); //Optional
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
