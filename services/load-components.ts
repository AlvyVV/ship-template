import { getPgWrapperClient } from '@/models/db';
import { connect } from 'http2';
import NodeCache from 'node-cache';

const componentCache = new NodeCache({ stdTTL: 60 });

export interface ComponentResult<T> {
  content: T;
  actualLocale: string;
}

export async function getComponent<T>(locale: string, namespace: string): Promise<T> {
  console.log('localexx', locale);
  // 检查缓存
  const cacheKey = locale + '-' + namespace;
  const cachedData = componentCache.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  console.log('localexx', locale);

  try {
    const result = await getPgWrapperClient().from('components').select('content').eq('locale', locale).eq('code', namespace).eq('project_id', process.env.PROJECT_ID).eq('is_deleted', false).single();
    console.log('localexx', result);
    if (result.data?.content) {
      const content = result.data.content as T;
      componentCache.set(cacheKey, content);
      return content;
    }

    throw new Error(`No content found for ${locale}/${namespace}`);
  } catch (error) {
    return {} as T;
  }
}
