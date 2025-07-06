'use client';

import {
  RiImageEditLine,
  RiLandscapeAiLine,
  RiBrainLine,
  RiApps2Line,
  RiTeamLine,
  RiInstagramLine,
  RiDiscordFill,
  RiChatQuoteLine,
  RiTwitterXFill,
  RiMenuLine,
  RiGalleryLine,
  RiMouseLine,
  RiAspectRatioLine,
  RiShuffleLine,
  RiShieldStarLine,
  RiArrowRightUpLine,
} from 'react-icons/ri';

// 精确映射每个具体图标
const iconMap: { [key: string]: React.ElementType } = {
  RiImageEditLine,
  RiMenuLine,
  RiBrainLine,
  RiInstagramLine,
  RiDiscordFill,
  RiLandscapeAiLine,
  RiShuffleLine,
  RiApps2Line,
  RiTeamLine,
  RiChatQuoteLine,
  RiTwitterXFill,
  RiGalleryLine,
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
