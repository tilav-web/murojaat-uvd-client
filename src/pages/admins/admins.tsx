import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAdminStore } from "@/stores/auth/admin.store";
import { AdminRole } from "@/interfaces/auth.interface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth/auth.store";
import { UserCog, Search, Filter, ChevronLeft, ChevronRight, Trash2, KeyRound } from "lucide-react";

interface Admin {
  _id: string;
  uid: string;
  role: AdminRole;
  full_name: string;
  username?: string;
  createdAt: string;
}

export default function AdminsPage() {
  const { admins, totalAdmins, loading, pagination, globalFilter, fetchAdmins, setPagination, setGlobalFilter, removeAdmin, updateAdminPassword } = useAdminStore();
  const { auth } = useAuthStore();
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<AdminRole | "all">("all");

  useEffect(() => {
    fetchAdmins(globalFilter, filterRole === "all" ? undefined : filterRole);
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, filterRole, fetchAdmins]);

  const handleRemoveClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedAdmin) return;
    try {
      await removeAdmin(selectedAdmin.uid);
      toast.success("Admin muvaffaqiyatli o'chirildi!");
    } catch (error) {
      toast.error("Adminni o'chirishda xatolik yuz berdi.");
      console.error(error);
    }
    setIsRemoveDialogOpen(false);
  };

  const handlePasswordClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async () => {
    if (!selectedAdmin || !password) {
      toast.error("Iltimos, yangi parol kiriting.");
      return;
    }
    try {
      await updateAdminPassword(selectedAdmin.uid, password);
      toast.success("Parol muvaffaqiyatli o'zgartirildi!");
    } catch (error) {
      toast.error("Parolni o'zgartirishda xatolik yuz berdi.");
      console.error(error);
    }
    setIsPasswordDialogOpen(false);
    setPassword("");
  };

  const columns = [
    { key: "uid", header: "Telegram ID" },
    { key: "full_name", header: "To'liq ism" },
    { key: "username", header: "Foydalanuvchi nomi" },
    { key: "role", header: "Rol" },
    { key: "createdAt", header: "Qo'shilgan sana" },
    { key: "actions", header: "Amallar" },
  ];

  const canGoPreviousPage = pagination.pageIndex > 0;
  const canGoNextPage = (pagination.pageIndex + 1) * pagination.pageSize < totalAdmins;

  const handlePreviousPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 });
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 });
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <UserCog className="w-8 h-8 text-[#62e3c8]" /> Adminlarni boshqarish
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
        <Select onValueChange={(value: AdminRole | "all") => setFilterRole(value)} value={filterRole}>
          <SelectTrigger className="w-full md:w-[200px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Rol bo'yicha filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value={AdminRole.ADMIN}>Admin</SelectItem>
            <SelectItem value={AdminRole.SUPER_ADMIN}>Super Admin</SelectItem>
          </SelectContent>
        </Select>
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
            ) : admins.length ? (
              admins.map((admin) => (
                <TableRow key={admin._id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="py-3 px-4 font-medium text-gray-700">{admin.uid}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{admin.full_name}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{admin.username}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{admin.role}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveClick(admin)}
                        disabled={auth?.uid === admin.uid}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Adminlikdan olish
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePasswordClick(admin)}
                        className="border-[#62e3c8] text-[#62e3c8] hover:bg-[#62e3c8] hover:text-white px-3 py-2 rounded-md flex items-center gap-1"
                      >
                        <KeyRound className="w-4 h-4" /> Parolni o'zgartirish
                      </Button>
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

      {/* Remove Admin Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Adminni o'chirishni tasdiqlang</DialogTitle>
            <DialogDescription className="text-gray-600">
              Rostdan ham <span className="font-semibold">{selectedAdmin?.full_name} ({selectedAdmin?.uid})</span> ni adminlikdan olib tashlamoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleRemoveConfirm} className="bg-red-500 hover:bg-red-600 text-white">
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Parolni o'zgartirish</DialogTitle>
            <DialogDescription className="text-gray-600">
              <span className="font-semibold">{selectedAdmin?.full_name} ({selectedAdmin?.uid})</span> uchun yangi parol kiriting.
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
            <Button onClick={handlePasswordSubmit} className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
