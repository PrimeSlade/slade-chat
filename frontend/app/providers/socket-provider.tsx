"use client";

import { ReactNode, useEffect } from "react";
import { socket } from "@/lib/socket";
import { authClient } from "@/lib/auth-client";

export default function SocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const connectSocket = async () => {
      const { data } = await authClient.token();
      if (!data?.token) return;

      socket.auth = {
        token: data.token,
      };

      if (!socket.connected) {
        socket.connect();
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

  return <>{children}</>;
}
