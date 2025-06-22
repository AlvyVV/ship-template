export interface PageConfig {
  id: number;
  code: string;
  locale: string;
  title: string;
  description?: string;
  content: Record<string, any>;
  meta: Record<string, any>;
  status: number;
  version: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}