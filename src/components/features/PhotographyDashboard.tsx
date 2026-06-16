// 桌面端写真仪表盘 — 展示写真 NSFW 子系统状态概览

import React, { useMemo } from 'react';
import type { 模特核心状态, 摄影师核心状态, 拍摄项目状态, 泄露事件状态 } from '../../models/photographyNSFW';
import type { 拍摄尺度, 拍摄场所, 传播范围 } from '../../models/photographyNSFW';

// ==================== 常量 ====================

const 尺度颜色: Record<拍摄尺度, string> = {
  'G级': 'bg-green-400',
  'PG-13': 'bg-yellow-400',
  'R级': 'bg-orange-400',
  'NC-17': 'bg-red-400',
  'XXX': 'bg-purple-400',
};

const 场所风险颜色: Record<拍摄场所, string> = {
  '影棚': 'text-green-400',
  '外景': 'text-yellow-400',
  '酒店': 'text-orange-400',
  '民宿': 'text-orange-400',
  '个人住所': 'text-red-400',
  '更衣室': 'text-yellow-400',
  '野外': 'text-red-400',
};

const 泄露严重程度颜色: Record<传播范围, string> = {
  '未传播': 'text-green-400',
  '小范围': 'text-yellow-400',
  '论坛传播': 'text-orange-400',
  '社交媒体': 'text-orange-400',
  '图片网站': 'text-red-400',
  '成人网站': 'text-red-500',
  '全网扩散': 'text-purple-500',
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
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {showValue && <span className="text-gray-400 font-mono w-8 text-right">{value}</span>}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; count?: number }> = ({ title, count }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className="text-[10px] text-gray-600 uppercase tracking-widest">{title}</span>
    {count !== undefined && <span className="text-[10px] text-gray-700 font-mono">({count})</span>}
  </div>
);

// ==================== Model Card ====================

interface ModelCardProps {
  模特: 模特核心状态;
  相关项目: 拍摄项目状态[];
}

