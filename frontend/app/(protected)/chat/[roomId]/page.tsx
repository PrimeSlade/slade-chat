"use client";
import { ChatWindow } from "@/components/chat-window/chat-window";
import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const { roomId } = useParams();

  useEffect(() => {
    console.log("📍 Joining room:", roomId);
    socket.emit("join_room", { roomId });

    return () => {
      console.log("📍 Leaving room:", roomId);
      socket.emit("leave_room", { roomId });
    };
  }, [roomId]);

  return (
    <div>
      <ChatWindow roomId={roomId as string} />
    </div>
  );
}
