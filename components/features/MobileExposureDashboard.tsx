// 移动端露出仪表盘

import React, { useMemo } from 'react';
import type { 露出状态, 紧张度状态, 网络流言状态, 旁观者, 名誉状态, 露出后果记录, 紧张度阶段, 露出成就, 露出记忆统计 } from '../../models/exposureNSFW';
import type { 露出个性系数 } from '../../models/npcNSFWEnhancement';

const 露出等级颜色: Record<number, string> = {
  0: 'text-gray-400',
  1: 'text-blue-400',
  2: 'text-cyan-400',
  3: 'text-pink-400',
  4: 'text-red-400',
  5: 'text-purple-400',
};

const 露出等级描述: Record<number, string> = {
  0: '无露出倾向',
  1: '半私密场所',
  2: '半公共场所',
  3: '走廊角落',
  4: '公共场所',
  5: '公开活动',
};

const 网络流言描述: Record<number, string> = {
  0: '无流言',
  1: '匿名论坛',
  2: '群组传播',
  3: '截图流传',
  4: '社媒扩散',
};

const 紧张度阶段配置: Record<紧张度阶段, { 颜色: string; 背景: string; 标签: string }> = {
  '安全': { 颜色: 'text-green-400', 背景: 'bg-green-400/10 border-green-400/30', 标签: '安全' },
  '微险': { 颜色: 'text-yellow-400', 背景: 'bg-yellow-400/10 border-yellow-400/30', 标签: '微险' },
  '危险': { 颜色: 'text-orange-400', 背景: 'bg-orange-400/10 border-orange-400/30', 标签: '危险' },
  '极限': { 颜色: 'text-red-400', 背景: 'bg-red-400/10 border-red-400/30', 标签: '极限' },
  '崩溃': { 颜色: 'text-red-600', 背景: 'bg-red-600/10 border-red-600/30', 标签: '崩溃' },
};

const 风评颜色: Record<string, string> = {
  '清白之身': 'text-green-400',
  '名声尚可': 'text-blue-400',
  '略有风评': 'text-yellow-400',
  '名声不佳': 'text-orange-400',
  '声名狼藉': 'text-red-400',
  '社会性死亡': 'text-red-600',
};

const 严重等级颜色: Record<string, string> = {
  '轻微': 'text-yellow-400',
  '中等': 'text-orange-400',
  '严重': 'text-red-400',
  '毁灭': 'text-red-600',
};

interface 露出档案数据 {
  npcId: string;
  npcName: string;
  露出状态?: 露出状态;
  紧张度状态?: 紧张度状态;
  网络流言?: 网络流言状态;
  名誉?: 名誉状态;
  活跃后果?: 露出后果记录[];
  个性系数?: 露出个性系数;
  紧张度阶段?: 紧张度阶段;
}

interface MobileExposureDashboardProps {
  露出档案: Record<string, 露出档案数据>;
  旁观者记录: 旁观者[];
  /** 全局成就列表 */
  成就?: 露出成就[];
  /** 全局记忆统计 */
  记忆统计?: 露出记忆统计;
  onClose?: () => void;
}

// ==================== 名誉卡片 ====================

