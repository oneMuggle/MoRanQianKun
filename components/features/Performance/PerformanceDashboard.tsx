/**
 * 性能监控面板
 * 集成所有性能指标的总控面板，支持快捷键 Ctrl+Shift+P 切换
 */

import React, { useState } from 'react';
import type { 性能监控数据 } from '../../../hooks/useGame/quality/performanceMonitor';
import type { AIQueueStats } from '../../../hooks/useGame/quality/aiQueueMonitor';
import type { ComponentRenderStats } from '../../../hooks/useGame/quality/renderProfiler';
import type { MemoryAlert } from '../../../hooks/useGame/quality/memoryTracker';
import SlowOperationLog from './SlowOperationLog';

interface Props {
  perfData: 性能监控数据;
  aiQueueStats: AIQueueStats;
  renderReport: ComponentRenderStats[];
  memoryAlerts: MemoryAlert[];
  slowOps: Array<{ 操作: string; 耗时: number; 时间戳: number }>;
  maxSlowOps?: number;
  onClose: () => void;
}

const getFPSColor = (fps: number): string => {
  if (fps >= 50) return '#4ade80';
  if (fps >= 30) return '#fbbf24';
  return '#ef4444';
};

const getDurationColor = (ms: number): string => {
  if (!ms) return '#6b7280';
  if (ms < 3000) return '#4ade80';
  if (ms < 10000) return '#fbbf24';
  return '#ef4444';
};

const formatDuration = (ms: number): string => {
  if (!ms) return '--';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const PerformanceDashboard: React.FC<Props> = ({
  perfData,
  aiQueueStats,
  renderReport,
  memoryAlerts,
  slowOps,
  maxSlowOps = 10,
  onClose,
}) => {
  const [minimized, setMinimized] = useState(false);

  const fpsColor = getFPSColor(perfData.fps);

  return (
    <div className="fixed top-4 right-4 z-[10000] w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl text-white font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="font-bold text-wuxia-gold text-sm">性能监控面板</span>
        <div className="flex gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="px-1.5 py-0.5 text-gray-400 hover:text-white bg-gray-800 rounded"
          >
            {minimized ? '展开' : '最小化'}
          </button>
          <button
            onClick={onClose}
            className="px-1.5 py-0.5 text-gray-400 hover:text-red-400 bg-gray-800 rounded"
          >
            ×
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="p-3 space-y-3 max-h-[80vh] overflow-y-auto">
          {/* FPS + Memory */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/60 rounded p-2">
              <div className="text-gray-400">FPS</div>
              <div className="text-2xl font-bold" style={{ color: fpsColor }}>
                {perfData.fps}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded p-2">
              <div className="text-gray-400">内存</div>
              <div className="text-lg text-gray-200">
                {perfData.当前内存MB ? `${perfData.当前内存MB}MB` : 'N/A'}
              </div>
            </div>
          </div>

          {/* AI Timing */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800/60 rounded p-2 text-center">
              <div className="text-gray-400">AI 响应</div>
              <div style={{ color: getDurationColor(perfData.ai响应时间 ?? 0) }}>
                {formatDuration(perfData.ai响应时间 ?? 0)}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded p-2 text-center">
              <div className="text-gray-400">生图</div>
              <div style={{ color: getDurationColor(perfData.生图响应时间 ?? 0) }}>
                {formatDuration(perfData.生图响应时间 ?? 0)}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded p-2 text-center">
              <div className="text-gray-400">队列</div>
              <div className="text-gray-200">{aiQueueStats.totalCount}</div>
            </div>
          </div>

          {/* AI Queue Status */}
          <div className="bg-gray-800/60 rounded p-2">
            <div className="text-gray-400 mb-1">AI 队列状态</div>
            <div className="flex justify-between">
              <span>活跃: <span className="text-green-400">{aiQueueStats.activeCount}</span></span>
              <span>等待: <span className="text-yellow-400">{aiQueueStats.pendingCount}</span></span>
              <span>完成: <span className="text-blue-400">{aiQueueStats.completedCount}</span></span>
              <span>失败: <span className="text-red-400">{aiQueueStats.failedCount}</span></span>
            </div>
            <div className="mt-1">
              平均耗时: {formatDuration(aiQueueStats.averageDurationMs)}
            </div>
          </div>

          {/* Render Hot Components */}
          {renderReport.length > 0 && (
            <div className="bg-gray-800/60 rounded p-2">
              <div className="text-gray-400 mb-1">渲染热区 (Top {renderReport.length})</div>
              <div className="space-y-0.5">
                {renderReport.slice(0, 5).map((comp) => (
                  <div key={comp.id} className="flex justify-between">
                    <span className="text-gray-300">{comp.id}</span>
                    <span className="text-gray-400">
                      {comp.renderCount}次 / {comp.totalTime.toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memory Alerts */}
          {memoryAlerts.length > 0 && (
            <div className="bg-gray-800/60 rounded p-2">
              <div className="text-yellow-400 mb-1">内存告警</div>
              <div className="space-y-0.5">
                {memoryAlerts.slice(-3).map((alert, idx) => (
                  <div key={idx} className="text-yellow-300 text-[10px]">
                    ⚠ {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slow Operation Log */}
          <div className="bg-gray-800/60 rounded p-2">
            <div className="text-gray-400 mb-1">慢操作日志</div>
            <SlowOperationLog records={slowOps} maxItems={maxSlowOps} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
