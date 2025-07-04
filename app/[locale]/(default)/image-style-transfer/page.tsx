import ImageStyleTransferBlock from '@/components/blocks/image-style-transfer';
import type { ImageStyleTransfer, StyleOption } from '@/types/blocks/image-style-transfer';
import { getPage } from '@/services/load-page';
import { getLocale } from 'next-intl/server';
import { LandingPage } from '@/types/pages/landing';
import { getPgWrapperClient } from '@/lib/db-wrapper';

export async function generateMetadata() {
  const locale = await getLocale();
  const pageResult = await getPage<LandingPage>(locale, 'image-style-transfer');

  // 根据实际加载的语言设置 canonical URL
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;
  if (pageResult.actualLocale !== 'en') {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${pageResult.actualLocale}`;
  }

  return {
    title: pageResult.content.meta?.title,
    description: pageResult.content.meta?.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ImageStyleTransferPage() {
  const locale = await getLocale();
  const imageStyleTransferData = await getPage<ImageStyleTransfer>(locale, 'image-style-transfer');
  const { data } = await getPgWrapperClient().from('item_configs').select('content').eq('data_type', 'IMAGE_CONFIG').eq('locale', locale).eq('is_deleted', false).eq('status', 'online');
  const styleOptions = data.map((records: { content: StyleOption }) => records.content) as StyleOption[];
  return (
    <div className="min-h-screen">
      <ImageStyleTransferBlock imageStyleTransfer={imageStyleTransferData.content} styleOptions={styleOptions} />
    </div>
  );
}
