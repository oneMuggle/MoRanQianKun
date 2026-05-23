/**
 * 情感羁绊树组件
 * 可视化展示羁绊里程碑、结局倾向
 */

import type { 情感羁绊树, 关系结局 } from '../../../models/npcNSFWEnhancement/bondTree';
import { 预定义里程碑 } from '../../../models/npcNSFWEnhancement/bondTree';

interface BondTreeProps {
  羁绊树: 情感羁绊树;
  size?: 'sm' | 'md';
}

const 结局颜色: Record<关系结局, string> = {
  '恋人': 'text-pink-400',
  '炮友': 'text-purple-400',
  '主从': 'text-amber-400',
  '陌路': 'text-gray-400',
  '知己': 'text-blue-400',
  '挚友': 'text-green-400',
};

const 稀有度颜色: Record<string, string> = {
  '普通': 'text-gray-400',
  '稀有': 'text-blue-400',
  '史诗': 'text-purple-400',
  '传说': 'text-amber-400',
};

export function BondTree({ 羁绊树, size = 'md' }: BondTreeProps) {
  const isSmall = size === 'sm';

  const 主导结局 = Object.entries(羁绊树.结局倾向)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as 关系结局 | undefined;

  return (
    <div className={`space-y-3 ${isSmall ? 'text-xs' : 'text-sm'}`}>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-300">羁绊值</span>
          <span className="text-pink-400">{羁绊树.羁绊值}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
            style={{ width: `${羁绊树.羁绊值}%` }}
          />
        </div>
      </div>

      {!isSmall && (
        <div>
          <div className="text-gray-500 mb-1">关系走向</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(羁绊树.结局倾向).map(([结局, 值]) => (
              <div
                key={结局}
                className={`px-2 py-0.5 rounded text-xs ${
                  结局 === 主导结局
                    ? 'bg-pink-500/20 border border-pink-500/50'
                    : 'bg-gray-700/50'
                } ${结局颜色[结局 as 关系结局]}`}
              >
                {结局}: {Math.round(值)}
              </div>
            ))}
          </div>
        </div>
      )}

      {羁绊树.已达成里程碑.length > 0 && (
        <div>
          <div className="text-gray-500 mb-1">已达成里程碑 ({羁绊树.已达成里程碑.length})</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {羁绊树.已达成里程碑.map(m => {
              const 定义 = 预定义里程碑[m.里程碑Id];
              if (!定义) return null;
              return (
                <div key={m.里程碑Id} className="flex items-center gap-2 text-xs">
                  <span className={稀有度颜色[定义.稀有度]}>
                    [{定义.稀有度}]
                  </span>
                  <span className="text-gray-300">{定义.名称}</span>
                  {m.备注 && (
                    <span className="text-gray-500 italic">- {m.备注}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
