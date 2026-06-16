/**
 * 暴露风险主动玩法面板
 * 集成潜行策略、谣言管理、场景互动选项
 */

import { useState } from 'react';
import type { 露出状态, 网络流言状态, 名誉状态 } from '../../../models/exposureNSFW/types';
import type { 潜行策略, 紧急应对 } from '../../../models/exposureNSFW/stealthMechanics';
import type { 反制策略, 声誉修复方式 } from '../../../models/exposureNSFW/rumorManagement';
import {
  选择潜行策略,
  紧急应对 as 执行紧急应对,
  计算潜行成功率,
  获取反侦察等级,
} from '../../../models/exposureNSFW/stealthMechanics';
import {
  反制谣言,
  谣言溯源,
  声誉修复,
} from '../../../models/exposureNSFW/rumorManagement';
import {
  获取场景互动选项,
  执行场景互动,
  获取可用道具,
} from '../../../models/exposureNSFW/sceneInteraction';

interface ExposurePanelProps {
  露出状态: 露出状态;
  流言状态?: 网络流言状态;
  名誉状态?: 名誉状态;
  场景类型?: string;
  天气?: string;
  亲密度?: number;
  声誉?: number;
  持有金钱?: number;
  游戏时间: string;
}

type 活跃标签 = '潜行' | '谣言' | '场景';

