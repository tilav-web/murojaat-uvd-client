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
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Bot className="size-8" />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Sog'lom Yurt
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuGroups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              {group.items.map((item, itemIndex) => {
                if (item.path === "/admins" && auth?.role !== "super_admin") {
                  return null;
                }
                return (
                  <SidebarMenuItem key={itemIndex}>
                    <Link to={item.path}>
                      <SidebarMenuButton tooltip={item.name}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Parolni o'zgartirish"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              <KeyRound className="h-4 w-4" />
              <span>Parolni o'zgartirish</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Parolni o'zgartirish</DialogTitle>
            <DialogDescription>
              O'zingiz uchun yangi parol kiriting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Yangi parol
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordChange}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};
