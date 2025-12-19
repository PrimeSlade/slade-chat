import { Skeleton } from "@/components/ui/skeleton";

export function FriendBoxSkeleton() {
  return (
    <div className="p-4 rounded-lg flex items-center space-x-4 border">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}
