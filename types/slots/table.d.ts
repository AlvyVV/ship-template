export interface Table {
  title?: string;
  description?: string;
  data?: any[];
  tip?: {
    title?: string;
    description?: string;
  };
  toolbar?: any;
  columns?: any[];
  actions?: any;
  emptyMessage?: string;
  crumb?: {
    items?: Array<{
      title: string;
      url?: string;
      isActive?: boolean;
    }>;
  };
}