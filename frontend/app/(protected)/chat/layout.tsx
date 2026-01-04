import React, { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/app-sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
          "--sidebar-width-mobile": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <main className="w-full">{children}</main>
    </SidebarProvider>
  );
}
