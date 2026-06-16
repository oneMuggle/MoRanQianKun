/**
 * models/eraDevice/props.ts
 *
 * 纪元设备 — Part 2：近代（6 era）+ 当代（12 era）设备定义
 *
 * 拆分记录（2026-06-06）：
 *   - 从 models/era-device/configs.ts 提取的"近代"+"当代"纪元设备定义
 *   - 18 era 总计 ~570 行，partial Record 名为 MODERN_DEVICES
 *   - index.ts 合并 ANCIENT_DEVICES + MODERN_DEVICES + FUTURE_PRESETS → eraDeviceConfigs
 */

import type { DeviceConfig } from '../mobileDevice';

// ========================================================================
// 近代东方（3 era）— 民国 / 明治大正 / 晚清
// ========================================================================

const MODERN_EASTERN_REPUBLIC: DeviceConfig = {
    deviceId: 'telegraph_republic',
    deviceName: '电报收发器',
    deviceForm: 'telegraph',
    eraId: 'modern_eastern_republic',
    apps: ['map', 'contacts', 'chat', 'forum', 'news'],
    uiStyle: 'retro',
    normalAppNames: { map: '电报地图', contacts: '电报通讯录', chat: '电报通讯', forum: '电报公告', news: '电讯', album: '影集', tools: '电报工具' },
    capabilities: { hasGPS: false, hasVocalInput: false, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '城市间', 能源类型: '电力' },
};

const MODERN_EASTERN_MEIJI: DeviceConfig = {
    deviceId: 'telegraph_meiji',
    deviceName: '电报机',
    deviceForm: 'telegraph',
    eraId: 'modern_eastern_meiji_taisho',
    apps: ['map', 'contacts', 'chat', 'news'],
    uiStyle: 'retro',
    normalAppNames: { map: '电气地图', contacts: '电气通讯录', chat: '电气通讯', forum: '电气公告', news: '电气速报', album: '影集', tools: '电气工具' },
    capabilities: { hasGPS: false, hasVocalInput: false, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '省内', 能源类型: '电力' },
    liModeOverrides: { appNames: { map: '暗线图', contacts: '地下社', chat: '密电', news: '地下刊' }, themeColor: '#8B4513' },
};

const MODERN_EASTERN_LATE_QING: DeviceConfig = {
    deviceId: 'telegraph_late_qing',
    deviceName: '有线电报机',
    deviceForm: 'telegraph',
    eraId: 'modern_eastern_late_qing',
    apps: ['map', 'contacts', 'chat', 'news'],
    uiStyle: 'retro',
    normalAppNames: { map: '驿路图', contacts: '驿报录', chat: '驿信', forum: '邸抄', news: '京报', album: '影集', tools: '驿物' },
    capabilities: { hasGPS: false, hasVocalInput: false, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '省内', 能源类型: '电力' },
    liModeOverrides: { appNames: { map: '暗驿图', contacts: '江湖录', chat: '密信', news: '密报' }, themeColor: '#4A2C17' },
};

// ========================================================================
// 近代西方（3 era）— 维多利亚怀表 / 爵士时代 / 战后重建
// ========================================================================

const MODERN_WESTERN_VICTORIAN: DeviceConfig = {
    deviceId: 'mechanical_victorian',
    deviceName: '通讯怀表',
    deviceForm: 'mechanical',
    eraId: 'modern_western_victorian',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiStyle: 'retro',
    normalAppNames: { map: '机械地图', contacts: '机械通讯录', chat: '机械群聊', forum: '机械论坛', news: '机械资讯', album: '机械相册', tools: '机械工具' },
    capabilities: { hasGPS: false, hasVocalInput: false, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '城市范围', 能源类型: '体力' },
};

const MODERN_WESTERN_JAZZ: DeviceConfig = {
    deviceId: 'mechanical_jazz',
    deviceName: '机械收音机',
    deviceForm: 'mechanical',
    eraId: 'modern_western_jazz_age',
    apps: ['map', 'contacts', 'chat', 'news'],
    uiStyle: 'retro',
    normalAppNames: { map: '机械地图', contacts: '机械通讯录', chat: '机械群聊', forum: '机械论坛', news: '机械资讯', album: '机械相册', tools: '机械工具' },
    capabilities: { hasGPS: false, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '城市范围', 能源类型: '电力' },
    liModeOverrides: { appNames: { map: '地下酒吧图', contacts: '爵士乐手录', chat: '密聊', news: '暗报' }, themeColor: '#3B1F2B' },
};

