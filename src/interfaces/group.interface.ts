export interface IGroup {
  _id: string;
  group: number;
  telegram_id: number;
  name: string;
  username?: string;
  status: "active" | "not_active" | "blocked";
  createdAt: string;
}
