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

  async updateEmergencyStatus(group_message_id: number, status: IEmergency["status"]) {
    const response = await privateInstance.patch(`/emergency/${group_message_id}`, { status });
    return response.data;
  },

  async updateEmergencyType(group_message_id: number, type: IEmergency["type"]) {
    const response = await privateInstance.patch(`/emergency/${group_message_id}`, { type });
    return response.data;
  },
};
