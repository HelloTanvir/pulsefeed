export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  subscriptions: {
    section: string;
  }[];
  createdAt: string;
}
