import { respData, respErr } from '@/lib/resp';
import { getPgWrapperClient } from '@/lib/db-wrapper';
import { headers } from 'next/headers';
import { date } from 'zod';

export async function POST(req: Request) {
  try {
    // 1. 解析请求参数
    const { code, imageUrl, userId } = await req.json();
    if (!code || !imageUrl) {
      return respErr('invalid params');
    }

    // 2. 查询 item_configs 获取 content 配置
    const pgClient = getPgWrapperClient();
    const { data: configData, error } = await pgClient.from('item_configs').select('content').eq('code', code).eq('project_id', process.env.PROJECT_ID).eq('is_deleted', false).single();
    console.log(configData, 'xx');
    console.log(error, 'error xxs');
    if (error || !configData?.content) {
      return respErr('config not found');
    }

    // 3. 处理 content 并注入 urls
    let content: any = configData.content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        return respErr('invalid content format');
      }
    }

    content.urls = [imageUrl];

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
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user-media-records`;

    const remoteResp = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(payload),
    });

    const remoteData = await remoteResp.json().catch(() => null);

    if (!remoteResp.ok) {
      const msg = remoteData?.message || 'remote error';
      return respErr(msg);
    }

    return respData(remoteData);
  } catch (e) {
    console.error('image-style-transfer error: ', e);
    return respErr('internal error');
  }
}
