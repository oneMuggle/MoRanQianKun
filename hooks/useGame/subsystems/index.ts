// hooks/useGame/subsystems/index.ts — Slice barrel 导出

export type { GameStateRef, GameSetters, GameActions, GameMeta, UseGameReturn } from './types';

export type { TravelSliceState, TravelSliceActions } from './useTravelSlice';
export { useTravelSlice } from './useTravelSlice';

export type { BDSMSliceActions } from './useBDSMSlice';
export { useBDSMSlice } from './useBDSMSlice';

export type { UISliceState, UISliceActions } from './useUISlice';
export { useUISlice } from './useUISlice';
