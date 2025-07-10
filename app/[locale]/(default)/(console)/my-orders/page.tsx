import Icon from '@/components/icon';
import TableBlock from '@/components/blocks/table';
import { TableColumn } from '@/types/blocks/table';
import { Table as TableSlotType } from '@/types/slots/table';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getUserUuid } from '@/services/user';
import { getMyOrders } from '@/models/order';

export default async function MyOrdersPage() {
  const t = await getTranslations();
  const userUuid = await getUserUuid();
  if (!userUuid) {
    const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-orders`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const list = await getMyOrders();
  if (!list.items || list.items.length === 0) {
    return (
      <div className="text-center flex flex-col items-center justify-center h-full py-16 gap-4">
        <Icon name="RiEmotionSadFill" className="w-8 h-8" />
        <span>{t('my_orders.no_orders')}</span>
      </div>
    );
  }

  const columns: TableColumn[] = [
    {
      name: 'orderNo',
      title: t('my_orders.table.order_no'),
    },
    {
      name: 'createdAt',
      title: t('my_orders.table.created_at'),
      callback: item => dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      name: 'status',
      title: t('my_orders.table.status'),
      callback: item => {
        const statusMap: { [key: string]: string } = {
          'PENDING': t('my_orders.table.status_pending'),
          'COMPLETED': t('my_orders.table.status_completed'),
          'FAILED': t('my_orders.table.status_failed'),
          'CANCELLED': t('my_orders.table.status_cancelled'),
        };
        return statusMap[item.status] || item.status;
      },
    },
    {
      name: 'amount',
      title: t('my_orders.table.amount'),
      callback: item => {
        const amount = Number(item.amount) / 100; // 转换为元
        return `${item.currency?.toUpperCase() || 'USD'} ${amount.toFixed(2)}`;
      },
    },
    {
      name: 'paidAt',
      title: t('my_orders.table.paid_at'),
      callback: item => item.paidAt ? dayjs(item.paidAt).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
  ];

  const table: TableSlotType = {
    title: t('my_orders.title'),
    description: t('my_orders.description'),
    columns,
    data: list.items,
  };

  return <TableBlock {...table} />;
}
