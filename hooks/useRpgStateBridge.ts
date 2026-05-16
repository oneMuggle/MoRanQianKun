/**
 * useRpgStateBridge.ts
 *
 * RPG 引擎状态 → React 状态桥接层。
 * 将 RpgBattleEngine 等 RPG 引擎的内部状态映射为 UI 可消费的 React state。
 */

import * as React from 'react';
import type { RpgBattleEngine, BattleSnapshot, BattleLogEntry, BattleOutcome } from './useGame/engine/rpgBattleEngine';
import type { RpgEquipEngine } from './useGame/engine/rpgEquipEngine';
import type { RpgKungfuEngine } from './useGame/engine/rpgKungfuEngine';
import type { RpgTaskEngine } from './useGame/engine/rpgTaskEngine';
import type { RpgSectEngine } from './useGame/engine/rpgSectEngine';
import type { RpgItemEngine } from './useGame/engine/rpgItemEngine';
import type { CombatStats } from './useGame/rpg/battle/damageCalculator';
import type { BattlePhase } from './useGame/rpg/battle/battleStateMachine';
import type { PlayerAction } from './useGame/engine/types';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';

export interface RpgBattleStateSnapshot {
  battleActive: boolean;
  phase: BattlePhase | null;
  round: number;
  snapshot: BattleSnapshot | null;
  currentActorName: string | null;
  playerStats: CombatStats | null;
  playerHP: { current: number; max: number } | null;
  log: ReadonlyArray<BattleLogEntry>;
  outcome: BattleOutcome | null;
}

export interface UseRpgStateBridgeReturn {
  battleEngineRef: React.RefObject<RpgBattleEngine | null>;
  equipEngineRef: React.RefObject<RpgEquipEngine | null>;
  itemEngineRef: React.RefObject<RpgItemEngine | null>;
  kungfuEngineRef: React.RefObject<RpgKungfuEngine | null>;
  taskEngineRef: React.RefObject<RpgTaskEngine | null>;
  sectEngineRef: React.RefObject<RpgSectEngine | null>;

  getBattleSnapshot: () => RpgBattleStateSnapshot | null;
  syncBattleState: () => void;
  initBattle: (actors: Parameters<RpgBattleEngine['initBattle']>[0]) => void;
  executeAttack: (targetId: string, bodyPart?: string) => boolean;
  executeSkill: (targetId: string, kungfuId: string, bodyPart?: string) => boolean;
  executeDefend: () => boolean;
  advanceBattleTurn: () => void;
  syncAllEnginesState: () => void;
  isBattleActive: () => boolean;
}

