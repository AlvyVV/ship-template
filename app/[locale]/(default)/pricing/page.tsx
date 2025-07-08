import Pricing from '@/components/blocks/pricing';
import { getComponent } from '@/services/load-components';
import { getLocale } from 'next-intl/server';
import { Pricing as PricingType } from '@/types/blocks/pricing';

export default async function PricingPage() {
  const locale = await getLocale();
  const pricing = await getComponent<PricingType>(locale, 'PRICE');

  return <>{pricing && <Pricing pricing={pricing} />}</>;
}
