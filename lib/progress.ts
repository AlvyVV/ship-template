export interface ProgressOptions {
  expectedSeconds: number;
  taskId: string;
  currentProgress?: number;
}

interface TaskProgressInfo {
  startTime: number;
  expectedSeconds: number;
  lastProgress: number;
}

const taskProgressMap: Map<string, TaskProgressInfo> = new Map();

/**
 * 根据任务的开始时间与预计耗时估算进度值（最大 94）。
 * 该函数的返回值始终递增且 ≤ 94。真正的 100% 由服务端事件触发时设定。
 * @param expectedSeconds 预计完成总时长（秒）
 * @param taskId 任务唯一标识
 * @param currentProgress 当前已显示的进度（默认 0）
 * @returns 返回新的进度值，范围 1-94，且不会低于 currentProgress
 */
export function getProgress(expectedSeconds: number, taskId: string, currentProgress = 0): number {
  if (expectedSeconds <= 0) {
    // 避免除以 0，直接返回 94
    return 94;
  }

  const now = Date.now();

  // 第一次调用：初始化 task 记录
  if (!taskProgressMap.has(taskId)) {
    const firstProgress = Math.floor(Math.random() * 5) + 1; // 1-5 之间
    taskProgressMap.set(taskId, {
      startTime: now,
      expectedSeconds,
      lastProgress: firstProgress,
    });
    return Math.max(firstProgress, currentProgress);
  }

  const info = taskProgressMap.get(taskId)!;

  const elapsed = (now - info.startTime) / 1000; // 秒
  // 幂函数曲线：前期快，后期慢，最大 94
  const baseProgress = 94 * (1 - Math.pow(0.5, elapsed / info.expectedSeconds));
  // 0.9 - 1.1 随机系数，提升随机性
  const randomFactor = 0.9 + Math.random() * 0.2;
  let estimatedProgress = Math.floor(baseProgress * randomFactor);

  // 不能超过 94
  if (estimatedProgress > 94) estimatedProgress = 94;

  // 保证递增且不比 currentProgress 小
  estimatedProgress = Math.max(estimatedProgress, info.lastProgress, currentProgress);

  // 更新缓存中的 lastProgress
  info.lastProgress = estimatedProgress;
  return estimatedProgress;
}
