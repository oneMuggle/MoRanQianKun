/**
 * 敏感点悬浮提示框
 * 显示敏感点名称、敏感度、发现状态、开发程度、反应描述等
 */

import { memo } from 'react';
import type { 敏感点条目 } from '../../../models/npcNSFWEnhancement/types';

interface BodyPointTooltipProps {
  point: 敏感点条目;
  eraId?: string;
  onClose?: () => void;
}

export const BodyPointTooltip = memo(({ point, eraId, onClose }: BodyPointTooltipProps) => {
  const displayName = point.时代名称 || point.名称;

  const renderStars = (count: number) => (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-xs ${i < count ? 'text-pink-400' : 'text-gray-600'}`}
        >
          ★
        </span>
      ))}
    </span>
  );

  const getStatusStyle = () => {
    switch (point.发现状态) {
      case '未发觉': return { color: 'text-gray-500', bg: 'bg-gray-800', label: '未发觉', icon: '○' };
      case '已发现': return { color: 'text-blue-400', bg: 'bg-blue-900/50', label: '已发现', icon: '◐' };
      case '已开发': return { color: 'text-pink-400', bg: 'bg-pink-900/50', label: '已开发', icon: '●' };
    }
  };

  const status = getStatusStyle();

  const getDevelopmentColor = () => {
    switch (point.开发程度) {
      case '未开发': return 'text-gray-400';
      case '初步探索': return 'text-blue-300';
      case '渐入佳境': return 'text-pink-300';
      case '深度开发': return 'text-pink-400';
      case '完全开发': return 'text-rose-400';
    }
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 min-w-[200px] max-w-[280px]">
      <div className={`rounded-lg border border-wuxia-gold/30 ${status.bg} p-3 shadow-lg shadow-black/50`}>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-1 right-1 text-gray-500 hover:text-gray-300 text-xs"
          >
            ×
          </button>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-bold ${status.color}`}>
            {status.icon} {displayName}
          </span>
          <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-black/30">
            {point.区域}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-gray-400">敏感度</span>
          {renderStars(point.敏感度)}
        </div>

        <div className="flex items-center gap-3 mb-2 text-xs">
          <span className={status.color}>{status.label}</span>
          {point.开发程度 && (
            <span className={`text-gray-400 ${getDevelopmentColor()}`}>
              开发：{point.开发程度}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-300 leading-relaxed border-t border-gray-700/50 pt-2">
          <span className="text-gray-500">反应：</span>
          {point.反应描述}
        </div>

        {point.描写提示词 && (
          <div className="text-xs text-gray-500 mt-1.5 italic">
            提示：{point.描写提示词}
          </div>
        )}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-wuxia-gold/30" />
    </div>
  );
});

BodyPointTooltip.displayName = 'BodyPointTooltip';

export default BodyPointTooltip;
