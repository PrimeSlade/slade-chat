import {
  ChatHeaderSkeleton,
  ChatItemSkeleton,
  ChatMessageSkeleton,
} from "@/components/chat-list/chat-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-[19rem] border-r">
        <div className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-6 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ChatItemSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <ChatHeaderSkeleton />
        <div className="flex-1 space-y-6 p-6">
          <ChatMessageSkeleton align="start" />
          <ChatMessageSkeleton align="end" />
          <ChatMessageSkeleton align="start" />
          <ChatMessageSkeleton align="end" />
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
