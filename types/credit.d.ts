export interface Credit {
  transNo: string;
  createdAt: string;
  userUuid: string;
  transType: string;
  credits: number;
  orderNo: string;
  expiredAt?: string;
}
