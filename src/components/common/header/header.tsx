import { useAuthStore } from "@/stores/auth/auth.store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCheckedUrlStore } from "@/stores/checkedurl/checkedurl.store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ICheckedUrl } from "@/interfaces/checkedurl.interface";
import { toast } from "sonner";

export const Header = () => {
  const { auth } = useAuthStore();
  const { pendingCount, pendingUrls, fetchPendingCount, fetchPendingUrls, updateCheckedUrlStatus } = useCheckedUrlStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<ICheckedUrl | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ICheckedUrl["status"] | null>(null);
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

  const handleStatusClick = (url: ICheckedUrl, status: ICheckedUrl["status"]) => {
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
      await updateCheckedUrlStatus(selectedUrl._id, selectedStatus, category, description);
      toast.success("URL statusi yangilandi.");
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
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-10">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end text-sm leading-tight">
          <span className="font-medium text-primary">{auth?.uid}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{auth?.role}</span>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Link
              to="#"
              className="relative p-2 rounded-full hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Notifications"
              onClick={handleBellClick}
            >
              <Bell className="w-6 h-6 text-muted-foreground" />
              {pendingCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{pendingCount}</span>
              )}
            </Link>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] px-2">
            <SheetHeader>
              <SheetTitle>Tekshirilmagan URL'lar ({pendingCount})</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {pendingUrls.length > 0 ? (
                pendingUrls.map((url) => (
                  <div key={url._id} className="border p-4 rounded-md shadow-sm">
                    <Link to={url.url} target="_blank" className="break-all underline text-blue-500">{url.url}</Link>
                    {url.type && (
                      <p className="text-sm text-muted-foreground">
                        Turi: {url.type.name} ({url.type.description})
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => handleStatusClick(url, "allowed")}>Ruxsat berish</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatusClick(url, "blocked")}>Taqiqlash</Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusClick(url, "unknown")}>Noma'lum</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">Tekshirilmagan URL'lar yo'q.</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>URL statusini yangilash: {selectedStatus}</DialogTitle>
            <DialogDescription>
              URL uchun kategoriya va tavsifni kiriting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={selectedUrl?.url || ""}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Kategoriya
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Tavsif
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStatus}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