export function useRpgStateBridge(): UseRpgStateBridgeReturn {
  const battleEngineRef = React.useRef<RpgBattleEngine | null>(null);
  const equipEngineRef = React.useRef<RpgEquipEngine | null>(null);
  const itemEngineRef = React.useRef<RpgItemEngine | null>(null);
  const kungfuEngineRef = React.useRef<RpgKungfuEngine | null>(null);
  const taskEngineRef = React.useRef<RpgTaskEngine | null>(null);
  const sectEngineRef = React.useRef<RpgSectEngine | null>(null);

  const { setRpgState } = useGameStore(
    useShallow((s) => ({
      setRpgState: s.setRpgState,
    }))
  );

  const getBattleSnapshot = React.useCallback((): RpgBattleStateSnapshot | null => {
    const engine = battleEngineRef.current;
    if (!engine) return null;

    const snapshot = engine.getBattleSnapshot();
    const playerStats = engine.getPlayerStats();

    let currentActorName: string | null = null;
    if (snapshot) {
      const currentActor = snapshot.actors.find((a) => a.id === snapshot.currentActorId);
      if (currentActor) currentActorName = currentActor.name;
    }

    let playerHP: { current: number; max: number } | null = null;
    if (snapshot) {
      const playerActor = snapshot.actors.find((a) => a.side === 'player');
      if (playerActor) {
        playerHP = { current: playerActor.currentHP, max: playerActor.maxHP };
      }
    }

    return {
      battleActive: engine.isActive,
      phase: engine.isActive ? engine.phase : null,
      round: engine.round,
      snapshot,
      currentActorName,
      playerStats,
      playerHP,
      log: engine.getBattleLog(),
      outcome: engine.getOutcome(),
    };
  }, []);

  const syncBattleState = React.useCallback(() => {
    const snap = getBattleSnapshot();
    if (!snap) return;

    setRpgState({
      rpgBattleActive: snap.battleActive,
      rpgBattlePhase: snap.phase,
      rpgBattleRound: snap.round,
      rpgBattleCurrentActor: snap.currentActorName,
      rpgBattleLog: Array.from(snap.log),
      rpgBattlePlayerHP: snap.playerHP,
      rpgBattleOutcome: snap.outcome?.winner ?? null,
    });
  }, [getBattleSnapshot, setRpgState]);

  const initBattle = React.useCallback(
    (actors: Parameters<RpgBattleEngine['initBattle']>[0]) => {
      const engine = battleEngineRef.current;
      if (!engine) return;
      engine.initBattle(actors);
      syncBattleState();
    },
    [syncBattleState]
  );

  const executeAttack = React.useCallback(
    (targetId: string, bodyPart?: string): boolean => {
      const engine = battleEngineRef.current;
      if (!engine || !engine.isActive) return false;

      const currentActor = engine.getCurrentActor();
      if (!currentActor || currentActor.side !== 'player') return false;

      const action: PlayerAction = {
        id: `attack-${Date.now()}`,
        engineType: 'rpgBattle',
        type: 'attack',
        payload: { targetId, bodyPart },
        timestamp: Date.now(),
      };

      const result = engine.executePlayerAction(action);
      if (result.success) syncBattleState();
      return result.success;
    },
    [syncBattleState]
  );

  const executeSkill = React.useCallback(
    (targetId: string, kungfuId: string, bodyPart?: string): boolean => {
      const engine = battleEngineRef.current;
      if (!engine || !engine.isActive) return false;

      const currentActor = engine.getCurrentActor();
      if (!currentActor || currentActor.side !== 'player') return false;

      const action: PlayerAction = {
        id: `skill-${Date.now()}`,
        engineType: 'rpgBattle',
        type: 'skill_attack',
        payload: { targetId, kungfuId, bodyPart },
        timestamp: Date.now(),
      };

      const result = engine.executePlayerAction(action);
      if (result.success) syncBattleState();
      return result.success;
    },
    [syncBattleState]
  );

  const executeDefend = React.useCallback((): boolean => {
    const engine = battleEngineRef.current;
    if (!engine || !engine.isActive) return false;

    const currentActor = engine.getCurrentActor();
    if (!currentActor || currentActor.side !== 'player') return false;

    const action: PlayerAction = {
      id: `defend-${Date.now()}`,
      engineType: 'rpgBattle',
      type: 'defend',
      payload: {},
      timestamp: Date.now(),
    };

    const result = engine.executePlayerAction(action);
    if (result.success) syncBattleState();
    return result.success;
  }, [syncBattleState]);

  const advanceBattleTurn = React.useCallback(() => {
    const engine = battleEngineRef.current;
    if (!engine) return;
    engine.advanceTurn();
    syncBattleState();
  }, [syncBattleState]);

  const syncAllEnginesState = React.useCallback(() => {
    syncBattleState();
  }, [syncBattleState]);

  const isBattleActive = React.useCallback((): boolean => {
    const engine = battleEngineRef.current;
    return engine?.isActive ?? false;
  }, []);

  return {
    battleEngineRef,
    equipEngineRef,
    itemEngineRef,
    kungfuEngineRef,
    taskEngineRef,
    sectEngineRef,
    getBattleSnapshot,
    syncBattleState,
    initBattle,
    executeAttack,
    executeSkill,
    executeDefend,
    advanceBattleTurn,
    syncAllEnginesState,
    isBattleActive,
  };
}
