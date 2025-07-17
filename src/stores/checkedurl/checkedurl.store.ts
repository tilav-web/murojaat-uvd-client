import { create } from "zustand";
import { checkedUrlService } from "@/services/checkedurl.service";
import type { ICheckedUrl } from "@/interfaces/checkedurl.interface";

interface CheckedUrlState {
  pendingCount: number;
  pendingUrls: ICheckedUrl[];
  loading: boolean;
  fetchPendingCount: () => Promise<void>;
  fetchPendingUrls: () => Promise<void>;
  updateCheckedUrlStatus: (id: string, status: ICheckedUrl["status"], category?: string, description?: string) => Promise<void>;
}

export const useCheckedUrlStore = create<CheckedUrlState>((set, get) => ({
  pendingCount: 0,
  pendingUrls: [],
  loading: false,
  fetchPendingCount: async () => {
    set({ loading: true });
    try {
      const count = await checkedUrlService.getPendingCount();
      set({ pendingCount: count });
    } catch (error) {
      console.error("Failed to fetch pending count:", error);
      set({ pendingCount: 0 });
    } finally {
      set({ loading: false });
    }
  },
  fetchPendingUrls: async () => {
    set({ loading: true });
    try {
      const urls = await checkedUrlService.fetchPendingUrls();
      set({ pendingUrls: urls });
    } catch (error) {
      console.error("Failed to fetch pending URLs:", error);
      set({ pendingUrls: [] });
    } finally {
      set({ loading: false });
    }
  },
  updateCheckedUrlStatus: async (id, status, category, description) => {
    set({ loading: true });
    try {
      await checkedUrlService.updateCheckedUrl(id, { status, category, description });
      get().fetchPendingCount();
      get().fetchPendingUrls();
    } catch (error) {
      console.error("Failed to update checked URL status:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
