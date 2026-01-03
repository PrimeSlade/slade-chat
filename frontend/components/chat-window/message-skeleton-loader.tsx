import { Skeleton } from "../ui/skeleton";

export function MessageSkeletonLoader() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex w-full items-end gap-2 justify-end">
        <div className="max-w-[70%]">
          <Skeleton className="h-10 w-40 rounded-2xl rounded-br-none" />
        </div>
      </div>

      <div className="flex w-full items-end gap-2 justify-start">
        <div className="w-8 flex-shrink-0">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="max-w-[70%]">
          <Skeleton className="h-20 w-72 rounded-2xl rounded-bl-none" />
        </div>
      </div>

      <div className="flex w-full items-end gap-2 justify-end">
        <div className="max-w-[70%]">
          <Skeleton className="h-14 w-52 rounded-2xl rounded-br-none" />
        </div>
      </div>

      <div className="flex w-full items-end gap-2 justify-start">
        <div className="w-8 flex-shrink-0">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="max-w-[70%]">
          <Skeleton className="h-10 w-32 rounded-2xl rounded-bl-none" />
        </div>
      </div>

      <div className="flex w-full items-end gap-2 justify-end">
        <div className="max-w-[70%] space-y-2">
          <div className="rounded-2xl rounded-br-none p-2">
            <Skeleton className="h-48 w-56 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex w-full items-end gap-2 justify-start">
        <div className="w-8 flex-shrink-0">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="max-w-[70%]">
          <Skeleton className="h-20 w-72 rounded-2xl rounded-bl-none" />
        </div>
      </div>
    </div>
  );
}
