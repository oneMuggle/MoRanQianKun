/**
 * AI 请求队列监控
 * 追踪 pending/active AI 请求，统计平均等待时间和拥堵情况
 */

import { useRef, useCallback } from 'react';

interface AIRequestRecord {
  id: string;
  operation: string;
  model: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  error?: string;
}

export interface AIQueueStats {
  activeCount: number;
  pendingCount: number;
  totalCount: number;
  completedCount: number;
  failedCount: number;
  averageDurationMs: number;
  longestPending: AIRequestRecord | null;
}

export const useAIQueueMonitor = () => {
  const queueRef = useRef<Map<string, AIRequestRecord>>(new Map());
  const historyRef = useRef<AIRequestRecord[]>([]);

  const enqueue = useCallback((id: string, operation: string, model: string) => {
    queueRef.current.set(id, { id, operation, model, startTime: Date.now(), status: 'pending' });
  }, []);

  const activate = useCallback((id: string) => {
    const record = queueRef.current.get(id);
    if (record) {
      record.status = 'active';
      queueRef.current.set(id, record);
    }
  }, []);

  const complete = useCallback((id: string) => {
    const record = queueRef.current.get(id);
    if (record) {
      record.status = 'completed';
      record.endTime = Date.now();
      historyRef.current.push({ ...record });
      queueRef.current.delete(id);
      if (historyRef.current.length > 50) {
        historyRef.current = historyRef.current.slice(-50);
      }
    }
  }, []);

  const fail = useCallback((id: string, error: string) => {
    const record = queueRef.current.get(id);
    if (record) {
      record.status = 'failed';
      record.error = error;
      record.endTime = Date.now();
      historyRef.current.push({ ...record });
      queueRef.current.delete(id);
    }
  }, []);

  const getStats = useCallback((): AIQueueStats => {
    const records = Array.from(queueRef.current.values());
    const active = records.filter(r => r.status === 'active');
    const pending = records.filter(r => r.status === 'pending');
    const completed = historyRef.current.filter(r => r.status === 'completed');
    const failed = historyRef.current.filter(r => r.status === 'failed');
    const avgDuration = completed.length > 0
      ? completed.reduce((sum, r) => sum + ((r.endTime ?? 0) - r.startTime), 0) / completed.length
      : 0;

    return {
      activeCount: active.length,
      pendingCount: pending.length,
      totalCount: records.length,
      completedCount: completed.length,
      failedCount: failed.length,
      averageDurationMs: Math.round(avgDuration),
      longestPending: pending.length > 0 ? pending[0] : null,
    };
  }, []);

  return { enqueue, activate, complete, fail, getStats, queueRef, historyRef };
};
