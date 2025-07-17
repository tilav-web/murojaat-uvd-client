import { privateInstance, privateInstanceFile } from "@/common/api/client-api";
import type { IGroup } from "@/interfaces/group.interface";
import type { MailingResponse } from "@/interfaces/mailing.interface";

export const groupService = {
  async fetchGroups(globalFilter?: string, status?: IGroup["status"]): Promise<IGroup[]> {
    const params: Record<string, string> = {};
    if (globalFilter) {
      params.search = globalFilter;
    }
    if (status) {
      params.status = status;
    }
    const response = await privateInstance.get<IGroup[]>("/group", { params });
    return response.data;
  },

  async updateGroupStatus(groupId: number, currentStatus: IGroup["status"]): Promise<IGroup> {
    const newStatus = currentStatus === "active" ? "not_active" : "active";
    const response = await privateInstance.patch<IGroup>(`/group/${groupId}`, { status: newStatus });
    return response.data;
  },

  async sendMessageToGroup(groupIds: string[], message: string, files: FileList | null): Promise<MailingResponse> {
    const formData = new FormData();
    formData.append("groupIds", JSON.stringify(groupIds));
    formData.append("message", message);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }
    const response = await privateInstanceFile.post<MailingResponse>("/mailing/group", formData);
    return response.data;
  },
};
