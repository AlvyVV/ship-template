import { User } from "./user";

export interface Feedback {
  id?: number;
  createdAt: string;
  status: string;
  userUuid: string;
  content: string;
  rating: number;
  user?: User;
}
