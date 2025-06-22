export interface RemoteFile {
  bucket: string;
  key: string;
  name: string;
  size: number;
  type: string;
  /**
   * 可公开访问的文件 URL，用于后端直接拉取处理
   */
  url: string;
}

/**
 * Generate or retrieve persistent visitor fingerprint stored in localStorage.
 * If running on the server, an error will be thrown because file uploads are
 * only supported in the browser environment.
 */
function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') {
    throw new Error('uploadFile can only be called in a browser environment');
  }

  const STORAGE_KEY = 'visitor_fingerprint';
  let fp = window.localStorage.getItem(STORAGE_KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, fp);
  }
  return fp;
}

/**
 * Create a unique file name by prefixing a random string before the original
 * file name to reduce collision risk while preserving the original name and
 * extension for readability.
 */
function generateUniqueFileName(file: File): string {
  const randomPrefix = Math.random().toString(36).substring(2, 10);
  return `${randomPrefix}_${file.name}`;
}

/**
 * 通用单文件上传方法。
 *
 * 1. 生成唯一文件名 (含随机前缀)
 * 2. 请求后端 `/upload/token` 获取直传 URL
 * 3. 通过 PUT 请求将文件直传至对象存储
 * 4. 返回后端约定格式的 `RemoteFile` 描述对象
 *
 * @param file 需要上传的浏览器 File 对象
 * @throws Error 当上传失败或网络请求异常时抛出
 */
export async function uploadFile(file: File): Promise<RemoteFile> {
  if (!(file instanceof File)) {
    throw new Error('uploadFile: parameter must be a File instance');
  }

  const fingerprint = getOrCreateFingerprint();
  const uniqueFileName = generateUniqueFileName(file);

  // import inside function to avoid cyclic deps when this util is imported on server
  const { apiClient } = await import('./api-client');

  // 请求上传 Token
  const tokenRes = await apiClient.post<{
    publicUrl: string;
    uploadUrl: string;
    bucket: string;
    key: string;
    expiresIn: number;
  }>(
    '/upload/token',
    {
      fingerprint,
      filename: uniqueFileName,
    },
    {
      headers: { fingerprint },
      includeAuth: false,
    }
  );

  // 直传到对象存储
  const putResp = await fetch(tokenRes.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!putResp.ok) {
    throw new Error(`uploadFile: PUT upload failed with status ${putResp.status}`);
  }

  return {
    bucket: tokenRes.bucket,
    key: tokenRes.key,
    name: file.name,
    size: file.size,
    type: file.type,
    url: tokenRes.publicUrl,
  };
}
