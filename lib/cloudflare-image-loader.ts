/**
 * Cloudflare 图像优化加载器
 * 利用 Cloudflare 的图像转换功能自动优化图片
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudflareImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // 如果是本地图片路径（以 / 开头），则添加域名
  if (src.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://your-domain.com';
    src = baseUrl + src;
  }

  // 对于外部图片URL，直接返回原始URL
  // Cloudflare 会在 CDN 层面自动进行图像优化
  try {
    const url = new URL(src);

    // 如果是完整的外部URL，直接返回
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return src;
    }
  } catch (error) {
    // 如果URL解析失败，继续使用下面的逻辑
  }

  // 对于同域名的图片，使用 Cloudflare Image Resizing
  const params = new URLSearchParams();

  // 设置宽度
  if (width) {
    params.set('width', width.toString());
  }

  // 设置质量（1-100）
  const imageQuality = quality || 75;
  params.set('quality', imageQuality.toString());

  // 设置格式为自动检测最佳格式
  params.set('format', 'auto');

  // 启用压缩
  params.set('fit', 'scale-down');

  // 构建最终 URL - 只对相对路径使用
  const cloudflareUrl = `/cdn-cgi/image/${params.toString()}/${encodeURIComponent(src)}`;

  return cloudflareUrl;
}
