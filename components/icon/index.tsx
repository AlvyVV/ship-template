'use client';

import {
    RiApps2Line,
    RiArrowRightUpLine,
    RiAspectRatioLine,
    RiBrainLine,
    RiBrushLine,
    RiChatQuoteLine,
    RiCheckLine,
    RiCloseFill,
    RiDiscordFill,
    RiDownloadLine,
    RiFileImageLine,
    RiFocus3Line,
    RiGalleryLine,
    RiGiftLine,
    RiImage2Line,
    RiImageEditLine,
    RiInstagramLine,
    RiLandscapeAiLine,
    RiMenuLine,
    RiMouseLine,
    RiPaletteLine,
    RiRefreshLine,
    RiSettings3Line,
    RiShieldStarLine,
    RiShuffleLine,
    RiSparkling2Line,
    RiSpeedUpLine,
    RiTeamLine,
    RiTwitterXFill,
    RiUpload2Line,
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
    RiShieldStarLine, RiCheckLine
};

export default function Icon({name, className, onClick}: { name: string; className?: string; onClick?: () => void }) {
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
    return <IconComponent className={`${className} cursor-pointer`} onClick={onClick}
                          style={{cursor: onClick ? 'pointer' : 'default'}}/>;
}
