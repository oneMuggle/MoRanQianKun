import React from 'react';
import type { 关系事件记录 } from '../../../models/relationship';
import { 关系事件图标 } from '../../../models/relationship';

interface Props {
  事件列表: 关系事件记录[];
}

const RelationshipTimeline: React.FC<Props> = ({ 事件列表 }) => {
  if (事件列表.length === 0) {
    return (
      <div className="text-center text-xs text-gray-600 py-6 font-mono tracking-widest">
        暂无关系事件记录
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-1 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
      {事件列表.map((event) => (
        <div key={event.id} className="relative flex items-start group">
          <div className="flex items-center justify-center w-3 h-3 rounded-full border border-gray-600 bg-gray-800 shrink-0 z-10 group-hover:border-wuxia-gold/50 group-hover:bg-wuxia-gold/20 transition-colors">
            <span className="text-[8px]">{关系事件图标[event.事件类型]}</span>
          </div>
          <div className="w-[calc(100%-1.5rem)] ml-3 p-3 rounded-lg border border-white/5 bg-black/50 shadow-sm group-hover:border-wuxia-gold/20 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <div className="text-[9px] text-gray-500 font-mono tracking-wider">{event.时间}</div>
              <div className="text-[9px] text-wuxia-gold/70 font-mono bg-wuxia-gold/5 px-1.5 py-0.5 rounded border border-wuxia-gold/20">
                {关系事件图标[event.事件类型]} {event.事件类型}
              </div>
            </div>
            <div className="text-xs text-gray-200 font-serif font-bold mb-1">{event.标题}</div>
            <div className="text-xs text-gray-300 leading-relaxed font-serif">{event.描述}</div>
            {(event.好感度变化 || event.亲密度变化 || event.信任度变化 || event.感情值变化) && (
              <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[9px] font-mono">
                {event.好感度变化 && event.好感度变化 !== 0 && (
                  <span className={event.好感度变化 > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    好感度 {event.好感度变化 > 0 ? '+' : ''}{event.好感度变化}
                  </span>
                )}
                {event.亲密度变化 && event.亲密度变化 !== 0 && (
                  <span className={event.亲密度变化 > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    亲密度 {event.亲密度变化 > 0 ? '+' : ''}{event.亲密度变化}
                  </span>
                )}
                {event.信任度变化 && event.信任度变化 !== 0 && (
                  <span className={event.信任度变化 > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    信任度 {event.信任度变化 > 0 ? '+' : ''}{event.信任度变化}
                  </span>
                )}
                {event.感情值变化 && event.感情值变化 !== 0 && (
                  <span className={event.感情值变化 > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    感情值 {event.感情值变化 > 0 ? '+' : ''}{event.感情值变化}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelationshipTimeline;
