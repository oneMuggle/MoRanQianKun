// 跨时代移动设备 — 时代设备配置
// 2026-06-03：拆分到 models/era-device/ 目录（configs.ts + appNames.ts）

import type { DeviceConfig, MobileApp } from './mobileDevice';

export { eraDeviceConfigs } from './era-device/configs';
export { DEFAULT_APP_NAMES } from './era-device/appNames';
// 工具函数也由 configs.ts 导出
export {
    getDeviceConfig,
    getAppName,
    getLiModeThemeColor,
} from './era-device/configs';
