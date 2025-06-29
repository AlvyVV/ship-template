import { getPgWrapperClient } from '@/models/db';
import NodeCache from 'node-cache';

const landingPageCache = new NodeCache({ stdTTL: 60 });

export interface PageResult<T> {
  content: T;
  actualLocale: string;
}

export async function getPage<T>(locale: string, namespace: string): Promise<PageResult<T>> {
  // 如果是英文，直接加载英文内容
  if (locale === 'en') {
    const content = await loadPageContent<T>(locale, namespace);
    return { content, actualLocale: 'en' };
  }

  // 非英文语言，并发加载英文和目标语言内容
  const [targetResult, enResult] = await Promise.allSettled([loadPageContent<T>(locale, namespace), loadPageContent<T>('en', namespace)]);

  // 优先返回目标语言内容
  if (targetResult.status === 'fulfilled') {
    return { content: targetResult.value, actualLocale: locale };
  }

  // 目标语言失败，返回英文内容
  if (enResult.status === 'fulfilled') {
    console.warn(`Failed to load pages/${namespace}/${locale}.json, using en.json as fallback`);
    return { content: enResult.value, actualLocale: 'en' };
  }

  // 两个都失败，抛出错误
  console.error(`Failed to load both ${locale} and en content for ${namespace}`);
  throw new Error(`Failed to load page content for ${namespace}`);
}

async function loadPageContent<T>(locale: string, namespace: string): Promise<T> {
  // 检查缓存
  const cacheKey = locale + '-' + namespace;
  const cachedData = landingPageCache.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    console.log('page_configs', locale, namespace, process.env.PROJECT_ID);
    const { data, error } = await getPgWrapperClient()
      .from('page_configs')
      .select('content')
      .eq('locale', locale)
      .eq('code', namespace)
      .eq('project_id', process.env.PROJECT_ID)
      .eq('is_deleted', false)
      .single();
    console.log('result', data, error);

    if (data?.content) {
      const content = data.content as T;
      landingPageCache.set(cacheKey, content);
      return content;
    }

    throw new Error(`No content found for ${locale}/${namespace}`);
  } catch (error) {
    // 如果数据库查询失败，尝试从文件系统加载（作为最后的备用方案）
    try {
      const fallbackData = await import(`@/i18n/pages/${namespace}/${locale}.json`).then(module => module.default as T);
      landingPageCache.set(cacheKey, fallbackData);
      return fallbackData;
    } catch (importError) {
      throw new Error(`Failed to load ${locale}/${namespace} from both database and filesystem`);
    }
  }
}
