import { useEffect, useState } from "react";

// Temporary comment to force re-compilation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useUserStore } from "@/stores/user/user.store";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mailingService } from "@/services/mailing.service";

interface User {
  _id: string;
  telegram_id: number;
  full_name: string;
  username?: string;
  status: "active" | "not_active" | "block";
  createdAt: string;
}

export default function Users() {
  const { users, totalUsers, loading, pagination, globalFilter, fetchUsers, setPagination, setGlobalFilter, updateUserStatus, makeUserAdmin } = useUserStore();
  const [selectedUserForAdmin, setSelectedUserForAdmin] = useState<User | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isMakeAdminDialogOpen, setIsMakeAdminDialogOpen] = useState(false);
  const { auth } = useAuthStore();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isMailingDialogOpen, setIsMailingDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filterStatus, setFilterStatus] = useState<User["status"] | "all">("all");
  const [isSending, setIsSending] = useState(false); // New state for sending status

  useEffect(() => {
    fetchUsers(globalFilter, filterStatus === "all" ? undefined : filterStatus);
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, filterStatus, fetchUsers]);

  const handleStatusChange = async (userId: number, currentStatus: User["status"]) => {
    await updateUserStatus(userId, currentStatus);
  };

  const handleMakeAdminClick = (user: User) => {
    setSelectedUserForAdmin(user);
    setIsMakeAdminDialogOpen(true);
  };

  const handleMakeAdminSubmit = async () => {
    if (!selectedUserForAdmin || !adminPassword) {
      toast.error("Iltimos, parol kiriting.");
      return;
    }
    await makeUserAdmin(selectedUserForAdmin.telegram_id, adminPassword);
    setIsMakeAdminDialogOpen(false);
    setAdminPassword("");
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && (!selectedFiles || selectedFiles.length === 0)) {
      toast.error("Xabar matnini kiriting yoki fayl yuklang.");
      return;
    }

    setIsSending(true); // Set sending to true

    const formData = new FormData();
    formData.append("userIds", JSON.stringify(selectedUsers));
    if (messageText.trim()) {
      formData.append("text", messageText.trim());
    }
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }
    }

    try {
      await mailingService.sendMessage(formData);
      toast.success("Xabar yuborish jarayoni boshlandi.");
      setIsMailingDialogOpen(false);
      setMessageText("");
      setSelectedFiles(null);
      setSelectedUsers([]);
    } catch (error) {
      toast.error("Xabar yuborishda xatolik yuz berdi.");
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false); // Set sending to false regardless of success or failure
    }
  };

  const columns = [
    { key: "select", header: (
      <Checkbox
        checked={selectedUsers.length === users.length && users.length > 0}
        onCheckedChange={handleSelectAllUsers}
      />
    ) },
    { key: "telegram_id", header: "Telegram ID" },
    { key: "full_name", header: "To'liq ism" },
    { key: "username", header: "Foydalanuvchi nomi" },
    { key: "status", header: "Holat" },
    { key: "createdAt", header: "Qo'shilgan sana" },
    { key: "actions", header: "Amallar" },
  ];

  const canGoPreviousPage = pagination.pageIndex > 0;
  const canGoNextPage = (pagination.pageIndex + 1) * pagination.pageSize < totalUsers;

  const handlePreviousPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 });
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Foydalanuvchilarni boshqarish</h1>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Barcha ustunlar bo'yicha qidirish..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Select onValueChange={(value: User["status"] | "all") => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Holat bo'yicha filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="active">Faol</SelectItem>
            <SelectItem value="not_active">NoFaol</SelectItem>
            <SelectItem value="block">Bloklangan</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setIsMailingDialogOpen(true)}
          disabled={selectedUsers.length === 0}
        >
          Tanlanganlarga xabar yuborish ({selectedUsers.length})
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : users.length ? (
              users.map((userRow) => (
                <TableRow key={userRow._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(userRow._id)}
                      onCheckedChange={(checked: boolean) => handleSelectUser(userRow._id, checked)}
                    />
                  </TableCell>
                  <TableCell>{userRow.telegram_id}</TableCell>
                  <TableCell>{userRow.full_name}</TableCell>
                  <TableCell>{userRow.username}</TableCell>
                  <TableCell>{userRow.status}</TableCell>
                  <TableCell>{new Date(userRow.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant={userRow.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleStatusChange(userRow.telegram_id, userRow.status)}
                      >
                        {userRow.status === "active" ? "Bloklash" : "Faollashtirish"}
                      </Button>
                      {auth?.role === "super_admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMakeAdminClick(userRow)}
                        >
                          Admin qilish
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Natijalar topilmadi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={!canGoPreviousPage}
        >
          Oldingi
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!canGoNextPage}
        >
          Keyingi
        </Button>
      </div>

      <Dialog open={isMakeAdminDialogOpen} onOpenChange={setIsMakeAdminDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yangi admin yaratish</DialogTitle>
            <DialogDescription>
              Yangi admin foydalanuvchi uchun parol kiriting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telegram_id" className="text-right">
                Telegram ID
              </Label>
              <Input
                id="telegram_id"
                value={selectedUserForAdmin?.telegram_id || ""}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Parol
              </Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleMakeAdminSubmit}>Admin yaratish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mailing Dialog */}
      <Dialog open={isMailingDialogOpen} onOpenChange={setIsMailingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tanlanganlarga xabar yuborish</DialogTitle>
            <DialogDescription>
              Tanlangan {selectedUsers.length} foydalanuvchiga xabar yuboring.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileInput" className="text-right">Fayl yuklash</Label>
              <Input
                id="fileInput"
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="messageText" className="text-right">Xabar matni / Sarlavha</Label>
              <Textarea
                id="messageText"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="col-span-3"
                placeholder="Xabar matnini yoki sarlavhani kiriting..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
