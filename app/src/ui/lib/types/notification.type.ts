import { News } from "./news.type";
import { User } from "./user.type";

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  user: User;
  article: News;
  createdAt: string;
}
