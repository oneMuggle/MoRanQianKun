/**
 * 移动端 NSFW 聚合面板
 * 整合所有 NSFW 组件，支持折叠/展开
 */

import { useState } from 'react';
import type { NPC结构 } from '../../../models/social';
import type { NSFWVisualState } from '../../../hooks/useNSFWState';
import type { 跨模块联动状态, 已激活联动 } from '../../../models/npcNSFWEnhancement/linker/types';
import type { NSFW心理状态 } from '../../../models/npcNSFWEnhancement/consequences/types';
import { NSFWStatusBar } from './NSFWStatusBar';
import { ClothingStatePanel } from './ClothingStatePanel';
import { IntimacyMeter } from './IntimacyMeter';
import { RiskWarning } from './RiskWarning';

interface MobileNSFWPanelProps {
  npc: NPC结构 | null;
  visualState: NSFWVisualState;
  跨模块状态?: 跨模块联动状态;
  待执行联动?: 已激活联动[];
  暴露风险?: number;
  流言等级?: number;
  活跃后果数量?: number;
  心理状态?: NSFW心理状态 | null;
}

export function MobileNSFWPanel({
  npc,
  visualState,
  待执行联动 = [],
  暴露风险 = 0,
  流言等级 = 0,
  活跃后果数量 = 0,
  心理状态,
}: MobileNSFWPanelProps) {
  const [collapsed, setCollapsed] = useState(true);

  if (!npc) return null;

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3 space-y-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between text-gray-300 text-sm font-medium"
      >
        <span>NSFW 状态</span>
        <span className="text-gray-500">{collapsed ? '▼' : '▲'}</span>
      </button>

      {!collapsed && (
        <>
          {/* 亲密度 */}
          <IntimacyMeter
            stage={visualState.亲密度阶段}
            value={visualState.bars.find(b => b.label === '亲密度')?.value ?? 0}
            size="sm"
          />

          {/* 状态条 */}
          {visualState.bars.length > 1 && (
            <NSFWStatusBar bars={visualState.bars.filter(b => b.label !== '亲密度')} compact />
          )}

          {/* 服装状态 */}
          {visualState.服装状态文本 && (
            <div className="text-xs text-yellow-400">
              {visualState.服装状态文本}
            </div>
          )}
          <ClothingStatePanel npc={npc} compact />

          {/* 孕产阶段 */}
          {visualState.孕产阶段文本 && (
            <div className="text-xs text-pink-400">
              孕产: {visualState.孕产阶段文本}
            </div>
          )}

          {/* 心理状态摘要 */}
          {visualState.心理状态摘要 && (
            <div className="text-xs text-purple-400">
              心理: {visualState.心理状态摘要}
            </div>
          )}

          {/* 事后情绪 */}
          {visualState.事后情绪摘要 && (
            <div className="text-xs text-blue-400">
              事后: {visualState.事后情绪摘要}
            </div>
          )}

          {/* 风险等级 */}
          <div className={`text-xs ${visualState.风险等级.color}`}>
            风险: {visualState.风险等级.text}
          </div>

          {/* 风险警告详情 */}
          <RiskWarning
            暴露风险={暴露风险}
            流言等级={流言等级}
            活跃后果数量={活跃后果数量}
            待执行联动={待执行联动}
            心理状态={心理状态}
          />
        </>
      )}
    </div>
  );
}
