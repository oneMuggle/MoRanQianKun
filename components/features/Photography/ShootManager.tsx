/**
 * 写真拍摄管理面板
 * 集成拍摄回合决策、模特情绪、后期处理、泄露应急响应
 */

import { useState } from 'react';
import type { 拍摄项目状态, 模特核心状态, 摄影师核心状态, 泄露事件状态 } from '../../../models/photographyNSFW/states';
import type { 回合决策, 情绪调节方式 } from '../../../models/photographyNSFW/shootDecisionSystem';
import type { 后期风格, 修图决策 } from '../../../models/photographyNSFW/postProcessing';
import type { 应急响应 } from '../../../models/photographyNSFW/leakResponse';
import {
  拍摄回合决策,
  模特情绪管理,
  信任度博弈评估,
} from '../../../models/photographyNSFW/shootDecisionSystem';
import {
  选择后期风格,
  修图决策 as 执行修图决策,
  作品评级,
} from '../../../models/photographyNSFW/postProcessing';
import {
  泄露检测,
  执行应急响应,
  泄露后果最小化,
} from '../../../models/photographyNSFW/leakResponse';

interface ShootManagerProps {
  项目: 拍摄项目状态;
  模特: 模特核心状态;
  摄影师: 摄影师核心状态;
  当前泄露?: 泄露事件状态 | null;
  游戏时间: string;
  持有金钱?: number;
  回合结束?: (结果: { 收益: number; 信任变化: number; 情绪变化: number }) => void;
}

type 活跃标签 = '拍摄' | '后期' | '泄露';

const 应急响应成本: Record<应急响应, number> = {
  '删除源文件': 0,
  '法律手段': 500,
  '公开承认': 0,
  '否认': 0,
  '追回': 300,
};

