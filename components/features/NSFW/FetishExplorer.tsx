/**
 * NSFW 性癖探索器 UI 组件
 * 展示性癖解锁树、敏感点探索地图、人格演化时间线
 */

import { useState } from 'react';
import type { NPC结构 } from '../../../models/social';
import {
  获取可探索性癖列表,
  生成探索进度摘要,
} from '../../../models/npcNSFWEnhancement/discovery/fetishDiscovery';
import type { 性癖解锁节点 } from '../../../models/npcNSFWEnhancement/discovery/fetishDiscovery';
import type { 性癖条目 } from '../../../models/npcNSFWEnhancement/types';
import {
  获取已发现技巧,
  生成敏感点探索摘要,
} from '../../../models/npcNSFWEnhancement/discovery/sensitivePointDiscovery';
import {
  获取人格演化路径,
  获取欲望觉醒进度,
  生成人格演化摘要,
  检查触发条件,
} from '../../../models/npcNSFWEnhancement/discovery/personalityTrigger';
import type { 触发目标 } from '../../../models/npcNSFWEnhancement/discovery/personalityTrigger';

interface FetishExplorerProps {
  npc: NPC结构 | null;
}

type 活跃标签 = '性癖树' | '敏感点' | '人格演化';

export function FetishExplorer({ npc }: FetishExplorerProps) {
  const [活跃标签, set活跃标签] = useState<活跃标签>('性癖树');
  const [展开节点, set展开节点] = useState<Record<string, boolean>>({});

  if (!npc) return null;

  const 性癖列表 = 获取可探索性癖列表(npc);
  const 性癖摘要 = 生成探索进度摘要(npc);
  const 技巧列表 = 获取已发现技巧(npc);
  const 敏感点摘要 = 生成敏感点探索摘要(npc);
  const 演化路径 = 获取人格演化路径(npc);
  const 觉醒进度 = 获取欲望觉醒进度(npc);
  const 人格摘要 = 生成人格演化摘要(npc);

  return (
    <div className="bg-gray-900/90 border border-gray-700 rounded-lg overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-200">NSFW 探索器</h3>
      </div>

      {/* 标签切换 */}
      <div className="flex border-b border-gray-700">
        {(['性癖树', '敏感点', '人格演化'] as 活跃标签[]).map(tab => (
          <button
            key={tab}
            onClick={() => set活跃标签(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              活跃标签 === tab
                ? 'text-pink-400 border-b-2 border-pink-400 bg-gray-800/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="p-3 max-h-96 overflow-y-auto">
        {活跃标签 === '性癖树' && (
          <FetishTree
            已解锁={性癖列表.已解锁}
            可解锁={性癖列表.可解锁}
            已锁定={性癖列表.已锁定}
            摘要={性癖摘要}
            展开节点={展开节点}
            切换节点={id => set展开节点(prev => ({ ...prev, [id]: !prev[id] }))}
          />
        )}
        {活跃标签 === '敏感点' && (
          <SensitivePointMap
            npc={npc}
            技巧列表={技巧列表}
            摘要={敏感点摘要}
          />
        )}
        {活跃标签 === '人格演化' && (
          <PersonalityTimeline
            npc={npc}
            演化路径={演化路径}
            觉醒进度={觉醒进度}
            摘要={人格摘要}
          />
        )}
      </div>
    </div>
  );
}

// ==================== 子组件：性癖解锁树 ====================

interface FetishTreeProps {
  已解锁: 性癖条目[];
  可解锁: 性癖解锁节点[];
  已锁定: 性癖解锁节点[];
  摘要: string;
  展开节点: Record<string, boolean>;
  切换节点: (id: string) => void;
}

function FetishTree({ 已解锁, 可解锁, 已锁定, 摘要, 展开节点, 切换节点 }: FetishTreeProps) {
  const 标识解锁 = (n: 性癖条目) => `${n.类别}:${n.子类型}`;
  const 标识节点 = (n: 性癖解锁节点) => `${n.性癖类别}:${n.性癖子类型}`;

  // 按类别分组
  const 按类别分组: Record<string, 性癖解锁节点[]> = {};
  const 所有节点: 性癖解锁节点[] = [
    ...可解锁,
    ...已锁定,
  ];
  for (const 节点 of 所有节点) {
    if (!按类别分组[节点.性癖类别]) {
      按类别分组[节点.性癖类别] = [];
    }
    按类别分组[节点.性癖类别].push(节点);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{摘要}</p>

      {Object.entries(按类别分组).map(([类别, 节点列表]) => {
        const is展开 = 展开节点[类别] ?? true;
        return (
          <div key={类别} className="space-y-1">
            <button
              onClick={() => 切换节点(类别)}
              className="w-full text-left text-xs font-medium text-gray-300 hover:text-pink-300 transition-colors"
            >
              {is展开 ? '▼' : '▶'} {类别}
            </button>
            {is展开 && (
              <div className="pl-3 space-y-1 border-l border-gray-700 ml-1">
                {节点列表.map(节点 => {
                  const id = 标识节点(节点);
                  const 对应已解锁 = 已解锁.find(f => 标识解锁(f) === id);
                  const 状态 = 对应已解锁 ? '已解锁' : '可解锁';
                  const 颜色 = 状态 === '已解锁' ? 'text-green-400' : 'text-yellow-400';
                  const 是否锁定 = !对应已解锁 && !可解锁.some(n => 标识节点(n) === id);
                  const 锁定颜色 = 是否锁定 ? 'text-gray-600' : 颜色;

                  return (
                    <div
                      key={id}
                      className={`text-xs ${锁定颜色} pl-2 ${
                        !是否锁定 ? 'cursor-default' : 'opacity-60'
                      }`}
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 text-[8px] leading-none">
                        {状态 === '已解锁' ? '●' : 是否锁定 ? '○' : '◐'}
                      </span>
                      {节点.性癖子类型}
                      {节点.前置节点.length > 0 && (
                        <span className="text-gray-600 ml-1 text-[10px]">
                          (需: {节点.前置节点.map(p => p.split(':')[1]).join(', ')})
                        </span>
                      )}
                      <span className="text-gray-600 ml-2 text-[10px]">
                        强度 {对应已解锁 ? 对应已解锁.强度 : 节点.解锁强度}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==================== 子组件：敏感点探索地图 ====================

interface SensitivePointMapProps {
  npc: NPC结构;
  技巧列表: Array<{ 敏感点名称: string; 探索方式: string; 效果描述: string; 协同效果?: string[] }>;
  摘要: string;
}

function SensitivePointMap({ npc, 技巧列表, 摘要 }: SensitivePointMapProps) {
  const 主要敏感点 = npc.敏感点档案?.主要敏感点 ?? [];
  const 隐藏敏感点 = npc.敏感点档案?.隐藏敏感点 ?? [];
  const 全部敏感点 = [...主要敏感点, ...隐藏敏感点];

  const 按区域分组: Record<string, typeof 全部敏感点> = {};
  for (const 点 of 全部敏感点) {
    if (!按区域分组[点.区域]) {
      按区域分组[点.区域] = [];
    }
    按区域分组[点.区域].push(点);
  }

  const 开发程度颜色: Record<string, string> = {
    '未开发': 'text-gray-500',
    '初步探索': 'text-blue-400',
    '渐入佳境': 'text-green-400',
    '深度开发': 'text-yellow-400',
    '完全开发': 'text-pink-400',
  };

  const 发现状态颜色: Record<string, string> = {
    '未发觉': 'text-gray-600',
    '已发现': 'text-blue-400',
    '已开发': 'text-pink-400',
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{摘要}</p>

      {技巧列表.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-300">已发现技巧 ({技巧列表.length})</h4>
          {技巧列表.map((技巧, i) => (
            <div key={i} className="text-xs text-gray-400 pl-2 border-l border-gray-700 ml-1">
              <span className="text-pink-300">{技巧.敏感点名称}</span>
              {' + '}
              <span className="text-blue-300">{技巧.探索方式}</span>
              <span className="text-gray-500 ml-2">— {技巧.效果描述}</span>
              {技巧.协同效果 && 技巧.协同效果.length > 0 && (
                <span className="text-green-500 ml-2 text-[10px]">
                  协同: {技巧.协同效果.join(', ')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {Object.entries(按区域分组).map(([区域, 点列表]) => (
        <div key={区域} className="space-y-1">
          <h4 className="text-xs font-medium text-gray-300">{区域}</h4>
          <div className="pl-3 space-y-1 border-l border-gray-700 ml-1">
            {点列表.map(点 => {
              const 开发颜色 = 开发程度颜色[点.开发程度 ?? '未开发'];
              const 发现颜色 = 发现状态颜色[点.发现状态];
              return (
                <div key={点.名称} className="text-xs text-gray-400">
                  <span className={发现颜色}>{点.名称}</span>
                  <span className="text-gray-600 ml-2 text-[10px]">
                    [{点.发现状态}]
                  </span>
                  {点.开发程度 && 点.开发程度 !== '未开发' && (
                    <span className={`${开发颜色} ml-1 text-[10px]`}>
                      → {点.开发程度}
                    </span>
                  )}
                  <span className="text-gray-600 ml-2 text-[10px]">
                    敏感度 {点.敏感度}/5
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== 子组件：人格演化时间线 ====================

interface PersonalityTimelineProps {
  npc: NPC结构;
  演化路径: Array<{ 步骤序号: number; 触发时间: string; 触发目标: string; 旧表人格描述: string; 新表人格描述: string; 触发原因: string }>;
  觉醒进度: number;
  摘要: string;
}

function PersonalityTimeline({ npc, 演化路径, 觉醒进度, 摘要 }: PersonalityTimelineProps) {
  const 触发目标列表: 触发目标[] = ['表里互换', '欲望觉醒', '创伤封闭', '解放突破', '恢复原人格'];

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{摘要}</p>

      {/* 欲望觉醒进度条 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">欲望觉醒进度</span>
          <span className="text-pink-400 font-medium">{觉醒进度}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${觉醒进度}%` }}
          />
        </div>
      </div>

      {/* 可触发目标检查 */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">可触发演化</h4>
        <div className="pl-3 space-y-1 border-l border-gray-700 ml-1">
          {触发目标列表.map(目标 => {
            const 检查结果 = 检查触发条件(npc, 目标);
            return (
              <div key={目标} className="text-xs">
                <span className={检查结果.满足 ? 'text-green-400' : 'text-gray-500'}>
                  {检查结果.满足 ? '●' : '○'} {目标}
                </span>
                {!检查结果.满足 && 检查结果.缺失条件.length > 0 && (
                  <span className="text-gray-600 ml-2 text-[10px]">
                    ({检查结果.缺失条件[0]}...)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 演化历史 */}
      {演化路径.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-300">演化历史</h4>
          <div className="space-y-2">
            {演化路径.map(步骤 => (
              <div key={步骤.步骤序号} className="text-xs pl-3 border-l-2 border-pink-700 ml-1">
                <div className="text-gray-500 text-[10px]">{步骤.触发时间}</div>
                <div className="text-pink-300 font-medium">{步骤.触发目标}</div>
                <div className="text-gray-500 line-clamp-2">{步骤.触发原因}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
