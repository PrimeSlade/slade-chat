"use client";

import { useSession } from "@/lib/auth-client"; // Import the hook you exported
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();

  if (isPending) return <div>Loading...</div>;

  if (!session) {
    return <div>Not signed in</div>;
  }

  // if (!session.user.username) {
  //   router.push("/username");
  // }

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Select someone to start chatting</p>
    </div>
  );
}
