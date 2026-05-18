// 桌面端露出仪表盘 — 展示露出 NSFW 独立系统状态概览

import React, { useMemo } from 'react';
import type { 露出状态, 紧张度状态, 网络流言状态, 旁观者, 名誉状态, 露出后果记录, 紧张度阶段, 露出成就, 露出记忆统计 } from '../../models/exposureNSFW';
import type { 露出个性系数 } from '../../models/npcNSFWEnhancement';

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

// ==================== 名誉卡片 ====================

interface ReputationCardProps {
  名誉: 名誉状态;
}

const ReputationCard: React.FC<ReputationCardProps> = ({ 名誉 }) => {
  const 风评色 = 风评颜色[名誉.风评] ?? 'text-gray-400';
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-3">
      <div className="text-gray-400 text-xs font-semibold mb-1">名誉状态</div>
      <ProgressBar label="公开名誉" value={Math.round(名誉.公开名誉)} color="bg-blue-500" />
      <ProgressBar label="私密名誉" value={Math.round(名誉.私密名誉)} color="bg-purple-500" />
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">风评:</span>
        <span className={`font-semibold ${风评色}`}>{名誉.风评}</span>
      </div>
      {名誉.标签.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {名誉.标签.map((t, i) => (
            <span key={i} className="text-xs bg-red-400/10 border border-red-400/20 text-red-300 px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== 后果时间线 ====================

interface ConsequenceTimelineProps {
  后果: 露出后果记录[];
}

const 严重等级颜色: Record<string, string> = {
  '轻微': 'text-yellow-400',
  '中等': 'text-orange-400',
  '严重': 'text-red-400',
  '毁灭': 'text-red-600',
};

const ConsequenceTimeline: React.FC<ConsequenceTimelineProps> = ({ 后果 }) => {
  const 活跃后果 = 后果.filter(c => !c.已解决);
  if (活跃后果.length === 0) return null;

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-2">
      <div className="text-gray-400 text-xs font-semibold mb-2">活跃后果</div>
      {活跃后果.map(c => (
        <div key={c.id} className="flex items-center justify-between text-xs bg-black/30 px-3 py-2 rounded">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${严重等级颜色[c.严重等级]}`}>[{c.严重等级}]</span>
            <span className="text-gray-300">{c.描述}</span>
          </div>
          <span className="text-gray-500 font-mono">剩余 {c.剩余回合} 回合</span>
        </div>
      ))}
    </div>
  );
};

// ==================== 紧张度阶段指示器 ====================

const TensionStageBadge: React.FC<{ 紧张度: number; 阶段: 紧张度阶段 }> = ({ 紧张度, 阶段 }) => {
  const 配置 = 紧张度阶段配置[阶段];
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs ${配置.背景} ${配置.颜色}`}>
      <span>{配置.标签}</span>
      <span className="font-mono">{紧张度}/100</span>
    </div>
  );
};

// ==================== 个性分析面板 ====================

interface PersonalityPanelProps {
  个性系数: 露出个性系数;
}

const PersonalityPanel: React.FC<PersonalityPanelProps> = ({ 个性系数 }) => {
  const 条目: { 名称: string; 值: number; 颜色: string }[] = [
    { 名称: '冒险倾向', 值: 个性系数.冒险倾向, 颜色: 'bg-red-500' },
    { 名称: '羞耻敏感', 值: 个性系数.羞耻敏感度, 颜色: 'bg-blue-500' },
    { 名称: '刺激渴望', 值: 个性系数.刺激渴望, 颜色: 'bg-purple-500' },
    { 名称: '从众压力', 值: 个性系数.从众压力, 颜色: 'bg-yellow-500' },
    { 名称: '关系信赖', 值: 个性系数.关系信赖, 颜色: 'bg-green-500' },
  ];
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-2">
      <div className="text-gray-400 text-xs font-semibold mb-2">个性分析</div>
      {条目.map(t => (
        <div key={t.名称} className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 w-16 shrink-0">{t.名称}</span>
          <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${t.颜色}`} style={{ width: `${t.值}%` }} />
          </div>
          <span className="text-gray-400 font-mono w-8 text-right">{t.值}</span>
        </div>
      ))}
    </div>
  );
};

// ==================== 成就展示 ====================

interface AchievementDisplayProps {
  成就: 露出成就[];
}

const AchievementDisplay: React.FC<AchievementDisplayProps> = ({ 成就 }) => {
  const [showAll, setShowAll] = React.useState(false);
  const 已达成 = 成就.filter(a => a.已达成);
  const 显示列表 = showAll ? 成就 : 已达成;

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-gray-400 text-xs font-semibold">成就 ({已达成.length}/{成就.length})</div>
        <button onClick={() => setShowAll(!showAll)} className="text-xs text-wuxia-gold hover:underline">
          {showAll ? '仅看已达成' : '查看全部'}
        </button>
      </div>
      {显示列表.length === 0 && <div className="text-gray-600 text-xs text-center py-2">暂无成就</div>}
      <div className="grid grid-cols-2 gap-1.5">
        {显示列表.map(a => (
          <div key={a.id} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${a.已达成 ? 'bg-wuxia-gold/10 text-wuxia-gold' : 'bg-black/20 text-gray-600'}`}>
            <span>{a.图标}</span>
            <span className="truncate" title={a.描述}>{a.名称}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== 记忆统计 ====================

interface MemoryStatsProps {
  统计: 露出记忆统计;
}

const MemoryStats: React.FC<MemoryStatsProps> = ({ 统计 }) => {
  if (统计.总次数 === 0) return null;
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-2">
      <div className="text-gray-400 text-xs font-semibold mb-2">露出记忆</div>
      <div className="grid grid-cols-3 gap-2 text-xs">
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
      {统计.最难忘记忆 && (
        <div className="text-xs text-gray-500 mt-1">
          最难忘: {统计.最难忘记忆.摘要}
        </div>
      )}
    </div>
  );
};

// ==================== 档案数据接口 ====================

interface 露出档案数据 {
  npcId: string;
  npcName: string;
  露出状态?: 露出状态;
  紧张度状态?: 紧张度状态;
  网络流言?: 网络流言状态;
  名誉?: 名誉状态;
  活跃后果?: 露出后果记录[];
  个性系数?: 露出个性系数;
  /** 由外部计算的当前紧张度阶段 */
  紧张度阶段?: 紧张度阶段;
}

interface ExposureProfileCardProps {
  数据: 露出档案数据;
}

const ExposureProfileCard: React.FC<ExposureProfileCardProps> = ({ 数据 }) => {
  const [expanded, setExpanded] = React.useState(false);
  const { npcName, 露出状态: exposure, 紧张度状态: tension, 网络流言: rumor, 名誉, 活跃后果, 个性系数, 紧张度阶段 } = 数据;

  const 等级颜色 = 露出等级颜色[exposure?.当前等级 ?? 0];
  const 等级描述 = 露出等级描述[exposure?.当前等级 ?? 0];
  const 当前紧张度 = tension?.当前值 ?? 0;

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
        <div className="flex gap-4 mt-1 text-xs text-gray-500 items-center flex-wrap">
          {紧张度阶段 && 当前紧张度 > 0 ? (
            <TensionStageBadge 紧张度={当前紧张度} 阶段={紧张度阶段} />
          ) : (
            <span>紧张度: {当前紧张度}</span>
          )}
          <span>流言: {网络流言描述[rumor?.当前等级 ?? 0]}</span>
          {exposure && <span>成功: {exposure.成功露出次数} / 失败: {exposure.暴露失败次数}</span>}
          {活跃后果 && 活跃后果.filter(c => !c.已解决).length > 0 && (
            <span className="text-red-400">后果: {活跃后果.filter(c => !c.已解决).length}</span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
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

          {/* 后果时间线 */}
          {活跃后果 && 活跃后果.length > 0 && (
            <ConsequenceTimeline 后果={活跃后果} />
          )}

          {/* 名誉卡片 */}
          {名誉 && <ReputationCard 名誉={名誉} />}

          {/* 个性分析 */}
          {个性系数 && <PersonalityPanel 个性系数={个性系数} />}

          {/* 无数据提示 */}
          {!exposure && !tension && (!rumor || rumor.当前等级 === 0) && (
            <div className="text-gray-600 text-xs text-center py-2">暂无露出活动记录</div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 旁观者记录卡片 ====================

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
    {w.关联NPCId && <span className="text-gray-600">NPC: {w.关联NPCId}</span>}
    {w.关系亲密度 !== undefined && (
      <span className="text-blue-400">亲密度: {w.关系亲密度}</span>
    )}
  </div>
);

// ==================== 主组件 ====================

interface ExposureDashboardProps {
  露出档案: Record<string, 露出档案数据>;
  旁观者记录: 旁观者[];
  /** 全局成就列表 */
  成就?: 露出成就[];
  /** 全局记忆统计 */
  记忆统计?: 露出记忆统计;
}

export const ExposureDashboard: React.FC<ExposureDashboardProps & { onClose?: () => void }> = ({ 露出档案, 旁观者记录, 成就, 记忆统计, onClose }) => {
  const 档案列表 = useMemo(() => Object.values(露出档案), [露出档案]);
  const 有数据的档案 = 档案列表.filter(
    d => (d.露出状态?.当前等级 ?? 0) > 0 || (d.紧张度状态?.当前值 ?? 0) > 0 || (d.网络流言?.当前等级 ?? 0) > 0
  );

  const 内容 = (
    <>
      {/* 头部 */}
      <div className="shrink-0 px-6 py-5 border-b border-wuxia-gold/20 flex items-center justify-between">
        <div>
          <h2 className="text-wuxia-gold font-serif font-bold text-xl tracking-[0.28em]">露出仪表盘</h2>
          <p className="text-xs text-gray-500 mt-1">{有数据的档案.length} / {档案列表.length} 活跃</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-300 hover:text-white hover:border-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
        <div className="space-y-4">
          {/* 全局统计区 */}
          {成就 && 成就.length > 0 && <AchievementDisplay 成就={成就} />}
          {记忆统计 && <MemoryStats 统计={记忆统计} />}

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
      </div>
    </>
  );

  if (档案列表.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-4xl max-h-[85vh] bg-[#0b0b0c]/95 border border-wuxia-gold/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="shrink-0 px-6 py-5 border-b border-wuxia-gold/20 flex items-center justify-between">
            <h2 className="text-wuxia-gold font-serif font-bold text-xl tracking-[0.28em]">露出仪表盘</h2>
            {onClose && (
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-300 hover:text-white hover:border-gray-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
            <div className="text-center py-16 text-gray-600">
              <p className="text-lg">暂无露出档案</p>
              <p className="text-sm mt-2">启用露出系统后，主要角色 NPC 将自动创建露出档案</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0b0b0c]/95 border border-wuxia-gold/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
        {内容}
      </div>
    </div>
  );
};

export default ExposureDashboard;
