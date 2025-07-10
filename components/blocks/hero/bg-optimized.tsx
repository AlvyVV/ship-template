"use client";

import { lazy, Suspense } from 'react';

// 动态导入 Threads 组件
const ThreadsAsync = lazy(() => import('@/components/ui/Threads/ThreadsAsync'));

// 加载中的占位符组件
const ThreadsPlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center opacity-10">
    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
  </div>
);

export default function BgOptimized() {
  return (
    <div className="-z-50 absolute inset-0 w-full h-full flex items-center justify-center opacity-75 [mask-image:linear-gradient(to_right,white,transparent,transparent,white)]">
      <Suspense fallback={<ThreadsPlaceholder />}>
        <ThreadsAsync amplitude={1.2} distance={0} enableMouseInteraction={true} />
      </Suspense>
    </div>
  );
}