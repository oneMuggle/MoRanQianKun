// 跨时代移动设备 — 时代设备配置

import { DeviceConfig, MobileApp } from './mobileDevice';

/** 按 eraId 索引的设备配置 */
export const eraDeviceConfigs: Record<string, DeviceConfig> = {
    // ========== 古代东方 · 武侠 ==========
    'ancient_eastern_wuxia': {
        deviceId: 'jade_token_wuxia',
        deviceName: '传音玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_wuxia',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '同城内',
            能源类型: '真气',
        },
        liModeOverrides: {
            appNames: {
                map: '灵识暗图',
                contacts: '暗契簿',
                chat: '密音阵',
                forum: '暗榜',
                news: '秘闻录',
            },
            themeColor: '#5C1A1A',
        },
    },

    // ========== 古代东方 · 志怪 ==========
    'ancient_eastern_strange': {
        deviceId: 'jade_token_strange',
        deviceName: '灵契玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_strange',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '跨城',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '灵识暗图',
                contacts: '暗契簿',
                chat: '密音阵',
                forum: '暗榜',
                news: '秘闻录',
            },
            themeColor: '#5C1A1A',
        },
    },

    // ========== 古代东方 · 仙侠 ==========
    'ancient_eastern_xianxia': {
        deviceId: 'jade_token_xianxia',
        deviceName: '神识玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_xianxia',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '跨洲',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '灵识暗图',
                contacts: '暗契簿',
                chat: '密音阵',
                forum: '暗榜',
                news: '秘闻录',
            },
            themeColor: '#5C1A1A',
        },
    },

    // ========== 古代西方 · 希腊 ==========
    'ancient_western_greek': {
        deviceId: 'scroll_greek',
        deviceName: '信使卷轴',
        deviceForm: 'scroll',
        eraId: 'ancient_western_greek',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城邦之间',
            能源类型: '体力',
        },
    },

    // ========== 古代西方 · 罗马 ==========
    'ancient_western_roman': {
        deviceId: 'scroll_roman',
        deviceName: '预言铜镜',
        deviceForm: 'scroll',
        eraId: 'ancient_western_roman',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '帝国范围',
            能源类型: '体力',
        },
    },

    // ========== 近代东方 · 民国 ==========
    'modern_eastern_republic': {
        deviceId: 'telegraph_republic',
        deviceName: '电报收发器',
        deviceForm: 'telegraph',
        eraId: 'modern_eastern_republic',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'retro',
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城市间',
            能源类型: '电力',
        },
    },

    // ========== 近代西方 · 维多利亚 ==========
    'modern_western_victorian': {
        deviceId: 'mechanical_victorian',
        deviceName: '通讯怀表',
        deviceForm: 'mechanical',
        eraId: 'modern_western_victorian',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'retro',
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城市范围',
            能源类型: '体力',
        },
    },

    // ========== 当代 · 都市（核心） ==========
    'contemporary_urban': {
        deviceId: 'smartphone_urban',
        deviceName: '智能手机',
        deviceForm: 'smartphone',
        eraId: 'contemporary_urban',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools'],
        uiStyle: 'modern',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: true,
            通讯范围: '全球',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '夜行地图',
                contacts: '关系网',
                chat: '私密聊天',
                forum: '都市秘闻',
                news: '深夜推送',
                album: '私密相册',
            },
            themeColor: '#6B2D8B',
        },
    },

    // ========== 当代 · 乡村 ==========
    'contemporary_rural': {
        deviceId: 'radio_rural',
        deviceName: '功能机',
        deviceForm: 'radio',
        eraId: 'contemporary_rural',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'modern',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数十公里',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '乡野小路图',
                contacts: '乡亲录',
                chat: '村口闲聊',
                forum: '村头八卦',
                news: '乡野传闻',
            },
            themeColor: '#2D5A27',
        },
    },

    // ========== 当代 · 末日废土 ==========
    'contemporary_post_apocalyptic': {
        deviceId: 'radio_apocalyptic',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_post_apocalyptic',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'retro',
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '生存区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                forum: '黑市公告板',
                news: '废土电台',
            },
            themeColor: '#8B3A3A',
        },
    },

    // ========== 当代 · 黑色犯罪 ==========
    'contemporary_noir': {
        deviceId: 'smartphone_noir',
        deviceName: '智能手机',
        deviceForm: 'smartphone',
        eraId: 'contemporary_noir',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'modern',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: true,
            通讯范围: '全球',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '暗巷地图',
                contacts: '线人录',
                chat: '暗线通讯',
                forum: '地下情报',
                news: '黑色快讯',
                album: '私密相册',
            },
            themeColor: '#1A1A2E',
        },
    },

    // ========== 当代 · 嬉皮士文化 ==========
    'contemporary_hippie': {
        deviceId: 'smartphone_hippie',
        deviceName: '智能手机',
        deviceForm: 'smartphone',
        eraId: 'contemporary_hippie',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'modern',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: true,
            通讯范围: '全球',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '迷幻地图',
                contacts: '灵魂伴侣录',
                chat: '公社圈子',
                forum: '地下刊物',
                news: '反文化快报',
                album: '私密相册',
            },
            themeColor: '#9B59B6',
        },
    },

    // ========== 当代 · 丧尸危机 ==========
    'contemporary_zombie': {
        deviceId: 'radio_zombie',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_zombie',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '安全区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '末日电台',
            },
            themeColor: '#8B3A3A',
        },
    },

    // ========== 当代 · 极寒末日 ==========
    'contemporary_extreme_cold': {
        deviceId: 'radio_cold',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_extreme_cold',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '避难所地图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '极寒电台',
            },
            themeColor: '#3A5C8B',
        },
    },

    // ========== 当代 · 生化危机 ==========
    'contemporary_biohazard': {
        deviceId: 'radio_bio',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_biohazard',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '污染区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '隔离区电台',
            },
            themeColor: '#4A8B3A',
        },
    },

    // ========== 当代 · 核冬天 ==========
    'contemporary_nuclear_winter': {
        deviceId: 'radio_nuclear',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_nuclear_winter',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '辐射区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '核冬电台',
            },
            themeColor: '#8B6B3A',
        },
    },

    // ========== 近未来 · 赛博朋克（核心） ==========
    'near-future_cyberpunk': {
        deviceId: 'data_terminal_cyber',
        deviceName: '数据终端',
        deviceForm: 'data_terminal',
        eraId: 'near-future_cyberpunk',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'tech',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '全球+神经链接',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '暗网节点图',
                contacts: '神经契约',
                chat: '深网频道',
                forum: '暗网论坛',
                news: '黑市数据流',
                album: '私密记忆库',
            },
            themeColor: '#00FFFF',
        },
    },

    // ========== 近未来 · 反乌托邦 ==========
    'near-future_dystopia': {
        deviceId: 'data_terminal_dystopia',
        deviceName: '数据终端',
        deviceForm: 'data_terminal',
        eraId: 'near-future_dystopia',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'tech',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '监控网内',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '监控盲区图',
                contacts: '抵抗者名录',
                chat: '加密反抗频道',
                forum: '地下广播',
                news: '体制外真相',
                album: '隐藏记忆库',
            },
            themeColor: '#CC0000',
        },
    },

    // ========== 近未来 · 太空殖民 ==========
    'near-future_space_colonization': {
        deviceId: 'data_terminal_space',
        deviceName: '数据终端',
        deviceForm: 'data_terminal',
        eraId: 'near-future_space_colonization',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'tech',
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '星际网络',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '殖民星域图',
                contacts: '基因匹配录',
                chat: '殖民者共鸣',
                forum: '星际联姻网',
                news: '殖民地秘闻',
                album: '私密记忆库',
            },
            themeColor: '#FFD700',
        },
    },
};

/** 获取指定 eraId 的设备配置 */
export function getDeviceConfig(eraId: string): DeviceConfig | null {
    return eraDeviceConfigs[eraId] ?? null;
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
    const defaultNames: Record<MobileApp, string> = {
        map: '地图',
        contacts: '通讯录',
        chat: '群聊',
        forum: '论坛',
        news: '资讯',
        album: '相册',
        tools: '工具',
    };
    return defaultNames[app];
}

/** 获取里模式主题色 */
export function getLiModeThemeColor(config: DeviceConfig, fallback: string): string {
    return config.liModeOverrides?.themeColor ?? fallback;
}

/** 默认应用名称映射 */
export const DEFAULT_APP_NAMES: Record<MobileApp, { normal: string; li: string }> = {
    map: { normal: '地图', li: '暗面地图' },
    contacts: { normal: '通讯录', li: '暗面关系' },
    chat: { normal: '群聊', li: '私密聊天' },
    forum: { normal: '论坛', li: '暗面论坛' },
    news: { normal: '资讯', li: '暗面推送' },
    album: { normal: '相册', li: '私密相册' },
    tools: { normal: '工具', li: '暗面工具' },
};