const MODERN_WESTERN_POSTWAR: DeviceConfig = {
    deviceId: 'radio_postwar',
    deviceName: '收音通讯机',
    deviceForm: 'radio',
    eraId: 'modern_western_postwar',
    apps: ['map', 'contacts', 'chat', 'news'],
    uiStyle: 'retro',
    normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
    capabilities: { hasGPS: false, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '国家范围', 能源类型: '电力' },
    liModeOverrides: { appNames: { map: '重建地图', contacts: '联络录', chat: '加密电台', news: '内部消息' }, themeColor: '#4A4A4A' },
};

// ========================================================================
// 当代 · 都市（核心）— 智能手机全功能
// ========================================================================

const CONTEMPORARY_URBAN: DeviceConfig = {
    deviceId: 'smartphone_urban',
    deviceName: '智能手机',
    deviceForm: 'smartphone',
    eraId: 'contemporary_urban',
    apps: ['phone', 'sms', 'camera', 'settings', 'weather', 'calendar', 'clock', 'files', 'map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'modern',
    normalAppNames: {
        map: '地图', contacts: '通讯录', chat: '群聊', forum: '论坛', news: '资讯', album: '相册', tools: '工具',
        phone: '电话', sms: '短信', camera: '相机', settings: '设置', weather: '天气',
        calendar: '日历', clock: '时钟', files: '文件',
        schedule: '社交日程', campus_card: '人脉卡', club: '兴趣圈子', confession: '匿名告白',
        rules: '社交礼仪', hypnosis: '心理诊所', bdsn: '深夜板块',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: true, 通讯范围: '全球', 能源类型: '电力' },
    liModeOverrides: {
        appNames: {
            map: '夜行地图', contacts: '关系网', chat: '私密聊天', forum: '都市秘闻',
            news: '深夜推送', album: '私密相册', tools: '暗面工具',
            phone: '密线', sms: '密信', camera: '暗摄', settings: '暗面设置',
            weather: '夜象', calendar: '密约', clock: '暗钟', files: '暗柜',
            schedule: '秘密约会', campus_card: '校园钱包', club: '地下社团', confession: '匿名告白',
            rules: '暗影校规', hypnosis: '深度催眠', bdsn: '禁忌论坛',
        },
        themeColor: '#6B2D8B',
    },
};

const CONTEMPORARY_CAMPUS: DeviceConfig = {
    deviceId: 'smartphone_campus',
    deviceName: '智能手机',
    deviceForm: 'smartphone',
    eraId: 'contemporary_campus',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'modern',
    normalAppNames: {
        map: '地图', contacts: '通讯录', chat: '私聊', forum: '校园论坛', news: '校园资讯', album: '相册', tools: '工具',
        schedule: '课程表', campus_card: '校园卡', club: '社团活动', confession: '表白墙',
        rules: '学生手册', hypnosis: '心理辅导', bdsn: '深夜板块',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: true, 通讯范围: '校园内', 能源类型: '电力' },
    liModeOverrides: {
        appNames: {
            map: '夜行地图', contacts: '关系网', chat: '私密聊天', forum: '深夜树洞',
            news: '暗面推送', album: '私密相册', tools: '暗面工具',
            schedule: '秘密约会', campus_card: '校园钱包', club: '地下社团', confession: '匿名告白',
            rules: '暗影校规', hypnosis: '深度催眠', bdsn: '禁忌论坛',
        },
        themeColor: '#2D6B3A',
    },
};

const CONTEMPORARY_CAMPUS_URBAN: DeviceConfig = {
    deviceId: 'smartphone_campus_urban',
    deviceName: '智能手机',
    deviceForm: 'smartphone',
    eraId: 'contemporary_campus_urban',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'modern',
    normalAppNames: {
        map: '地图', contacts: '通讯录', chat: '私聊', forum: '都市校园论坛', news: '都市校园资讯', album: '相册', tools: '工具',
        schedule: '课程表', campus_card: '校园卡', club: '社团活动', confession: '表白墙',
        rules: '学生手册', hypnosis: '心理辅导', bdsn: '深夜板块',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: true, 通讯范围: '都市校园内', 能源类型: '电力' },
    liModeOverrides: {
        appNames: {
            map: '夜行地图', contacts: '关系网', chat: '私密聊天', forum: '深夜树洞',
            news: '暗面推送', album: '私密相册', tools: '暗面工具',
            schedule: '秘密约会', campus_card: '校园钱包', club: '地下社团', confession: '匿名告白',
            rules: '暗影校规', hypnosis: '深度催眠', bdsn: '禁忌论坛',
        },
        themeColor: '#3A6B4A',
    },
};

const CONTEMPORARY_RURAL: DeviceConfig = {
    deviceId: 'radio_rural',
    deviceName: '功能机',
    deviceForm: 'radio',
    eraId: 'contemporary_rural',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'modern',
    normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具',
        schedule: '社交日程', campus_card: '人脉卡', club: '乡土圈子', confession: '村口告白',
        rules: '乡约民规', hypnosis: '心理疏导', bdsn: '深夜广播',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '数十公里', 能源类型: '电力' },
    liModeOverrides: { appNames: { map: '乡野小路图', contacts: '乡亲录', chat: '村口闲聊', forum: '村头八卦', news: '乡野传闻' }, themeColor: '#2D5A27' },
};

