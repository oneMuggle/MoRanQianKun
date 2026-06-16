/**
 * RpgBattleIntegration.tsx
 *
 * 将 BattleModal 与 RpgBattleEngine 连接的集成组件。
 * 在现有战斗面板中注入 RPG 引擎驱动的行动执行。
 */

import React, { useEffect, useRef } from 'react';
import { useRpgStateBridge } from '../../../hooks/useRpgStateBridge';
import type { BattleActor } from '../../../hooks/useGame/engine/rpgBattleEngine';
import type { 角色数据结构 } from '../../../models/character';
import type { 战斗状态结构 } from '@/types';
import type { PlayerAction } from '../../../hooks/useGame/engine/types';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import { IconSwords, IconShield } from '../../ui/Icons';

interface Props {
  character: 角色数据结构;
  battle: 战斗状态结构;
  onBattleEnd?: (outcome: 'victory' | 'defeat' | 'flee') => void;
}

type RpgCombatAction = {
  id: string;
  type: PlayerAction['type'];
  name: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
};

const ACTIONS: RpgCombatAction[] = [
  {
    id: 'attack',
    type: 'attack',
    name: '普通攻击',
    description: '基础近战攻击，消耗少量精力',
    icon: <IconSwords size={14} />,
    colorClass: 'text-red-300 border-red-900/40 bg-red-950/30',
  },
  {
    id: 'defend',
    type: 'defend',
    name: '防御',
    description: '减少本回合受到的伤害',
    icon: <IconShield size={14} />,
    colorClass: 'text-blue-300 border-blue-900/40 bg-blue-950/30',
  },
];

export const RpgBattleIntegration: React.FC<Props> = ({ character, battle, onBattleEnd }) => {
  const bridge = useRpgStateBridge();
  const hasInitialized = useRef(false);

  const { rpgBattleActive, rpgBattleRound, rpgBattleCurrentActor, rpgBattleLog, rpgBattlePlayerHP, rpgBattleOutcome } = useGameStore(
    useShallow((s) => ({
      rpgBattleActive: s.rpgBattleActive,
      rpgBattlePhase: s.rpgBattlePhase,
      rpgBattleRound: s.rpgBattleRound,
      rpgBattleCurrentActor: s.rpgBattleCurrentActor,
      rpgBattleLog: s.rpgBattleLog,
      rpgBattlePlayerHP: s.rpgBattlePlayerHP,
      rpgBattleOutcome: s.rpgBattleOutcome,
    }))
  );

  // 初始化：当战斗状态存在且引擎未激活时，初始化 RPG 战斗
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!bridge.battleEngineRef.current) return;

    const enemyList = Array.isArray(battle?.敌方) ? battle.敌方 : [];
    if (enemyList.length === 0) return;

    const actors: BattleActor[] = [
      {
        id: 'player',
        name: character.姓名 || '无名侠客',
        side: 'player' as const,
        character,
      },
      ...enemyList.map((enemy, idx) => ({
        id: `enemy-${idx}`,
        name: enemy.名字 || `无名游卒 ${idx + 1}`,
        side: 'enemy' as const,
        enemy,
      })),
    ];

    bridge.initBattle(actors);
    bridge.syncBattleState();
    hasInitialized.current = true;
  }, [bridge, character, battle.敌方]);

  // 监听战斗结束
  useEffect(() => {
    if (!rpgBattleOutcome) return;
    const mappedOutcome: 'victory' | 'defeat' | 'flee' =
      rpgBattleOutcome === 'player' ? 'victory' : rpgBattleOutcome === 'enemy' ? 'defeat' : 'defeat';
    onBattleEnd?.(mappedOutcome);
  }, [rpgBattleOutcome, onBattleEnd]);

  // 执行行动
  const executeAction = React.useCallback(
    (action: RpgCombatAction) => {
      if (!rpgBattleActive) return;

      const enemyList = Array.isArray(battle?.敌方) ? battle.敌方 : [];
      const aliveEnemy = enemyList.find((e) => (e.当前血量 || 0) > 0);
      if (!aliveEnemy && action.type !== 'defend') return;

      const targetId = aliveEnemy
        ? `enemy-${enemyList.indexOf(aliveEnemy)}`
        : 'player';

      const success = bridge.executeAttack(targetId);
      if (success) {
        bridge.syncBattleState();
        setTimeout(() => {
          bridge.advanceBattleTurn();
          bridge.syncBattleState();
        }, 500);
      }
    },
    [bridge, battle, rpgBattleActive]
  );

  // 如果 RPG 引擎未激活，不渲染
  if (!rpgBattleActive) return null;

  const recentLogs = rpgBattleLog.slice(-5).reverse();

  return (
    <div className="border-t border-wuxia-gold/10 pt-4">
      {/* RPG 战斗状态栏 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-wuxia-gold/70 font-serif">
            第 {rpgBattleRound} 回合
          </span>
          {rpgBattleCurrentActor && (
            <span className="text-red-300/80">
              当前: {rpgBattleCurrentActor}
            </span>
          )}
        </div>
        {rpgBattlePlayerHP && (
          <div className="text-xs font-mono text-gray-300">
            HP: {rpgBattlePlayerHP.current}/{rpgBattlePlayerHP.max}
          </div>
        )}
      </div>

      {/* 行动按钮 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => executeAction(action)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all
              ${action.colorClass}
              hover:scale-[1.02] hover:shadow-lg
            `}
          >
            <span className="shrink-0">{action.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-serif">{action.name}</div>
              <div className="text-[10px] opacity-60">{action.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* 战斗日志 */}
      {recentLogs.length > 0 && (
        <div className="rounded-lg border border-gray-800/50 bg-black/40 p-3 max-h-40 overflow-y-auto">
          <div className="text-[10px] text-wuxia-gold/50 font-serif mb-1 tracking-wider">
            战斗记录
          </div>
          {recentLogs.map((log, idx) => (
            <div
              key={`log-${idx}`}
              className="text-xs text-gray-300 py-0.5 border-l-2 border-gray-700/50 pl-2"
            >
              <span className="text-gray-500">[R{log.round}]</span>{' '}
              <span className="text-wuxia-gold/70">{log.actorId}</span>{' '}
              {log.action}
              {log.targetId && <> → {log.targetId}</>}
              {log.damage !== undefined && (
                <span className={log.damage > 0 ? 'text-red-400' : 'text-gray-400'}>
                  {' '}
                  -{log.damage}
                </span>
              )}
              {log.isCrit && <span className="text-yellow-400 ml-1">暴击!</span>}
              {log.isDodge && <span className="text-cyan-400 ml-1">闪避!</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 检查是否应使用 RPG 战斗模式。
 */
export function shouldUseRpgBattle(battle: 战斗状态结构): boolean {
  return !!(battle as unknown as Record<string, unknown>).useRpgEngine;
}
