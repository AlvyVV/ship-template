import { User } from "@/types/user";

export interface Affiliate {
  userUuid: string;
  createdAt: string;
  status: string;
  invitedBy: string;
  paidOrderNo: string;
  paidAmount: number;
  rewardPercent: number;
  rewardAmount: number;
  user?: User;
  invitedByUser?: User;
}
