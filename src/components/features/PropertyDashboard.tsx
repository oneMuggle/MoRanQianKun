// 房产 SLG 经营仪表盘 - 桌面端

import React, { useMemo } from 'react';
import type { 房产数据结构, 房产系统状态, 房客结构, 房间结构 } from '../../models/property/types';
import { 计算房产吸引力, 计算舒适度, 计算安全性, 生成经营摘要 } from '../../hooks/useGame/property/propertyEngine';
import { 获取房客满意度报告 } from '../../hooks/useGame/property/tenantWorkflow';

// ==================== 常量 ====================

const 房产类型图标: Record<string, string> = {
  '民居': '🏠', '客栈': '🏨', '民宿': '🏡', '庄园': '🏰',
  '商铺': '🏪', '青楼': '🏮', '武馆': '🥋', '医馆': '💊'
};

const 房间类型图标: Record<string, string> = {
  '客房': '🛏️', '卧室': '🛌', '功能房': '🔧', '公共区域': '🌿', '储藏室': '📦'
};

const 状态颜色: Record<string, string> = {
  '空闲': 'text-green-400', '使用中': 'text-blue-400',
  '维修中': 'text-yellow-400', '装修中': 'text-purple-400'
};

const 满意度颜色 = (值: number): string => {
  if (值 >= 70) return 'text-green-400';
  if (值 >= 40) return 'text-yellow-400';
  if (值 >= 20) return 'text-orange-400';
  return 'text-red-400';
};

// ==================== 子组件 ====================

const 统计卡片: React.FC<{ 标签: string; 数值: string | number; 图标?: string }> = ({ 标签, 数值, 图标 }) => (
  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
    <div className="flex items-center gap-2">
      {图标 && <span className="text-lg">{图标}</span>}
      <div>
        <div className="text-xs text-gray-400">{标签}</div>
        <div className="text-lg font-bold text-white">{数值}</div>
      </div>
    </div>
  </div>
);

const 房间卡片: React.FC<{
  房间: 房间结构;
  房客?: 房客结构;
}> = ({ 房间, 房客 }) => (
  <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/30">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">
        {房间类型图标[房间.房间类型] || '🏠'} {房间.房间名称}
      </span>
      <span className={`text-xs ${状态颜色[房间.房间状态] || 'text-gray-400'}`}>
        {房间.房间状态}
      </span>
    </div>
    <div className="text-xs text-gray-400 space-y-1">
      <div>等级: {'⭐'.repeat(房间.房间等级)} ({房间.房间等级}/5)</div>
      <div>面积: {房间.面积}㎡</div>
      <div>设施: {房间.已建设施.length} 件</div>
      {房客 && (
        <div className="pt-1 border-t border-gray-600/30">
          <div className="flex justify-between">
            <span>房客: {房客.NPC姓名}</span>
            <span className={满意度颜色(房客.满意度)}>
              满意度: {房客.满意度}%
            </span>
          </div>
          <div className="text-xs text-gray-500">类型: {房客.房客类型}</div>
        </div>
      )}
    </div>
  </div>
);

