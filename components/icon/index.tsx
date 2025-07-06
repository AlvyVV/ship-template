'use client';

import {
  RiImageEditLine,
  RiLandscapeAiLine,
  RiBrainLine,
  RiApps2Line,
  RiTeamLine,
  RiDiscordFill,
  RiChatQuoteLine,
  RiTwitterXFill,
  RiMenuLine,
  RiGalleryLine,
  RiMouseLine,
  RiAspectRatioLine,
  RiShuffleLine,
  RiShieldStarLine,
  RiGiftLine,
  RiArrowRightUpLine,
  RiFileImageLine,
  RiPaletteLine,
  RiImage2Line,
  RiInstagramLine,
  RiFocus3Line,
  RiSettings3Line,
  RiSpeedUpLine,
  RiRefreshLine,
  RiUpload2Line,
  RiDownloadLine,
  RiCloseFill,
  RiBrushLine,
  RiSparkling2Line,
} from 'react-icons/ri';

// 精确映射每个具体图标
const iconMap: { [key: string]: React.ElementType } = {
  RiImageEditLine,
  RiMenuLine,
  RiBrainLine,
  RiImage2Line,
  RiRefreshLine,
  RiSettings3Line,
  RiCloseFill,
  RiFocus3Line,
  RiPaletteLine,
  RiSpeedUpLine,
  RiSparkling2Line,
  RiGalleryLine,
  RiInstagramLine,
  RiFileImageLine,
  RiUpload2Line,
  RiDiscordFill,
  RiLandscapeAiLine,
  RiShuffleLine,
  RiDownloadLine,
  RiApps2Line,
  RiGiftLine,
  RiBrushLine,
  RiTeamLine,
  RiChatQuoteLine,
  RiTwitterXFill,
  RiMouseLine,
  RiAspectRatioLine,
  RiArrowRightUpLine,
  RiShieldStarLine,
};

export default function Icon({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) {
  // 直接从 iconMap 中获取图标组件
  const IconComponent = iconMap[name];
  console.log(IconComponent);
  // 如果找不到图标，返回 null 或者显示警告（开发环境）
  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`图标 "${name}" 未找到。请确保已在 iconMap 中添加该图标。`);
    }
    return null;
  }

  // 渲染图标组件
  return <IconComponent className={`${className} cursor-pointer`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }} />;
}
