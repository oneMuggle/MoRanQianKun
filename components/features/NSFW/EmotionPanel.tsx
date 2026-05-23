/**
 * 情绪面板组件 — 扩展版
 * 展示NPC当前情绪、复合情感维度、互动节奏、日常行为
 */

import type { 情感维度, 情感冲突条目, 互动节奏状态 } from '../../../models/npcNSFWEnhancement/types';
import type { 情绪状态, 心情阶段 } from '../../../models/npcNSFWEnhancement/emotionSystem';
import type { 日常行为状态 } from '../../../models/npcNSFWEnhancement/dailyPattern';

interface EmotionPanelProps {
  情绪?: 情绪状态;
  复合情感?: {
    情感维度: Record<情感维度, number>;
    主导情感: 情感维度;
    情感冲突: 情感冲突条目[];
  };
  节奏状态?: 互动节奏状态;
  日常行为?: 日常行为状态;
  size?: 'sm' | 'md';
}

const 心情阶段颜色: Record<心情阶段, { bg: string; text: string; icon: string }> = {
  '开心': { bg: 'bg-yellow-500', text: 'text-yellow-400', icon: '☀' },
  '平静': { bg: 'bg-blue-500', text: 'text-blue-400', icon: '≈' },
  '烦躁': { bg: 'bg-orange-500', text: 'text-orange-400', icon: '#' },
  '低落': { bg: 'bg-purple-500', text: 'text-purple-400', icon: '*' },
  '愤怒': { bg: 'bg-red-500', text: 'text-red-400', icon: '+' },
};

const 情感维度颜色: Record<情感维度, string> = {
  '爱慕': 'text-pink-400',
  '嫉妒': 'text-green-400',
  '不安': 'text-yellow-400',
  '兴奋': 'text-red-400',
  '内疚': 'text-blue-400',
};

const 情感维度背景: Record<情感维度, string> = {
  '爱慕': 'bg-pink-500',
  '嫉妒': 'bg-green-500',
  '不安': 'bg-yellow-500',
  '兴奋': 'bg-red-500',
  '内疚': 'bg-blue-500',
};

const 阶段颜色: Record<string, { bg: string; text: string }> = {
  '氛围营造': { bg: 'bg-purple-500', text: 'text-purple-400' },
  '身体接触': { bg: 'bg-pink-500', text: 'text-pink-400' },
  '深度前戏': { bg: 'bg-rose-500', text: 'text-rose-400' },
  '推进边缘': { bg: 'bg-red-500', text: 'text-red-400' },
  '核心互动': { bg: 'bg-orange-500', text: 'text-orange-400' },
};

export function EmotionPanel({ 情绪, 复合情感, 节奏状态, 日常行为, size = 'md' }: EmotionPanelProps) {
  const isSmall = size === 'sm';

  return (
    <div className={`space-y-3 ${isSmall ? 'text-xs' : 'text-sm'}`}>
      {/* === 基础心情 === */}
      {情绪 && (
        <div>
          <div className="text-gray-500 mb-1">基础心情</div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{心情阶段颜色[情绪.心情阶段]?.icon ?? '≈'}</span>
            <span className={`font-medium ${心情阶段颜色[情绪.心情阶段]?.text ?? 'text-blue-400'}`}>
              {情绪.心情阶段}
            </span>
            <span className="text-gray-500">({情绪.心情值}/100)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mt-1">
            <div
              className={`h-full ${心情阶段颜色[情绪.心情阶段]?.bg ?? 'bg-blue-500'} transition-all duration-500`}
              style={{ width: `${情绪.心情值}%` }}
            />
          </div>
        </div>
      )}

      {/* === 复合情感维度 === */}
      {复合情感 && !isSmall && (
        <div>
          <div className="text-gray-500 mb-1">复合情感</div>
          <div className="space-y-1">
            {(Object.keys(复合情感.情感维度) as 情感维度[]).map(维度 => {
              const 值 = 复合情感.情感维度[维度];
              const is主导 = 维度 === 复合情感.主导情感;
              return (
                <div key={维度} className="flex items-center gap-2">
                  <span className={`w-8 ${情感维度颜色[维度]} ${is主导 ? 'font-bold' : ''}`}>
                    {维度}
                  </span>
                  <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${情感维度背景[维度]} transition-all duration-500`}
                      style={{ width: `${值}%` }}
                    />
                  </div>
                  <span className="text-gray-500 w-8 text-right">{Math.round(值)}</span>
                </div>
              );
            })}
          </div>

          {/* 情感冲突 */}
          {复合情感.情感冲突.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-yellow-400 text-xs mb-1">情感冲突</div>
              {复合情感.情感冲突.map((冲突, i) => (
                <div key={i} className="text-xs text-gray-400">
                  {冲突.维度A} vs {冲突.维度B}（{冲突.冲突强度}%）→ {冲突.行为表现}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === 互动节奏 === */}
      {节奏状态 && (
        <div>
          <div className="text-gray-500 mb-1">互动节奏</div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${阶段颜色[节奏状态.当前阶段]?.text ?? 'text-gray-400'}`}>
              {节奏状态.当前阶段}
            </span>
            <span className="text-gray-500">（第{节奏状态.阶段持续时间 + 1}回合）</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mt-1">
            <div
              className={`h-full ${阶段颜色[节奏状态.当前阶段]?.bg ?? 'bg-gray-500'} transition-all duration-500`}
              style={{ width: `${节奏状态.阶段满意度}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>满意度: {节奏状态.阶段满意度}%</span>
            <span className={
              节奏状态.节奏评价 === '完美' ? 'text-green-400' :
              节奏状态.节奏评价 === '过快' ? 'text-red-400' :
              节奏状态.节奏评价 === '过慢' ? 'text-yellow-400' :
              'text-gray-400'
            }>
              {节奏状态.节奏评价}
            </span>
          </div>
        </div>
      )}

      {/* === 日常行为 === */}
      {日常行为 && 日常行为.今日行为.length > 0 && !isSmall && (
        <div>
          <div className="text-gray-500 mb-1">今日活动</div>
          {日常行为.今日行为.slice(-3).reverse().map((记录, i) => (
            <div key={i} className="text-xs text-gray-400 flex justify-between">
              <span>{记录.行为名称}</span>
              <span className={记录.完成度 > 70 ? 'text-green-400' : 记录.被打断 ? 'text-red-400' : 'text-yellow-400'}>
                {记录.完成度}%{记录.被打断 ? ' (打断)' : ''}
              </span>
            </div>
          ))}
          {日常行为.行为倾向 !== '正常' && (
            <div className="text-xs text-gray-500 mt-1">
              倾向: {日常行为.行为倾向}
            </div>
          )}
        </div>
      )}

      {/* === 情绪波动历史 === */}
      {情绪 && 情绪.情绪触发器.length > 0 && !isSmall && (
        <div className="pt-2 border-t border-gray-700">
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
