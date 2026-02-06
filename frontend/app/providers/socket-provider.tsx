"use client";

import { ReactNode, useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { authClient } from "@/lib/auth-client";
import { SocketContext } from "@/contexts/socket-context";
import { toast } from "sonner";
import { WifiOff, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

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

    // Socket event handlers
    const handleConnect = () => {
      console.log("Socket connected successfully");

      // Dismiss specific connection error toasts
      toast.dismiss("connection-error");
      toast.dismiss("disconnect-error");
      toast.dismiss("offline-error");
    };

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
      // Check if browser is offline
      if (!navigator.onLine) {
        toast.error("You are offline", {
          id: "offline-error",
          description: "Please check your internet connection",
          icon: <WifiOff className="h-4 w-4" />,
          action: {
            label: "Retry",
            onClick: () => window.location.reload(),
          },
          duration: Infinity,
        });
      } else if (reason === "io server disconnect") {
        toast.error("Disconnected from server", {
          id: "disconnect-error",
          description: "Connection was closed by the server",
          icon: <WifiOff className="h-4 w-4" />,
          action: {
            label: "Retry",
            onClick: () => window.location.reload(),
          },
          duration: Infinity,
        });
      }
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);

      if (error.message === "unauthorized") {
        connectSocket();
      } else {
        toast.error(" Unable to connect to server", {
          id: "connection-error",
          description: (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Retrying connection...</span>
            </div>
          ),
          icon: <WifiOff className="h-4 w-4" />,
          action: {
            label: "Retry",
            onClick: () => window.location.reload(),
          },
          duration: Infinity,
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !socket.connected) {
        connectSocket();
      }
    };

    const handleOnline = () => {
      console.log("Browser is back online");
      toast.dismiss("connection-error");
      toast.dismiss("disconnect-error");
      toast.dismiss("offline-error");
      toast.success("Connection restored", {
        description: "You are back online",
        icon: <RefreshCw className="h-4 w-4" />,
      });
      if (!socket.connected) {
        connectSocket();
      }
    };

    const handleOffline = () => {
      console.log("Browser went offline");
      toast.error("Connection lost", {
        id: "offline-error",
        description: "You are offline. Connection will resume when back online",
        icon: <WifiOff className="h-4 w-4" />,
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
        duration: Infinity,
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Register browser online/offline listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial connection
    connectSocket();

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // socket.disconnect(); // Optional: Keep connection alive across navigations
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
