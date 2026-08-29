import AuthGuard from "@/components/guards/auth-guard";
import React from "react";
import SocketProvider from "../providers/socket-provider";
import UserStatusProvider from "../providers/user-status-provider";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AuthGuard>
        <SocketProvider>
          <UserStatusProvider>{children}</UserStatusProvider>
        </SocketProvider>
      </AuthGuard>
    </div>
  );
}