export function ShootManager({
  项目,
  模特,
  摄影师,
  当前泄露,
  游戏时间,
  持有金钱 = 0,
  回合结束,
}: ShootManagerProps) {
  const [活跃标签, set活跃标签] = useState<活跃标签>('拍摄');
  const [日志, set日志] = useState<string[]>([]);
  const [当前回合结果, set当前回合结果] = useState<{ 描述: string; 是否越界: boolean } | null>(null);
  const [检测到泄露, set检测到泄露] = useState<ReturnType<typeof 泄露检测> | null>(null);
  const [泄露响应结果, set泄露响应结果] = useState<{ 描述: string; 成功: boolean } | null>(null);

  const 添加日志 = (msg: string) => set日志(prev => [msg, ...prev].slice(0, 20));

  const 推荐策略 = 信任度博弈评估(模特, 项目);

  return (
    <div className="bg-gray-900/90 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-200">写真拍摄管理</h3>
        <div className="text-xs text-gray-500 mt-0.5">
          {项目.项目名称} — 回合 {项目.当前回合}/{项目.最大回合} | 当前尺度: {项目.实际尺度}
        </div>
      </div>

      <div className="flex border-b border-gray-700">
        {(['拍摄', '后期', '泄露'] as 活跃标签[]).map(tab => (
          <button
            key={tab}
            onClick={() => set活跃标签(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              活跃标签 === tab
                ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-3 max-h-96 overflow-y-auto space-y-3">
        {活跃标签 === '拍摄' && (
          <ShootTab
            项目={项目}
            模特={模特}
            摄影师={摄影师}
            推荐策略={推荐策略}
            添加日志={添加日志}
            set当前回合结果={set当前回合结果}
            回合结束={回合结束}
          />
        )}
        {活跃标签 === '后期' && (
          <PostProcessTab
            项目={项目}
            摄影师={摄影师}
            模特={模特}
            添加日志={添加日志}
          />
        )}
        {活跃标签 === '泄露' && (
          <LeakTab
            项目={项目}
            模特={模特}
            当前泄露={当前泄露 ?? null}
            持有金钱={持有金钱}
            游戏时间={游戏时间}
            检测到泄露={检测到泄露}
            set检测到泄露={set检测到泄露}
            泄露响应结果={泄露响应结果}
            set泄露响应结果={set泄露响应结果}
            添加日志={添加日志}
          />
        )}

        {当前回合结果 && (
          <div className={`border rounded p-2 text-xs ${当前回合结果.是否越界 ? 'border-red-800/50 bg-red-900/20' : 'border-gray-700 bg-gray-800/30'}`}>
            <div className={当前回合结果.是否越界 ? 'text-red-300' : 'text-gray-300'}>
              {当前回合结果.是否越界 && '⚠️ 越界风险！'}
            </div>
            <div className="text-gray-400 mt-1">{当前回合结果.描述}</div>
          </div>
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

// ==================== 子组件：拍摄标签 ====================

function ShootTab({
  项目, 模特, 摄影师, 推荐策略, 添加日志, set当前回合结果, 回合结束,
}: {
  项目: 拍摄项目状态;
  模特: 模特核心状态;
  摄影师: 摄影师核心状态;
  推荐策略: { 推荐策略: 回合决策; 风险评估: '低' | '中' | '高'; 描述: string };
  添加日志: (msg: string) => void;
  set当前回合结果: (v: { 描述: string; 是否越界: boolean } | null) => void;
  回合结束?: (结果: { 收益: number; 信任变化: number; 情绪变化: number }) => void;
}) {
  const 决策列表: 回合决策[] = ['推进尺度', '保持当前', '放缓节奏', '停止拍摄'];
  const 调节方式列表: 情绪调节方式[] = ['对话安抚', '休息调整', '小礼物', '专业引导'];

  return (
    <div className="space-y-3">
      {/* 模特状态 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-500">信任度</div>
          <div className={`text-lg font-bold ${模特.信任度 > 60 ? 'text-green-400' : 模特.信任度 > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {模特.信任度}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-500">安全感</div>
          <div className={`text-lg font-bold ${模特.安全感 > 60 ? 'text-green-400' : 模特.安全感 > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {模特.安全感}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-500">情绪</div>
          <div className="text-lg font-bold text-purple-400">{模特.自我认同 ?? 50}</div>
        </div>
      </div>

      {/* 策略推荐 */}
      <div className="text-xs text-gray-400 bg-gray-800/30 rounded p-2">
        <span className="text-gray-500">推荐策略：</span>
        <span className="text-purple-300">{推荐策略.推荐策略}</span>
        <span className={`ml-2 ${推荐策略.风险评估 === '高' ? 'text-red-400' : 推荐策略.风险评估 === '中' ? 'text-yellow-400' : 'text-green-400'}`}>
          风险: {推荐策略.风险评估}
        </span>
        <div className="text-gray-500 mt-1">{推荐策略.描述}</div>
      </div>

      {/* 回合决策 */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">回合决策</h4>
        <div className="grid grid-cols-2 gap-1">
          {决策列表.map(决策 => (
            <button
              key={决策}
              onClick={() => {
                const 结果 = 拍摄回合决策(决策, 项目, 模特, 摄影师);
                set当前回合结果({ 描述: 结果.描述, 是否越界: 结果.是否越界 });
                添加日志(`决策[${决策}]: ${结果.描述}`);
                if (结果.是否越界) 添加日志('⚠️ 检测到越界风险！');
                if (回合结束) {
                  回合结束({ 收益: 结果.收益变化, 信任变化: 结果.信任度变化, 情绪变化: 结果.模特情绪变化 });
                }
              }}
              className="px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-left"
            >
              <div className="text-gray-300">{决策}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 情绪调节 */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">情绪调节</h4>
        <div className="grid grid-cols-2 gap-1">
          {调节方式列表.map(方式 => (
            <button
              key={方式}
              onClick={() => {
                const 结果 = 模特情绪管理(方式, 模特, 项目);
                添加日志(`调节[${方式}]: ${结果.描述} (情绪+${结果.情绪变化}, 信任+${结果.信任变化})`);
                if (结果.成本 > 0) 添加日志(`花费: ${结果.成本}`);
              }}
              className="px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-left"
            >
              <div className="text-gray-300">{方式}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 子组件：后期处理标签 ====================

function PostProcessTab({
  项目, 摄影师, 模特, 添加日志,
}: {
  项目: 拍摄项目状态;
  摄影师: 摄影师核心状态;
  模特: 模特核心状态;
  添加日志: (msg: string) => void;
}) {
  const 风格列表: 后期风格[] = ['自然', '精修', 'AI增强', '艺术处理'];
  const 修图列表: 修图决策[] = ['保留敏感内容', '适度遮掩', '完全删除敏感内容'];

  const [已选风格, set已选风格] = useState<后期风格 | null>(null);
  const [已选修图, set已选修图] = useState<修图决策 | null>(null);
  const [评级结果, set评级结果] = useState<ReturnType<typeof 作品评级> | null>(null);

  return (
    <div className="space-y-3">
      {/* 后期风格选择 */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">后期风格</h4>
        <div className="grid grid-cols-2 gap-1">
          {风格列表.map(风格 => {
            const 预览 = 选择后期风格(风格, 项目, 摄影师, 模特);
            return (
              <button
                key={风格}
                onClick={() => {
                  set已选风格(风格);
                  添加日志(`风格选择[${风格}]: 质量+${预览.质量提升}, 泄露风险${预览.泄露风险变化 > 0 ? '+' : ''}${预览.泄露风险变化}`);
                  if (预览.成本 > 0) 添加日志(`成本: ${预览.成本}`);
                }}
                className={`px-2 py-1.5 text-xs rounded border text-left ${
                  已选风格 === 风格
                    ? 'bg-purple-900/40 border-purple-600 text-purple-300'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300'
                }`}
              >
                <div>{风格}</div>
                <div className="text-gray-500 text-[10px]">
                  质量+{预览.质量提升} | 风险{预览.泄露风险变化 > 0 ? '+' : ''}{预览.泄露风险变化}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 修图决策 */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">修图决策</h4>
        <div className="space-y-1">
          {修图列表.map(决策 => (
            <button
              key={决策}
              onClick={() => {
                set已选修图(决策);
                const 结果 = 执行修图决策(决策, 项目, 模特);
                添加日志(`修图[${决策}]: 泄露风险${结果.泄露风险变化 > 0 ? '+' : ''}${结果.泄露风险变化}`);
              }}
              className={`w-full px-2 py-1.5 text-xs rounded border text-left ${
                已选修图 === 决策
                  ? 'bg-purple-900/40 border-purple-600 text-purple-300'
                  : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300'
              }`}
            >
              <div className="text-gray-300">{决策}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 执行评级 */}
      {已选风格 && 已选修图 && (
        <button
          onClick={() => {
            const 评级 = 作品评级(项目, 摄影师, 模特, 已选风格, 已选修图);
            set评级结果(评级);
            添加日志(`作品评级: ${评级.评级}(${评级.质量分数}分) 满意度:${评级.模特满意度}`);
          }}
          className="w-full px-3 py-2 text-xs bg-purple-700 hover:bg-purple-600 rounded text-gray-100 font-medium"
        >
          执行后期处理并评级
        </button>
      )}

      {评级结果 && (
        <div className="border border-purple-700/50 rounded p-2 bg-purple-900/20">
          <div className="text-sm font-bold text-purple-300">评级: {评级结果.评级}</div>
          <div className="text-xs text-gray-400 mt-1">质量分数: {评级结果.质量分数}</div>
          <div className="text-xs text-gray-400">模特满意度: {评级结果.模特满意度}</div>
          <div className="text-xs text-gray-500 mt-1">{评级结果.描述}</div>
        </div>
      )}
    </div>
  );
}

// ==================== 子组件：泄露应急标签 ====================

function LeakTab({
  项目,
  模特,
  当前泄露,
  持有金钱,
  游戏时间,
  检测到泄露,
  set检测到泄露,
  泄露响应结果,
  set泄露响应结果,
  添加日志,
}: {
  项目: 拍摄项目状态;
  模特: 模特核心状态;
  当前泄露: 泄露事件状态 | null;
  持有金钱: number;
  游戏时间: string;
  检测到泄露: ReturnType<typeof 泄露检测> | null;
  set检测到泄露: (v: ReturnType<typeof 泄露检测> | null) => void;
  泄露响应结果: { 描述: string; 成功: boolean } | null;
  set泄露响应结果: (v: { 描述: string; 成功: boolean } | null) => void;
  添加日志: (msg: string) => void;
}) {
  const 响应列表: 应急响应[] = ['删除源文件', '法律手段', '公开承认', '否认', '追回'];

  return (
    <div className="space-y-3">
      {/* 泄露检测按钮 */}
      <button
        onClick={() => {
          const 结果 = 泄露检测(项目, 模特, Date.now());
          set检测到泄露(结果);
          添加日志(`检测: ${结果.描述}`);
          if (结果.是否发现泄露) 添加日志('⚠️ 发现泄露！');
        }}
        className="w-full px-3 py-2 text-xs bg-red-900/40 hover:bg-red-800/50 rounded border border-red-700/50 text-red-300"
      >
        泄露检测（当前风险评分: {项目.泄露风险评分}）
      </button>

      {/* 检测结果 */}
      {检测到泄露 && (
        <div className={`border rounded p-2 text-xs ${检测到泄露.是否发现泄露 ? 'border-red-800/50 bg-red-900/20' : 'border-green-800/50 bg-green-900/20'}`}>
          <div className={检测到泄露.是否发现泄露 ? 'text-red-300' : 'text-green-300'}>
            {检测到泄露.是否发现泄露 ? '⚠️ 检测到泄露' : '安全：未检测到异常'}
          </div>
          <div className="text-gray-400 mt-1">{检测到泄露.描述}</div>
          {检测到泄露.是否发现泄露 && (
            <div className="text-gray-500 mt-1">类型: {检测到泄露.泄露类型} | 传播: {检测到泄露.传播范围}</div>
          )}
        </div>
      )}

      {/* 应急响应 */}
      {当前泄露 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-red-300">⚠️ 活跃泄露：{当前泄露.传播范围}</h4>
          <div className="grid grid-cols-2 gap-1">
            {响应列表.map(响应 => (
              <button
                key={响应}
                onClick={() => {
                  const 结果 = 执行应急响应(响应, 当前泄露, { 持有金钱 }, 游戏时间);
                  set泄露响应结果({ 描述: 结果.描述, 成功: 结果.成功 });
                  添加日志(`响应[${响应}]: ${结果.描述}${结果.成功 ? '' : ' ——失败'}`);
                }}
                className="px-2 py-1.5 text-xs bg-red-900/40 hover:bg-red-800/50 rounded border border-red-700/50 text-left"
              >
                <div className="text-gray-300">{响应}</div>
                <div className="text-gray-500 text-[10px]">成本: ¥{应急响应成本[响应]}</div>
              </button>
            ))}
          </div>

          {/* 后果最小化 */}
          <button
            onClick={() => {
              const 结果 = 泄露后果最小化(1, 当前泄露, 项目);
              添加日志(`最小化: ${结果.描述} 传播→${结果.传播范围变化}`);
            }}
            className="w-full px-2 py-1.5 text-xs bg-orange-900/40 hover:bg-orange-800/50 rounded border border-orange-700/50 text-gray-300"
          >
            快速响应（1回合内）
          </button>
        </div>
      )}

      {泄露响应结果 && (
        <div className={`border rounded p-2 text-xs ${泄露响应结果.成功 ? 'border-green-800/50 bg-green-900/20' : 'border-red-800/50 bg-red-900/20'}`}>
          <div className={泄露响应结果.成功 ? 'text-green-300' : 'text-red-300'}>
            {泄露响应结果.成功 ? '响应成功' : '响应失败'}
          </div>
          <div className="text-gray-400 mt-1">{泄露响应结果.描述}</div>
        </div>
      )}
    </div>
  );
}
