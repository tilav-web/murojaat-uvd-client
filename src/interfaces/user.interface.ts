export interface IUser {
  _id: string;
  telegram_id: number;
  full_name: string;
  username?: string;
  status: "active" | "not_active" | "block";
  createdAt: string;
}