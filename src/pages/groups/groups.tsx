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
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, filterStatus]);

  const handleStatusChange = async (groupId: number, currentStatus: IGroup["status"]) => {
    await updateGroupStatus(groupId, currentStatus);
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
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Guruhlarni boshqarish</h1>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Barcha ustunlar bo'yicha qidirish..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Select onValueChange={(value: IGroup["status"] | "all") => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-[180px]">
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
        >
          Tanlanganlarga xabar yuborish ({selectedGroups.length})
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
            ) : groups.length ? (
              groups.map((groupRow) => (
                <TableRow key={groupRow._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedGroups.includes(groupRow._id)}
                      onCheckedChange={(checked: boolean) => handleSelectGroup(groupRow._id, checked)}
                    />
                  </TableCell>
                  <TableCell>{groupRow.group}</TableCell>
                  <TableCell>{groupRow.telegram_id}</TableCell>
                  <TableCell>{groupRow.name}</TableCell>
                  <TableCell>{groupRow.username}</TableCell>
                  <TableCell>{groupRow.status}</TableCell>
                  <TableCell>{new Date(groupRow.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant={groupRow.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleStatusChange(groupRow.group, groupRow.status)}
                      >
                        {groupRow.status === "active" ? "Bloklash" : "Faollashtirish"}
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

      {/* Mailing Dialog */}
      <Dialog open={isMailingDialogOpen} onOpenChange={setIsMailingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tanlanganlarga xabar yuborish</DialogTitle>
            <DialogDescription>
              Tanlangan {selectedGroups.length} guruhga xabar yuboring.
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
