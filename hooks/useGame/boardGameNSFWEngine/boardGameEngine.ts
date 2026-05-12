/**
 * BoardGameEngine — 桌游引擎类
 *
 * 将 boardGameNSFWEngine 的纯函数包装为 SLGEngine 接口实现，
 * 支持回合推进、玩家操作执行、叙事约束生成。
 */

import { BaseEngine } from '../engine/baseEngine';
import {
  executePlayerAction,
  计算桌游紧张度,
  判定桌游NSFW升级,
  type 玩家操作,
  type 操作结算结果,
} from './core';
import type {
  SLGEngine,
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  SideEffect,
  NPCInfo,
} from '../engine/types';
import type { 桌游类型 } from '../../../models/boardGameNSFW/core';

// Internal state for the board game engine
interface InternalBoardState {
  gameType: 桌游类型 | null;
  tension: number;
  currentTurn: number;
  totalTurns: number;
  nsfwTriggered: boolean;
  players: string[];
  isActive: boolean;
  lastActionResult: 操作结算结果 | null;
}

const DEFAULT_STATE: InternalBoardState = {
  gameType: null,
  tension: 40,
  currentTurn: 0,
  totalTurns: 12,
  nsfwTriggered: false,
  players: [],
  isActive: false,
  lastActionResult: null,
};

export class BoardGameEngine extends BaseEngine implements SLGEngine {
  private _state: InternalBoardState;
  private _npcProfiles: Map<string, Record<string, unknown>>;
  private _turnCount: number;

  constructor() {
    super('boardGame');
    this._state = { ...DEFAULT_STATE };
    this._npcProfiles = new Map();
    this._turnCount = 0;
  }

  // ==================== SLGEngine 抽象方法实现 ====================

