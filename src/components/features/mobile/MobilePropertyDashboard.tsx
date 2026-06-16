// 房产 SLG 经营仪表盘 - 移动端

import React, { useMemo } from 'react';
import type { 房产数据结构, 房产系统状态 } from '../../../models/property/types';
import { 计算房产吸引力, 计算舒适度, 计算安全性 } from '../../../hooks/useGame/property/propertyEngine';

const 房产类型图标: Record<string, string> = {
  '民居': '🏠', '客栈': '🏨', '民宿': '🏡', '庄园': '🏰',
  '商铺': '🏪', '青楼': '🏮', '武馆': '🥋', '医馆': '💊'
};

const 满意度颜色 = (值: number): string => {
  if (值 >= 70) return 'text-green-400';
  if (值 >= 40) return 'text-yellow-400';
  if (值 >= 20) return 'text-orange-400';
  return 'text-red-400';
};

interface 房产仪表盘Props {
  房产系统: 房产系统状态;
  当前房产: 房产数据结构 | null;
  onClose?: () => void;
}

export const 移动端房产仪表盘: React.FC<房产仪表盘Props> = ({
  房产系统, 当前房产, onClose
}) => {
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
      <div className="bg-gray-900 rounded-xl p-6 max-w-md mx-auto">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">🏚️</div>
          <div className="text-lg">房产系统尚未解锁</div>
        </div>
      </div>
    );
  }

  const { 房产名称, 房产类型, 房产等级, 当前经验, 升级所需经验, 房间列表, 房客列表, 经营状态 } = 当前房产;
  const 经验进度 = 升级所需经验 > 0 ? (当前经验 / 升级所需经验) * 100 : 0;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-md mx-auto overflow-hidden">
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-amber-900/40 to-gray-800/60 p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{房产类型图标[房产类型] || '🏠'}</span>
            <div>
              <h2 className="text-base font-bold text-amber-100">{房产名称}</h2>
              <div className="text-xs text-gray-400">{房产类型} · Lv.{房产等级}</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 p-2">✕</button>
          )}
        </div>
        <div className="mt-2 bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-amber-500" style={{ width: `${经验进度}%` }} />
        </div>
      </div>

      {/* 统计 */}
      <div className="p-3 grid grid-cols-4 gap-2">
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-xs text-gray-400">资金</div>
          <div className="text-sm font-bold">{经营状态.总资金}</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-xs text-gray-400">吸引力</div>
          <div className="text-sm font-bold">{吸引力}</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-xs text-gray-400">舒适度</div>
          <div className="text-sm font-bold">{舒适度}</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-xs text-gray-400">安全性</div>
          <div className="text-sm font-bold">{安全性}</div>
        </div>
      </div>

      {/* 房间列表 */}
      <div className="p-3 border-t border-gray-700/50">
        <h3 className="text-xs font-medium text-gray-300 mb-2">房间 ({房间列表.length})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {房间列表.map(房间 => {
            const 房客 = 房间.当前房客Id ? 房客列表.find(f => f.id === 房间.当前房客Id) : undefined;
            return (
              <div key={房间.id} className="bg-gray-700/30 rounded p-2">
                <div className="flex justify-between text-xs">
                  <span>{房间.房间名称} Lv.{房间.房间等级}</span>
                  <span className={房间.房间状态 === '空闲' ? 'text-green-400' : 'text-blue-400'}>
                    {房间.房间状态}
                  </span>
                </div>
                {房客 && (
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{房客.NPC姓名} ({房客.房客类型})</span>
                    <span className={满意度颜色(房客.满意度)}>{房客.满意度}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="p-3 bg-gray-800/50 border-t border-gray-700/50 grid grid-cols-2 gap-2">
        <button className="bg-amber-700 hover:bg-amber-600 text-white rounded py-2 text-xs">
          建造/升级
        </button>
        <button className="bg-green-700 hover:bg-green-600 text-white rounded py-2 text-xs">
          招揽房客
        </button>
        <button className="bg-purple-700 hover:bg-purple-600 text-white rounded py-2 text-xs">
          推进经营
        </button>
        <button className="bg-blue-700 hover:bg-blue-600 text-white rounded py-2 text-xs">
          扩建房间
        </button>
      </div>
    </div>
  );
};

export default 移动端房产仪表盘;
