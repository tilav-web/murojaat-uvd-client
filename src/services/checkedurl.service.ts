import { privateInstance } from "@/common/api/client-api";
import type { ICheckedUrl } from "@/interfaces/checkedurl.interface";

export const checkedUrlService = {
  async getPendingCount(): Promise<number> {
    const response = await privateInstance.get<number>("/checkedurl/pending-count");
    return response.data;
  },

  async fetchPendingUrls(): Promise<ICheckedUrl[]> {
    const response = await privateInstance.get<ICheckedUrl[]>("/checkedurl", { params: { status: "pending" } });
    return response.data;
  },

  async updateCheckedUrl(id: string, data: Partial<ICheckedUrl>): Promise<ICheckedUrl> {
    const response = await privateInstance.patch<ICheckedUrl>(`/checkedurl/${id}`, data);
    return response.data;
  },
};
