"use client";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";

export default function Header() {
  const { data: session, isPending, error } = useSession();

  if (isPending) return <div>Loading...</div>;

  return (
    <div className="flex items-center gap-4 p-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={session!.user.image!} />
        <AvatarFallback>{getInitials(session!.user.name)}</AvatarFallback>
      </Avatar>
      <h1 className="text-lg font-semibold">Hi, {session!.user.name}</h1>
    </div>
  );
}
