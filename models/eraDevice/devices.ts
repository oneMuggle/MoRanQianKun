/**
 * models/eraDevice/devices.ts
 *
 * 纪元设备 — 各纪元设备定义（Part 1：古代东方 + 古代西方）
 *
 * 拆分记录（2026-06-06）：
 *   - 从 models/era-device/configs.ts 提取的"古代"纪元设备定义
 *   - Day 43：先建立 devices.ts 容纳 12 个 ancient 时代（~340 行）
 *   - Day 44：将"近代 + 当代"挪到 props.ts，"远古 + 近未来 + 远未来 + 后人类"挪到 presets.ts
 *   - 最终在 index.ts 合并为完整 eraDeviceConfigs
 *
 * 现状：作为 ANCIENT_DEVICES partial Record 导出，供后续 index.ts 合并使用。
 *       完整 eraDeviceConfigs 仍由 models/era-device/configs.ts 提供（Day 44 将全部迁出）。
 */

import type { DeviceConfig } from '../mobileDevice';

// ========================================================================
// 古代东方（7 era）— 武侠 / 志怪 / 仙侠 / 志怪续 / 神话 / 权谋 / 修真
// ========================================================================

const ANCIENT_EASTERN_WUXIA: DeviceConfig = {
    deviceId: 'jade_token_wuxia',
    deviceName: '传音玉简',
    deviceForm: 'jade_token',
    eraId: 'ancient_eastern_wuxia',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'ancient',
    normalAppNames: {
        map: '山川舆图',
        contacts: '英雄帖',
        chat: '飞鸽传书',
        forum: '武林风云录',
    },
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
};

const ANCIENT_EASTERN_STRANGE: DeviceConfig = {
    deviceId: 'jade_token_strange',
    deviceName: '灵契玉简',
    deviceForm: 'jade_token',
    eraId: 'ancient_eastern_strange',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'ancient',
    normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
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
};

const ANCIENT_EASTERN_XIANXIA: DeviceConfig = {
    deviceId: 'jade_token_xianxia',
    deviceName: '神识玉简',
    deviceForm: 'jade_token',
    eraId: 'ancient_eastern_xianxia',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'ancient',
    normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
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
};

const ANCIENT_EASTERN_ZHIGUAI: DeviceConfig = {
    deviceId: 'jade_token_zhiguai',
    deviceName: '志怪玉简',
    deviceForm: 'jade_token',
    eraId: 'ancient_eastern_zhiguai',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'ancient',
    normalAppNames: { map: '山海图', contacts: '异士录', chat: '幽冥传书', forum: '志怪录', news: '灵异简报', album: '妖影集', tools: '器物' },
    capabilities: {
        hasGPS: false,
        hasVocalInput: true,
        hasTextInput: true,
        hasProjection: true,
        hasNeuralLink: false,
        hasAR: false,
        通讯范围: '千里',
        能源类型: '灵力',
    },
    liModeOverrides: {
        appNames: {
            map: '妖境图',
            contacts: '鬼契簿',
            chat: '阴司传音',
            forum: '妖言榜',
            news: '冥府通缉',
        },
        themeColor: '#4B0082',
    },
};

const ANCIENT_EASTERN_MYTH: DeviceConfig = {
    deviceId: 'jade_token_myth',
    deviceName: '神话玉简',
    deviceForm: 'jade_token',
    eraId: 'ancient_eastern_myth',
    apps: ['map', 'contacts', 'chat', 'forum', 'news'],
    uiStyle: 'ancient',
    normalAppNames: { map: '天地舆图', contacts: '仙录', chat: '仙音传书', forum: '封神榜', news: '天庭通缉', album: '神迹集', tools: '神器' },
    capabilities: {
        hasGPS: false,
        hasVocalInput: true,
        hasTextInput: true,
        hasProjection: true,
        hasNeuralLink: false,
        hasAR: false,
        通讯范围: '三界',
        能源类型: '灵力',
    },
    liModeOverrides: {
        appNames: {
            map: '六道轮回图',
            contacts: '妖神录',
            chat: '魔音传书',
            forum: '幽冥榜',
            news: '天机推演',
        },
        themeColor: '#8B0000',
    },
};

const ANCIENT_EASTERN_INTRIGUE: DeviceConfig = {
    deviceId: 'jade_token_intrigue',
    deviceName: '权谋玉简',
    deviceForm: 'jade_token',
    eraId: 'ancient_eastern_intrigue',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'ancient',
    normalAppNames: { map: '朝堂舆图', contacts: '百官录', chat: '密奏', forum: '朝议', news: '邸报', album: '秘档', tools: '印信' },
    capabilities: {
        hasGPS: false,
        hasVocalInput: true,
        hasTextInput: true,
        hasProjection: true,
        hasNeuralLink: false,
        hasAR: false,
        通讯范围: '朝堂',
        能源类型: '真气',
    },
    liModeOverrides: {
        appNames: {
            map: '暗桩图',
            contacts: '暗臣录',
            chat: '密折',
            forum: '暗议',
            news: '宫廷密报',
        },
        themeColor: '#2F4F4F',
    },
};

