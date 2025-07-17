import { privateInstanceFile } from "@/common/api/client-api";

export const mailingService = {
  sendMessage: async (payload: FormData) => {
    const response = await privateInstanceFile.post("/mailing/send-message", payload);
    return response.data;
  },
};