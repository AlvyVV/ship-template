'use client';

// 使用 SVG 图标代替 lucide-react
import { useEffect, useState } from 'react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'waiting' | 'completed' | 'expired' | 'failed';
  orderNo?: string;
  amount?: number;
  currency?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  status,
  orderNo,
  amount,
  currency = 'USD',
}: PaymentModalProps) {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  if (!showModal) return null;

  const getStatusContent = () => {
    switch (status) {
      case 'waiting':
        return {
          title: '正在支付中',
          message: '请跳转到支付页面完成支付',
          icon: (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ),
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-900',
          showClose: true,
        };
      case 'completed':
        return {
          title: '支付成功',
          message: '感谢您的购买！',
          icon: (
            <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          bgColor: 'bg-green-50',
          textColor: 'text-green-900',
          showClose: true,
        };
      case 'expired':
        return {
          title: '支付超时',
          message: '支付链接已过期，请重新发起支付',
          icon: (
            <div className="rounded-full h-12 w-12 bg-yellow-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          ),
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-900',
          showClose: true,
        };
      case 'failed':
        return {
          title: '支付失败',
          message: '支付遇到问题，请重试',
          icon: (
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ),
          bgColor: 'bg-red-50',
          textColor: 'text-red-900',
          showClose: true,
        };
      default:
        return {
          title: '处理中',
          message: '请稍候...',
          icon: (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          ),
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-900',
          showClose: false,
        };
    }
  };

  const { title, message, icon, bgColor, textColor, showClose } = getStatusContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* 弹框内容 */}
      <div className={`relative w-full max-w-md mx-4 p-6 ${bgColor} rounded-lg shadow-xl transform transition-all`}>
        {/* 关闭按钮 */}
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 内容 */}
        <div className="text-center">
          {/* 图标 */}
          <div className="mx-auto mb-4">
            {icon}
          </div>

          {/* 标题 */}
          <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>
            {title}
          </h3>

          {/* 消息 */}
          <p className={`text-sm mb-4 ${textColor} opacity-80`}>
            {message}
          </p>

          {/* 订单信息 */}
          {(orderNo || amount) && (
            <div className={`text-xs ${textColor} opacity-60 space-y-1`}>
              {orderNo && (
                <div>订单号: {orderNo}</div>
              )}
              {amount && (
                <div>金额: {amount} {currency.toUpperCase()}</div>
              )}
            </div>
          )}

          {/* 成功状态下的额外操作 */}
          {status === 'completed' && (
            <div className="mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                确定
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}