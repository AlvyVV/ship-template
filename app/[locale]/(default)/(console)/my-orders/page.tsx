import { getOrdersByPaidEmail, getOrdersByUserUuid } from '@/models/order';
import { getUserEmail, getUserUuid } from '@/services/user';

import { TableColumn } from '@/types/blocks/table';
import TableSlot from '@/components/console/slots/table';
import { Table as TableSlotType } from '@/types/slots/table';
import { getTranslations } from 'next-intl/server';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';

export default async function () {
  const t = await getTranslations();

  const userUuid = await getUserUuid();
  const userEmail = await getUserEmail();

  const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-orders`;
  if (!userUuid) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  let orders = await getOrdersByUserUuid(userUuid);
  if (!orders || orders.length === 0) {
    orders = await getOrdersByPaidEmail(userEmail);
  }

  const columns: TableColumn[] = [
    { name: 'orderNo', title: t('my_orders.table.order_no') },
    { name: 'paidEmail', title: t('my_orders.table.email') },
    { name: 'productName', title: t('my_orders.table.product_name') },
    {
      name: 'amount',
      title: t('my_orders.table.amount'),
      callback: (item: any) => `${item.currency.toUpperCase() === 'CNY' ? '¥' : '$'} ${item.amount / 100}`,
    },
    {
      name: 'paidAt',
      title: t('my_orders.table.paid_at'),
      callback: (item: any) => dayjs(item.paidAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const table: TableSlotType = {
    title: t('my_orders.title'),
    toolbar: {
      items: [
        {
          title: t('my_orders.read_docs'),
          icon: 'RiBookLine',
          url: 'https://docs.shipany.ai',
          target: '_blank',
          variant: 'outline',
        },
        {
          title: t('my_orders.join_discord'),
          icon: 'RiDiscordFill',
          url: 'https://discord.gg/HQNnrzjZQS',
          target: '_blank',
        },
      ],
    },
    columns: columns,
    data: orders,
    emptyMessage: t('my_orders.no_orders'),
  };

  return <TableSlot {...table} />;
}