const CONTEMPORARY_POST_APOCALYPTIC: DeviceConfig = {
    deviceId: 'radio_apocalyptic',
    deviceName: '对讲机',
    deviceForm: 'radio',
    eraId: 'contemporary_post_apocalyptic',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'retro',
    normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具',
        schedule: '生存日程', campus_card: '幸存者卡', club: '避难所圈子', confession: '废土告白',
        rules: '废土法则', hypnosis: '战后心理', bdsn: '废土夜话',
    },
    capabilities: { hasGPS: false, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '数公里', 能源类型: '太阳能' },
    liModeOverrides: { appNames: { map: '生存区域图', contacts: '幸存者名录', chat: '加密频道', forum: '黑市公告板', news: '废土电台' }, themeColor: '#8B3A3A' },
};

const CONTEMPORARY_NOIR: DeviceConfig = {
    deviceId: 'smartphone_noir',
    deviceName: '智能手机',
    deviceForm: 'smartphone',
    eraId: 'contemporary_noir',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'modern',
    normalAppNames: { map: '地图', contacts: '通讯录', chat: '群聊', forum: '论坛', news: '资讯', album: '相册', tools: '工具',
        schedule: '行动日程', campus_card: '暗面身份', club: '地下组织', confession: '匿名密报',
        rules: '黑道规矩', hypnosis: '心理控制', bdsn: '午夜频道',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: true, 通讯范围: '全球', 能源类型: '电力' },
    liModeOverrides: { appNames: { map: '暗巷地图', contacts: '线人录', chat: '暗线通讯', forum: '地下情报', news: '黑色快讯', album: '私密相册' }, themeColor: '#1A1A2E' },
};

const CONTEMPORARY_HIPPIE: DeviceConfig = {
    deviceId: 'smartphone_hippie',
    deviceName: '智能手机',
    deviceForm: 'smartphone',
    eraId: 'contemporary_hippie',
    apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'modern',
    normalAppNames: { map: '地图', contacts: '通讯录', chat: '群聊', forum: '论坛', news: '资讯', album: '相册', tools: '工具',
        schedule: '公社日程', campus_card: '自由身份', club: '公社圈子', confession: '心灵告白',
        rules: '公社守则', hypnosis: '意识探索', bdsn: '深夜公社',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: true, 通讯范围: '全球', 能源类型: '电力' },
    liModeOverrides: { appNames: { map: '迷幻地图', contacts: '灵魂伴侣录', chat: '公社圈子', forum: '地下刊物', news: '反文化快报', album: '私密相册' }, themeColor: '#9B59B6' },
};

const CONTEMPORARY_ZOMBIE: DeviceConfig = {
    deviceId: 'radio_zombie',
    deviceName: '对讲机',
    deviceForm: 'radio',
    eraId: 'contemporary_zombie',
    apps: ['map', 'contacts', 'chat', 'news', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'retro',
    normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具',
        schedule: '生存日程', campus_card: '幸存者卡', club: '求生小队', confession: '末日告白',
        rules: '生存法则', hypnosis: '创伤疗愈', bdsn: '暗夜电台',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '数公里', 能源类型: '太阳能' },
    liModeOverrides: { appNames: { map: '安全区域图', contacts: '幸存者名录', chat: '加密频道', news: '末日电台' }, themeColor: '#8B3A3A' },
};

