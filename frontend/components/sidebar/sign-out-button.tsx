"use client";

import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../message/confirm-dialog";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <ConfirmDialog
      trigger={
        <Button className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      }
      title="Sign Out"
      description="Are you sure you want to log out?"
      confirmText="Yes"
      cancelText="No"
      onConfirm={handleSignOut}
    />
  );
}
