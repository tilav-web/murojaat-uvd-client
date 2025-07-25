import { create } from "zustand";
import type { IEmergency } from "@/interfaces/emergency.interface";
import { emergencyService } from "@/services/emergency.service";
import { toast } from "sonner";

interface EmergencyState {
  emergencies: IEmergency[];
  totalEmergencies: number;
  loading: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
  filterStatus: IEmergency["status"] | "all";
  filterType: IEmergency["type"] | "all";
  // Temporary comment to force re-compilation
  statistics: any; // Will be more specific later
  fetchEmergencies: () => Promise<void>;
  fetchEmergencyStatistics: () => Promise<void>;
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
  setGlobalFilter: (filter: string) => void;
  setFilterStatus: (status: IEmergency["status"] | "all") => void;
  setFilterType: (type: IEmergency["type"] | "all") => void;
  updateEmergencyStatus: (
    id: string,
    status: IEmergency["status"]
  ) => Promise<void>;
  updateEmergencyType: (id: string, type: IEmergency["type"]) => Promise<void>;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  emergencies: [],
  totalEmergencies: 0,
  loading: false,
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  globalFilter: "",
  filterStatus: "all",
  filterType: "all",
  statistics: null,

  fetchEmergencies: async () => {
    set({ loading: true });
    const { pagination, globalFilter, filterStatus, filterType } = get();
    try {
      const response = await emergencyService.fetchEmergencies(
        pagination.pageIndex + 1,
        pagination.pageSize,
        globalFilter,
        filterStatus === "all" ? undefined : filterStatus,
        filterType === "all" ? undefined : filterType
      );
      set({ emergencies: response.data, totalEmergencies: response.total });
    } catch (error) {
      console.error("Failed to fetch emergencies:", error);
      toast.error("Favqulodda vaziyatlarni yuklashda xatolik yuz berdi.");
    } finally {
      set({ loading: false });
    }
  },

  fetchEmergencyStatistics: async () => {
    try {
      const stats = await emergencyService.fetchEmergencyStatistics();
      set({ statistics: stats });
    } catch (error) {
      console.error("Failed to fetch emergency statistics:", error);
      toast.error("Statistikalarni yuklashda xatolik yuz berdi.");
    }
  },

  setPagination: (pagination) => set({ pagination }),
  setGlobalFilter: (filter) => set({ globalFilter: filter }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterType: (type: IEmergency["type"] | "all") =>
    set({ filterType: type }),

  updateEmergencyStatus: async (id, status) => {
    set({ loading: true });
    try {
      await emergencyService.updateEmergencyStatus(id, status);
      toast.success("Favqulodda vaziyat statusi yangilandi.");
      get().fetchEmergencies();
      get().fetchEmergencyStatistics();
    } catch (error) {
      console.error("Failed to update emergency status:", error);
      toast.error(
        "Favqulodda vaziyat statusini yangilashda xatolik yuz berdi."
      );
    } finally {
      set({ loading: false });
    }
  },

  updateEmergencyType: async (id, type) => {
    set({ loading: true });
    try {
      await emergencyService.updateEmergencyType(id, type);
      toast.success("Favqulodda vaziyat turi yangilandi.");
      get().fetchEmergencies();
      get().fetchEmergencyStatistics();
    } catch (error) {
      console.error("Failed to update emergency type:", error);
      toast.error("Favqulodda vaziyat turini yangilashda xatolik yuz berdi.");
    } finally {
      set({ loading: false });
    }
  },
}));
