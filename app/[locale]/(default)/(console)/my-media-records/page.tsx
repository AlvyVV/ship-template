import Icon from '@/components/icon';
import TableBlock from '@/components/blocks/table';
import { TableColumn } from '@/types/blocks/table';
import { Table as TableSlotType } from '@/types/slots/table';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getUserUuid } from '@/services/user';
import { getMyMediaRecords } from '@/models/media-record';

export default async function MyMediaRecordPage() {
  const t = await getTranslations();
  const userUuid = await getUserUuid();
  if (!userUuid) {
    const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-media-record`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const list = await getMyMediaRecords();
  console.log('getMyMediaRecords list', list);
  if (!list.items || list.items.length === 0) {
    return (
      <div className="text-center flex flex-col items-center justify-center h-full py-16 gap-4">
        <Icon name="RiEmotionSadFill" className="w-8 h-8" />
        <span>{t('my_media_record.no_records')}</span>
      </div>
    );
  }

  const columns: TableColumn[] = [
    {
      name: 'createdAt',
      title: t('my_media_record.table.created_at'),
      callback: item => dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      name: 'status',
      title: t('my_media_record.table.status'),
    },

    {
      name: 'bizCode',
      title: t('my_media_record.table.biz_code'),
    },
    {
      name: 'resultUrls',
      type: 'image',
      title: t('my_media_record.table.biz_code'),
    },
  ];

  const table: TableSlotType = {
    title: t('my_media_record.title'),
    description: t('my_media_record.description'),
    columns,
    data: list.items,
  };

  return <TableBlock {...table} />;
}
