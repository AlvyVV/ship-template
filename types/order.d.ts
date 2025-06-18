export interface Order {
  orderNo: string;
  createdAt: string;
  userUuid: string;
  userEmail: string;
  amount: number;
  interval: string;
  expiredAt: string;
  status: string;
  stripeSessionId?: string;
  credits: number;
  currency: string;
  subId?: string;
  subIntervalCount?: number;
  subCycleAnchor?: number;
  subPeriodEnd?: number;
  subPeriodStart?: number;
  subTimes?: number;
  productId?: string;
  productName?: string;
  validMonths?: number;
  orderDetail?: string;
  paidAt?: string;
  paidEmail?: string;
  paidDetail?: string;
}
