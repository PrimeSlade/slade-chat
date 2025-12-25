import { AddFriendDialog } from "@/components/people/add-friend-dialog";
import NavBar from "@/components/navbar/nav-bar";
import { getFriends, getStrangers } from "@/lib/api/friends";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/app-sidebar";

export default async function Layout({ children }: { children: ReactNode }) {
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
      <main className="px-5 w-full">{children}</main>
    </SidebarProvider>
  );
}
