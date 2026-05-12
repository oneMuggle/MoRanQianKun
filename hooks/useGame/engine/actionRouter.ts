/**
 * SLG + AI 混合架构 — 玩家操作路由器
 *
 * 将玩家操作分发到对应的子引擎，执行前验证合法性。
 */

import type {
  PlayerAction,
  ActionResult,
  SLGEngine,
  EngineType,
} from './types';

export class ActionRouter {
  private _engines = new Map<EngineType, SLGEngine>();

  register(engine: SLGEngine): void {
    this._engines.set(engine.getEngineType(), engine);
  }

  unregister(type: EngineType): void {
    this._engines.delete(type);
  }

  dispatch(action: PlayerAction): ActionResult | null {
    const engine = this._engines.get(action.engineType);
    if (!engine) {
      return null;
    }

    if (!engine.canExecuteAction(action)) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<操作拒绝>引擎: ${action.engineType} | 操作: ${action.type} | 原因: 当前状态不允许此操作</操作拒绝>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    if (engine.isPaused()) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<操作拒绝>引擎: ${action.engineType} | 操作: ${action.type} | 原因: 引擎已暂停</操作拒绝>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    return engine.executePlayerAction(action);
  }

  getEngine(type: EngineType): SLGEngine | undefined {
    return this._engines.get(type);
  }
}
