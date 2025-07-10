'use client';

import { PaymentModal } from '@/components/ui/payment-modal';
import { useModal } from '@/contexts/app';
import { usePaymentSSE } from '@/hooks/use-payment-sse';

export function PaymentModalProvider() {
  const { 
    showPaymentModal, 
    setShowPaymentModal, 
    paymentStatus, 
    paymentOrderInfo 
  } = useModal();

  // 监听支付相关的 SSE 事件
  usePaymentSSE();

  const closeModal = () => {
    setShowPaymentModal(false);
  };

  return (
    <PaymentModal
      isOpen={false} // 临时隐藏支付弹框，但保留代码
      // isOpen={showPaymentModal}  // 原始代码，修复后可恢复
      onClose={closeModal}
      status={paymentStatus}
      orderNo={paymentOrderInfo.orderNo}
      amount={paymentOrderInfo.amount}
      currency={paymentOrderInfo.currency}
    />
  );
}