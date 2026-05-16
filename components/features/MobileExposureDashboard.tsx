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
}

export const MobileExposureDashboard: React.FC<MobileExposureDashboardProps> = ({ 露出档案, 旁观者记录 }) => {
  const 档案列表 = useMemo(() => Object.values(露出档案), [露出档案]);

  if (档案列表.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p>暂无露出档案</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-base font-bold text-white">露出仪表盘</h2>

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
  );
};

export default MobileExposureDashboard;
