import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// Temporary comment to force re-compilation for default export issue (3)
// Temporary comment to force re-compilation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEmergencyStore } from "@/stores/emergency/emergency.store";
import type { IEmergency } from "@/interfaces/emergency.interface";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Emergency() {
  const {
    emergencies,
    totalEmergencies,
    loading,
    pagination,
    globalFilter,
    filterStatus,
    filterType,
    statistics,
    fetchEmergencies,
    fetchEmergencyStatistics,
    setPagination,
    setGlobalFilter,
    setFilterStatus,
    setFilterType,
    updateEmergencyType,
  } = useEmergencyStore();

  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [selectedEmergencyForTypeChange, setSelectedEmergencyForTypeChange] =
    useState<IEmergency | null>(null);
  const [selectedNewType, setSelectedNewType] = useState<
    IEmergency["type"] | null
  >(null);

  const handleTypeChangeClick = (emergency: IEmergency) => {
    setSelectedEmergencyForTypeChange(emergency);
    setSelectedNewType(emergency.type);
    setIsTypeDialogOpen(true);
  };

  const handleUpdateType = async () => {
    if (!selectedEmergencyForTypeChange || !selectedNewType) {
      toast.error("Favqulodda vaziyat yoki turi tanlanmagan.");
      return;
    }

    try {
      await updateEmergencyType(
        selectedEmergencyForTypeChange.group_message_id!,
        selectedNewType
      );
      toast.success("Favqulodda vaziyat turi yangilandi.");
      setIsTypeDialogOpen(false);
      setSelectedEmergencyForTypeChange(null);
      setSelectedNewType(null);
    } catch (error) {
      toast.error("Favqulodda vaziyat turini yangilashda xatolik yuz berdi.");
      console.error("Error updating emergency type:", error);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    fetchEmergencyStatistics();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, filterStatus, filterType, fetchEmergencies, fetchEmergencyStatistics]);

  const columns = [
    { key: "user", header: "Foydalanuvchi" },
    { key: "message", header: "Xabar" },
    { key: "status", header: (
      <div className="flex flex-col">
        <span>Holat</span>
        <Select
          onValueChange={(value: IEmergency["status"] | "all") => setFilterStatus(value)}
          value={filterStatus}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="pending">Kutilayotgan</SelectItem>
            <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
            <SelectItem value="canceled">Bekor qilingan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ) },
    { key: "type", header: (
      <div className="flex flex-col">
        <span>Turi</span>
        <Select
          onValueChange={(value: IEmergency["type"] | "all") => setFilterType(value)}
          value={filterType}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="PENDING">Kutilmoqda</SelectItem>
            <SelectItem value="IN_PROGRESS">Jarayonda</SelectItem>
            <SelectItem value="RESOLVED">Hal qilingan</SelectItem>
            <SelectItem value="FAKE">Soxta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ) },
    { key: "createdAt", header: "Yaratilgan sana" },
    { key: "actions", header: "Amallar" },
  ];

  const canGoPreviousPage = pagination.pageIndex > 0;
  const canGoNextPage =
    (pagination.pageIndex + 1) * pagination.pageSize < totalEmergencies;

  const handlePreviousPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 });
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 });
  };

  const getTelegramLink = (group_message_id: number) => {
    const GROUP_ID = import.meta.env.VITE_TELEGRAM_GROUP_ID; // .env fayldan olinadi
    if (!GROUP_ID) {
      toast.error("Telegram guruh ID topilmadi.");
      return "#";
    }
    return `https://t.me/c/${GROUP_ID.replace("-100", "")}/${group_message_id}`;
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Favqulodda vaziyatlar</h1>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jami favqulodda vaziyatlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {statistics?.totalEmergencies ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasdiqlanganlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {statistics?.confirmedEmergencies ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bekor qilinganlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {statistics?.canceledEmergencies ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kutilayotganlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {statistics?.pendingEmergencies ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table and Filters */}
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Qidirish..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : emergencies.length ? (
              emergencies.map((emergency) => (
                <TableRow key={emergency._id}>
                  <TableCell>
                    <Link
                      to={`/users?telegram_id=${emergency.user.telegram_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {emergency.user.full_name ||
                        emergency.user.username ||
                        emergency.user.telegram_id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {emergency.message_content || emergency.message_type}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              emergency.status === "confirmed" &&
                                "bg-green-100 text-green-800",
                              emergency.status === "canceled" &&
                                "bg-red-100 text-red-800",
                              emergency.status === "pending" &&
                                "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {emergency.status === "confirmed"
                              ? "Tasdiqlangan"
                              : emergency.status === "canceled"
                              ? "Bekor qilingan"
                              : "Kutilmoqda"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {emergency.status === "confirmed"
                              ? "Foydalanuvchi tomonidan tasdiqlangan xabar"
                              : emergency.status === "canceled"
                              ? "Foydalanuvchi tomonidan bekor qilingan xabar"
                              : "Foydalanuvchi xabar yuborgan va tasdiqlamagan ham bekor ham qilmagan"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTypeChangeClick(emergency)}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        emergency.type === "PENDING" &&
                          "bg-yellow-100 text-yellow-800",
                        emergency.type === "IN_PROGRESS" &&
                          "bg-blue-100 text-blue-800",
                        emergency.type === "RESOLVED" &&
                          "bg-green-100 text-green-800",
                        emergency.type === "FAKE" && "bg-gray-800 text-white"
                      )}
                    >
                      {emergency.type === "PENDING"
                        ? "Kutilmoqda"
                        : emergency.type === "IN_PROGRESS"
                        ? "Jarayonda"
                        : emergency.type === "RESOLVED"
                        ? "Hal qilingan"
                        : "Soxta"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(emergency.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {emergency.group_message_id && (
                        <Button asChild size="sm">
                          <a
                            href={getTelegramLink(emergency.group_message_id)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Telegramda ko'rish
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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

      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Favqulodda vaziyat turini yangilash</DialogTitle>
            <DialogDescription>
              Favqulodda vaziyatning yangi turini tanlang.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message-info" className="text-right">
                Xabar
              </Label>
              <Input
                id="message-info"
                value={
                  selectedEmergencyForTypeChange?.message_content ||
                  selectedEmergencyForTypeChange?.message_type ||
                  ""
                }
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-type" className="text-right">
                Joriy turi
              </Label>
              <Input
                id="current-type"
                value={selectedEmergencyForTypeChange?.type || ""}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type" className="text-right">
                Yangi turi
              </Label>
              <Select
                onValueChange={(value: IEmergency["type"]) =>
                  setSelectedNewType(value)
                }
                value={selectedNewType || ""}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Yangi turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                  <SelectItem value="IN_PROGRESS">Jarayonda</SelectItem>
                  <SelectItem value="RESOLVED">Hal qilingan</SelectItem>
                  <SelectItem value="FAKE">Soxta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateType}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