const 房客列表面板: React.FC<{ 房客列表: 房客结构[] }> = ({ 房客列表 }) => (
  <div className="space-y-2">
    {房客列表.map(房客 => {
      const 报告 = 获取房客满意度报告({ 房客列表: [房客] } as 房产数据结构);
      const 状态 = 报告[0]?.状态 || '未知';
      return (
        <div key={房客.id} className="bg-gray-700/30 rounded p-2 flex items-center justify-between">
          <div>
            <span className="text-sm">{房客.NPC姓名}</span>
            <span className="text-xs text-gray-400 ml-2">({房客.房客类型})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${满意度颜色(房客.满意度)}`}>
              {房客.满意度}%
            </span>
            <span className="text-xs text-gray-500">{状态}</span>
          </div>
        </div>
      );
    })}
    {房客列表.length === 0 && (
      <div className="text-center text-gray-500 text-sm py-4">暂无房客</div>
    )}
  </div>
);

// ==================== 主组件 ====================

interface 房产仪表盘Props {
  房产系统: 房产系统状态;
  当前房产: 房产数据结构 | null;
  onClose?: () => void;
}

export const 房产仪表盘: React.FC<房产仪表盘Props> = ({
  房产系统, 当前房产, onClose
}) => {
  const 摘要 = useMemo(
    () => 当前房产 ? 生成经营摘要(当前房产) : '',
    [当前房产]
  );

  const 吸引力 = useMemo(
    () => 当前房产 ? 计算房产吸引力(当前房产) : 0,
    [当前房产]
  );
  const 舒适度 = useMemo(
    () => 当前房产 ? 计算舒适度(当前房产) : 0,
    [当前房产]
  );
  const 安全性 = useMemo(
    () => 当前房产 ? 计算安全性(当前房产) : 0,
    [当前房产]
  );

  if (!房产系统.已解锁 || !当前房产) {
    return (
      <div className="bg-gray-900/90 backdrop-blur rounded-xl p-6 border border-gray-700 max-w-2xl mx-auto">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">🏚️</div>
          <div className="text-lg">房产系统尚未解锁</div>
          <div className="text-sm mt-2">在剧情中探索并获得房产后启用</div>
        </div>
      </div>
    );
  }

  const { 房产名称, 房产类型, 房产等级, 当前经验, 升级所需经验, 房间列表, 设施列表, 房客列表, 经营状态 } = 当前房产;
  const 经验进度 = 升级所需经验 > 0 ? (当前经验 / 升级所需经验) * 100 : 0;

  return (
    <div className="bg-gray-900/90 backdrop-blur rounded-xl border border-gray-700 max-w-4xl mx-auto overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="bg-gradient-to-r from-amber-900/40 to-gray-800/60 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{房产类型图标[房产类型] || '🏠'}</span>
            <div>
              <h2 className="text-xl font-bold text-amber-100">{房产名称}</h2>
              <div className="text-sm text-gray-400">{房产类型} · 等级 {房产等级}</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              ✕
            </button>
          )}
        </div>
        <div className="mt-3 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
            style={{ width: `${经验进度}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">经验: {当前经验}/{升级所需经验}</div>
      </div>

      {/* 经营摘要 */}
      <div className="p-4 bg-gray-800/30 border-b border-gray-700/50">
        <div className="text-sm text-gray-300">{摘要}</div>
      </div>

      {/* 统计卡片 */}
      <div className="p-4 grid grid-cols-4 gap-3">
        <统计卡片 标签="资金" 数值={经营状态.总资金} 图标="💰" />
        <统计卡片 标签="吸引力" 数值={吸引力} 图标="✨" />
        <统计卡片 标签="舒适度" 数值={舒适度} 图标="🛋️" />
        <统计卡片 标签="安全性" 数值={安全性} 图标="🔒" />
      </div>

      {/* 房间与房客 */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">房间 ({房间列表.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {房间列表.map(房间 => {
              const 房客 = 房间.当前房客Id
                ? 房客列表.find(f => f.id === 房间.当前房客Id)
                : undefined;
              return <房间卡片 key={房间.id} 房间={房间} 房客={房客} />;
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">房客 ({房客列表.length})</h3>
          <房客列表面板 房客列表={房客列表} />
        </div>
      </div>

      {/* 设施概览 */}
      <div className="p-4 border-t border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-300 mb-2">设施 ({设施列表.length} 件全局)</h3>
        <div className="flex flex-wrap gap-2">
          {设施列表.map(设施 => (
            <span key={设施.id} className="bg-gray-700/50 rounded px-2 py-1 text-xs text-gray-300">
              {设施.设施名称} Lv.{设施.设施等级}
            </span>
          ))}
          {设施列表.length === 0 && (
            <span className="text-xs text-gray-500">暂无全局设施</span>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700/50 flex gap-3">
        <button className="flex-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg py-2 text-sm transition-colors">
          建造设施
        </button>
        <button className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg py-2 text-sm transition-colors">
          扩建房间
        </button>
        <button className="flex-1 bg-green-700 hover:bg-green-600 text-white rounded-lg py-2 text-sm transition-colors">
          招揽房客
        </button>
        <button className="flex-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg py-2 text-sm transition-colors">
          推进经营
        </button>
      </div>
    </div>
  );
};

export default 房产仪表盘;