const ModelCard: React.FC<ModelCardProps> = ({ 模特, 相关项目 }) => {
  const [expanded, setExpanded] = React.useState(false);

  const 安全感颜色 = 模特.安全感 >= 70 ? 'bg-green-500' : 模特.安全感 >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  const 自我认同颜色 = 模特.自我认同 >= 70 ? 'bg-blue-500' : 模特.自我认同 >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  const 羞耻度颜色 = 模特.羞耻度 >= 70 ? 'bg-red-500' : 模特.羞耻度 >= 40 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-wuxia-gold/20 transition-colors">
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/60 border border-wuxia-gold/30 flex items-center justify-center text-lg font-serif text-wuxia-gold/60">
            {模特.姓名[0]}
          </div>
          <div className="text-left">
            <div className="font-serif text-wuxia-gold font-bold">{模特.姓名}</div>
            <div className="text-[11px] text-gray-500">{模特.类型} · {模特.职业状态}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] ${尺度颜色[模特.当前底线]}`}>底线: {模特.当前底线}</span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <ProgressBar label="安全感" value={模特.安全感} color={安全感颜色} />
          <ProgressBar label="自我认同" value={模特.自我认同} color={自我认同颜色} />
          <ProgressBar label="羞耻度" value={模特.羞耻度} color={羞耻度颜色} />
          <ProgressBar label="信任度" value={模特.信任度} color="bg-blue-400" />

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div><div className="text-gray-600 text-[10px]">总拍摄</div><div className="text-wuxia-gold font-mono">{模特.拍摄总次数}</div></div>
            <div><div className="text-gray-600 text-[10px]">正规</div><div className="text-green-400 font-mono">{模特.正规拍摄次数}</div></div>
            <div><div className="text-gray-600 text-[10px]">擦边</div><div className="text-yellow-400 font-mono">{模特.擦边拍摄次数}</div></div>
            <div><div className="text-gray-600 text-[10px]">越界</div><div className="text-red-400 font-mono">{模特.越界拍摄次数}</div></div>
          </div>

          {(模特.被偷拍次数 > 0 || 模特.被泄露次数 > 0 || 模特.投诉次数 > 0) && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-2 space-y-1">
              <div className="text-[10px] text-red-400/80 font-bold tracking-widest">安全记录</div>
              {模特.被偷拍次数 > 0 && <div className="text-[11px] text-red-400">被偷拍: {模特.被偷拍次数} 次</div>}
              {模特.被泄露次数 > 0 && <div className="text-[11px] text-red-400">被泄露: {模特.被泄露次数} 次</div>}
              {模特.投诉次数 > 0 && <div className="text-[11px] text-red-400">投诉: {模特.投诉次数} 次</div>}
            </div>
          )}

          {相关项目.length > 0 && (
            <div className="text-[11px] text-gray-500">
              进行中项目: {相关项目.length} 个
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== Project Card ====================

interface ProjectCardProps {
  项目: 拍摄项目状态;
  模特姓名: string;
  摄影师姓名: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 项目, 模特姓名, 摄影师姓名 }) => {
  const [expanded, setExpanded] = React.useState(false);

  const 进度 = 项目.最大回合 > 0 ? (项目.当前回合 / 项目.最大回合) * 100 : 0;
  const 尺度变化 = 项目.尺度变更历史.length > 0;
  const 越界记录 = 项目.越界行为记录.length > 0;

  const 泄露风险颜色 = 项目.泄露风险评分 >= 70 ? 'bg-red-500' : 项目.泄露风险评分 >= 40 ? 'bg-yellow-500' : 'bg-green-500';

  const 阶段状态映射: Record<string, { 颜色: string; 图标: string }> = {
    '未开始': { 颜色: 'text-gray-600', 图标: '○' },
    '进行中': { 颜色: 'text-wuxia-gold', 图标: '◉' },
    '已完成': { 颜色: 'text-green-400', 图标: '✓' },
    '已跳过': { 颜色: 'text-gray-500', 图标: '—' },
  };

  const 显示名称 = 项目.项目名称 || `${模特姓名} × ${摄影师姓名}`;

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-wuxia-gold/20 transition-colors">
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="text-left">
          <div className="font-serif text-wuxia-gold font-bold">{显示名称}</div>
          <div className="text-[11px] text-gray-500">{项目.约定写真类型} · {项目.拍摄阶段}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] ${尺度颜色[项目.实际尺度]}`}>{项目.实际尺度}</span>
          {尺度变化 && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="尺度已变更" />}
          {越界记录 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="有越界行为" />}
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* 项目详情 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-500">模特：</span><span className="text-gray-300">{模特姓名}</span></div>
            <div><span className="text-gray-500">摄影师：</span><span className="text-gray-300">{摄影师姓名}</span></div>
          </div>

          {/* 进度 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-16">进度</span>
            <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div className="h-full rounded-full bg-wuxia-gold transition-all duration-300" style={{ width: `${进度}%` }} />
            </div>
            <span className="text-gray-400 font-mono w-12 text-right">{项目.当前回合}/{项目.最大回合}</span>
          </div>

          {/* 阶段明细 */}
          {项目.阶段明细 && 项目.阶段明细.length > 0 && (
            <div>
              <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">拍摄阶段</div>
              <div className="flex items-center gap-1 flex-wrap">
                {项目.阶段明细.map((stage, i) => {
                  const status = 阶段状态映射[stage.状态] || 阶段状态映射['未开始'];
                  const isCurrent = stage.状态 === '进行中';
                  return (
                    <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] ${isCurrent ? 'bg-wuxia-gold/10 border border-wuxia-gold/30' : 'bg-black/30 border border-white/5'}`}>
                      <span className={status.颜色}>{status.图标}</span>
                      <span className={isCurrent ? 'text-wuxia-gold' : status.颜色}>{stage.阶段名称}</span>
                      {stage.备注 && <span className="text-gray-500 text-[10px] ml-1">({stage.备注})</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 场所 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-16">场所</span>
            <span className={场所风险颜色[项目.实际场所]}>{项目.实际场所}</span>
            {项目.实际场所 !== 项目.约定场所 && <span className="text-orange-400 text-[10px]">(已变更)</span>}
          </div>

          <ProgressBar label="泄露风险" value={项目.泄露风险评分} color={泄露风险颜色} />

          {尺度变化 && (
            <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-2 space-y-1">
              <div className="text-[10px] text-orange-400/80 font-bold tracking-widest">尺度变更</div>
              {项目.尺度变更历史.map((h, i) => (
                <div key={i} className="text-[11px] text-orange-300">
                  {h.旧尺度} → {h.新尺度} (回合{h.回合}) {h.模特是否同意 ? '模特同意' : '模特拒绝'}
                </div>
              ))}
            </div>
          )}

          {越界记录 && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-2 space-y-1">
              <div className="text-[10px] text-red-400/80 font-bold tracking-widest">越界行为</div>
              {项目.越界行为记录.map((v, i) => (
                <div key={i} className="text-[11px] text-red-300">
                  {v.类型} (回合{v.回合}) — {v.模特回应}
                </div>
              ))}
            </div>
          )}

          {/* 关系进展 */}
          {项目.关系进展 && (
            <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-2 space-y-1">
              <div className="text-[10px] text-blue-400/80 font-bold tracking-widest">关系进展</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div><div className="text-gray-600 text-[10px]">默契度</div><div className="text-blue-400 font-mono">{项目.关系进展.默契度}</div></div>
                <div><div className="text-gray-600 text-[10px]">信任变化</div><div className={`font-mono ${项目.关系进展.信任变化 >= 0 ? 'text-green-400' : 'text-red-400'}`}>{项目.关系进展.信任变化 >= 0 ? '+' : ''}{项目.关系进展.信任变化}</div></div>
                <div><div className="text-gray-600 text-[10px]">亲密度</div><div className="text-pink-400 font-mono">{项目.关系进展.亲密度变化}</div></div>
              </div>
              {项目.关系进展.关系里程碑 && 项目.关系进展.关系里程碑.length > 0 && (
                <div className="text-[10px] text-blue-300">里程碑: {项目.关系进展.关系里程碑.join(' → ')}</div>
              )}
            </div>
          )}

          {/* 摄影集 */}
          {项目.摄影集 && 项目.摄影集.作品数量 > 0 && (
            <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-2 space-y-1">
              <div className="text-[10px] text-purple-400/80 font-bold tracking-widest">摄影集</div>
              <div className="text-[11px] text-purple-300">作品: {项目.摄影集.作品数量} 张 {项目.摄影集.是否发布 ? '(已发布)' : '(未发布)'}</div>
              {项目.摄影集.精选作品 && 项目.摄影集.精选作品.length > 0 && (
                <div className="text-[10px] text-gray-400">精选: {项目.摄影集.精选作品.map(w => `${w.描述} (${w.评分}分)`).join(', ')}</div>
              )}
            </div>
          )}

          <div className="text-[11px] text-gray-500">
            交付: {项目.交付状态} {项目.交付方式 ? `(${项目.交付方式})` : ''}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Leak Card ====================

interface LeakCardProps {
  事件: 泄露事件状态;
  模特姓名: string;
}

const LeakCard: React.FC<LeakCardProps> = ({ 事件, 模特姓名 }) => {
  const [expanded, setExpanded] = React.useState(false);

  const 状态颜色: Record<string, string> = {
    '活跃': 'bg-red-500 animate-pulse',
    '已处理': 'bg-yellow-500',
    '已发酵': 'bg-orange-500',
    '已平息': 'bg-green-500',
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-wuxia-gold/20 transition-colors">
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${状态颜色[事件.状态] || 'bg-gray-500'}`} />
          <div className="text-left">
            <div className="font-serif text-wuxia-gold font-bold">{模特姓名}</div>
            <div className="text-[11px] text-gray-500">{事件.泄露类型}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] ${泄露严重程度颜色[事件.传播范围]}`}>{事件.传播范围}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            事件.应对效果 === '有效' ? 'border-green-500/50 text-green-400' :
            事件.应对效果 === '部分有效' ? 'border-yellow-500/50 text-yellow-400' :
            事件.应对效果 === '恶化' ? 'border-red-500/50 text-red-400' :
            'border-gray-500/50 text-gray-400'
          }`}>{事件.应对效果}</span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <ProgressBar label="心理影响" value={事件.心理影响} color="bg-purple-400" />
          <ProgressBar label="名誉影响" value={事件.名誉影响} color="bg-red-400" />
          <ProgressBar label="职业影响" value={事件.职业影响} color="bg-orange-400" />
          <ProgressBar label="生活影响" value={事件.生活影响} color="bg-yellow-400" />

          {事件.传播路径.length > 0 && (
            <div className="text-[11px] text-gray-500">
              传播路径: {事件.传播路径.join(' → ')}
            </div>
          )}

          <div className="text-[11px] text-gray-500">
            应对: {事件.模特应对}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Photographer Card ====================

interface PhotographerCardProps {
  摄影师: 摄影师核心状态;
  显示姓名?: string;
}

const PhotographerCard: React.FC<PhotographerCardProps> = ({ 摄影师, 显示姓名 }) => {
  const 姓名 = 显示姓名 || 摄影师.姓名;
  const [expanded, setExpanded] = React.useState(false);

  const 信誉颜色: Record<string, string> = {
    '业界大佬': 'text-emerald-400',
    '资深摄影师': 'text-green-400',
    '普通摄影师': 'text-yellow-400',
    '有争议': 'text-orange-400',
    '名声较差': 'text-red-400',
    '惯犯': 'text-red-600',
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-wuxia-gold/20 transition-colors">
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/60 border border-wuxia-gold/30 flex items-center justify-center text-lg font-serif text-wuxia-gold/60">
            {姓名[0]}
          </div>
          <div className="text-left">
            <div className="font-serif text-wuxia-gold font-bold">{姓名}</div>
            <div className={`text-[11px] ${信誉颜色[摄影师.信誉] || 'text-gray-500'}`}>{摄影师.信誉}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500">评分 {Math.round(摄影师.口碑评分)}</span>
          {摄影师.投诉累计 > 0 && <span className="text-[10px] text-red-400">投诉 {摄影师.投诉累计}</span>}
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <ProgressBar label="技术水平" value={摄影师.技术水平} color="bg-blue-400" />
          <ProgressBar label="沟通能力" value={摄影师.沟通能力} color="bg-green-400" />

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div><div className="text-gray-600 text-[10px]">总拍摄</div><div className="text-wuxia-gold font-mono">{摄影师.拍摄总次数}</div></div>
            <div><div className="text-gray-600 text-[10px]">回头客</div><div className="text-green-400 font-mono">{摄影师.回头客数量}</div></div>
            <div><div className="text-gray-600 text-[10px]">作品数</div><div className="text-blue-400 font-mono">{摄影师.作品发布数量}</div></div>
          </div>

          {摄影师.擅长写真类型.length > 0 && (
            <div className="text-[11px] text-gray-500">
              擅长: {摄影师.擅长写真类型.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 主组件 ====================

interface Props {
  模特档案: Record<string, 模特核心状态>;
  摄影师档案: Record<string, 摄影师核心状态>;
  进行中的拍摄项目: 拍摄项目状态[];
  历史拍摄记录: 拍摄项目状态[];
  泄露事件列表: 泄露事件状态[];
  关系网络?: Record<string, {
    信任度: number;
    亲密度: number;
    默契度: number;
    合作次数: number;
    关系等级: string;
    里程碑: string[];
  }>;
  摄影师声望?: Record<string, {
    业内声望: number;
    圈内声誉: number;
    风评: string;
    标签: string[];
    粉丝数量: number;
    合作意向: number;
  }>;
  模特声望?: Record<string, {
    知名度: number;
    风评: string;
    标签: string[];
    黑料风险: number;
  }>;
  摄影集索引?: Record<string, {
    作品总数: number;
    发布数量: number;
    代表作?: string[];
  }>;
  onClose: () => void;
}

export const PhotographyDashboard: React.FC<Props> = ({
  模特档案, 摄影师档案, 进行中的拍摄项目, 历史拍摄记录, 泄露事件列表,
  关系网络 = {}, 摄影师声望 = {}, 模特声望 = {}, 摄影集索引 = {},
  onClose
}) => {
  const 活跃泄露 = useMemo(() => 泄露事件列表.filter(e => e.状态 === '活跃' || e.状态 === '已发酵'), [泄露事件列表]);

  const 模特姓名映射 = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [id, m] of Object.entries(模特档案)) map[id] = m.姓名;
    return map;
  }, [模特档案]);

  const 摄影师姓名映射 = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [id, p] of Object.entries(摄影师档案)) map[id] = p.姓名;
    return map;
  }, [摄影师档案]);

  const 统计 = useMemo(() => ({
    模特数: Object.keys(模特档案).length,
    摄影师数: Object.keys(摄影师档案).length,
    进行中项目: 进行中的拍摄项目.length,
    历史项目: 历史拍摄记录.length,
    活跃泄露: 活跃泄露.length,
    总投诉: Object.values(摄影师档案).reduce((sum, p) => sum + (p.投诉累计 || 0), 0),
  }), [模特档案, 摄影师档案, 进行中的拍摄项目, 历史拍摄记录, 活跃泄露]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-ink-black/95 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-wuxia-gold/20 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="h-14 shrink-0 border-b border-white/10 bg-gradient-to-r from-black/80 to-black/40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-wuxia-red animate-pulse" />
            <h3 className="text-wuxia-gold font-serif font-bold text-xl tracking-[0.3em]">
              写真仪表盘
              <span className="text-[10px] text-wuxia-gold/50 ml-2 font-mono tracking-widest border border-wuxia-gold/20 px-2 py-0.5 rounded-full">PHOTOGRAPHY</span>
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-400 transition-all" title="关闭">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b border-white/5 bg-black/30">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">模特</div>
            <div className="text-2xl font-serif text-wuxia-gold">{统计.模特数}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">摄影师</div>
            <div className="text-2xl font-serif text-wuxia-gold">{统计.摄影师数}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">进行中</div>
            <div className="text-2xl font-serif text-wuxia-gold">{统计.进行中项目}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">泄露事件</div>
            <div className={`text-2xl font-serif ${统计.活跃泄露 > 0 ? 'text-red-500' : 'text-gray-600'}`}>{统计.活跃泄露}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">总投诉</div>
            <div className={`text-2xl font-serif ${统计.总投诉 > 0 ? 'text-red-400' : 'text-gray-600'}`}>{统计.总投诉}</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* Active Projects */}
          {进行中的拍摄项目.length > 0 && (
            <div>
              <SectionHeader title="进行中的拍摄项目" count={进行中的拍摄项目.length} />
              <div className="space-y-2">
                {进行中的拍摄项目.map(p => (
                  <ProjectCard key={p.id} 项目={p} 模特姓名={模特姓名映射[p.模特Id] || p.模特Id} 摄影师姓名={摄影师姓名映射[p.摄影师Id] || p.摄影师Id} />
                ))}
              </div>
            </div>
          )}

          {/* Active Leaks */}
          {活跃泄露.length > 0 && (
            <div>
              <SectionHeader title="活跃泄露事件" count={活跃泄露.length} />
              <div className="space-y-2">
                {活跃泄露.map(e => (
                  <LeakCard key={e.id} 事件={e} 模特姓名={模特姓名映射[e.模特Id] || e.模特Id} />
                ))}
              </div>
            </div>
          )}

          {/* Model Profiles */}
          {Object.keys(模特档案).length > 0 && (
            <div>
              <SectionHeader title="模特档案" count={Object.keys(模特档案).length} />
              <div className="space-y-2">
                {Object.entries(模特档案).map(([id, 模特]) => {
                  const 相关项目 = 进行中的拍摄项目.filter(p => p.模特Id === id);
                  return <ModelCard key={id} 模特={模特} 相关项目={相关项目} />;
                })}
              </div>
            </div>
          )}

          {/* Photographer Directory */}
          {Object.keys(摄影师档案).length > 0 && (
            <div>
              <SectionHeader title="摄影师名录" count={Object.keys(摄影师档案).length} />
              <div className="space-y-2">
                {Object.entries(摄影师档案).map(([id, 摄影师]) => (
                  <PhotographerCard key={id} 摄影师={摄影师} 显示姓名={摄影师姓名映射[id]} />
                ))}
              </div>
            </div>
          )}

          {/* 关系网络 */}
          {Object.keys(关系网络).length > 0 && (
            <div>
              <SectionHeader title="关系网络" count={Object.keys(关系网络).length} />
              <div className="space-y-2">
                {Object.entries(关系网络).map(([key, rel]) => {
                  const [模特Id, 摄影师Id] = key.split('-');
                  const 模特名 = 模特姓名映射[模特Id] || 模特Id;
                  const 摄影师名 = 摄影师姓名映射[摄影师Id] || 摄影师Id;
                  const 等级颜色 = rel.关系等级 === '密友' ? 'text-red-400'
                    : rel.关系等级 === '固定搭档' ? 'text-orange-400'
                    : rel.关系等级 === '合作伙伴' ? 'text-yellow-400'
                    : 'text-gray-500';
                  return (
                    <div key={key} className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-wuxia-gold font-bold text-sm">{模特名} ↔ {摄影师名}</div>
                        <div className={`text-xs ${等级颜色}`}>{rel.关系等级}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div><div className="text-gray-600 text-[10px]">信任度</div><div className="text-blue-400 font-mono">{rel.信任度}</div></div>
                        <div><div className="text-gray-600 text-[10px]">亲密度</div><div className="text-pink-400 font-mono">{rel.亲密度}</div></div>
                        <div><div className="text-gray-600 text-[10px]">默契度</div><div className="text-green-400 font-mono">{rel.默契度}</div></div>
                        <div><div className="text-gray-600 text-[10px]">合作次数</div><div className="text-wuxia-gold font-mono">{rel.合作次数}</div></div>
                      </div>
                      {rel.里程碑.length > 0 && (
                        <div className="text-[10px] text-gray-400 mt-1">里程碑: {rel.里程碑.join(' → ')}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 声望面板 */}
          {(Object.keys(摄影师声望).length > 0 || Object.keys(模特声望).length > 0) && (
            <div>
              <SectionHeader title="声望排行" count={Object.keys(摄影师声望).length + Object.keys(模特声望).length} />
              <div className="space-y-2">
                {/* 摄影师声望 */}
                {Object.entries(摄影师声望).map(([id, rep]) => {
                  const 姓名 = 摄影师姓名映射[id] || id;
                  const 风评颜色 = rep.风评 === '优秀' ? 'text-emerald-400'
                    : rep.风评 === '良好' ? 'text-green-400'
                    : rep.风评 === '一般' ? 'text-yellow-400'
                    : rep.风评 === '争议' ? 'text-orange-400'
                    : 'text-red-400';
                  return (
                    <div key={`ph-${id}`} className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-wuxia-gold font-bold text-sm">{姓名} <span className="text-gray-500 text-xs">(摄影师)</span></div>
                        <div className={`text-xs ${风评颜色}`}>{rep.风评}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div><div className="text-gray-600 text-[10px]">业内声望</div><div className="text-blue-400 font-mono">{rep.业内声望}</div></div>
                        <div><div className="text-gray-600 text-[10px]">圈内声誉</div><div className="text-purple-400 font-mono">{rep.圈内声誉}</div></div>
                        <div><div className="text-gray-600 text-[10px]">粉丝</div><div className="text-pink-400 font-mono">{rep.粉丝数量}</div></div>
                        <div><div className="text-gray-600 text-[10px]">合作意向</div><div className="text-green-400 font-mono">{rep.合作意向}%</div></div>
                      </div>
                      {rep.标签.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {rep.标签.map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* 模特声望 */}
                {Object.entries(模特声望).map(([id, rep]) => {
                  return (
                    <div key={`md-${id}`} className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-wuxia-gold font-bold text-sm">{模特姓名映射[id] || id} <span className="text-gray-500 text-xs">(模特)</span></div>
                        <div className="text-xs text-gray-300">{rep.风评}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div><div className="text-gray-600 text-[10px]">知名度</div><div className="text-yellow-400 font-mono">{rep.知名度}</div></div>
                        <div><div className="text-gray-600 text-[10px]">黑料风险</div><div className={`font-mono ${rep.黑料风险 >= 70 ? 'text-red-400' : rep.黑料风险 >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>{rep.黑料风险}</div></div>
                        <div><div className="text-gray-600 text-[10px]">标签数</div><div className="text-blue-400 font-mono">{rep.标签?.length || 0}</div></div>
                        <div><div className="text-gray-600 text-[10px]">风评</div><div className="text-gray-300 text-[10px] truncate max-w-[80px]">{rep.风评}</div></div>
                      </div>
                      {rep.标签 && rep.标签.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {rep.标签.map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 摄影集索引 */}
          {Object.keys(摄影集索引).length > 0 && (
            <div>
              <SectionHeader title="摄影集总览" count={Object.keys(摄影集索引).length} />
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(摄影集索引).map(([id, col]) => {
                  const 姓名 = 模特姓名映射[id] || 摄影师姓名映射[id] || id;
                  return (
                    <div key={id} className="bg-black/40 border border-white/10 rounded-xl p-3">
                      <div className="text-wuxia-gold font-bold text-sm mb-1">{姓名}</div>
                      <div className="grid grid-cols-2 gap-1 text-center text-xs">
                        <div><div className="text-gray-600 text-[10px]">作品总数</div><div className="text-purple-400 font-mono">{col.作品总数}</div></div>
                        <div><div className="text-gray-600 text-[10px]">已发布</div><div className="text-green-400 font-mono">{col.发布数量}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {Object.keys(模特档案).length === 0 && 进行中的拍摄项目.length === 0 && 活跃泄露.length === 0 && (
            <div className="text-center text-gray-600 py-16 font-serif">
              <div className="text-lg mb-2">暂无写真数据</div>
              <div className="text-xs">写真系统启用后将在此显示相关数据</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotographyDashboard;
