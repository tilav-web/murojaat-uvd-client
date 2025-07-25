import { useEffect, useState } from "react";
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
import { Users as UsersIcon, Search, Filter, ChevronLeft, ChevronRight, UserPlus, MessageSquare, Ban, CheckCircle } from "lucide-react";

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
    try {
      await updateUserStatus(userId, currentStatus);
      toast.success("Foydalanuvchi holati muvaffaqiyatli yangilandi!");
    } catch (error) {
      toast.error("Foydalanuvchi holatini yangilashda xatolik yuz berdi.");
      console.error(error);
    }
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
    try {
      await makeUserAdmin(selectedUserForAdmin.telegram_id, adminPassword);
      toast.success("Foydalanuvchi admin qilib tayinlandi!");
    } catch (error) {
      toast.error("Admin qilishda xatolik yuz berdi.");
      console.error(error);
    }
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
        className="border-[#62e3c8] data-[state=checked]:bg-[#62e3c8] data-[state=checked]:text-white"
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
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <UsersIcon className="w-8 h-8 text-[#62e3c8]" /> Foydalanuvchilarni boshqarish
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Barcha ustunlar bo'yicha qidirish..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
          />
        </div>
        <Select onValueChange={(value: User["status"] | "all") => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-full md:w-[200px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
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
          className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5" /> Tanlanganlarga xabar yuborish ({selectedUsers.length})
        </Button>
      </div>

      <div className="rounded-lg border shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="text-gray-700 font-semibold py-3 px-4">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : users.length ? (
              users.map((userRow) => (
                <TableRow key={userRow._id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="py-3 px-4">
                    <Checkbox
                      checked={selectedUsers.includes(userRow._id)}
                      onCheckedChange={(checked: boolean) => handleSelectUser(userRow._id, checked)}
                      className="border-[#62e3c8] data-[state=checked]:bg-[#62e3c8] data-[state=checked]:text-white"
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4 font-medium text-gray-700">{userRow.telegram_id}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{userRow.full_name}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{userRow.username}</TableCell>
                  <TableCell className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userRow.status === "active" ? "bg-green-100 text-green-800" :
                        userRow.status === "not_active" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      {userRow.status === "active" ? "Faol" :
                       userRow.status === "not_active" ? "NoFaol" :
                       "Bloklangan"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{new Date(userRow.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant={userRow.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleStatusChange(userRow.telegram_id, userRow.status === "active" ? "block" : "active")}
                        className={`px-3 py-2 rounded-md flex items-center gap-1 ${
                          userRow.status === "active" ? "bg-red-500 hover:bg-red-600 text-white" :
                          "bg-[#62e3c8] hover:bg-[#52c2b0] text-white"
                        }`}
                      >
                        {userRow.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} {userRow.status === "active" ? "Bloklash" : "Faollashtirish"}
                      </Button>
                      {auth?.role === "super_admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMakeAdminClick(userRow)}
                          className="border-[#62e3c8] text-[#62e3c8] hover:bg-[#62e3c8] hover:text-white px-3 py-2 rounded-md flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" /> Admin qilish
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
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
          className="border-[#62e3c8] text-[#62e3c8] hover:bg-[#62e3c8] hover:text-white flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Oldingi
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!canGoNextPage}
          className="border-[#62e3c8] text-[#62e3c8] hover:bg-[#62e3c8] hover:text-white flex items-center gap-1"
        >
          Keyingi <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={isMakeAdminDialogOpen} onOpenChange={setIsMakeAdminDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Yangi admin yaratish</DialogTitle>
            <DialogDescription className="text-gray-600">
              <span className="font-semibold">{selectedUserForAdmin?.full_name} ({selectedUserForAdmin?.telegram_id})</span> uchun parol kiriting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telegram_id" className="text-right text-gray-700">
                Telegram ID
              </Label>
              <Input
                id="telegram_id"
                value={selectedUserForAdmin?.telegram_id || ""}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right text-gray-700">
                Parol
              </Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button onClick={handleMakeAdminSubmit} className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white">
              Admin yaratish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mailing Dialog */}
      <Dialog open={isMailingDialogOpen} onOpenChange={setIsMailingDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Tanlanganlarga xabar yuborish</DialogTitle>
            <DialogDescription className="text-gray-600">
              Tanlangan {selectedUsers.length} foydalanuvchiga xabar yuboring.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileInput" className="text-right text-gray-700">Fayl yuklash</Label>
              <Input
                id="fileInput"
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="messageText" className="text-right text-gray-700">Xabar matni / Sarlavha</Label>
              <Textarea
                id="messageText"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
                placeholder="Xabar matnini yoki sarlavhani kiriting..."
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button onClick={handleSendMessage} disabled={isSending} className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white">
              {isSending ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
