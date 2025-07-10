import { FormField, FormSubmit } from '@/types/blocks/form';

export interface Form {
  title?: string;
  description?: string;
  tip?: string;
  toolbar?: {
    items: any[];
  };
  crumb?: {
    items: Array<{
      title: string;
      url?: string;
      isActive?: boolean;
    }>;
  };
  fields?: FormField[];
  data?: any;
  passby?: any;
  submit?: FormSubmit;
  loading?: boolean;
}