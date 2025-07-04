import { Credit } from '@/types/credit';
import { getPgWrapperClient } from '@/lib/db-wrapper';
import { apiClient } from '@/lib/api-client';

export async function insertCredit(credit: Credit) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from('credits').insert(credit);

  if (error) {
    throw error;
  }

  return data;
}

export async function findCreditByTransNo(transNo: string): Promise<Credit | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from('credits').select('*').eq('transNo', transNo).limit(1).single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findCreditByOrderNo(orderNo: string): Promise<Credit | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from('credits').select('*').eq('orderNo', orderNo).limit(1).single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUserValidCredits(userUuid: string): Promise<Credit[] | undefined> {
  const now = new Date().toISOString();
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from('credits').select('*').eq('userUuid', userUuid).gte('expiredAt', now).order('expiredAt', { ascending: true });

  if (error) {
    return undefined;
  }

  return data;
}

export async function getCreditsByUserUuid(userUuid: string, page: number = 1, limit: number = 50): Promise<Credit[] | undefined> {
  try {
    // 调用 vv-api 的用户积分流水接口
    const response = await apiClient.get<any>(`/console/credit-records?page=${page}&limit=${limit}`);

    // vv-api 返回格式: { status: 'success', data: { data: [...], total: number } }
    const records = (response?.data?.data || []) as any[];

    // 将 vv-api 返回的字段映射到现有 Credit 类型
    return records.map(rec => ({
      transNo: rec.transactionNo,
      createdAt: rec.createdAt,
      userUuid: rec.userId || userUuid,
      transType: rec.transactionType,
      credits: rec.change,
      orderNo: rec.sourceId || '',
      expiredAt: rec.expiresAt || '',
    })) as Credit[];
  } catch (error) {
    console.error('getCreditsByUserUuid failed:', error);
    return undefined;
  }
}
