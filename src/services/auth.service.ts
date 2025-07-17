import { privateInstance } from "../common/api/client-api";
import { AdminRole } from "@/interfaces/auth.interface";

interface ILoginRequest {
  uid: string;
  password: string;
}

export const authService = {
  login: async (credentials: ILoginRequest) => {
    const response = await privateInstance.post("/auth/login", credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await privateInstance.get("/auth/me");
    return response.data;
  },

  getAdmins: async (
    page: number,
    limit: number,
    search?: string,
    role?: AdminRole,
  ) => {
    const response = await privateInstance.get("/auth/admins", {
      params: { page, limit, search, role },
    });
    return response.data;
  },

  removeAdmin: async (uid: string) => {
    const response = await privateInstance.delete(`/auth/admins/${uid}`);
    return response.data;
  },

  updateAdminPassword: async (uid: string, password: string) => {
    const response = await privateInstance.patch(`/auth/admins/${uid}/password`, {
      password,
    });
    return response.data;
  },
};
