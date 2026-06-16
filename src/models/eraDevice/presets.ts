/**
 * models/eraDevice/presets.ts
 *
 * 纪元设备 — Part 3：近未来 + 远未来 + 后人类 + 远古（12 era）+ DEFAULT_APP_NAMES + 工具函数
 *
 * 拆分记录（2026-06-06）：
 *   - 从 models/era-device/configs.ts 提取的"近未来/远未来/后人类/远古"纪元设备定义
 *   - 从 models/era-device/configs.ts 提取的 getDeviceConfig / getAppName / getLiModeThemeColor 工具函数
 *   - 从 models/era-device/appNames.ts 提取的 DEFAULT_APP_NAMES
 *   - 12 era + 1 常量 + 3 函数总计 ~480 行
 */

import type { DeviceConfig, MobileApp } from '../mobileDevice';
import { resolveEraNode } from '../eraTheme';
import { DEFAULT_APP_NAMES_FALLBACK, LEGACY_ERA_MAP } from './types';
import { ANCIENT_DEVICES } from './devices';
import { MODERN_DEVICES } from './props';

// ========================================================================
// 近未来（3 era）— 赛博朋克 / 反乌托邦 / 太空殖民
// ========================================================================

const NEAR_FUTURE_CYBERPUNK: DeviceConfig = {
    deviceId: 'data_terminal_cyber',
    deviceName: '数据终端',
    deviceForm: 'data_terminal',
    eraId: 'near-future_cyberpunk',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
    uiStyle: 'tech',
    normalAppNames: { map: '星图', contacts: '星际通讯录', chat: '星际通讯', forum: '星际论坛', news: '星际资讯', album: '星际相册', tools: '星际工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '全球+神经链接', 能源类型: '量子' },
    liModeOverrides: { appNames: { map: '暗网节点图', contacts: '神经契约', chat: '深网频道', forum: '暗网论坛', news: '黑市数据流', album: '私密记忆库' }, themeColor: '#00FFFF' },
};

const NEAR_FUTURE_DYSTOPIA: DeviceConfig = {
    deviceId: 'data_terminal_dystopia',
    deviceName: '数据终端',
    deviceForm: 'data_terminal',
    eraId: 'near-future_dystopia',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
    uiStyle: 'tech',
    normalAppNames: { map: '星图', contacts: '星际通讯录', chat: '星际通讯', forum: '星际论坛', news: '星际资讯', album: '星际相册', tools: '星际工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '监控网内', 能源类型: '量子' },
    liModeOverrides: { appNames: { map: '监控盲区图', contacts: '抵抗者名录', chat: '加密反抗频道', forum: '地下广播', news: '体制外真相', album: '隐藏记忆库' }, themeColor: '#CC0000' },
};

const NEAR_FUTURE_SPACE: DeviceConfig = {
    deviceId: 'data_terminal_space',
    deviceName: '数据终端',
    deviceForm: 'data_terminal',
    eraId: 'near-future_space_colonization',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
    uiStyle: 'tech',
    normalAppNames: { map: '星图', contacts: '星际通讯录', chat: '星际通讯', forum: '星际论坛', news: '星际资讯', album: '星际相册', tools: '星际工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '星际网络', 能源类型: '量子' },
    liModeOverrides: { appNames: { map: '殖民星域图', contacts: '基因匹配录', chat: '殖民者共鸣', forum: '星际联姻网', news: '殖民地秘闻', album: '私密记忆库' }, themeColor: '#FFD700' },
};

// ========================================================================
// 远未来（3 era）— 太空歌剧 / 赛博格 / 虚拟现实
// ========================================================================

const FAR_FUTURE_SPACE_OPERA: DeviceConfig = {
    deviceId: 'hologram_space_opera',
    deviceName: '星际通讯器',
    deviceForm: 'hologram',
    eraId: 'far-future_space_opera',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
    uiStyle: 'holographic',
    normalAppNames: { map: '全息地图', contacts: '全息通讯录', chat: '全息通讯', forum: '全息论坛', news: '全息资讯', album: '全息相册', tools: '全息工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '星际网络', 能源类型: '量子' },
    liModeOverrides: { appNames: { map: '暗星域图', contacts: '基因契录', chat: '深空密频', forum: '星际暗网', news: '禁忌数据流', album: '记忆库' }, themeColor: '#00FFFF' },
};

const FAR_FUTURE_CYBORG: DeviceConfig = {
    deviceId: 'neural_interface_cyborg',
    deviceName: '神经植入体',
    deviceForm: 'neural_interface',
    eraId: 'far-future_cyborg',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools'],
    uiStyle: 'tech',
    normalAppNames: { map: '神经地图', contacts: '神经通讯录', chat: '神经通讯', forum: '神经论坛', news: '神经资讯', album: '神经相册', tools: '神经工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '全球神经网', 能源类型: '意识' },
    liModeOverrides: { appNames: { map: '暗网节点', contacts: '神经契约', chat: '潜意识频道', forum: '深层意识网', news: '潜意识推送', album: '记忆碎片库', tools: '神经工具' }, themeColor: '#FF00FF' },
};

const FAR_FUTURE_VR: DeviceConfig = {
    deviceId: 'hologram_vr',
    deviceName: '虚拟终端',
    deviceForm: 'hologram',
    eraId: 'far-future_virtual_reality',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
    uiStyle: 'holographic',
    normalAppNames: { map: '全息地图', contacts: '全息通讯录', chat: '全息通讯', forum: '全息论坛', news: '全息资讯', album: '全息相册', tools: '全息工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '虚拟世界', 能源类型: '量子' },
    liModeOverrides: { appNames: { map: '隐藏图层', contacts: '暗面好友', chat: '加密虚拟频道', forum: '暗网论坛', news: '真实世界推送', album: '隐藏相册' }, themeColor: '#00FF88' },
};

// ========================================================================
// 后人类（3 era）— 意识上传 / 维度穿越 / 数学世界
// ========================================================================

const POST_HUMAN_ENERGY: DeviceConfig = {
    deviceId: 'consciousness_energy',
    deviceName: '意识聚合器',
    deviceForm: 'consciousness',
    eraId: 'post-human_energy',
    apps: ['map', 'contacts', 'chat', 'forum', 'news'],
    uiStyle: 'consciousness',
    normalAppNames: { map: '意识地图', contacts: '意识通讯录', chat: '意识通讯', forum: '意识论坛', news: '意识资讯', album: '意识相册', tools: '意识工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '意识空间', 能源类型: '意识' },
    liModeOverrides: { appNames: { map: '意识暗域', contacts: '隐藏意识体', chat: '潜意识共鸣', forum: '深层意识集', news: '意识真相' }, themeColor: '#FFFFFF' },
};

const POST_HUMAN_DIMENSION: DeviceConfig = {
    deviceId: 'consciousness_dimension',
    deviceName: '维度终端',
    deviceForm: 'consciousness',
    eraId: 'post-human_dimension',
    apps: ['map', 'contacts', 'chat', 'forum', 'news'],
    uiStyle: 'consciousness',
    normalAppNames: { map: '意识地图', contacts: '意识通讯录', chat: '意识通讯', forum: '意识论坛', news: '意识资讯', album: '意识相册', tools: '意识工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '跨维度', 能源类型: '意识' },
    liModeOverrides: { appNames: { map: '维度裂隙图', contacts: '跨维联络', chat: '维度密频', forum: '多维论坛', news: '维度真相' }, themeColor: '#FFD700' },
};

const POST_HUMAN_MATH: DeviceConfig = {
    deviceId: 'consciousness_math',
    deviceName: '几何意识体',
    deviceForm: 'consciousness',
    eraId: 'post-human_math',
    apps: ['map', 'contacts', 'chat'],
    uiStyle: 'consciousness',
    normalAppNames: { map: '意识地图', contacts: '意识通讯录', chat: '意识通讯', forum: '意识论坛', news: '意识资讯', album: '意识相册', tools: '意识工具' },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: true, hasNeuralLink: true, hasAR: true, 通讯范围: '数学空间', 能源类型: '意识' },
    liModeOverrides: { appNames: { map: '拓扑地图', contacts: '同构联络', chat: '加密函数' }, themeColor: '#87CEEB' },
};

// ========================================================================
// 远古（3 era）— 非洲部落 / 美洲原住民 / 北欧萨满
// ========================================================================

const PRIMORDIAL_AFRICAN: DeviceConfig = {
    deviceId: 'stone_tablet_african',
    deviceName: '部落图腾柱',
    deviceForm: 'stone_tablet',
    eraId: 'primordial_african',
    apps: ['map', 'contacts', 'chat'],
    uiStyle: 'ancient',
    normalAppNames: { map: '石刻地图', contacts: '石刻名录', chat: '石刻传音', forum: '石刻公告', news: '石刻简报', album: '石刻画集', tools: '石刻工具' },
    capabilities: { hasGPS: false, hasVocalInput: false, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '部落范围', 能源类型: '体力' },
    liModeOverrides: { appNames: { map: '猎径图', contacts: '族人录', chat: '巫术鼓语' }, themeColor: '#8B4513' },
};

const PRIMORDIAL_AMERICAS: DeviceConfig = {
    deviceId: 'stone_tablet_americas',
    deviceName: '玛雅石刻',
    deviceForm: 'stone_tablet',
    eraId: 'primordial_americas',
    apps: ['map', 'contacts', 'chat'],
    uiStyle: 'ancient',
    normalAppNames: { map: '石刻地图', contacts: '石刻名录', chat: '石刻传音', forum: '石刻公告', news: '石刻简报', album: '石刻画集', tools: '石刻工具' },
    capabilities: { hasGPS: false, hasVocalInput: false, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '城邦间', 能源类型: '体力' },
    liModeOverrides: { appNames: { map: '圣地图', contacts: '祭司录', chat: '图腾密语' }, themeColor: '#6B3A2D' },
};

const PRIMORDIAL_NORSE: DeviceConfig = {
    deviceId: 'stone_tablet_norse',
    deviceName: '卢恩石碑',
    deviceForm: 'stone_tablet',
    eraId: 'primordial_norse',
    apps: ['map', 'contacts', 'chat'],
    uiStyle: 'ancient',
    normalAppNames: { map: '石刻地图', contacts: '石刻名录', chat: '石刻传音', forum: '石刻公告', news: '石刻简报', album: '石刻画集', tools: '石刻工具' },
    capabilities: { hasGPS: false, hasVocalInput: false, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '峡湾间', 能源类型: '体力' },
    liModeOverrides: { appNames: { map: '航海图', contacts: '战盟录', chat: '卢恩密文' }, themeColor: '#2D4A6B' },
};

// ========================================================================
// 合并为 FUTURE_PRESETS partial Record（供 index.ts 进一步合并）
// ========================================================================

/** 近未来 + 远未来 + 后人类 + 远古（12 era）设备定义 */
export const FUTURE_PRESETS: Record<string, DeviceConfig> = {
    // 近未来
    'near-future_cyberpunk': NEAR_FUTURE_CYBERPUNK,
    'near-future_dystopia': NEAR_FUTURE_DYSTOPIA,
    'near-future_space_colonization': NEAR_FUTURE_SPACE,
    // 远未来
    'far-future_space_opera': FAR_FUTURE_SPACE_OPERA,
    'far-future_cyborg': FAR_FUTURE_CYBORG,
    'far-future_virtual_reality': FAR_FUTURE_VR,
    // 后人类
    'post-human_energy': POST_HUMAN_ENERGY,
    'post-human_dimension': POST_HUMAN_DIMENSION,
    'post-human_math': POST_HUMAN_MATH,
    // 远古
    'primordial_african': PRIMORDIAL_AFRICAN,
    'primordial_americas': PRIMORDIAL_AMERICAS,
    'primordial_norse': PRIMORDIAL_NORSE,
};

// ========================================================================
// DEFAULT_APP_NAMES — 应用名 normal/li 双模式预设（从 appNames.ts 提取）
// ========================================================================

/** 应用名预设：normal/li 双模式 */
export const DEFAULT_APP_NAMES: Record<MobileApp, { normal: string; li: string }> = {
    map: { normal: '地图', li: '暗面地图' },
    contacts: { normal: '通讯录', li: '暗面关系' },
    chat: { normal: '群聊', li: '私密聊天' },
    forum: { normal: '论坛', li: '暗面论坛' },
    news: { normal: '资讯', li: '暗面推送' },
    album: { normal: '相册', li: '私密相册' },
    tools: { normal: '工具', li: '暗面工具' },
    schedule: { normal: '课程表', li: '秘密约会' },
    campus_card: { normal: '校园卡', li: '校园钱包' },
    club: { normal: '社团活动', li: '地下社团' },
    confession: { normal: '表白墙', li: '匿名告白' },
    rules: { normal: '学生手册', li: '暗影校规' },
    hypnosis: { normal: '心理辅导', li: '深度催眠' },
    bdsn: { normal: '深夜板块', li: '禁忌论坛' },
    // 现代纪元
    phone: { normal: '电话', li: '密线' },
    sms: { normal: '短信', li: '密信' },
    camera: { normal: '相机', li: '暗摄' },
    settings: { normal: '设置', li: '暗面设置' },
    weather: { normal: '天气', li: '夜象' },
    calendar: { normal: '日历', li: '密约' },
    clock: { normal: '时钟', li: '暗钟' },
    files: { normal: '文件', li: '暗柜' },
    ride_hailing: { normal: '司机端', li: '夜行接单' },
    delivery: { normal: '配送端', li: '暗路配送' },
    appointment: { normal: '预约管理', li: '暗约' },
    ledger: { normal: '记账本', li: '暗账' },
    work_schedule: { normal: '工作台', li: '暗面工作' },
    property: { normal: '房源管理', li: '暗房' },
    shopping: { normal: '购物', li: '暗市' },
    social_media: { normal: '社交媒体', li: '暗面社交' },
    app_store: { normal: '应用市场', li: '暗面市场' },
    music: { normal: '音乐', li: '夜曲' },
    video: { normal: '视频', li: '暗屏' },
    fitness: { normal: '运动健康', li: '暗面健康' },
    map_app: { normal: '地图导航', li: '暗面地图' },
    dating: { normal: '心动配对', li: '暗缘' },
    adult_forum: { normal: '深夜论坛', li: '禁忌版块' },
    nsfw_gallery: { normal: '私密空间', li: '暗室' },
    live_stream: { normal: '直播', li: '暗播' },
};

// ========================================================================
// 工具函数（从 configs.ts 提取）
// ========================================================================

/** 获取指定 eraId 的设备配置 */
export function getDeviceConfig(eraId: string): DeviceConfig | null {
    // 0. 旧版 ID 兼容转换
    const resolvedId = LEGACY_ERA_MAP[eraId] || eraId;

    // 1. 直接查找（跨所有分片：古代 + 近代 + 当代 + 近未来/远未来/后人类/远古）
    const direct =
        ANCIENT_DEVICES[resolvedId] ||
        MODERN_DEVICES[resolvedId] ||
        FUTURE_PRESETS[resolvedId];
    if (direct) return direct;

    // 2. 通过时代树推导：查找该 SubEra 的父 Era 节点是否有设备配置
    const resolved = resolveEraNode(resolvedId);
    if (resolved) {
        const parentEraKey = resolved.node.parent;
        if (parentEraKey) {
            const parentConfig =
                ANCIENT_DEVICES[parentEraKey] ||
                MODERN_DEVICES[parentEraKey] ||
                FUTURE_PRESETS[parentEraKey];
            if (parentConfig) return parentConfig;
        }
    }

    // 3. 无匹配配置
    return null;
}

/** 获取设备模式下显示的应用名称 */
export function getAppName(
    config: DeviceConfig,
    app: MobileApp,
    mode: 'normal' | 'li'
): string {
    if (mode === 'li' && config.liModeOverrides?.appNames?.[app]) {
        return config.liModeOverrides.appNames[app]!;
    }
    if (mode === 'normal' && config.normalAppNames?.[app]) {
        return config.normalAppNames[app]!;
    }
    return DEFAULT_APP_NAMES_FALLBACK[app];
}

/** 获取里模式主题色 */
export function getLiModeThemeColor(config: DeviceConfig, fallback: string): string {
    return config.liModeOverrides?.themeColor ?? fallback;
}
