import { ChatList } from "../chat-list/chat-list";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Header from "./header";

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-0">
        <Header />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <ChatList />
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
