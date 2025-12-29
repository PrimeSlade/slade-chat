"use client";

import { ReactNode, useEffect } from "react";
import { socket } from "@/lib/socket";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    socket.connect();

    // 3. Cleanup on app unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
};
