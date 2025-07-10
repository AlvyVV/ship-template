"use client";

import {useEffect, useRef} from "react";

export default function clarityAnalytics() {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    const clarityInitialized = useRef(false);

    // 异步加载 Microsoft Clarity - 修复 HMR 兼容性问题
    useEffect(() => {
        if (!clarityId || clarityInitialized.current) return;

        const initClarity = () => {
            // 开发模式下跳过 Clarity 初始化，避免 HMR 冲突
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 开发模式：跳过 Clarity 初始化');
                return;
            }

            // 动态导入 Clarity，避免阻塞主线程
            import('@microsoft/clarity').then(({default: Clarity}) => {
                try {
                    Clarity.init(clarityId);
                    clarityInitialized.current = true;
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
            requestIdleCallback(initClarity, {timeout: 3000});
        } else {
            // 降级处理：延迟初始化
            setTimeout(initClarity, 2000);
        }
    }, [clarityId]);
    return null;
}
