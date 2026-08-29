"use client";

import { ChatList } from "../chat-list/chat-list";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Header from "./header";
import SignOutButton from "./sign-out-button";
import { useRooms } from "@/hooks/use-rooms";
import { useFriendsStatus, useUserById } from "@/hooks/use-friends";
import { useParams } from "next/navigation";
import {
  ChatHeaderSkeleton,
  ChatItemSkeleton,
} from "../chat-list/chat-skeletons";

export default function AppSidebar() {
  const { userId, roomId } = useParams();

  // Prefetch all data at sidebar level
  const { data: roomsData, isLoading: isLoadingRooms } = useRooms();
  const { data: userData, isLoading: isLoadingUser } = useUserById(
    userId as string
  );
  const { data: userStatuses } = useFriendsStatus();

  const isLoading = isLoadingRooms || (userId && isLoadingUser);

  if (isLoading) {
    return (
      <Sidebar>
        <SidebarHeader className="border-b p-0">
          <ChatHeaderSkeleton />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-0">
            <div className="space-y-3 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ChatItemSkeleton key={i} />
              ))}
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-0">
        <Header />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <ChatList
            roomsData={roomsData}
            userData={userData}
            userStatuses={userStatuses}
            userId={userId as string}
            roomId={roomId as string}
          />
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SignOutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