  advanceTurn(): TurnResult {
    this._turnCount++;
    this._state.currentTurn = this._turnCount;

    const tension = 计算桌游紧张度({
      桌游类型: this._state.gameType ?? '骰子游戏',
      周围人数: this._state.players.length,
      当前回合: this._state.currentTurn,
      已触发NSFW: this._state.nsfwTriggered,
    });

    const oldTension = this._state.tension;
    this._state.tension = tension;

    const events: GameEvent[] = [];
    if (this._state.lastActionResult?.nsfwTriggered && !this._state.nsfwTriggered) {
      this._state.nsfwTriggered = true;
      events.push({
        id: `nsfw-trigger-${this._turnCount}`,
        engineType: 'boardGame',
        type: 'nsfw-scene',
        description: '桌游NSFW场景已触发',
        status: 'pending',
        payload: { turn: this._turnCount },
        createdAt: Date.now(),
      });
    }

    return {
      turnNumber: this._turnCount,
      phase: 'resolution',
      eventsTriggered: events,
      stateChanges: [
        { key: 'tension', before: oldTension, after: tension },
        { key: 'currentTurn', before: this._turnCount - 1, after: this._turnCount },
      ],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    const boardAction: 玩家操作 = {
      type: this._mapActionType(action.type),
      payload: action.payload,
      游戏类型: this._state.gameType ?? '骰子游戏',
    };

    const result = executePlayerAction(boardAction, {
      紧张度: this._state.tension,
      当前回合: this._state.currentTurn,
      总回合数: this._state.totalTurns,
    });

    this._state.tension = Math.min(100, this._state.tension + result.tensionDelta);
    this._state.lastActionResult = result;

    if (result.nsfwTriggered) {
      this._state.nsfwTriggered = true;
    }

    const sideEffects: SideEffect[] = [];
    if (result.nsfwTriggered) {
      sideEffects.push({ type: 'nsfw-triggered', payload: { turn: this._state.currentTurn } });
    }
    if (result.keyStep) {
      sideEffects.push({ type: 'key-step', payload: { description: result.description } });
    }

    return {
      success: result.success,
      stateUpdates: {
        tension: this._state.tension,
        lastAction: result.description,
      },
      narrativeConstraint: result.narrativeConstraint,
      keyStep: result.keyStep,
      sideEffects,
    };
  }

  canExecuteAction(_action: PlayerAction): boolean {
    if (!this._state.isActive) return false;
    if (this._paused) return false;
    if (!this._state.gameType) return false;
    return true;
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnCount,
      timestamp: Date.now(),
      engineStates: {
        boardGame: {
          gameType: this._state.gameType,
          tension: this._state.tension,
          currentTurn: this._state.currentTurn,
          totalTurns: this._state.totalTurns,
          nsfwTriggered: this._state.nsfwTriggered,
          players: [...this._state.players],
          isActive: this._state.isActive,
          npcCount: this._npcProfiles.size,
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const participants: NPCInfo[] = Array.from(this._npcProfiles.entries()).map(
      ([id, profile]) => ({
        id,
        name: (profile.name as string) ?? id,
        status: (profile.status as string) ?? 'active',
        desireStage: profile.desireStage as string | undefined,
      }),
    );

    return {
      scene: `桌游-${this._state.gameType ?? '未开始'}`,
      turn: this._state.currentTurn,
      tension: this._state.tension,
      playerAction: this._state.lastActionResult?.description ?? '',
      keyStep: this._state.lastActionResult?.keyStep ?? false,
      nsfwTriggered: this._state.nsfwTriggered,
      participants,
      nextEvent: this._pendingEvents.length > 0 ? this._pendingEvents[0].description : '',
    };
  }

  // ==================== 桌游专有方法 ====================

  /** 开始一局新桌游 */
  startGame(gameType: 桌游类型, totalTurns: number = 12): void {
    this._state = {
      ...DEFAULT_STATE,
      gameType,
      totalTurns,
      isActive: true,
      currentTurn: 0,
    };
    this._turnCount = 0;
  }

  /** 结束当前桌游 */
  endGame(): void {
    this._state.isActive = false;
    this._state.gameType = null;
    this._state.lastActionResult = null;
  }

  /** 注册一个参与NPC */
  registerNPC(npcId: string, profile: Record<string, unknown>): void {
    this._npcProfiles.set(npcId, profile);
    if (!this._state.players.includes(npcId)) {
      this._state.players.push(npcId);
    }
  }

  /** 注销一个NPC */
  unregisterNPC(npcId: string): void {
    this._npcProfiles.delete(npcId);
    this._state.players = this._state.players.filter(id => id !== npcId);
  }

  /** 获取当前棋盘状态 */
  getBoardState(): Readonly<InternalBoardState> {
    return { ...this._state };
  }

  /** 检查当前桌游是否应触发NSFW升级 */
  checkNSFWUpgrade(欲望阶段: string, 露出偏好等级: number): boolean {
    if (!this._state.gameType) return false;
    return 判定桌游NSFW升级({
      桌游类型: this._state.gameType,
      紧张度: this._state.tension,
      欲望阶段: 欲望阶段 as any,
      露出偏好等级: 露出偏好等级 as any,
      已触发NSFW: this._state.nsfwTriggered,
    });
  }

  /** 获取当前紧张度 */
  get tension(): number {
    return this._state.tension;
  }

  /** 获取当前游戏类型 */
  get gameType(): 桌游类型 | null {
    return this._state.gameType;
  }

  /** 是否活跃 */
  get isActive(): boolean {
    return this._state.isActive;
  }

  // ==================== 私有方法 ====================

  /** 将通用 action.type 字符串映射到桌游操作类型 */
  private _mapActionType(type: string): 玩家操作['type'] {
    const mapping: Record<string, 玩家操作['type']> = {
      'roll': '掷骰',
      '掷骰': '掷骰',
      'choose-path': '选择路径',
      '选择路径': '选择路径',
      'vote': '投票',
      '投票': '投票',
      'search': '搜索',
      '搜索': '搜索',
      'truth-or-dare': '选择真心话大冒险',
      '选择真心话大冒险': '选择真心话大冒险',
      'respond-command': '回应命令',
      '回应命令': '回应命令',
      'buy-property': '购买地块',
      '购买地块': '购买地块',
      'play-card': '出牌',
      '出牌': '出牌',
      'custom': '自定义',
      '自定义': '自定义',
    };
    return mapping[type] ?? '自定义';
  }
}
