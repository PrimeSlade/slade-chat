import AuthGuard from "@/components/guards/auth-guard";
import React from "react";
import { SocketProvider } from "../providers/socket-provider";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AuthGuard>
        <SocketProvider>{children}</SocketProvider>
      </AuthGuard>
    </div>
  );
}
