import { Apikey } from '@/types/apikey';
import { getPgWrapperClient } from '@/lib/db-wrapper';

export enum ApikeyStatus {
  Created = 'created',
  Deleted = 'deleted',
}

export async function insertApikey(apikey: Apikey) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from('apikeys').insert(apikey);

  if (error) throw error;

  return data;
}

export async function getUserApikeys(userUuid: string, page: number = 1, limit: number = 50): Promise<Apikey[] | undefined> {
  const offset = (page - 1) * limit;

  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from('apikeys')
    .select('*')
    .eq('userUuid', userUuid)
    .neq('status', ApikeyStatus.Deleted)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUserUuidByApiKey(apiKey: string): Promise<string | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from('apikeys').select('userUuid').eq('apiKey', apiKey).eq('status', ApikeyStatus.Created).limit(1).single();

  if (error) {
    return undefined;
  }

  return data?.userUuid;
}
