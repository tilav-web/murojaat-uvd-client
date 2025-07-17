import { create } from "zustand";
import type { IAuth } from "../../interfaces/auth.interface";

interface AuthState {
  auth: IAuth | null;
  setAuth: (auth: IAuth | null) => void;
  isLoading: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  auth: null,
  isLoading: true,
  setAuth: (auth) => set({ auth }),
}));
