import { Button } from '@/types/blocks/base';

export interface PricingGroup {
  name?: string;
  title?: string;
  description?: string;
  label?: string;
}

export interface PricingItem {
  title?: string;
  description?: string;
  label?: string;
  productCode?: string;
  price?: string;
  originalPrice?: string;
  currency?: string;
  unit?: string;
  featuresTitle?: string;
  features?: string[];
  button?: Button;
  tip?: string;
  isFeatured?: boolean;
  interval: 'MONTH' | 'YEAR' | 'ONE-TIME';
  productId: string;
  productName?: string;
  amount: number;
  cnAmount?: number;
  credits?: number;
  validMonths?: number;
  group?: string;
}

export interface Pricing {
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  items?: PricingItem[];
  groups?: PricingGroup[];
}
