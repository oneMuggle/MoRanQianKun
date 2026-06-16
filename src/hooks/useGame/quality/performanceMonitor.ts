/**
 * 性能监控系统
 * 采集 FPS、AI 响应时间、图片生成时间、内存使用等关键性能指标
 * 统一数据源，消除 FPSDisplay 中的重复计算
 */

import { useEffect, useRef, useCallback } from 'react';
import type { 性能监控配置结构 } from '../../../models/system';

export interface 性能监控数据 {
  fps: number;
  ai响应时间?: number;
  生图响应时间?: number;
  当前内存MB?: number;
  状态更新时间?: { category: string; duration: number };
  最后更新: number;
}

export interface UsePerformanceMonitorDeps {
  onSlowOperation?: (op: string, duration: number) => void;
  config?: 性能监控配置结构;
}

export interface UsePerformanceMonitorReturn {
  数据: 性能监控数据;
  记录AI响应: (duration: number) => void;
  记录生图响应: (duration: number) => void;
  记录状态更新: (category: string, duration: number) => void;
  获取当前数据: () => 性能监控数据;
  获取FPS: () => number;
  subscribe: (listener: (data: 性能监控数据) => void) => () => void;
}

/**
 * 性能监控 Hook
 * - FPS 计算使用 requestAnimationFrame（唯一数据源）
 * - 支持记录 AI 响应时间、生图响应时间、状态更新延迟
 * - 慢操作自动回调警告（阈值从配置读取）
 * - 订阅机制供 FPSDisplay 和 Dashboard 响应数据变化
 */
export const usePerformanceMonitor = (deps: UsePerformanceMonitorDeps): UsePerformanceMonitorReturn => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsValue = useRef(0);
  const dataRef = useRef<性能监控数据>({ fps: 0, 最后更新: Date.now() });
  const listenersRef = useRef<Set<(data: 性能监控数据) => void>>(new Set());

  // 通知所有订阅者
  const notifyListeners = useCallback(() => {
    const snapshot = { ...dataRef.current };
    listenersRef.current.forEach(listener => listener(snapshot));
  }, []);

  // 订阅机制
  const subscribe = useCallback((listener: (data: 性能监控数据) => void) => {
    listenersRef.current.add(listener);
    listener({ ...dataRef.current });
    return () => { listenersRef.current.delete(listener); };
  }, []);

  // FPS 计算使用 requestAnimationFrame 循环（唯一实现）
  useEffect(() => {
    let rafId: number;
    const 计算FPS = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;
      if (delta >= 1000) {
        fpsValue.current = Math.round((frameCount.current * 1000) / delta);
        frameCount.current = 0;
        lastTime.current = now;
        dataRef.current = {
          ...dataRef.current,
          fps: fpsValue.current,
          最后更新: Date.now(),
        };
        notifyListeners();
      }
      rafId = requestAnimationFrame(计算FPS);
    };
    rafId = requestAnimationFrame(计算FPS);
    return () => cancelAnimationFrame(rafId);
  }, [notifyListeners]);

  // 尝试获取内存信息（仅 Chrome 支持）
  const 获取内存信息 = useCallback((): number | undefined => {
    try {
      // @ts-expect-error performance.memory 是 Chrome 特有 API
      const memory = performance.memory;
      if (memory) {
        return Math.round(memory.usedJSHeapSize / (1024 * 1024));
      }
    } catch {
      // 非 Chrome 环境忽略
    }
    return undefined;
  }, []);

  // 读取慢操作阈值（从配置，回退到硬编码默认值）
  const aiThreshold = deps.config?.AI响应慢阈值ms ?? 10000;
  const imageThreshold = deps.config?.生图慢阈值ms ?? 30000;

  // 记录 AI 响应时间
  const 记录AI响应 = useCallback((duration: number) => {
    const memoryMB = 获取内存信息();
    dataRef.current = {
      ...dataRef.current,
      ai响应时间: Math.round(duration),
      当前内存MB: memoryMB,
      最后更新: Date.now(),
    };
    notifyListeners();
    if (duration > aiThreshold) {
      deps.onSlowOperation?.('AI响应', duration);
    }
  }, [deps, 获取内存信息, notifyListeners, aiThreshold]);

  // 记录生图响应时间
  const 记录生图响应 = useCallback((duration: number) => {
    const memoryMB = 获取内存信息();
    dataRef.current = {
      ...dataRef.current,
      生图响应时间: Math.round(duration),
      当前内存MB: memoryMB,
      最后更新: Date.now(),
    };
    notifyListeners();
    if (duration > imageThreshold) {
      deps.onSlowOperation?.('图片生成', duration);
    }
  }, [deps, 获取内存信息, notifyListeners, imageThreshold]);

  // 记录状态更新延迟
  const 记录状态更新 = useCallback((category: string, duration: number) => {
    dataRef.current = {
      ...dataRef.current,
      状态更新时间: { category, duration: Math.round(duration) },
      最后更新: Date.now(),
    };
    notifyListeners();
  }, [notifyListeners]);

  const 获取当前数据 = useCallback((): 性能监控数据 => {
    return { ...dataRef.current };
  }, []);

  const 获取FPS = useCallback((): number => {
    return fpsValue.current;
  }, []);

  return {
    数据: dataRef.current,
    记录AI响应,
    记录生图响应,
    记录状态更新,
    获取当前数据,
    获取FPS,
    subscribe,
  };
};

/**
 * 性能监控 Provider Hook
 * 用于在 useGame 中管理全局性能监控状态
 */
export const usePerformanceTracker = () => {
  const 慢操作记录Ref = useRef<Array<{ 操作: string; 耗时: number; 时间戳: number }>>([]);

  const 处理慢操作 = useCallback((op: string, duration: number) => {
    const 记录 = {
      操作: op,
      耗时: duration,
      时间戳: Date.now(),
    };
    慢操作记录Ref.current.push(记录);
    // 保留最近 20 条记录
    if (慢操作记录Ref.current.length > 20) {
      慢操作记录Ref.current = 慢操作记录Ref.current.slice(-20);
    }
    // 输出到控制台
    console.warn(`[性能警告] ${op} 耗时 ${Math.round(duration / 1000)}s`, {
      duration,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const 获取慢操作记录 = useCallback(() => {
    return [...慢操作记录Ref.current];
  }, []);

  const 清除慢操作记录 = useCallback(() => {
    慢操作记录Ref.current = [];
  }, []);

  return {
    处理慢操作,
    获取慢操作记录,
    清除慢操作记录,
  };
};
