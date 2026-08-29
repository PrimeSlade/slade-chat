import { Skeleton } from "@/components/ui/skeleton";

export function ChatItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg p-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-6" />
    </div>
  );
}

export function ChatMessageSkeleton({ align }: { align: "start" | "end" }) {
  const alignment = align === "start" ? "items-start" : "items-end";
  const bubble = align === "start" ? "rounded-br-none" : "rounded-bl-none";
  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      <Skeleton className={`h-10 w-48 rounded-lg ${bubble}`} />
    </div>
  );
}