const CONTEMPORARY_EXTREME_COLD: DeviceConfig = {
    deviceId: 'radio_cold',
    deviceName: '对讲机',
    deviceForm: 'radio',
    eraId: 'contemporary_extreme_cold',
    apps: ['map', 'contacts', 'chat', 'news', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'retro',
    normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具',
        schedule: '保暖日程', campus_card: '避难所卡', club: '取暖小组', confession: '寒夜告白',
        rules: '极寒法则', hypnosis: '寒夜心理', bdsn: '极寒夜话',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '数公里', 能源类型: '太阳能' },
    liModeOverrides: { appNames: { map: '避难所地图', contacts: '幸存者名录', chat: '加密频道', news: '极寒电台' }, themeColor: '#3A5C8B' },
};

const CONTEMPORARY_BIOHAZARD: DeviceConfig = {
    deviceId: 'radio_bio',
    deviceName: '对讲机',
    deviceForm: 'radio',
    eraId: 'contemporary_biohazard',
    apps: ['map', 'contacts', 'chat', 'news', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'retro',
    normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具',
        schedule: '隔离日程', campus_card: '免疫卡', club: '隔离小组', confession: '隔离告白',
        rules: '隔离法则', hypnosis: '疫情心理', bdsn: '生化夜话',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '数公里', 能源类型: '太阳能' },
    liModeOverrides: { appNames: { map: '污染区域图', contacts: '幸存者名录', chat: '加密频道', news: '隔离区电台' }, themeColor: '#4A8B3A' },
};

const CONTEMPORARY_NUCLEAR_WINTER: DeviceConfig = {
    deviceId: 'radio_nuclear',
    deviceName: '对讲机',
    deviceForm: 'radio',
    eraId: 'contemporary_nuclear_winter',
    apps: ['map', 'contacts', 'chat', 'news', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
    uiStyle: 'retro',
    normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具',
        schedule: '辐射日程', campus_card: '防辐射卡', club: '避难圈子', confession: '核夜告白',
        rules: '辐射法则', hypnosis: '核后心理', bdsn: '核冬夜话',
    },
    capabilities: { hasGPS: true, hasVocalInput: true, hasTextInput: true, hasProjection: false, hasNeuralLink: false, hasAR: false, 通讯范围: '数公里', 能源类型: '太阳能' },
    liModeOverrides: { appNames: { map: '辐射区域图', contacts: '幸存者名录', chat: '加密频道', news: '核冬电台' }, themeColor: '#8B6B3A' },
};

// ========================================================================
// 合并为 MODERN_DEVICES partial Record（供 index.ts 进一步合并）
// ========================================================================

/** 近代（6 era）+ 当代（12 era）设备定义 */
export const MODERN_DEVICES: Record<string, DeviceConfig> = {
    // 近代东方
    'modern_eastern_republic': MODERN_EASTERN_REPUBLIC,
    'modern_eastern_meiji_taisho': MODERN_EASTERN_MEIJI,
    'modern_eastern_late_qing': MODERN_EASTERN_LATE_QING,
    // 近代西方
    'modern_western_victorian': MODERN_WESTERN_VICTORIAN,
    'modern_western_jazz_age': MODERN_WESTERN_JAZZ,
    'modern_western_postwar': MODERN_WESTERN_POSTWAR,
    // 当代
    'contemporary_urban': CONTEMPORARY_URBAN,
    'contemporary_campus': CONTEMPORARY_CAMPUS,
    'contemporary_campus_urban': CONTEMPORARY_CAMPUS_URBAN,
    'contemporary_rural': CONTEMPORARY_RURAL,
    'contemporary_post_apocalyptic': CONTEMPORARY_POST_APOCALYPTIC,
    'contemporary_noir': CONTEMPORARY_NOIR,
    'contemporary_hippie': CONTEMPORARY_HIPPIE,
    'contemporary_zombie': CONTEMPORARY_ZOMBIE,
    'contemporary_extreme_cold': CONTEMPORARY_EXTREME_COLD,
    'contemporary_biohazard': CONTEMPORARY_BIOHAZARD,
    'contemporary_nuclear_winter': CONTEMPORARY_NUCLEAR_WINTER,
};
