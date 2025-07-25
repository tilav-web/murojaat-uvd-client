import { useAuthStore } from "@/stores/auth/auth.store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCheckedUrlStore } from "@/stores/checkedurl/checkedurl.store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ICheckedUrl } from "@/interfaces/checkedurl.interface";
import { toast } from "sonner";

import headerbg from "@/assets/header-bg.webp";

export const Header = () => {
  const { auth } = useAuthStore();
  const {
    pendingCount,
    pendingUrls,
    fetchPendingCount,
    fetchPendingUrls,
    updateCheckedUrlStatus,
  } = useCheckedUrlStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<ICheckedUrl | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    ICheckedUrl["status"] | null
  >(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  const handleBellClick = () => {
    setIsSheetOpen(true);
    fetchPendingUrls();
  };

  const handleStatusClick = (
    url: ICheckedUrl,
    status: ICheckedUrl["status"]
  ) => {
    setSelectedUrl(url);
    setSelectedStatus(status);
    setCategory(url.category || "");
    setDescription(url.description || "");
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUrl || !selectedStatus) {
      toast.error("URL yoki status tanlanmagan.");
      return;
    }

    try {
      await updateCheckedUrlStatus(
        selectedUrl._id,
        selectedStatus,
        category,
        description
      );
      toast.success("URL statusi muvaffaqiyatli yangilandi.");
      setIsDialogOpen(false);
      setIsSheetOpen(false);
      setSelectedUrl(null);
      setSelectedStatus(null);
      setCategory("");
      setDescription("");
    } catch (error) {
      toast.error("URL statusini yangilashda xatolik yuz berdi.");
      console.error("Error updating URL status:", error);
    }
  };

  return (
    <header
      style={{
        backgroundImage: `url(${headerbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="flex h-20 items-center justify-between border-b dark:bg-slate-800/50 px-6 z-10 shadow-sm sticky top-0"
    >
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end text-sm leading-tight">
          <span className="font-medium text-gray-800">{auth?.uid}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {auth?.role}
          </span>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Link
              to="#"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#62e3c8]"
              aria-label="Notifications"
              onClick={handleBellClick}
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {pendingCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] px-2">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-800">
                Tekshirilmagan URL'lar ({pendingCount})
              </SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {pendingUrls.length > 0 ? (
                pendingUrls.map((url) => (
                  <div
                    key={url._id}
                    className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white"
                  >
                    <Link
                      to={url.url}
                      target="_blank"
                      className="break-all underline text-[#62e3c8] hover:text-[#52c2b0]"
                    >
                      {url.url}
                    </Link>
                    {url.type && (
                      <p className="text-sm text-gray-600 mt-1">
                        Turi:{" "}
                        <span className="font-medium">{url.type.name}</span> (
                        {url.type.description})
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusClick(url, "allowed")}
                        className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Ruxsat berish
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusClick(url, "blocked")}
                        className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Taqiqlash
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusClick(url, "unknown")}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                      >
                        <HelpCircle className="w-4 h-4" /> Noma'lum
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Tekshirilmagan URL'lar yo'q.
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              URL statusini yangilash:{" "}
              {selectedStatus === "allowed"
                ? "Ruxsat berilgan"
                : selectedStatus === "blocked"
                ? "Taqiqlangan"
                : "Noma'lum"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              URL uchun kategoriya va tavsifni kiriting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right text-gray-700">
                URL
              </Label>
              <Input
                id="url"
                value={selectedUrl?.url || ""}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-gray-700">
                Kategoriya
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-gray-700">
                Tavsif
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              onClick={handleUpdateStatus}
              className="bg-[#62e3c8] hover:bg-[#52c2b0] text-white"
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
