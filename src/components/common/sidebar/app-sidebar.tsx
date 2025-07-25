import { Link } from "react-router-dom";
import { menuGroups } from "./menu";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "../../../components/ui/sidebar";
import { LogOut, Bot, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import headerbg from "@/assets/headerbg.jpg";

export const AppSidebar = () => {
  const { auth, setAuth } = useAuthStore();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogout = () => {
    setAuth(null);
  };

  const handlePasswordChange = async () => {
    if (!password) {
      toast.error("Iltimos, yangi parol kiriting.");
      return;
    }
    try {
      await authService.updateAdminPassword(auth!.uid, password);
      toast.success("Parol muvaffaqiyatli o'zgartirildi.");
      setIsPasswordDialogOpen(false);
      setPassword("");
    } catch (error) {
      console.log(error);
      toast.error("Parolni o'zgartirishda xatolik yuz berdi.");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent
        style={{
          backgroundImage: `url(${headerbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="py-4"
      >
        <SidebarHeader className="py-4 px-6">
          <div className="flex items-center gap-3">
            <Bot className="size-9 text-[#365241]" />
            <span className="text-xl font-bold group-data-[collapsible=icon]:hidden text-[#365241]">
              Sog'lom Yurt
            </span>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          {menuGroups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex} className="mb-4">
              <SidebarGroupLabel className="text-[#365241] uppercase text-sm font-semibold mb-2 group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              {group.items.map((item, itemIndex) => {
                if (item.path === "/admins" && auth?.role !== "super_admin") {
                  return null;
                }
                return (
                  <SidebarMenuItem key={itemIndex} className="py-2">
                    <Link to={item.path}>
                      <SidebarMenuButton
                        tooltip={item.name}
                        className="text-[#365241] font-bold hover:text-white hover:bg-[#367769] cursor-pointer data-[active=true]:bg-[#62e3c8] data-[active=true]:text-gray-900 rounded-md py-2 px-4 transition-colors duration-200"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-lg">{item.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter
        style={{
          backgroundImage: `url(${headerbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="py-4 px-6"
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Parolni o'zgartirish"
              onClick={() => setIsPasswordDialogOpen(true)}
              className="text-[#365241] hover:bg-[#62e3c8] hover:text-white rounded-md py-2 px-4 transition-colors duration-200"
            >
              <KeyRound className="h-5 w-5 text-[#365241]" />
              <span className="text-lg text-[#365241]">
                Parolni o'zgartirish
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Chiqish"
              onClick={handleLogout}
              className="text-[#365241] hover:bg-red-600 hover:text-white rounded-md py-2 px-4 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 text-[#365241]" />
              <span className="text-lg text-[#365241]">Chiqish</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Parolni o'zgartirish
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              O'zingiz uchun yangi parol kiriting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right text-gray-700">
                Yangi parol
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              onClick={handlePasswordChange}
              className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white"
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};
