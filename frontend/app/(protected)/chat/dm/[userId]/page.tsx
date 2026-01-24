"use client";
import { ChatWindow } from "@/components/chat-window/chat-window";
import { useParams } from "next/navigation";

export default function DmPage() {
  const { userId } = useParams();

  return (
    <div>
      <ChatWindow isGhostMode={true} userId={userId as string} />
    </div>
  );
}
