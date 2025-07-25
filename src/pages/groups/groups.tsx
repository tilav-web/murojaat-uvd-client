import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroupStore } from "@/stores/group/group.store";
import type { IGroup } from "@/interfaces/group.interface";
import { groupService } from "@/services/group.service";
import { Users, Search, Filter, ChevronLeft, ChevronRight, MessageSquare, Send, PlusCircle, Ban, CheckCircle } from "lucide-react";

export default function Groups() {
  const { groups, totalGroups, loading, pagination, globalFilter, fetchGroups, setPagination, setGlobalFilter, updateGroupStatus } = useGroupStore();

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isMailingDialogOpen, setIsMailingDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filterStatus, setFilterStatus] = useState<IGroup["status"] | "all">("all");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchGroups(globalFilter, filterStatus === "all" ? undefined : filterStatus);
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, filterStatus, fetchGroups]);

  const handleStatusChange = async (groupId: number, currentStatus: IGroup["status"]) => {
    try {
      await updateGroupStatus(groupId, currentStatus);
      toast.success("Guruh holati muvaffaqiyatli yangilandi!");
    } catch (error) {
      toast.error("Guruh holatini yangilashda xatolik yuz berdi.");
      console.error(error);
    }
  };

  const handleSelectAllGroups = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(groups.map(group => group._id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleSelectGroup = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups(prev => [...prev, groupId]);
    } else {
      setSelectedGroups(prev => prev.filter(id => id !== groupId));
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && (!selectedFiles || selectedFiles.length === 0)) {
      toast.error("Xabar matnini kiriting yoki fayl yuklang.");
      return;
    }

    setIsSending(true);

    try {
      await groupService.sendMessageToGroup(selectedGroups, messageText.trim(), selectedFiles);
      toast.success("Xabar yuborish jarayoni boshlandi.");
      setIsMailingDialogOpen(false);
      setMessageText("");
      setSelectedFiles(null);
      setSelectedGroups([]);
    } catch (error) {
      toast.error("Xabar yuborishda xatolik yuz berdi.");
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const columns = [
    { key: "select", header: (
      <Checkbox
        checked={selectedGroups.length === groups.length && groups.length > 0}
        onCheckedChange={handleSelectAllGroups}
        className="border-[#62e3c8] data-[state=checked]:bg-[#62e3c8] data-[state=checked]:text-white"
      />
    ) },
    { key: "group", header: "Guruh ID" },
    { key: "telegram_id", header: "Telegram ID" },
    { key: "name", header: "Guruh nomi" },
    { key: "username", header: "Guruh username" },
    { key: "status", header: "Holat" },
    { key: "createdAt", header: "Qo'shilgan sana" },
    { key: "actions", header: "Amallar" },
  ];

  const canGoPreviousPage = pagination.pageIndex > 0;
  const canGoNextPage = (pagination.pageIndex + 1) * pagination.pageSize < totalGroups;

  const handlePreviousPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 });
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 });
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <Users className="w-8 h-8 text-[#62e3c8]" /> Guruhlarni boshqarish
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
        <Select onValueChange={(value: IGroup["status"] | "all") => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-full md:w-[200px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Holat bo'yicha filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="active">Faol</SelectItem>
            <SelectItem value="not_active">NoFaol</SelectItem>
            <SelectItem value="blocked">Bloklangan</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setIsMailingDialogOpen(true)}
          disabled={selectedGroups.length === 0}
          className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Send className="w-5 h-5" /> Tanlanganlarga xabar yuborish ({selectedGroups.length})
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
            ) : groups.length ? (
              groups.map((groupRow) => (
                <TableRow key={groupRow._id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="py-3 px-4">
                    <Checkbox
                      checked={selectedGroups.includes(groupRow._id)}
                      onCheckedChange={(checked: boolean) => handleSelectGroup(groupRow._id, checked)}
                      className="border-[#62e3c8] data-[state=checked]:bg-[#62e3c8] data-[state=checked]:text-white"
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4 font-medium text-gray-700">{groupRow.group}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{groupRow.telegram_id}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{groupRow.name}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{groupRow.username}</TableCell>
                  <TableCell className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        groupRow.status === "active" ? "bg-green-100 text-green-800" :
                        groupRow.status === "not_active" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      {groupRow.status === "active" ? "Faol" :
                       groupRow.status === "not_active" ? "NoFaol" :
                       "Bloklangan"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{new Date(groupRow.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant={groupRow.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleStatusChange(groupRow.group, groupRow.status === "active" ? "blocked" : "active")}
                        className={`px-3 py-2 rounded-md flex items-center gap-1 ${
                          groupRow.status === "active" ? "bg-red-500 hover:bg-red-600 text-white" :
                          "bg-[#62e3c8] hover:bg-[#52c2b0] text-white"
                        }`}
                      >
                        {groupRow.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} {groupRow.status === "active" ? "Bloklash" : "Faollashtirish"}
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

      {/* Mailing Dialog */}
      <Dialog open={isMailingDialogOpen} onOpenChange={setIsMailingDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Tanlanganlarga xabar yuborish</DialogTitle>
            <DialogDescription className="text-gray-600">
              Tanlangan {selectedGroups.length} guruhga xabar yuboring.
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
