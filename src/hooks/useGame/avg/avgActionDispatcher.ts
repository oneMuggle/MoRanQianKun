/**
 * avgActionDispatcher.ts
 *
 * AVG/Galgame UI 操作 → 引擎调用分发器。
 * 将 UI 层的用户操作（选择路线、完成结局、切换 CG 等）转为 AvgRelationEngine 调用。
 */

import type { AvgRelationEngine } from '../engine/avgRelationEngine';
import type { RouteJudgment, EndingJudgment, GalgameRoute, GalgameCG } from '../../../models/avg/galgame';
import type { IntimacyLevel, IntimacyChange } from '../../../models/avg/relationGraph';

export interface AvgActionDispatcher {
  setEngine: (engine: AvgRelationEngine) => void;
  changeIntimacy: (fromNpcId: string, toNpcId: string, delta: number, reason: string) => IntimacyChange | null;
  judgeRoute: (routeId: string, npcId: string) => RouteJudgment | null;
  enterRoute: (routeId: string, npcId: string) => boolean;
  suggestRoute: (npcId: string) => GalgameRoute | null;
  resolveEnding: (routeId?: string) => EndingJudgment | null;
  completeEnding: (endingId: string) => boolean;
  setFlag: (key: string, value: boolean) => void;
  getFlag: (key: string) => boolean;
  getActiveRoute: () => GalgameRoute | undefined;
  getIntimacy: (fromNpcId: string, toNpcId: string) => number;
  getLevel: (fromNpcId: string, toNpcId: string) => IntimacyLevel;
  getLevelLabel: (level: IntimacyLevel) => string;
  getAllCGs: () => GalgameCG[];
  getUnlockedCGs: () => GalgameCG[];
}

export function createAvgActionDispatcher(): AvgActionDispatcher {
  let engine: AvgRelationEngine | null = null;

  const requireEngine = (): AvgRelationEngine => {
    if (!engine) throw new Error('AvgRelationEngine not set');
    return engine;
  };

  return {
    setEngine: (eng: AvgRelationEngine) => { engine = eng; },

    changeIntimacy: (fromNpcId, toNpcId, delta, reason) =>
      requireEngine().changeIntimacy(fromNpcId, toNpcId, delta, reason),

    judgeRoute: (routeId, npcId) =>
      requireEngine().judgeRoute(routeId, npcId),

    enterRoute: (routeId, npcId) =>
      requireEngine().enterRoute(routeId, npcId),

    suggestRoute: (npcId) =>
      requireEngine().suggestRoute(npcId),

    resolveEnding: (routeId) =>
      requireEngine().resolveEnding(routeId),

    completeEnding: (endingId) =>
      requireEngine().completeEnding(endingId),

    setFlag: (key, value) => { requireEngine().setFlag(key, value); },
    getFlag: (key) => requireEngine().getFlag(key),
    getActiveRoute: () => requireEngine().getActiveRoute(),
    getIntimacy: (fromNpcId, toNpcId) => requireEngine().getIntimacy(fromNpcId, toNpcId),
    getLevel: (fromNpcId, toNpcId) => requireEngine().getLevel(fromNpcId, toNpcId),
    getLevelLabel: (level) => requireEngine().getLevelLabel(level),
    getAllCGs: () => requireEngine().getAllCGs(),
    getUnlockedCGs: () => requireEngine().getUnlockedCGs(),
  };
}
