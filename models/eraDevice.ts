// 跨时代移动设备 — 时代设备配置
// 2026-06-06：拆分到 models/eraDevice/ 目录（types + devices + index）
//             types.ts 提供 LEGACY_ERA_MAP 与 DEFAULT_APP_NAMES_FALLBACK
//             devices.ts 提供 ANCIENT_DEVICES partial
//             完整 eraDeviceConfigs 与工具函数仍由 ./era-device/configs.ts 提供（Day 44 完全迁出）

// 新拆分目录的公共 API（Day 43 新增）
// 注：用 './eraDevice/index' 显式指向目录，避免与本 shim 同名导致自循环
export type { DeviceConfig, MobileApp, EraDeviceConfigKey, DeviceUiStyle } from './eraDevice/index';
export { LEGACY_ERA_MAP, DEFAULT_APP_NAMES_FALLBACK, ANCIENT_DEVICES } from './eraDevice/index';

// 旧路径仍 re-export（保持向后兼容，Day 44 全部迁移后此段可删）
export { eraDeviceConfigs } from './era-device/configs';
export { DEFAULT_APP_NAMES } from './era-device/appNames';
export {
    getDeviceConfig,
    getAppName,
    getLiModeThemeColor,
} from './era-device/configs';
