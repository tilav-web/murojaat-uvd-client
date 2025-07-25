import { privateInstance } from "@/common/api/client-api";
import type { IEmergency } from "@/interfaces/emergency.interface";

export const emergencyService = {
  async fetchEmergencies(page: number, limit: number, search?: string, status?: IEmergency["status"], type?: IEmergency["type"]) {
    const params: Record<string, string | number> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (search) {
      params.search = search;
    }
    if (status) {
      params.status = status;
    }
    if (type) {
      params.type = type;
    }
    const response = await privateInstance.get<{ data: IEmergency[]; total: number }>("/emergency", { params });
    return response.data;
  },

  async fetchEmergencyStatistics() {
    const response = await privateInstance.get("/emergency/statistics");
    return response.data;
  },

  async updateEmergencyStatus(id: string, status: IEmergency["status"]) {
    const response = await privateInstance.patch(`/emergency/${id}`, { status });
    return response.data;
  },

  async updateEmergencyType(id: string, type: IEmergency["type"]) {
    const response = await privateInstance.patch(`/emergency/type/${id}`, { type });
    return response.data;
  },
};
