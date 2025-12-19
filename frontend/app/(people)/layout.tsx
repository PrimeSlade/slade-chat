import NavBar from "@/components/navbar/nav-bar";
import { getFriends, getStrangers } from "@/lib/api/friends";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React, { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["friends"], queryFn: getFriends }),
    queryClient.prefetchQuery({
      queryKey: ["strangers"],
      queryFn: getStrangers,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 space-y-4">
        <NavBar />
        <div>{children}</div>
      </div>
    </HydrationBoundary>
  );
}
