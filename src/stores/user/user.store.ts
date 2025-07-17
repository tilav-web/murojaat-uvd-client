import { create } from "zustand";
import {
  getUsers,
  updateUserStatus,
  makeUserAdmin,
} from "@/services/user.service";
import { toast } from "sonner";

interface User {
  _id: string;
  telegram_id: number;
  full_name: string;
  username?: string;
  status: "active" | "not_active" | "block";
  createdAt: string;
}

interface UserState {
  users: User[];
  totalUsers: number;
  loading: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
  fetchUsers: (globalFilter?: string, status?: User["status"]) => Promise<void>;
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
  setGlobalFilter: (filter: string) => void;
  updateUserStatus: (
    userId: number,
    currentStatus: User["status"]
  ) => Promise<void>;
  makeUserAdmin: (telegram_id: number, password: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  totalUsers: 0,
  loading: false,
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  globalFilter: "",

  fetchUsers: async (globalFilterParam?: string, statusParam?: User["status"]) => {
    set({ loading: true });
    const { pagination, globalFilter } = get();
    try {
      const response = await getUsers(
        pagination.pageIndex + 1,
        pagination.pageSize,
        globalFilterParam !== undefined ? globalFilterParam : globalFilter,
        statusParam
      );
      set({ users: response.users, totalUsers: response.total });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      set({ loading: false });
    }
  },

  setPagination: (pagination) => {
    set({ pagination });
    get().fetchUsers();
  },

  setGlobalFilter: (filter) => {
    set({
      globalFilter: filter,
      pagination: { ...get().pagination, pageIndex: 0 },
    });
    get().fetchUsers();
  },

  updateUserStatus: async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "block" : "active";
    try {
      await updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}.`);
      get().fetchUsers();
    } catch (error: any) {
      console.error("Failed to update user status:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update user status.");
      }
    }
  },

  makeUserAdmin: async (telegram_id, password) => {
    try {
      await makeUserAdmin(telegram_id, password);
      toast.success(`User is now an admin.`);
      get().fetchUsers();
    } catch (error: any) {
      console.error("Failed to make user admin:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to make user admin.");
      }
    }
  },
}));