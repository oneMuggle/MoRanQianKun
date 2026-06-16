import React, { useState } from 'react';
import type { 人物关系边 } from '../../../models/relationship';
import { 关系分类颜色, 关系谱阶段顺序 } from '../../../models/relationship';
import RelationshipTimeline from './RelationshipTimeline';

interface Props {
  关系边: 人物关系边;
  关联关系边?: 人物关系边[];
}

const 维度条: React.FC<{ 标签: string; 值: number; 颜色: string }> = ({ 标签, 值, 颜色 }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-gray-400 w-8 shrink-0">{标签}</span>
    <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, 值))}%`, backgroundColor: 颜色 }}
      />
    </div>
    <span className="text-[10px] font-mono text-gray-300 w-8 text-right">{值}</span>
  </div>
);

const RelationshipDetailPanel: React.FC<Props> = ({ 关系边, 关联关系边 = [] }) => {
  const [展开时间线, set展开时间线] = useState(false);

  const 分类 = 关系边.关系分类;
  const 阶段 = 关系边.关系阶段;
  const 分类色 = 关系分类颜色[分类];
  const 阶段索引 = 关系谱阶段顺序.indexOf(阶段);
  const 阶段进度 = ((阶段索引 + 1) / 关系谱阶段顺序.length) * 100;

  // 找出与该客体相关的其他关系边
  const 其他关系 = 关联关系边.filter(
    b =>
      b.id !== 关系边.id &&
      (b.主体姓名 === 关系边.客体姓名 || b.客体姓名 === 关系边.客体姓名),
  );

  return (
    <div className="space-y-4">
      {/* 头部：角色名 + 徽章 */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-serif font-bold text-wuxia-gold tracking-wider">
            {关系边.客体姓名}
          </h3>
          {关系边.关系描述 && (
            <p className="text-xs text-gray-400 font-serif italic mt-1">"{关系边.关系描述}"</p>
          )}
        </div>
        <div className="flex gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border font-mono tracking-wider"
            style={{
              backgroundColor: `${分类色}20`,
              color: 分类色,
              borderColor: `${分类色}40`,
            }}
          >
            {分类}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border border-wuxia-gold/30 text-wuxia-gold/80 font-mono tracking-wider"
          >
            {阶段}
          </span>
        </div>
      </div>

      {/* 关系谱阶段进度条 */}
      <div>
        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">关系谱进度</div>
        <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-wuxia-gold/60 to-wuxia-gold transition-all duration-500"
            style={{ width: `${阶段进度}%` }}
          />
        </div>
      </div>

      {/* 四维指标 */}
      <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-2">
        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">关系指标</div>
        <维度条 标签="好感度" 值={关系边.好感度} 颜色="#E74C3C" />
        <维度条 标签="亲密度" 值={关系边.亲密度} 颜色="#FFB6C1" />
        <维度条 标签="信任度" 值={关系边.信任度} 颜色="#4A90D9" />
        <维度条 标签="感情值" 值={关系边.感情值} 颜色="#F5A623" />
      </div>

      {/* 互动统计 */}
      <div className="flex gap-3 text-xs font-mono text-gray-400">
        <span>互动 {关系边.互动次数} 次</span>
        {关系边.最近互动时间 && <span>最近：{关系边.最近互动时间}</span>}
      </div>

      {/* TA与其他人的关系 */}
      {其他关系.length > 0 && (
        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">
            {关系边.客体姓名}与他人的关系
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
            {其他关系.map(b => {
              const 对方姓名 = b.主体姓名 === 关系边.客体姓名 ? b.客体姓名 : b.主体姓名;
              const 对方颜色 = 关系分类颜色[b.关系分类];
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5"
                >
                  <span className="text-xs text-gray-300 font-serif">{对方姓名}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded border font-mono"
                    style={{
                      backgroundColor: `${对方颜色}15`,
                      color: 对方颜色,
                      borderColor: `${对方颜色}30`,
                    }}
                  >
                    {b.关系分类} · {b.关系阶段}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 关系时间线 */}
      <div>
        <button
          onClick={() => set展开时间线(!展开时间线)}
          className="w-full flex items-center justify-between text-[9px] text-gray-500 uppercase tracking-widest hover:text-wuxia-gold/70 transition-colors"
        >
          <span>关系时间线 ({关系边.事件记录.length} 条)</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-3 h-3 transition-transform duration-300 ${展开时间线 ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {展开时间线 && (
          <div className="mt-3">
            <RelationshipTimeline 事件列表={关系边.事件记录} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipDetailPanel;
