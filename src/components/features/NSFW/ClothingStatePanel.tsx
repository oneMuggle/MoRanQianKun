/**
 * 服装状态可视化面板
 * 展示服装层次、损坏程度、污渍等信息
 */

import type { NPC结构 } from '../../../models/social';
import type { 服装层次结构 } from '../../../models/npcNSFWEnhancement/types';

interface ClothingStatePanelProps {
  npc: NPC结构;
  compact?: boolean;
}

const 损坏颜色: Record<string, string> = {
  '完好': 'text-green-400',
  '褶皱': 'text-yellow-400',
  '凌乱': 'text-orange-400',
  '破损': 'text-red-400',
  '撕裂': 'text-red-500',
  '移除': 'text-gray-500',
};

function 获取损坏进度(程度: string): number {
  const map: Record<string, number> = { '完好': 0, '褶皱': 20, '凌乱': 40, '破损': 70, '撕裂': 90, '移除': 100 };
  return map[程度] ?? 0;
}

export function ClothingStatePanel({ npc, compact }: ClothingStatePanelProps) {
  const 演化 = npc.完整演化状态;
  const 服装层次 = 演化?.服装层次 as 服装层次结构 | undefined;

  if (!服装层次?.层次.length) {
    return null;
  }

  return (
    <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="text-gray-400 font-medium mb-2">服装状态</div>
      {服装层次.层次.map((layer, i) => (
        <div key={i} className="flex items-center justify-between py-1 border-b border-gray-800">
          <span className="text-gray-300">{layer.名称}</span>
          <div className="flex items-center gap-2">
            {layer.污渍 && <span className="text-amber-400 text-xs" title="有污渍">●</span>}
            <span className={`${损坏颜色[layer.损坏程度] ?? 'text-gray-400'}`}>
              {layer.损坏程度}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
