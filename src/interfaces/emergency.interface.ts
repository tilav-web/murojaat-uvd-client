import type { IUser } from "./user.interface";

export interface IEmergency {
  _id: string;
  user: IUser;
  user_message_id: number;
  group_message_id?: number;
  message_type?: string;
  message_content?: string;
  status: "confirmed" | "canceled" | "pending";
  type: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "FAKE";
  createdAt: string;
  updatedAt: string;
}
