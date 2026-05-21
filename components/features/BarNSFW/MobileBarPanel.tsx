/**
 * 酒吧 NSFW 移动端面板
 *
 * 为移动设备优化的全屏酒吧状态面板。
 */

import React, { useState } from 'react';
import type { 酒吧NSFW状态, 酒吧操作类型, 酒吧NSFW设置 } from '../../../models/contemporary/barNSFW/types';

interface Props {
  barState: 酒吧NSFW状态 | null;
  settings: 酒吧NSFW设置;
  onAction: (action: 酒吧操作类型, payload?: Record<string, unknown>) => void;
  onLeave: () => void;
  onClose: () => void;
}

const DRUNK_COLORS: Record<string, { bg: string; text: string }> = {
  清醒: { bg: 'bg-emerald-500', text: 'text-emerald-300' },
  微醺: { bg: 'bg-yellow-500', text: 'text-yellow-300' },
  上头: { bg: 'bg-orange-500', text: 'text-orange-300' },
  大醉: { bg: 'bg-red-500', text: 'text-red-300' },
  烂醉: { bg: 'bg-purple-500', text: 'text-purple-300' },
};

const ACTION_ICONS: Record<酒吧操作类型, string> = {
  '进入酒吧': '🚪',
  '点酒': '🍸',
  '搭讪': '💬',
  '邀请跳舞': '💃',
  '邀请唱歌': '🎤',
  '邀请喝酒': '🍻',
  '玩骰子': '🎲',
  '真心话大冒险': '🃏',
  '单独聊天': '🤝',
  '离开酒吧': '🚶',
};

const MobileBarPanel: React.FC<Props> = ({ barState, settings, onAction, onLeave, onClose }) => {
  const [showSettings, setShowSettings] = useState(false);

  if (!barState || !barState.已激活) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-sm rounded-xl bg-gray-900 p-6 text-center">
          <p className="mb-4 text-sm text-gray-400">酒吧场景未激活</p>
          <button
            className="rounded-lg bg-amber-700/50 px-4 py-2 text-sm text-amber-100"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  const consumer = barState.消费者状态;
  const drunkColor = DRUNK_COLORS[consumer?.醉酒程度 || '清醒'] || DRUNK_COLORS['清醒'];
  const drunkValue = consumer?.醉酒值 || 0;
  const excitementValue = consumer?.兴奋程度 || 0;

  const availableActions: 酒吧操作类型[] = [
    '点酒', '搭讪', '邀请跳舞', '邀请唱歌',
    '邀请喝酒', '玩骰子', '真心话大冒险', '单独聊天', '离开酒吧',
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <h2 className="text-base font-semibold text-amber-300">{barState.当前场所?.场所名称 || '酒吧'}</h2>
        <button className="rounded px-2 py-1 text-xs bg-gray-700 text-white" onClick={() => setShowSettings(!showSettings)}>
          ⚙
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-900/95 px-4 py-3">
        {/* 场所信息 */}
        {barState.当前场所 && (
          <div className="mb-3 rounded-lg bg-gray-800/60 px-3 py-2 text-xs text-gray-400">
            <p>{barState.当前场所.类型} · {barState.当前场所.档次}</p>
            <p>客流 {barState.当前场所.当前客流}% · 包厢 {barState.当前场所.包厢占用}%</p>
          </div>
        )}

        {/* 状态条 */}
        {consumer && (
          <div className="mb-3 space-y-2">
            {/* 醉酒 */}
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className={drunkColor.text}>🍺 醉酒</span>
                <span>{drunkValue}% {consumer.醉酒程度}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-700">
                <div
                  className={`h-full rounded-full ${drunkColor.bg}`}
                  style={{ width: `${drunkValue}%` }}
                />
              </div>
            </div>
            {/* 兴奋 */}
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-pink-300">🔥 兴奋</span>
                <span>{excitementValue}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-pink-500"
                  style={{ width: `${excitementValue}%` }}
                />
              </div>
            </div>
            {/* 理智 */}
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-blue-300">🧠 理智</span>
                <span>{consumer.理智程度}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${consumer.理智程度}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 操作网格 */}
        <div className="mb-3">
          <p className="mb-2 text-xs text-gray-500">操作</p>
          <div className="grid grid-cols-3 gap-2">
            {availableActions.map((action) => (
              <button
                key={action}
                className="flex flex-col items-center justify-center rounded-xl bg-gray-700/60 py-3 text-xs text-gray-200 active:bg-gray-600/80"
                onClick={() => action === '离开酒吧' ? onLeave() : onAction(action)}
              >
                <span className="text-lg">{ACTION_ICONS[action]}</span>
                <span className="mt-1">{action}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 在场 NPC */}
        {barState.在场NPC.length > 0 && (
          <div className="mb-3 rounded-lg bg-gray-800/60 px-3 py-2">
            <p className="mb-1 text-xs text-gray-500">在场</p>
            <div className="flex flex-wrap gap-1">
              {barState.在场NPC.map((id) => (
                <span key={id} className="rounded-full bg-amber-800/40 px-2 py-0.5 text-xs text-amber-200">
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 当前事件 */}
        {barState.当前事件 && (
          <div className="mb-3 rounded-lg bg-purple-800/30 px-3 py-2 text-xs text-purple-300">
            事件: {barState.当前事件}
          </div>
        )}

        {/* 设置 */}
        {showSettings && (
          <div className="mb-3 rounded-lg bg-gray-800/80 px-3 py-3 text-xs">
            <p className="mb-2 text-amber-300">设置</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.启用} readOnly className="accent-amber-500" />
                启用
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.启用醉酒系统} readOnly className="accent-amber-500" />
                醉酒
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.启用危机事件} readOnly className="accent-amber-500" />
                危机
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.启用陪酒服务} readOnly className="accent-amber-500" />
                陪酒
              </label>
              <p>强度: {settings.内容强度}</p>
              <p>尺度: {settings.尺度上限}</p>
            </div>
          </div>
        )}

        {/* 回合信息 */}
        <div className="pb-4 text-center text-xs text-gray-600">
          回合 {barState.回合数} · 事件 {barState.历史事件.length}
        </div>
      </div>

      {/* 底部关闭按钮 */}
      <div className="bg-gray-900 px-4 py-3">
        <button
          className="w-full rounded-lg bg-red-700/50 py-3 text-sm text-red-100 active:bg-red-700/70"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  );
};

export default MobileBarPanel;
