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
    await removeAdmin(selectedAdmin.uid);
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
    await updateAdminPassword(selectedAdmin.uid, password);
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
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Adminlarni boshqarish</h1>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Barcha ustunlar bo'yicha qidirish..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Select onValueChange={(value: AdminRole | "all") => setFilterRole(value)} value={filterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rol bo'yicha filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value={AdminRole.ADMIN}>Admin</SelectItem>
            <SelectItem value={AdminRole.SUPER_ADMIN}>Super Admin</SelectItem>
          </SelectContent>
        </Select>
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
            ) : admins.length ? (
              admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell>{admin.uid}</TableCell>
                  <TableCell>{admin.full_name}</TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveClick(admin)}
                        disabled={auth?.uid === admin.uid}
                      >
                        Adminlikdan olish
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePasswordClick(admin)}
                      >
                        Parolni o'zgartirish
                      </Button>
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

      {/* Remove Admin Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adminni o'chirishni tasdiqlang</DialogTitle>
            <DialogDescription>
              Rostdan ham {selectedAdmin?.full_name} ({selectedAdmin?.uid}) ni adminlikdan olib tashlamoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>Bekor qilish</Button>
            <Button variant="destructive" onClick={handleRemoveConfirm}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Parolni o'zgartirish</DialogTitle>
            <DialogDescription>
              {selectedAdmin?.full_name} ({selectedAdmin?.uid}) uchun yangi parol kiriting.
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
            <Button onClick={handlePasswordSubmit}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
