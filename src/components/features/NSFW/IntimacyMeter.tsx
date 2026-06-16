/**
 * 亲密度计量器
 * 11级亲密度阶段，带渐变色
 */

import type { 亲密度阶段 } from '../../../hooks/useNSFWState';

interface IntimacyMeterProps {
  stage: 亲密度阶段;
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

const 阶段颜色: Record<亲密度阶段, string> = {
  '陌生人': 'from-gray-500 to-gray-600',
  '初识': 'from-gray-400 to-slate-500',
  '泛泛之交': 'from-blue-400 to-blue-500',
  '朋友': 'from-green-400 to-emerald-500',
  '暧昧': 'from-pink-400 to-rose-400',
  '恋人': 'from-rose-500 to-pink-600',
  '亲密': 'from-purple-500 to-pink-500',
  '挚爱': 'from-amber-500 to-orange-500',
  '灵魂伴侣': 'from-yellow-400 to-amber-500',
  '血脉相连': 'from-red-500 to-rose-600',
  '极致羁绊': 'from-rose-600 to-red-700',
};

const 尺寸映射 = { sm: 'h-1.5 text-xs', md: 'h-2.5 text-sm', lg: 'h-4 text-base' };

export function IntimacyMeter({ stage, value = 0, max = 100, size = 'md' }: IntimacyMeterProps) {
  const pct = Math.min(100, (value / max) * 100);
  const color = 阶段颜色[stage] ?? 'from-gray-500 to-gray-600';
  const sizeClass = 尺寸映射[size];

  return (
    <div className={sizeClass.split(' ')[1]}>
      <div className="flex justify-between mb-1">
        <span className="text-gray-300">亲密度</span>
        <span className="text-gray-400">{stage}</span>
      </div>
      <div className={`w-full bg-gray-700 rounded-full ${sizeClass.split(' ')[0]} overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
