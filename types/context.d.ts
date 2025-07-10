import { ReactNode } from "react";

export interface ContextValue {
  [propName: string]: any;
  // 支付模态窗口相关
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  paymentStatus: 'waiting' | 'completed' | 'expired' | 'failed';
  setPaymentStatus: (status: 'waiting' | 'completed' | 'expired' | 'failed') => void;
  paymentOrderInfo: {
    orderNo?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
  };
  setPaymentOrderInfo: (info: {
    orderNo?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
  }) => void;
}
