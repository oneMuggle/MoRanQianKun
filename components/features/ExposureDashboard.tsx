// 桌面端露出仪表盘 — 展示露出 NSFW 独立系统状态概览

import React, { useMemo } from 'react';
import type { 露出状态, 紧张度状态, 网络流言状态, 旁观者 } from '../../models/exposureNSFW';

// ==================== 常量 ====================

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

const 网络流言颜色: Record<number, string> = {
  0: 'text-gray-400',
  1: 'text-yellow-400',
  2: 'text-orange-400',
  3: 'text-red-400',
  4: 'text-red-700',
};

const 网络流言描述: Record<number, string> = {
  0: '无流言',
  1: '匿名论坛讨论',
  2: '群组中传播',
  3: '截图流传',
  4: '社交媒体扩散',
};

const 辟谣状态颜色: Record<string, string> = {
  '未辟谣': 'text-red-400',
  '正在辟谣': 'text-yellow-400',
  '已辟谣': 'text-green-400',
};

// ==================== 子组件 ====================

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, max = 100, color = 'bg-wuxia-gold', showValue = true }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 shrink-0 w-16">{label}</span>
      <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && <span className="text-gray-400 font-mono w-8 text-right">{value}</span>}
    </div>
  );
};

interface 露出档案数据 {
  npcId: string;
  npcName: string;
  露出状态?: 露出状态;
  紧张度状态?: 紧张度状态;
  网络流言?: 网络流言状态;
}

interface ExposureProfileCardProps {
  数据: 露出档案数据;
}

const ExposureProfileCard: React.FC<ExposureProfileCardProps> = ({ 数据 }) => {
  const [expanded, setExpanded] = React.useState(false);
  const { npcName, 露出状态: exposure, 紧张度状态: tension, 网络流言: rumor } = 数据;

  const 等级颜色 = 露出等级颜色[exposure?.当前等级 ?? 0];
  const 等级描述 = 露出等级描述[exposure?.当前等级 ?? 0];

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold">{npcName}</span>
            <span className={`text-xs font-mono ${等级颜色}`}>
              露出 Lv.{exposure?.当前等级 ?? 0} — {等级描述}
            </span>
          </div>
          <span className="text-gray-500 text-xs">{expanded ? '▼' : '▶'}</span>
        </div>
        <div className="flex gap-4 mt-1 text-xs text-gray-500">
          <span>紧张度: {tension?.当前值 ?? 0}</span>
          <span>流言: {网络流言描述[rumor?.当前等级 ?? 0]}</span>
          {exposure && <span>成功: {exposure.成功露出次数} / 失败: {exposure.暴露失败次数}</span>}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
          {/* 露出状态 */}
          {exposure && (
            <div>
              <div className="text-gray-400 text-xs mb-2 font-semibold">露出状态</div>
              <ProgressBar label="等级进度" value={exposure.等级进度} color="bg-pink-500" />
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>成功次数: {exposure.成功露出次数}</span>
                <span>失败次数: {exposure.暴露失败次数}</span>
                <span>最大紧张度: {exposure.最大紧张度记录}</span>
              </div>
            </div>
          )}

          {/* 紧张度状态 */}
          {tension && tension.当前值 > 0 && (
            <div>
              <div className="text-gray-400 text-xs mb-2 font-semibold">紧张度</div>
              <ProgressBar
                label="当前值"
                value={tension.当前值}
                color={tension.当前值 > 85 ? 'bg-red-500' : tension.当前值 > 60 ? 'bg-orange-500' : 'bg-yellow-500'}
              />
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>周围人数: {tension.周围人数}</span>
                <span>互动强度: {tension.互动强度系数.toFixed(1)}</span>
                <span>周围状态: {tension.周围人状态}</span>
              </div>
            </div>
          )}

          {/* 网络流言 */}
          {rumor && rumor.当前等级 > 0 && (
            <div>
              <div className="text-gray-400 text-xs mb-2 font-semibold">网络流言</div>
              <div className={`text-xs ${网络流言颜色[rumor.当前等级]}`}>
                等级 {rumor.当前等级}/4 — {网络流言描述[rumor.当前等级]}
              </div>
              {rumor.传播渠道.length > 0 && (
                <div className="flex gap-2 mt-1 flex-wrap">
                  {rumor.传播渠道.map((渠道, i) => (
                    <span key={i} className="text-xs bg-white/5 px-2 py-0.5 rounded text-gray-400">{渠道}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>有证据: {rumor.有无证据 ? '是' : '否'}</span>
                <span className={辟谣状态颜色[rumor.辟谣状态]}>辟谣: {rumor.辟谣状态}</span>
              </div>
            </div>
          )}

          {/* 无数据提示 */}
          {!exposure && !tension && (!rumor || rumor.当前等级 === 0) && (
            <div className="text-gray-600 text-xs text-center py-2">暂无露出活动记录</div>
          )}
        </div>
      )}
    </div>
  );
};

interface 旁观者记录CardProps {
  旁观者: 旁观者;
}

const 旁观者记录Card: React.FC<旁观者记录CardProps> = ({ 旁观者: w }) => (
  <div className="flex items-center gap-3 text-xs bg-black/30 px-3 py-2 rounded">
    <span className="text-white">{w.类型}</span>
    <span className="text-gray-500">距离: {w.距离}</span>
    <span className={w.已察觉 ? 'text-red-400' : 'text-green-400'}>
      {w.已察觉 ? '已察觉' : '未察觉'}
    </span>
    {w.反应 && <span className="text-gray-400">反应: {w.反应}</span>}
  </div>
);

// ==================== 主组件 ====================

interface ExposureDashboardProps {
  露出档案: Record<string, 露出档案数据>;
  旁观者记录: 旁观者[];
}

export const ExposureDashboard: React.FC<ExposureDashboardProps> = ({ 露出档案, 旁观者记录 }) => {
  const 档案列表 = useMemo(() => Object.values(露出档案), [露出档案]);
  const 有数据的档案 = 档案列表.filter(
    d => (d.露出状态?.当前等级 ?? 0) > 0 || (d.紧张度状态?.当前值 ?? 0) > 0 || (d.网络流言?.当前等级 ?? 0) > 0
  );

  if (档案列表.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg">暂无露出档案</p>
        <p className="text-sm mt-2">启用露出系统后，主要角色 NPC 将自动创建露出档案</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">露出仪表盘</h2>
        <span className="text-xs text-gray-500">{有数据的档案.length} / {档案列表.length} 活跃</span>
      </div>

      {/* 旁观者记录 */}
      {旁观者记录.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">旁观者记录</h3>
          <div className="space-y-1">
            {旁观者记录.map((w, i) => (
              <旁观者记录Card key={w.id || i} 旁观者={w} />
            ))}
          </div>
        </div>
      )}

      {/* NPC 露出档案 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">NPC 露出档案</h3>
        <div className="space-y-2">
          {档案列表.map(d => (
            <ExposureProfileCard key={d.npcId} 数据={d} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExposureDashboard;
