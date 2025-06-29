import { respData, respErr } from '@/lib/resp';
import { getPgWrapperClient } from '@/lib/db-wrapper';
import { headers } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import { ItemGenerate } from '@/types/item/image-generate';

export async function POST(req: Request) {
  try {
    // 1. 解析请求参数
    const { code, imageUrl, userId, aspectRatio, n } = await req.json();
    if (!code || !imageUrl) {
      return respErr('invalid params');
    }

    // 2. 查询 item_configs 获取 content 配置
    const pgClient = getPgWrapperClient();
    const { data: configData, error } = await pgClient.from('item_configs').select('content').eq('code', code).eq('project_id', process.env.PROJECT_ID).eq('is_deleted', false).single();
    if (error || !configData?.content) {
      return respErr('config not found');
    }

    // 3. 处理 content 并注入 urls
    let content: ItemGenerate = configData.content as ItemGenerate;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        return respErr('invalid content format');
      }
    }
    console.log('configData', configData);
    const { data: promptData, error: promptError } = await pgClient.from('prompts').select('prompt').eq('code', configData.code).eq('is_deleted', false).single();
    if (promptError || !promptData?.prompt) {
      console.error('prompt not found', promptError, promptData);
      return respErr('prompt not found');
    }

    content.urls = [imageUrl];
    content.prompt = promptData.prompt;
    content.aspectRatio = aspectRatio;
    content.n = n;

    // 4. 组装外部接口请求体
    const payload = {
      projectId: process.env.PROJECT_ID,
      userId: userId || undefined,
      creditCode: 'IMAGE-STYLE',
      bizCode: code,
      type: 'IMAGE',
      oriMeta: content,
    };

    // 5. 构造请求头，透传 Authorization（若有）
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const h = await headers();
    const authHeader = h.get('Authorization');
    if (authHeader) {
      requestHeaders['Authorization'] = authHeader;
    }

    // 6. 调用外部接口
    const resData = await apiClient.post('/user-media-records', payload, {
      headers: requestHeaders,
    });

    // 将返回结果扁平化，去掉多余的 data 嵌套，同时保留 status 字段
    const res = {
      status: resData?.status,
      ...resData?.data,
      exeTime: content.exeTime,
    };

    return respData(res);
  } catch (e) {
    console.error('image-style-transfer error: ', e);
    return respErr('internal error');
  }
}
