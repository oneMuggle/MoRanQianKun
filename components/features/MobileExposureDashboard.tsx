// 移动端露出仪表盘

import React, { useMemo } from 'react';
import type { 露出状态, 紧张度状态, 网络流言状态, 旁观者 } from '../../models/exposureNSFW';

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

interface 露出档案数据 {
  npcId: string;
  npcName: string;
  露出状态?: 露出状态;
  紧张度状态?: 紧张度状态;
  网络流言?: 网络流言状态;
}

interface MobileExposureDashboardProps {
  露出档案: Record<string, 露出档案数据>;
  旁观者记录: 旁观者[];
  onClose?: () => void;
}

export const MobileExposureDashboard: React.FC<MobileExposureDashboardProps> = ({ 露出档案, 旁观者记录, onClose }) => {
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
          {/* NPC 档案卡片 */}
          {档案列表.map(d => {
            const exposure = d.露出状态;
            const tension = d.紧张度状态;
            const rumor = d.网络流言;
            return (
              <div key={d.npcId} className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">{d.npcName}</span>
                  <span className={`text-xs font-mono ${露出等级颜色[exposure?.当前等级 ?? 0]}`}>
                    Lv.{exposure?.当前等级 ?? 0}
                  </span>
                </div>
                {exposure && (
                  <div className="text-xs text-gray-400">
                    露出: {露出等级描述[exposure.当前等级]} | 进度: {exposure.等级进度}%
                  </div>
                )}
                {tension && tension.当前值 > 0 && (
                  <div className="text-xs text-gray-400">
                    紧张度: {tension.当前值}/100
                  </div>
                )}
                {rumor && rumor.当前等级 > 0 && (
                  <div className="text-xs text-gray-400">
                    流言: {网络流言描述[rumor.当前等级]}
                  </div>
                )}
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
