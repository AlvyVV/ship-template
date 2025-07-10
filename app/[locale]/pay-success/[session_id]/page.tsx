import { apiClient } from '@/lib/api-client';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';

interface Order {
  orderId: string;
  orderNo: string;
  userId: string;
  stripePriceId: string;
  orderType: string;
  status: string;
  amount: number;
  currency: string;
  productId: string;
  paidAt: string;
  productSnapshot: any;
  stripeSessionId: string;
  createdAt: string;
  updatedAt: string;
}

export default async function PaySuccessPage({ params }: { params: Promise<{ session_id: string; locale: string }> }) {
  const { session_id: sessionId, locale } = await params;
  const t = await getTranslations();
  
  let order: Order | null = null;

  try {
    // 调用新的API获取订单信息
    const response = await apiClient.get<{
      status: string;
      data: Order;
    }>(`/orders/by-session/${sessionId}`);

    if (response.status === 'success') {
      order = response.data;
    }
  } catch (error) {
    console.error('获取订单信息失败:', error);
    redirect(process.env.NEXT_PUBLIC_PAY_FAIL_URL || '/');
  }

  if (!order) {
    redirect(process.env.NEXT_PUBLIC_PAY_FAIL_URL || '/');
  }

  // 格式化金额
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe金额单位是分
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="w-full py-8 md:py-16 from-slate-50 to-slate-100">
      <div className="container mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Icon name="RiCheckLine" className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">
              {t('pay_success.title', { defaultValue: '支付成功！' })}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {t('pay_success.description', { defaultValue: '感谢您的购买，您的订单已经成功完成。' })}
          </p>
        </div>

        {/* 成功状态卡片 */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="RiCheckLine" className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Icon name="RiCheckLine" className="w-3 h-3 mr-1" />
                  {t('pay_success.payment_success', { defaultValue: '支付成功' })}
                </Badge>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(order.amount, order.currency)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 订单详情卡片 */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="RiFileTextLine" className="h-5 w-5" />
              {t('pay_success.order_details', { defaultValue: '订单详情' })}
            </CardTitle>
            <CardDescription>
              {t('pay_success.order_info', { defaultValue: '以下是您的订单信息' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 订单号 */}
            <div className="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">
                {t('pay_success.order_number', { defaultValue: '订单号' })}
              </span>
              <span className="font-mono text-sm font-semibold">{order.orderNo}</span>
            </div>

            {/* 订单类型 */}
            <div className="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">
                {t('pay_success.order_type', { defaultValue: '订单类型' })}
              </span>
              <Badge variant="secondary">
                {order.orderType === 'ONE_TIME' 
                  ? t('pay_success.one_time', { defaultValue: '一次性购买' })
                  : t('pay_success.subscription', { defaultValue: '订阅' })
                }
              </Badge>
            </div>

            {/* 支付时间 */}
            <div className="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">
                {t('pay_success.payment_time', { defaultValue: '支付时间' })}
              </span>
              <span className="text-sm font-semibold">
                {formatDate(order.paidAt || order.createdAt)}
              </span>
            </div>

            {/* 产品信息 */}
            {order.productSnapshot && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="RiPackageLine" className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">
                    {t('pay_success.product_info', { defaultValue: '产品信息' })}
                  </h4>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-blue-900">{order.productSnapshot.name}</p>
                  {order.productSnapshot.description && (
                    <p className="text-sm text-blue-700">{order.productSnapshot.description}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
          <Button asChild className="flex items-center gap-2 flex-1">
            <Link href={`/${locale}/my-orders`}>
              <Icon name="RiFileTextLine" className="w-4 h-4" />
              {t('pay_success.view_orders', { defaultValue: '查看我的订单' })}
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex items-center gap-2 flex-1">
            <Link href={`/${locale}`}>
              <Icon name="RiHomeLine" className="w-4 h-4" />
              {t('pay_success.back_home', { defaultValue: '返回首页' })}
            </Link>
          </Button>
        </div>

        {/* 感谢信息 */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <Icon name="RiHeartLine" className="w-8 h-8 text-pink-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {t('pay_success.thank_you', { defaultValue: '感谢您的信任' })}
                </h3>
                <p className="text-muted-foreground">
                  {t('pay_success.thank_you_message', { 
                    defaultValue: '我们将持续为您提供优质的服务，如有任何问题请随时联系我们。' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
