import { privateInstance } from "@/common/api/client-api";

export const statisticsService = {
  getStatistics: async (startDate?: string, endDate?: string) => {
    const response = await privateInstance.get("/statistics", {
      params: { startDate, endDate },
    });
    return response.data;
  },
};