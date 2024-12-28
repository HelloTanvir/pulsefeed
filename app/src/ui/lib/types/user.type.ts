export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  subscribedSections: string[];
  createdAt: string;
}