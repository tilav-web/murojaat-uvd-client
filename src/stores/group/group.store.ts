import { create } from "zustand";
import type { IGroup } from "@/interfaces/group.interface";
import { groupService } from "@/services/group.service";
import { toast } from "sonner";

interface GroupState {
  groups: IGroup[];
  totalGroups: number;
  loading: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
  fetchGroups: (search?: string, status?: IGroup["status"]) => Promise<void>;
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
  setGlobalFilter: (filter: string) => void;
  updateGroupStatus: (groupId: number, currentStatus: IGroup["status"]) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  totalGroups: 0,
  loading: false,
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  globalFilter: "",

  fetchGroups: async (search, status) => {
    set({ loading: true });
    try {
      const response = await groupService.fetchGroups(search, status);
      set({ groups: response, totalGroups: response.length }); // Assuming API returns all groups for now
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Guruhlarni yuklashda xatolik yuz berdi.");
    } finally {
      set({ loading: false });
    }
  },

  setPagination: (pagination) => set({ pagination }),
  setGlobalFilter: (filter) => set({ globalFilter: filter }),

  updateGroupStatus: async (groupId, currentStatus) => {
    try {
      await groupService.updateGroupStatus(groupId, currentStatus);
      toast.success("Guruh holati yangilandi.");
      get().fetchGroups(get().globalFilter); // Refresh groups after update
    } catch (error) {
      console.error("Failed to update group status:", error);
      toast.error("Guruh holatini yangilashda xatolik yuz berdi.");
    }
  },
}));
