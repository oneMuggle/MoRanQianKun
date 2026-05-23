/**
 * 情绪面板组件
 * 展示NPC当前情绪、心情值、波动历史
 */

import type { 情绪状态, 心情阶段 } from '../../../models/npcNSFWEnhancement/emotionSystem';

interface EmotionPanelProps {
  情绪?: 情绪状态;
  size?: 'sm' | 'md';
}

const 心情阶段颜色: Record<心情阶段, { bg: string; text: string; icon: string }> = {
  '开心': { bg: 'bg-yellow-500', text: 'text-yellow-400', icon: '☀️' },
  '平静': { bg: 'bg-blue-500', text: 'text-blue-400', icon: '🌊' },
  '烦躁': { bg: 'bg-orange-500', text: 'text-orange-400', icon: '🔥' },
  '低落': { bg: 'bg-purple-500', text: 'text-purple-400', icon: '🌧️' },
  '愤怒': { bg: 'bg-red-500', text: 'text-red-400', icon: '⚡' },
};

export function EmotionPanel({ 情绪, size = 'md' }: EmotionPanelProps) {
  if (!情绪) {
    return (
      <div className="text-gray-500 text-sm">
        情绪数据未初始化
      </div>
    );
  }

  const 颜色 = 心情阶段颜色[情绪.心情阶段] ?? 心情阶段颜色['平静'];
  const isSmall = size === 'sm';

  return (
    <div className={`space-y-2 ${isSmall ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{颜色.icon}</span>
        <span className={`font-medium ${颜色.text}`}>{情绪.心情阶段}</span>
        <span className="text-gray-500">({情绪.心情值}/100)</span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${颜色.bg} transition-all duration-500`}
          style={{ width: `${情绪.心情值}%` }}
        />
      </div>

      {!isSmall && (
        <div className="grid grid-cols-2 gap-1 text-gray-400">
          <div>波动率: {(情绪.情绪波动率 * 100).toFixed(0)}%</div>
          <div>基准心情: {情绪.基础心情}</div>
        </div>
      )}

      {情绪.情绪触发器.length > 0 && !isSmall && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-gray-500 text-xs mb-1">最近情绪变化</div>
          {情绪.情绪触发器.slice(-3).reverse().map((触发, i) => (
            <div key={i} className="text-xs text-gray-400 flex justify-between">
              <span>{触发.触发源}</span>
              <span className={触发.情绪变化 > 0 ? 'text-green-400' : 'text-red-400'}>
                {触发.情绪变化 > 0 ? '+' : ''}{触发.情绪变化}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
