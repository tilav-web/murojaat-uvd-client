import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { AdminRole } from '@/interfaces/auth.interface';

interface Admin {
  _id: string;
  uid: string;
  role: AdminRole;
  full_name: string;
  username?: string;
  createdAt: string;
}

interface AdminState {
  admins: Admin[];
  totalAdmins: number;
  loading: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
  fetchAdmins: (search?: string, role?: AdminRole) => Promise<void>;
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
  setGlobalFilter: (filter: string) => void;
  removeAdmin: (uid: string) => Promise<void>;
  updateAdminPassword: (uid: string, password: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  admins: [],
  totalAdmins: 0,
  loading: false,
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  globalFilter: '',

  setPagination: (pagination) => set({ pagination }),
  setGlobalFilter: (globalFilter) => set({ globalFilter }),

  fetchAdmins: async (search, role) => {
    set({ loading: true });
    const { pageIndex, pageSize } = get().pagination;
    try {
      const { admins, total } = await authService.getAdmins(
        pageIndex + 1,
        pageSize,
        search,
        role,
      );
      set({ admins, totalAdmins: total, loading: false });
    } catch (error) {
      toast.error("Adminlarni yuklashda xatolik yuz berdi.");
      set({ loading: false });
    }
  },

  removeAdmin: async (uid: string) => {
    try {
      await authService.removeAdmin(uid);
      toast.success("Admin muvaffaqiyatli o'chirildi.");
      get().fetchAdmins(get().globalFilter);
    } catch (error) {
      toast.error("Adminni o'chirishda xatolik yuz berdi.");
    }
  },

  updateAdminPassword: async (uid, password) => {
    try {
      await authService.updateAdminPassword(uid, password);
      toast.success("Admin paroli muvaffaqiyatli yangilandi.");
    } catch (error) {
      toast.error("Parolni yangilashda xatolik yuz berdi.");
    }
  },
}));
