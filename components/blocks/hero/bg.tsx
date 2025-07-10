"use client";

import { lazy, Suspense } from 'react';

// 动态导入高性能版本
const ThreadsHighPerf = lazy(() => import('@/components/ui/Threads/ThreadsHighPerf'));

// 轻量级占位符
const ThreadsPlaceholder = () => (
  <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-20 animate-pulse" />
);

export default function Bg() {
  return (
    <div className="-z-50 absolute inset-0 w-full h-full flex items-center justify-center opacity-75 [mask-image:linear-gradient(to_right,white,transparent,transparent,white)]">
      <Suspense fallback={<ThreadsPlaceholder />}>
        <ThreadsHighPerf 
          amplitude={1.2} 
          distance={0} 
          enableMouseInteraction={true} 
        />
      </Suspense>
    </div>
  );
}
