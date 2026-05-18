/**
 * 内存追踪器
 * 定时检测核心状态对象体积增长，检测潜在内存泄漏
 */

import { useRef, useEffect, useCallback } from 'react';

export interface MemoryAlert {
  key: string;
  currentSize: number;
  previousSize: number;
  growthPercent: number;
  message: string;
}

const TRACKED_KEYS = ['历史记录', '社交', '记忆系统', '世界', '任务列表'];
const SIZE_THRESHOLD = 5 * 1024 * 1024; // 5MB 警告
const GROWTH_THRESHOLD = 50; // 增长 50% 警告

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const useMemoryTracker = (enabled: boolean, gameState: Record<string, unknown>) => {
  const previousSizesRef = useRef<Record<string, number>>({});
  const alertsRef = useRef<MemoryAlert[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sample = useCallback(() => {
    for (const key of TRACKED_KEYS) {
      try {
        const value = gameState[key];
        if (!value) continue;
        const json = JSON.stringify(value);
        const size = new Blob([json]).size;

        const prev = previousSizesRef.current[key];
        if (prev !== undefined) {
          const growth = ((size - prev) / prev) * 100;
          if (growth > GROWTH_THRESHOLD) {
            alertsRef.current.push({
              key,
              currentSize: size,
              previousSize: prev,
              growthPercent: growth,
              message: `${key} 增长 ${growth.toFixed(0)}% (${formatSize(prev)} → ${formatSize(size)})`,
            });
          }
          if (size > SIZE_THRESHOLD) {
            alertsRef.current.push({
              key,
              currentSize: size,
              previousSize: prev,
              growthPercent: 0,
              message: `${key} 体积过大: ${formatSize(size)}`,
            });
          }
        }
        previousSizesRef.current[key] = size;
      } catch {
        // 忽略不可序列化对象
      }
    }
    // 保留最近 20 条告警
    if (alertsRef.current.length > 20) {
      alertsRef.current = alertsRef.current.slice(-20);
    }
  }, [gameState]);

  useEffect(() => {
    if (!enabled) return;

    const doSample = () => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => sample(), { timeout: 1000 });
      } else {
        setTimeout(sample, 0);
      }
    };

    intervalRef.current = setInterval(doSample, 30000);
    // 立即采样一次
    doSample();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, sample]);

  return {
    alerts: alertsRef.current,
    clearAlerts: useCallback(() => { alertsRef.current = []; }, []),
  };
};
