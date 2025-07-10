"use client";

import { ReactNode, useEffect } from "react";
import PlausibleProvider from "next-plausible";

interface AnalyticsProps {
    children?: ReactNode;
}

export default function Analytics({children}: AnalyticsProps) {
    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    const plausibleScriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL;
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

    // 异步加载 Microsoft Clarity - 修复 TBT 问题
    useEffect(() => {
        if (!clarityId) return;

        const initClarity = () => {
            // 动态导入 Clarity，避免阻塞主线程
            import('@microsoft/clarity').then(({ default: Clarity }) => {
                try {
                    Clarity.init(clarityId);
                    console.log('✅ Microsoft Clarity 已异步初始化');
                } catch (error) {
                    console.warn('⚠️ Clarity 初始化失败:', error);
                }
            }).catch(error => {
                console.warn('⚠️ 无法加载 Clarity:', error);
            });
        };

        if ('requestIdleCallback' in window) {
            // 在浏览器空闲时初始化，延迟3秒确保关键资源先加载
            requestIdleCallback(initClarity, { timeout: 3000 });
        } else {
            // 降级处理：延迟初始化
            setTimeout(initClarity, 2000);
        }
    }, [clarityId]);
    console.log("xsdfx", plausibleDomain);
    if (!plausibleDomain || !plausibleScriptUrl) {
        return <>{children}</>;
    }

    console.log("ssddsf", plausibleScriptUrl);
    return (
        <PlausibleProvider
            domain={plausibleDomain}
            hash={true}
            trackOutboundLinks={true}
            taggedEvents={true}
            trackFileDownloads={true}
            selfHosted={true}
            customDomain={plausibleScriptUrl}
        >
            {children}
        </PlausibleProvider>
    );
}
