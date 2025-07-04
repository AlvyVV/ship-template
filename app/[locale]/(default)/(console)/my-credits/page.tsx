import { TableColumn } from '@/types/blocks/table';
import TableSlot from '@/components/console/slots/table';
import { Table as TableSlotType } from '@/types/slots/table';
import { getTranslations } from 'next-intl/server';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';
import { getUserCredits, getUserCreditRecords } from '@/services/credit';
import { getUserUuid } from '@/services/user';

export default async function MyCreditsPage() {
  const t = await getTranslations();

  const userUuid = await getUserUuid();

  const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-credits`;
  if (!userUuid) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // 获取用户积分余额
  const credits = await getUserCredits(userUuid);

  // 获取用户积分流水记录
  const creditRecords = await getUserCreditRecords(userUuid);
  console.log('creditRecords', creditRecords);  
  const table: TableSlotType = {
    title: t('my_credits.title'),
    // tip: {
    //   title: t('my_credits.left_tip', {
    //     leftCredits: credits?.totalBalance || 0,
    //   }),
    // },
    toolbar: {
      items: [
        {
          title: t('my_credits.recharge'),
          url: '/pricing',
          target: '_blank',
          icon: 'RiBankCardLine',
        },
      ],
    },
    columns: [
      {
        title: t('my_credits.table.trans_no'),
        name: 'transactionNo',
      },
      {
        title: t('my_credits.table.trans_type'),
        name: 'transactionType',
      },
      {
        title: t('my_credits.table.credits'),
        name: 'change',
        callback: (item: any) => {
          const change = item.change || 0;
          return change >= 0 ? `+${change}` : `${change}`;
        },
      },
      {
        title: t('my_credits.table.balance_after'),
        name: 'balanceAfter',
      },
      {
        title: t('my_credits.table.status'),
        name: 'status',
        callback: (item: any) => item.status || '-',
      },
      {
        title: t('my_credits.table.updated_at'),
        name: 'createdAt',
        callback: (item: any) => {
          return dayjs(item.createdAt).format('YYYY/MM/DD HH:mm:ss');
        },
      },
    ],
    data: creditRecords.items,
    emptyMessage: t('my_credits.no_credits'),
  };

  return <TableSlot {...table} />;
}
