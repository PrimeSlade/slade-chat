import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useSocket } from "./use-socket";

export const useMarkAsSeen = (
  roomId?: string,
  lastMessageId?: string | null
) => {
  const socket = useSocket();

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  useEffect(() => {
    if (!inView || !lastMessageId || !roomId || !socket) return;

    if (lastMessageId.startsWith("temp-")) return;

    if (document.visibilityState === "visible") {
      // console.log("Marking seen:", lastMessageId);

      socket.emit("mark_seen", {
        roomId,
        messageId: lastMessageId,
      });
    }
  }, [inView, lastMessageId, roomId, socket]);

  return ref;
};
