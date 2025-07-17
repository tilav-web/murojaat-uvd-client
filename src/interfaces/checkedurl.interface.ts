import type { IUrlType } from "./url-type.interface";

export interface ICheckedUrl {
  _id: string;
  url: string;
  status: "allowed" | "blocked" | "pending" | "unknown";
  category?: string;
  description?: string;
  type?: IUrlType;
  createdAt: string;
  updatedAt: string;
}
