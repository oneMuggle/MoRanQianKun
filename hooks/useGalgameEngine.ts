/**
 * useGalgameEngine.ts
 *
 * GalgameView 的引擎连接 hook。
 * 将 useAvgStateBridge 的输出转为 GalgameView 可消费的 props。
 */

import * as React from 'react';
import { useAvgStateBridge } from './useAvgStateBridge';
import type { AvgStateBridgeSnapshot } from './useAvgStateBridge';
import type { AvgRelationEngine } from './useGame/engine/avgRelationEngine';

export interface UseGalgameEngineReturn {
  avgSnapshot: AvgStateBridgeSnapshot | null;
  onEnterRoute: (routeId: string, npcId: string) => boolean;
  engineSuggestedOptions: Array<{ id: string; text: string; npcId: string }>;
  engineRef: React.RefObject<AvgRelationEngine | null>;
  syncState: () => void;
}

export function useGalgameEngine(): UseGalgameEngineReturn {
  const bridge = useAvgStateBridge();

  const onEnterRoute = React.useCallback(
    (routeId: string, npcId: string): boolean => {
      return bridge.enterRoute(routeId, npcId);
    },
    [bridge]
  );

  const engineSuggestedOptions = React.useMemo(() => {
    const snap = bridge.getSnapshot();
    if (!snap || !snap.suggestedRouteId) return [];

    const label = snap.activeRouteName ?? '进入路线';
    const route = snap.activeRoute;
    if (route) {
      return [{
        id: route.id,
        text: `进入 ${route.routeName}`,
        npcId: route.npcId,
      }];
    }

    return [{
      id: snap.suggestedRouteId,
      text: label,
      npcId: 'player',
    }];
  }, [bridge.getSnapshot]);

  return {
    avgSnapshot: bridge.getSnapshot(),
    onEnterRoute,
    engineSuggestedOptions,
    engineRef: bridge.engineRef,
    syncState: bridge.syncStateToZustand,
  };
}
