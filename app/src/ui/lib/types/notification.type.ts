import { User } from "./user.type";

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  user: User;
  createdAt: string;
}
