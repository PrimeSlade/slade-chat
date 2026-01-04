"use client";

import { ReactNode, useEffect } from "react";
import { socket } from "@/lib/socket";
import { authClient } from "@/lib/auth-client";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const connectSocket = async () => {
      const { data } = await authClient.token();
      if (!data?.token) return;

      socket.auth = {
        token: data.token,
      };

      socket.connect();
    };

    connectSocket();

    return () => {
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
};
