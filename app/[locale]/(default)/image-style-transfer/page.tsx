import ImageStyleTransferBlock from '@/components/blocks/image-style-transfer';
import type { ImageStyleTransfer } from '@/types/blocks/image-style-transfer';
import { getPage } from '@/services/load-page';
import { getLocale } from 'next-intl/server';

export default async function ImageStyleTransferPage() {
  const locale = await getLocale();
  console.log('locale', locale);
  const imageStyleTransferData = await getPage<ImageStyleTransfer>(locale, 'image-style-transfer');

  return (
    <div className="min-h-screen">
      <ImageStyleTransferBlock imageStyleTransfer={imageStyleTransferData.content} />
    </div>
  );
}
