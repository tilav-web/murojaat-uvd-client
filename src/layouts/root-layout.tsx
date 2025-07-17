import { Outlet } from "react-router-dom";
import { Header } from "@/components/common/header/header";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";

export function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
