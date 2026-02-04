import { MessageWithSender } from "@backend/shared/index";
import { useEffect, useRef } from "react";
import { useSocket } from "./use-socket";

export const useMarkAsSeen = (
  roomId: string,
  messages: MessageWithSender[]
) => {
  const socket = useSocket();
  const lastSeenIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!messages.length || !socket || !roomId) return;

    const lastMessage = messages[messages.length - 1];

    // Optimization: Don't send if we already marked this specific ID as seen
    if (lastSeenIdRef.current === lastMessage.id) return;

    //Define the trigger logic
    const markSeen = () => {
      // Check if window is actually focused (User is looking)
      if (document.visibilityState === "visible") {
        socket.emit("mark_seen", {
          roomId,
          messageId: lastMessage.id,
        });

        lastSeenIdRef.current = lastMessage.id;
      }
    };

    markSeen();

    //Handle "On Focus" (User comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markSeen();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [roomId, messages, socket]);
};
