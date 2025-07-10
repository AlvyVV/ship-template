'use client';

import { useServerEvents } from '@/hooks/use-server-events';
import { useModal } from '@/contexts/app';
import { useEffect } from 'react';

export function usePaymentSSE() {
  const { setPaymentStatus, setPaymentOrderInfo, showPaymentModal } = useModal();
  
  // 获取 SSE 连接
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const sseUrl = `${apiBase}/events/stream`;
  const { events: sseEvents } = useServerEvents(sseUrl);

  useEffect(() => {
    if (!showPaymentModal) return;

    // 监听支付相关事件
    const paymentEvent = sseEvents.find((e) => e.type === 'wait_pay');
    
    if (paymentEvent) {
      console.log('收到支付事件:', paymentEvent);
      
      // 更新支付状态
      setPaymentStatus(paymentEvent.status);
      
      // 更新订单信息
      setPaymentOrderInfo({
        orderNo: paymentEvent.orderNo,
        amount: paymentEvent.amount,
        currency: paymentEvent.currency,
        orderId: paymentEvent.orderId,
      });
    }
  }, [sseEvents, showPaymentModal, setPaymentStatus, setPaymentOrderInfo]);

  return {
    sseEvents,
  };
}