const ReputationCard: React.FC<{ 名誉: 名誉状态 }> = ({ 名誉 }) => {
  const 风评色 = 风评颜色[名誉.风评] ?? 'text-gray-400';
  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2">
      <div className="text-gray-400 text-xs font-semibold">名誉</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 w-12">公开</span>
          <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round(名誉.公开名誉)}%` }} />
          </div>
          <span className="text-gray-400 font-mono">{Math.round(名誉.公开名誉)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 w-12">私密</span>
          <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.round(名誉.私密名誉)}%` }} />
          </div>
          <span className="text-gray-400 font-mono">{Math.round(名誉.私密名誉)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">风评:</span>
        <span className={`font-semibold ${风评色}`}>{名誉.风评}</span>
      </div>
      {名誉.标签.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {名誉.标签.map((t, i) => (
            <span key={i} className="text-xs bg-red-400/10 text-red-300 px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== 成就展示 ====================

const AchievementDisplay: React.FC<{ 成就: 露出成就[] }> = ({ 成就 }) => {
  const 已达成 = 成就.filter(a => a.已达成);
  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
      <div className="text-gray-400 text-xs font-semibold mb-2">成就 ({已达成.length}/{成就.length})</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {成就.map(a => (
          <div key={a.id} className={`flex flex-col items-center gap-0.5 shrink-0 text-center px-2 py-1 rounded ${a.已达成 ? 'bg-wuxia-gold/10 text-wuxia-gold' : 'bg-black/20 text-gray-600'}`}>
            <span className="text-lg">{a.图标}</span>
            <span className="text-xs truncate max-w-[60px]" title={a.名称}>{a.名称}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== 记忆统计 ====================

const MemoryStats: React.FC<{ 统计: 露出记忆统计 }> = ({ 统计 }) => {
  if (统计.总次数 === 0) return null;
  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
      <div className="text-gray-400 text-xs font-semibold mb-2">露出记忆</div>
      <div className="flex justify-around text-xs">
        <div className="text-center">
          <div className="text-gray-500">总次数</div>
          <div className="text-white font-mono text-lg">{统计.总次数}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">成功</div>
          <div className="text-green-400 font-mono text-lg">{统计.成功次数}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">失败</div>
          <div className="text-red-400 font-mono text-lg">{统计.失败次数}</div>
        </div>
      </div>
    </div>
  );
};

// ==================== 主组件 ====================

export const MobileExposureDashboard: React.FC<MobileExposureDashboardProps> = ({ 露出档案, 旁观者记录, 成就, 记忆统计, onClose }) => {
  const 档案列表 = useMemo(() => Object.values(露出档案), [露出档案]);

  if (档案列表.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-lg max-h-[85vh] bg-[#0b0b0c]/95 border border-wuxia-gold/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="shrink-0 px-4 py-4 border-b border-wuxia-gold/20 flex items-center justify-between">
            <h2 className="text-wuxia-gold font-serif font-bold text-lg tracking-[0.2em]">露出仪表盘</h2>
            {onClose && (
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-gray-600">暂无露出档案</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg max-h-[85vh] bg-[#0b0b0c]/95 border border-wuxia-gold/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
        <div className="shrink-0 px-4 py-4 border-b border-wuxia-gold/20 flex items-center justify-between">
          <h2 className="text-wuxia-gold font-serif font-bold text-lg tracking-[0.2em]">露出仪表盘</h2>
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {/* 全局统计 */}
          {成就 && 成就.length > 0 && <AchievementDisplay 成就={成就} />}
          {记忆统计 && <MemoryStats 统计={记忆统计} />}

          {/* NPC 档案卡片 */}
          {档案列表.map(d => {
            const exposure = d.露出状态;
            const tension = d.紧张度状态;
            const rumor = d.网络流言;
            const 当前紧张度 = tension?.当前值 ?? 0;
            const 活跃后果 = d.活跃后果?.filter(c => !c.已解决) ?? [];
            return (
              <div key={d.npcId} className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-2">
                {/* 头部 */}
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">{d.npcName}</span>
                  <span className={`text-xs font-mono ${露出等级颜色[exposure?.当前等级 ?? 0]}`}>
                    Lv.{exposure?.当前等级 ?? 0}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  露出: {露出等级描述[exposure?.当前等级 ?? 0]} | 进度: {exposure?.等级进度 ?? 0}%
                </div>

                {/* 紧张度阶段 */}
                {d.紧张度阶段 && 当前紧张度 > 0 && (
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs ${紧张度阶段配置[d.紧张度阶段].背景} ${紧张度阶段配置[d.紧张度阶段].颜色}`}>
                    <span>{紧张度阶段配置[d.紧张度阶段].标签}</span>
                    <span className="font-mono">{当前紧张度}</span>
                  </div>
                )}

                {/* 流言 */}
                {rumor && rumor.当前等级 > 0 && (
                  <div className="text-xs text-gray-400">
                    流言: {网络流言描述[rumor.当前等级]}
                  </div>
                )}

                {/* 活跃后果 */}
                {活跃后果.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-gray-500 text-xs font-semibold">后果</div>
                    {活跃后果.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-xs bg-black/20 px-2 py-1 rounded">
                        <span className={`${严重等级颜色[c.严重等级]}`}>{c.描述}</span>
                        <span className="text-gray-500 font-mono">{c.剩余回合}回合</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 名誉 */}
                {d.名誉 && <ReputationCard 名誉={d.名誉} />}
              </div>
            );
          })}

          {/* 旁观者 */}
          {旁观者记录.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-2">旁观者</h3>
              <div className="space-y-1">
                {旁观者记录.map((w, i) => (
                  <div key={w.id || i} className="flex items-center gap-2 text-xs bg-black/30 px-3 py-1.5 rounded">
                    <span className="text-white">{w.类型}</span>
                    <span className={w.已察觉 ? 'text-red-400' : 'text-green-400'}>
                      {w.已察觉 ? '已察觉' : '未察觉'}
                    </span>
                    {w.关系亲密度 !== undefined && (
                      <span className="text-blue-400">亲密度:{w.关系亲密度}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileExposureDashboard;
