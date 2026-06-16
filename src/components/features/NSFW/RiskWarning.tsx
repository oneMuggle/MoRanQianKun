/**
 * 风险警告面板
 * 展示暴露风险、流言等级、后果数量、待执行联动
 */

import type { 已激活联动 } from '../../../models/npcNSFWEnhancement/linker/types';
import type { NSFW心理状态 } from '../../../models/npcNSFWEnhancement/consequences/types';

interface RiskWarningProps {
  暴露风险: number;
  流言等级: number;
  活跃后果数量: number;
  待执行联动: 已激活联动[];
  心理状态?: NSFW心理状态 | null;
}

const 流言颜色: Record<number, string> = {
  0: 'text-green-400',
  1: 'text-blue-400',
  2: 'text-yellow-400',
  3: 'text-orange-400',
  4: 'text-red-400',
  5: 'text-red-600',
};

const 流言文本: Record<number, string> = {
  0: '无流言',
  1: '耳语',
  2: '传闻',
  3: '流言蜚语',
  4: '满城风雨',
  5: '声名狼藉',
};

export function RiskWarning({ 暴露风险, 流言等级, 活跃后果数量, 待执行联动, 心理状态 }: RiskWarningProps) {
  const hasRisk = 暴露风险 > 20 || 流言等级 > 0 || 活跃后果数量 > 0 || 待执行联动.length > 0;
  if (!hasRisk) return null;

  return (
    <div className="space-y-2 text-sm">
      <div className="text-gray-400 font-medium">风险警告</div>

      {暴露风险 > 20 && (
        <div className={`flex items-center gap-2 ${暴露风险 >= 60 ? 'text-red-400' : 'text-yellow-400'}`}>
          <span>⚠</span>
          <span>暴露风险: {暴露风险}%</span>
        </div>
      )}

      {流言等级 > 0 && (
        <div className={`flex items-center gap-2 ${流言颜色[流言等级] ?? 'text-gray-400'}`}>
          <span>📢</span>
          <span>流言: {流言文本[流言等级] ?? `等级${流言等级}`}</span>
        </div>
      )}

      {活跃后果数量 > 0 && (
        <div className="flex items-center gap-2 text-orange-400">
          <span>⏳</span>
          <span>活跃后果: {活跃后果数量}</span>
        </div>
      )}

      {待执行联动.length > 0 && (
        <div className="flex items-center gap-2 text-purple-400">
          <span>🔗</span>
          <span>待执行联动: {待执行联动.length}</span>
        </div>
      )}

      {心理状态 && (心理状态.冒险倾向 > 50 || 心理状态.麻木度 > 50) && (
        <div className="flex items-center gap-2 text-amber-400">
          <span>🧠</span>
          <span>
            {心理状态.冒险倾向 > 50 ? '冒险倾向偏高' : ''}
            {心理状态.冒险倾向 > 50 && 心理状态.麻木度 > 50 ? ' | ' : ''}
            {心理状态.麻木度 > 50 ? '麻木度偏高' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
