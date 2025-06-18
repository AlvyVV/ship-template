import { Button } from "@/types/blocks/base/button";

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
  price?: string;
  originalPrice?: string;
  currency?: string;
  unit?: string;
  featuresTitle?: string;
  features?: string[];
  button?: Button;
  tip?: string;
  isFeatured?: boolean;
  interval: "month" | "year" | "one-time";
  productId: string;
  productName?: string;
  amount: number;
  cnAmount?: number;
  currency: string;
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
