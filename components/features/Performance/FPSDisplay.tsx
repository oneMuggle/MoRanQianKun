/**
 * FPSDisplay Component
 * 在游戏角落显示实时 FPS
 */

import React, { useEffect, useRef, useState } from 'react';
import { usePerformanceMonitor, type 性能监控数据 } from '../../hooks/useGame/performanceMonitor';

interface Props {
  enabled: boolean;
}

const FPSDisplay: React.FC<Props> = ({ enabled }) => {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;

    const 计算FPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      if (delta >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / delta));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      rafId = requestAnimationFrame(计算FPS);
    };

    rafId = requestAnimationFrame(计算FPS);
    return () => cancelAnimationFrame(rafId);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        pointerEvents: 'none',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: fps >= 50 ? '#4ade80' : fps >= 30 ? '#fbbf24' : '#ef4444',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '2px 6px',
        borderRadius: '4px',
      }}
    >
      {fps} FPS
    </div>
  );
};

export default FPSDisplay;
