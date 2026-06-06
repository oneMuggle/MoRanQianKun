/**
 * models/eraDevice/index.ts
 *
 * 纪元设备 — 桶形 re-export + 完整 eraDeviceConfigs 合并（2026-06-06）
 *
 * 拆分记录：
 *   - Day 43：建立 types.ts + devices.ts（含 ANCIENT_DEVICES 12 个古代 era）
 *   - Day 44：建立 props.ts（近代 + 当代 era）+ presets.ts（近未来/远未来/后人类/远古 era + DEFAULT_APP_NAMES + 工具函数）
 *   - Day 45：清理 era-device/ 旧路径，验证 + 文档
 *
 * 当前：完整 eraDeviceConfigs 由 ANCIENT_DEVICES + MODERN_DEVICES + FUTURE_PRESETS 在此处合并。
 */

import type { DeviceConfig } from '../mobileDevice';

import { ANCIENT_DEVICES } from './devices';
import { MODERN_DEVICES } from './props';
import { FUTURE_PRESETS } from './presets';

// ========================================================================
// 合并 41 era 为完整 eraDeviceConfigs Record
// ========================================================================

/** 全部 41 个 era 的设备配置（合并 ANCIENT + MODERN + FUTURE） */
export const eraDeviceConfigs: Record<string, DeviceConfig> = {
    ...ANCIENT_DEVICES,
    ...MODERN_DEVICES,
    ...FUTURE_PRESETS,
};

// ========================================================================
// 桶形 re-export
// ========================================================================

export * from './types';
export * from './devices';
export * from './props';
export * from './presets';