export function ExposurePanel({
  露出状态: 状态,
  流言状态,
  名誉状态,
  场景类型 = 'default',
  天气,
  亲密度 = 0,
  声誉 = 50,
  持有金钱 = 0,
  游戏时间,
}: ExposurePanelProps) {
  const [活跃标签, set活跃标签] = useState<活跃标签>('潜行');
  const [日志, set日志] = useState<string[]>([]);
  const [当前被发现程度, set当前被发现程度] = useState<'轻微可疑' | '明显暴露' | '当众曝光' | null>(null);

  const 反侦察等级 = 获取反侦察等级(状态);

  const 添加日志 = (msg: string) => set日志(prev => [msg, ...prev].slice(0, 20));

  return (
    <div className="bg-gray-900/90 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-200">暴露风险管理</h3>
      </div>

      <div className="flex border-b border-gray-700">
        {(['潜行', '谣言', '场景'] as 活跃标签[]).map(tab => (
          <button
            key={tab}
            onClick={() => set活跃标签(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              活跃标签 === tab
                ? 'text-orange-400 border-b-2 border-orange-400 bg-gray-800/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-3 max-h-96 overflow-y-auto space-y-3">
        {活跃标签 === '潜行' && (
          <StealthTab
            反侦察等级={反侦察等级}
            状态={状态}
            游戏时间={游戏时间}
            当前被发现程度={当前被发现程度}
            set当前被发现程度={set当前被发现程度}
            添加日志={添加日志}
            亲密度={亲密度}
            声誉={声誉}
            持有金钱={持有金钱}
          />
        )}
        {活跃标签 === '谣言' && (
          <RumorTab
            流言状态={流言状态}
            名誉状态={名誉状态}
            亲密度={亲密度}
            声誉={声誉}
            持有金钱={持有金钱}
            游戏时间={游戏时间}
            添加日志={添加日志}
          />
        )}
        {活跃标签 === '场景' && (
          <SceneTab
            场景类型={场景类型}
            天气={天气}
            添加日志={添加日志}
          />
        )}

        {日志.length > 0 && (
          <div className="border-t border-gray-700 pt-2 mt-2">
            <h4 className="text-xs font-medium text-gray-400 mb-1">操作日志</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {日志.slice(0, 5).map((l, i) => (
                <div key={i} className="text-xs text-gray-500 pl-2 border-l border-gray-700">{l}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 子组件：潜行标签 ====================

function StealthTab({
  反侦察等级, 状态, 游戏时间, 当前被发现程度, set当前被发现程度, 添加日志,
  亲密度, 声誉, 持有金钱,
}: {
  反侦察等级: number;
  状态: 露出状态;
  游戏时间: string;
  当前被发现程度: '轻微可疑' | '明显暴露' | '当众曝光' | null;
  set当前被发现程度: (v: '轻微可疑' | '明显暴露' | '当众曝光' | null) => void;
  添加日志: (msg: string) => void;
  亲密度: number;
  声誉: number;
  持有金钱: number;
}) {
  const 策略列表: 潜行策略[] = ['低调行动', '快速通过', '伪装', '分散注意力'];
  const 应对列表: 紧急应对[] = ['逃跑', '解释', '威胁', '贿赂'];

  const 上下文 = {
    露出等级: 状态.当前等级,
    场景发现概率: 0.3,
    周围人数: 3,
    旁观者察觉概率: 0.4,
    服装暴露度: 50,
    时间隐私度: 50,
    反侦察等级,
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400">
        反侦察等级: <span className="text-orange-300">{反侦察等级}/5</span>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">潜行策略</h4>
        <div className="grid grid-cols-2 gap-1">
          {策略列表.map(策略 => {
            const 成功率 = 计算潜行成功率(策略, 上下文);
            return (
              <button
                key={策略}
                onClick={() => {
                  const 结果 = 选择潜行策略(策略, 上下文, 游戏时间);
                  添加日志(`潜行[${策略}]: ${结果.描述}`);
                  if (!结果.成功 && 结果.被发现程度 !== '完全隐蔽') {
                    set当前被发现程度(结果.被发现程度 === '轻微可疑' ? '轻微可疑' : 结果.被发现程度 === '明显暴露' ? '明显暴露' : '当众曝光');
                  } else {
                    set当前被发现程度(null);
                  }
                }}
                className="px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-left"
              >
                <div className="text-gray-300">{策略}</div>
                <div className={`text-[10px] ${成功率 > 0.7 ? 'text-green-400' : 成功率 > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                  成功率 {Math.round(成功率 * 100)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {当前被发现程度 && (
        <div className="space-y-1 border border-red-800/50 rounded p-2 bg-red-900/20">
          <h4 className="text-xs font-medium text-red-300">⚠️ 被发现：{当前被发现程度}</h4>
          <div className="grid grid-cols-2 gap-1">
            {应对列表.map(应对 => (
              <button
                key={应对}
                onClick={() => {
                  const 结果 = 执行紧急应对(应对, 当前被发现程度, { 亲密度, 声誉, 持有金钱 }, 游戏时间);
                  添加日志(`应对[${应对}]: ${结果.描述}`);
                  if (结果.成功) set当前被发现程度(null);
                }}
                className="px-2 py-1.5 text-xs bg-red-900/40 hover:bg-red-800/50 rounded border border-red-700/50 text-left"
              >
                <div className="text-gray-300">{应对}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 子组件：谣言标签 ====================

function RumorTab({
  流言状态, 名誉状态, 亲密度, 声誉, 持有金钱, 游戏时间, 添加日志,
}: {
  流言状态?: 网络流言状态;
  名誉状态?: 名誉状态;
  亲密度: number;
  声誉: number;
  持有金钱: number;
  游戏时间: string;
  添加日志: (msg: string) => void;
}) {
  const 反制策略列表: 反制策略[] = ['辟谣', '转移注意力', '反向造谣', '收买关键人物'];
  const 修复方式列表: 声誉修复方式[] = ['慈善行为', '公开露面', '关系修复', '低调行事'];

  if (!流言状态) {
    return <div className="text-xs text-gray-500">当前没有活跃流言</div>;
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400 space-y-1">
        <div>流言等级: <span className={流言状态.当前等级 > 50 ? 'text-red-400' : 'text-yellow-400'}>{流言状态.当前等级}</span></div>
        <div>传播渠道: {流言状态.传播渠道.join(', ')}</div>
        <div>辟谣状态: {流言状态.辟谣状态}</div>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">反制策略</h4>
        <div className="grid grid-cols-2 gap-1">
          {反制策略列表.map(策略 => (
            <button
              key={策略}
              onClick={() => {
                const 结果 = 反制谣言(策略, 流言状态, { 亲密度, 声誉, 持有金钱 }, 游戏时间);
                添加日志(`反制[${策略}]: ${结果.描述}`);
              }}
              className="px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-left"
            >
              <div className="text-gray-300">{策略}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          const 结果 = 谣言溯源(流言状态, { 声誉 });
          添加日志(`溯源: ${结果.描述}`);
        }}
        className="w-full px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-gray-300"
      >
        谣言溯源
      </button>

      {名誉状态 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-300">声誉修复</h4>
          <div className="grid grid-cols-2 gap-1">
            {修复方式列表.map(方式 => (
              <button
                key={方式}
                onClick={() => {
                  const 结果 = 声誉修复(方式, 名誉状态, 游戏时间);
                  添加日志(`修复[${方式}]: ${结果.描述}`);
                }}
                className="px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-left"
              >
                <div className="text-gray-300">{方式}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 子组件：场景标签 ====================

function SceneTab({
  场景类型, 天气, 添加日志,
}: {
  场景类型: string;
  天气?: string;
  添加日志: (msg: string) => void;
}) {
  const 互动选项 = 获取场景互动选项(场景类型);
  const 可用道具列表 = 获取可用道具(场景类型, 天气);

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400">
        当前场景: <span className="text-orange-300">{场景类型}</span>
        {天气 && <span className="ml-2">天气: {天气}</span>}
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">场景互动</h4>
        <div className="space-y-1">
          {互动选项.map(选项 => (
            <button
              key={选项.id}
              onClick={() => {
                const 结果 = 执行场景互动(选项.id, 场景类型);
                添加日志(`互动[${选项.名称}]: ${结果.描述} (${结果.成功 ? '成功' : '失败'})`);
              }}
              className="w-full px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-left"
            >
              <div className="text-gray-300">{选项.名称}</div>
              <div className="text-gray-500 text-[10px]">{选项.描述}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">可用道具</h4>
        <div className="grid grid-cols-2 gap-1">
          {可用道具列表.map(道具 => (
            <div
              key={道具}
              className="px-2 py-1.5 text-xs bg-gray-800 rounded border border-gray-600 text-gray-400"
            >
              <div>{道具}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
