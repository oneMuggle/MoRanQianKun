/**
 * 慢操作日志列表 UI
 * 展示慢操作记录，包含时间戳、操作名称、耗时（颜色编码）
 *
 * 生产构建守卫:
 * - 默认仅在 DEV 模式下渲染（import.meta.env.DEV）
 * - 生产环境下可通过 URL 参数 `?debug=1` 或 `?perf=1` 显式启用
 * - 避免性能数据常驻 DOM 影响生产 FPS / 增加噪音
 */

/// <reference types="vite/client" />

import React from 'react';

interface SlowOperationRecord {
  操作: string;
  耗时: number;
  时间戳: number;
}

interface Props {
  records: SlowOperationRecord[];
  maxItems?: number;
}

/**
 * 检查 URL 是否带调试参数（生产环境手动开启的入口）
 * SSR 安全：window 不存在时直接返回 false
 */
const hasDebugParam = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === '1' || params.get('perf') === '1';
  } catch {
    return false;
  }
};

const getDurationColor = (seconds: number): string => {
  if (seconds < 5) return '#4ade80';
  if (seconds < 10) return '#fbbf24';
  return '#ef4444';
};

const formatTime = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleTimeString('zh-CN', { hour12: false });
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const SlowOperationLog: React.FC<Props> = ({ records, maxItems = 10 }) => {
  // 生产构建守卫：仅 DEV 或显式 ?debug=1 启用
  // 注意：Vite 会把 import.meta.env.DEV 在生产构建中替换为 false，配合
  // 死代码消除，启用分支会被摇树掉，不影响 DEV 包的渲染行为
  if (!import.meta.env.DEV && !hasDebugParam()) {
    return null;
  }

  const displayRecords = records.slice(-maxItems).reverse();

  if (displayRecords.length === 0) {
    return (
      <div className="text-gray-500 text-xs text-center py-2">
        无慢操作记录
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-40 overflow-y-auto">
      {displayRecords.map((record, idx) => {
        const seconds = record.耗时 / 1000;
        const color = getDurationColor(seconds);
        return (
          <div
            key={idx}
            className="flex items-center justify-between text-xs px-2 py-1 bg-gray-800/50 rounded"
          >
            <span className="text-gray-400 font-mono">{formatTime(record.时间戳)}</span>
            <span className="text-gray-200 ml-2">{record.操作}</span>
            <span className="ml-auto font-mono" style={{ color }}>
              {formatDuration(record.耗时)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SlowOperationLog;
