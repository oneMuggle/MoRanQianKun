/**
 * models/eraDevice/types.ts
 *
 * 纪元设备 — 类型定义与共享常量（2026-06-06 从 models/era-device/configs.ts 提取）
 *
 * 拆分记录：
 *   - 顶层 DeviceConfig / MobileApp 类型仍由 models/mobileDevice.ts 提供
 *   - LEGACY_ERA_MAP 与 DEFAULT_APP_NAMES_FALLBACK 是 era device 模块的内部共享常量
 *   - 详见 docs/technical/02-state-modularization.md
 */

import type { DeviceConfig, MobileApp } from '../mobileDevice';

// ========================================================================
// 旧版 era ID → 新版 ID 兼容映射（getDeviceConfig 内部使用）
// ========================================================================

/** 旧版 era ID 到新版 ID 的映射（保持向后兼容） */
export const LEGACY_ERA_MAP: Record<string, string> = {
    era_ancient_wuxia: 'ancient_eastern_wuxia',
    era_republic_modern: 'modern_eastern_republic',
    era_modern_urban: 'contemporary_urban',
    era_cyberpunk_nearfuture: 'near-future_cyberpunk',
    era_scifi_future: 'far-future_space_opera',
};

// ========================================================================
// getAppName 回退名称表（当 config.normalAppNames/liModeOverrides 未覆盖时使用）
// ========================================================================

/** MobileApp → 默认显示名（normal 模式回退） */
export const DEFAULT_APP_NAMES_FALLBACK: Record<MobileApp, string> = {
    map: '地图',
    contacts: '通讯录',
    chat: '群聊',
    forum: '论坛',
    news: '资讯',
    album: '相册',
    tools: '工具',
    schedule: '课程表',
    campus_card: '校园卡',
    club: '社团活动',
    confession: '表白墙',
    rules: '校规编辑器',
    hypnosis: '催眠App',
    bdsn: '深夜板块',
    // 现代纪元
    phone: '电话',
    sms: '短信',
    camera: '相机',
    settings: '设置',
    weather: '天气',
    calendar: '日历',
    clock: '时钟',
    files: '文件',
    ride_hailing: '司机端',
    delivery: '配送端',
    appointment: '预约管理',
    ledger: '记账本',
    work_schedule: '工作台',
    property: '房源管理',
    shopping: '购物',
    social_media: '社交媒体',
    app_store: '应用市场',
    music: '音乐',
    video: '视频',
    fitness: '运动健康',
    map_app: '地图导航',
    dating: '心动配对',
    adult_forum: '深夜论坛',
    nsfw_gallery: '私密空间',
    live_stream: '直播',
};

// ========================================================================
// 工具类型
// ========================================================================

/** eraDeviceConfigs 的子集键：用于分片 partial Record 之间的交叉引用 */
export type EraDeviceConfigKey = string;

/** 时代 UI 风格 */
export type DeviceUiStyle = DeviceConfig['uiStyle'];

// ========================================================================
// 重新导出公共类型（保持调用方 import 路径不变）
// ========================================================================

export type { DeviceConfig, MobileApp } from '../mobileDevice';
