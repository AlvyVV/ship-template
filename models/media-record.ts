import { apiClient } from '@/lib/api-client';

export interface MediaRecord {
  userMediaRecordId: string;
  name?: string;
  type?: string;
  status?: string;
  bizCode?: string;
  resultUrls?: string;
  createdAt: string;
}

export interface MediaRecordListResponse {
  items: MediaRecord[];
  total: number;
  page: number;
  limit: number;
}

export async function getMyMediaRecords(page: number = 1, limit: number = 50): Promise<MediaRecordListResponse> {
  const res = await apiClient.get<any>(`/user-media-records?page=${page}&limit=${limit}`);
  console.log('getMyMediaRecords res', res);
  const payload = res?.data || {};
  return {
    items: payload.items || [],
    total: payload.total ?? 0,
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
  } as MediaRecordListResponse;
}
