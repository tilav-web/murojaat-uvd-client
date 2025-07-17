import { privateInstance } from "@/common/api/client-api";

export const getUsers = async (page: number, limit: number, search?: string, status?: string) => {
  const response = await privateInstance.get("/users", {
    params: { page, limit, search, status },
  });
  return response.data;
};

export const updateUserStatus = async (telegram_id: number, status: string) => {
  const response = await privateInstance.patch(`/users/${telegram_id}/status`, { status });
  return response.data;
};

export const makeUserAdmin = async (telegram_id: number, password: string) => {
  const response = await privateInstance.post(`/users/${telegram_id}/make-admin`, { password });
  return response.data;
};