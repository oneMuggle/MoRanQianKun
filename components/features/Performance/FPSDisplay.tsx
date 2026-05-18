/**
 * FPSDisplay Component
 * 在游戏角落显示实时 FPS（消费 performanceMonitor.ts 的共享数据）
 */

import React from 'react';

interface Props {
  fps: number;
  memoryMB?: number;
  enabled: boolean;
}

const FPSDisplay: React.FC<Props> = ({ fps, memoryMB, enabled }) => {
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
      {fps} FPS{memoryMB ? ` · ${memoryMB}MB` : ''}
    </div>
  );
};

export default FPSDisplay;
