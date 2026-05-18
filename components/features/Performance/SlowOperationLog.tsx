/**
 * 慢操作日志列表 UI
 * 展示慢操作记录，包含时间戳、操作名称、耗时（颜色编码）
 */

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
