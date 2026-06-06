// 跨时代移动设备 — 时代设备配置
// 2026-06-06：完整拆分到 models/eraDevice/ 目录（types + devices + props + presets + index）
//             eraDeviceConfigs（41 era）+ 工具函数（getDeviceConfig / getAppName / getLiModeThemeColor）
//             + DEFAULT_APP_NAMES + 类型常量全部从 ./eraDevice 导出
//             旧 ./era-device/ 路径已废弃（Day 45 清理）

// 公共 API 全部从 ./eraDevice/index 导出
// 注：用 './eraDevice/index' 显式指向目录，避免与本 shim 同名导致自循环
export {
    // 类型
    type DeviceConfig,
    type MobileApp,
    type EraDeviceConfigKey,
    type DeviceUiStyle,
    // 常量
    LEGACY_ERA_MAP,
    DEFAULT_APP_NAMES_FALLBACK,
    DEFAULT_APP_NAMES,
    // partial Records
    ANCIENT_DEVICES,
    MODERN_DEVICES,
    FUTURE_PRESETS,
    // 完整 Record
    eraDeviceConfigs,
    // 工具函数
    getDeviceConfig,
    getAppName,
    getLiModeThemeColor,
} from './eraDevice/index';
