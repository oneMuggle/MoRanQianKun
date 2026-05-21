/**
 * NSFW 状态条组件
 * 展示亲密度、心理防线等进度条
 */

import type { NSFWBarState } from '../../../hooks/useNSFWState';

interface NSFWStatusBarProps {
  bars: NSFWBarState[];
  compact?: boolean;
}

export function NSFWStatusBar({ bars, compact }: NSFWStatusBarProps) {
  if (!bars.length) return null;

  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {bars.map((bar, i) => (
        <div key={i} className="group relative">
          <div className="flex justify-between mb-1">
            <span className="text-gray-300">{bar.label}</span>
            <span className="text-gray-400">{bar.value}/{bar.max}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${bar.color} transition-all duration-300`}
              style={{ width: `${Math.min(100, (bar.value / bar.max) * 100)}%` }}
            />
          </div>
          {bar.tooltip && (
            <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded -mt-1">
              {bar.tooltip}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
