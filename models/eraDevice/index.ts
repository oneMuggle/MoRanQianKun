/**
 * models/eraDevice/index.ts
 *
 * 纪元设备 — 桶形 re-export（2026-06-06 起）
 *
 * 拆分记录：
 *   - Day 43：建立 types.ts + devices.ts（含 ANCIENT_DEVICES 12 个古代 era）
 *   - Day 44：建立 props.ts（近代 + 当代 era）+ presets.ts（远古 + 近未来/远未来/后人类 era + DEFAULT_APP_NAMES + 工具函数）
 *   - Day 45：所有 era 配置在 index.ts 合并为完整 eraDeviceConfigs
 *
 * 现状（Day 43）：
 *   - re-export types.ts 中的共享类型与常量
 *   - re-export devices.ts 中的 ANCIENT_DEVICES partial
 *   - 完整 eraDeviceConfigs 仍由 ./era-device/configs.ts 提供（保持向后兼容）
 */

export * from './types';
export * from './devices';