const ANCIENT_EASTERN_CULTIVATION: DeviceConfig = {
    deviceId: 'jade_token_cultivation',
    deviceName: '修真玉简',
    deviceForm: 'jade_token',
    eraId: 'ancient_eastern_cultivation',
    apps: ['map', 'contacts', 'chat', 'forum', 'news'],
    uiStyle: 'ancient',
    normalAppNames: { map: '灵山图', contacts: '道友录', chat: '传音符', forum: '论道坛', news: '天道榜', album: '悟道集', tools: '法器' },
    capabilities: {
        hasGPS: false,
        hasVocalInput: true,
        hasTextInput: true,
        hasProjection: true,
        hasNeuralLink: false,
        hasAR: false,
        通讯范围: '跨界',
        能源类型: '灵力',
    },
    liModeOverrides: {
        appNames: {
            map: '魔域图',
            contacts: '魔道录',
            chat: '血符传音',
            forum: '邪道坛',
            news: '天道警示',
        },
        themeColor: '#4B0082',
    },
};

// ========================================================================
// 古代西方（5 era）— 希腊卷轴 / 罗马铜镜 / 中世纪渡鸦 / 维京 / 凯尔特
// ========================================================================

const ANCIENT_WESTERN_GREEK: DeviceConfig = {
    deviceId: 'scroll_greek',
    deviceName: '信使卷轴',
    deviceForm: 'scroll',
    eraId: 'ancient_western_greek',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'ancient',
    normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
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
};

const ANCIENT_WESTERN_ROMAN: DeviceConfig = {
    deviceId: 'scroll_roman',
    deviceName: '预言铜镜',
    deviceForm: 'scroll',
    eraId: 'ancient_western_roman',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'ancient',
    normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
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
};

const ANCIENT_WESTERN_MEDIEVAL: DeviceConfig = {
    deviceId: 'scroll_medieval',
    deviceName: '信使渡鸦',
    deviceForm: 'scroll',
    eraId: 'ancient_western_medieval',
    apps: ['map', 'contacts', 'chat'],
    uiStyle: 'ancient',
    normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
    capabilities: {
        hasGPS: false,
        hasVocalInput: false,
        hasTextInput: true,
        hasProjection: false,
        hasNeuralLink: false,
        hasAR: false,
        通讯范围: '王国之间',
        能源类型: '体力',
    },
};

const ANCIENT_WESTERN_VIKING: DeviceConfig = {
    deviceId: 'scroll_viking',
    deviceName: '符文木牌',
    deviceForm: 'scroll',
    eraId: 'ancient_western_viking',
    apps: ['map', 'contacts', 'chat'],
    uiStyle: 'ancient',
    normalAppNames: { map: '航海图', contacts: '部族录', chat: '战吼', forum: '议事厅', news: '长屋传讯', album: '战利品', tools: '器物' },
    capabilities: {
        hasGPS: false,
        hasVocalInput: true,
        hasTextInput: true,
        hasProjection: false,
        hasNeuralLink: false,
        hasAR: false,
        通讯范围: '峡湾之间',
        能源类型: '体力',
    },
    liModeOverrides: {
        appNames: {
            map: '劫掠图',
            contacts: '敌部录',
            chat: '偷袭暗号',
        },
        themeColor: '#1C1C1C',
    },
};

const ANCIENT_WESTERN_CELTIC: DeviceConfig = {
    deviceId: 'scroll_celtic',
    deviceName: '德鲁伊木牌',
    deviceForm: 'scroll',
    eraId: 'ancient_western_celtic',
    apps: ['map', 'contacts', 'chat'],
    uiStyle: 'ancient',
    normalAppNames: { map: '圣地图', contacts: '部族录', chat: '橡树传音', forum: '德鲁伊议会', news: '月相', album: '符文集', tools: '草药' },
    capabilities: {
        hasGPS: false,
        hasVocalInput: true,
        hasTextInput: true,
        hasProjection: false,
        hasNeuralLink: false,
        hasAR: false,
        通讯范围: '部落之间',
        能源类型: '体力',
    },
    liModeOverrides: {
        appNames: {
            map: '异界地图',
            contacts: '暗部录',
            chat: '精灵密语',
        },
        themeColor: '#006400',
    },
};

// ========================================================================
// 合并为 ANCIENT_DEVICES partial Record（供 index.ts 进一步合并）
// ========================================================================

/** 古代纪元（东方 + 西方）设备定义 — 12 era */
export const ANCIENT_DEVICES: Record<string, DeviceConfig> = {
    'ancient_eastern_wuxia': ANCIENT_EASTERN_WUXIA,
    'ancient_eastern_strange': ANCIENT_EASTERN_STRANGE,
    'ancient_eastern_xianxia': ANCIENT_EASTERN_XIANXIA,
    'ancient_eastern_zhiguai': ANCIENT_EASTERN_ZHIGUAI,
    'ancient_eastern_myth': ANCIENT_EASTERN_MYTH,
    'ancient_eastern_intrigue': ANCIENT_EASTERN_INTRIGUE,
    'ancient_eastern_cultivation': ANCIENT_EASTERN_CULTIVATION,
    'ancient_western_greek': ANCIENT_WESTERN_GREEK,
    'ancient_western_roman': ANCIENT_WESTERN_ROMAN,
    'ancient_western_medieval': ANCIENT_WESTERN_MEDIEVAL,
    'ancient_western_viking': ANCIENT_WESTERN_VIKING,
    'ancient_western_celtic': ANCIENT_WESTERN_CELTIC,
};
