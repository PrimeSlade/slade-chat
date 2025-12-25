import { AddFriendDialog } from "@/components/people/add-friend-dialog";
import NavBar from "@/components/navbar/nav-bar";
import { getFriends, getStrangers } from "@/lib/api/friends";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 space-y-4 w-screen">
      <div className="flex justify-between items-center">
        <NavBar />
        <AddFriendDialog />
      </div>
      <div>{children}</div>
    </div>
  );
}
