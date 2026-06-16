// App 注册表 — 定义所有可用 App 的元数据、分类、身份匹配规则

export type AppCategory = 'universal' | 'background' | 'optional' | 'nsfw';

/** NSFW 内容分级 */
export enum NsfwLevel {
  Clean = 0,       // 全年龄
  Suggestive = 1,  // 轻度暗示（暧昧对话、擦边动态）
  Mature = 2,      // 中度（亲密接触描写）
  Explicit = 3,    // 重度（直接描写）
}

/** NSFW 显示模式 */
export type NsfwMode = 'hidden' | 'visible' | 'content-transform';

export interface AppDefinition {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 图标（emoji） */
  icon: string;
  /** 分类 */
  category: AppCategory;
  /** 哪些背景自动安装此 App（category=background 时生效） */
  requiredBackground?: string[];
  /** App 主题色（用于图标渐变） */
  color: string;
  /** 应用市场中的描述 */
  description: string;
  /** 版本号 */
  version: string;
  /** 开发者（应用市场用） */
  developer?: string;
  /** 是否系统 App（不可卸载） */
  isSystem?: boolean;
  /** NSFW 分级 */
  nsfwLevel?: NsfwLevel;
  /** NSFW 模式 */
  nsfwMode?: NsfwMode;
  /** 应用市场中的分类标签 */
  storeTags?: string[];
  /** 是否在 Dock 栏 */
  isDock?: boolean;
  /** 里模式名称覆盖 */
  liName?: string;
}

// ============================================================
// 通用 App
// ============================================================

export const universalApps: AppDefinition[] = [
  {
    id: 'phone',
    name: '电话',
    icon: '📞',
    category: 'universal',
    color: '#34C759',
    description: '拨打电话、查看通话记录',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
    isDock: true,
    liName: '密线',
  },
  {
    id: 'sms',
    name: '短信',
    icon: '💬',
    category: 'universal',
    color: '#34C759',
    description: '收发短信、管理会话',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
    isDock: true,
    liName: '密信',
  },
  {
    id: 'camera',
    name: '相机',
    icon: '📷',
    category: 'universal',
    color: '#8E8E93',
    description: '拍照、录像',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
    isDock: true,
    liName: '暗摄',
  },
  {
    id: 'settings',
    name: '设置',
    icon: '⚙️',
    category: 'universal',
    color: '#8E8E93',
    description: '系统设置',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
    liName: '暗面设置',
  },
  {
    id: 'weather',
    name: '天气',
    icon: '🌤️',
    category: 'universal',
    color: '#5AC8FA',
    description: '实时天气、未来预报',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
    liName: '夜象',
  },
  {
    id: 'calendar',
    name: '日历',
    icon: '📅',
    category: 'universal',
    color: '#FF3B30',
    description: '日程、备忘录',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
    liName: '密约',
  },
  {
    id: 'clock',
    name: '时钟',
    icon: '⏰',
    category: 'universal',
    color: '#FF9500',
    description: '闹钟、计时器、秒表',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
  },
  {
    id: 'files',
    name: '文件',
    icon: '📁',
    category: 'universal',
    color: '#5856D6',
    description: '文件管理器',
    version: '1.0.0',
    isSystem: true,
    nsfwLevel: NsfwLevel.Clean,
  },
];

// ============================================================
// 背景匹配 App
// ============================================================

export const backgroundApps: AppDefinition[] = [
  // 配送出行
  {
    id: 'ride_hailing',
    name: '司机端',
    icon: '🚗',
    category: 'background',
    requiredBackground: ['网约车司机', '代驾司机', '网约车队长'],
    color: '#FF9500',
    description: '接单、导航、收入统计',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['出行', '工作'],
    liName: '夜行接单',
  },
  {
    id: 'delivery',
    name: '配送端',
    icon: '🛵',
    category: 'background',
    requiredBackground: ['外卖骑手', '众包配送员', '快递小哥', '外卖站长'],
    color: '#007AFF',
    description: '抢单、路线、配送记录',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['出行', '工作'],
    liName: '暗路配送',
  },
  // 生活服务
  {
    id: 'appointment',
    name: '预约管理',
    icon: '📋',
    category: 'background',
    requiredBackground: ['理发师', '美容师', '美甲师', '推拿按摩师', '宠物美容师', '健身教练'],
    color: '#AF52DE',
    description: '客户预约、排期管理',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['工作', '管理'],
  },
  {
    id: 'ledger',
    name: '记账本',
    icon: '📒',
    category: 'background',
    requiredBackground: ['便利店老板', '夜市摊主', '水果摊老板', '菜贩子'],
    color: '#FF2D55',
    description: '收支记录、库存管理',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['工作', '财务'],
  },
  // 职场
  {
    id: 'work_schedule',
    name: '工作台',
    icon: '💼',
    category: 'background',
    requiredBackground: ['大厂员工', '都市白领', '投行分析师', '律所新人', 'MCN运营'],
    color: '#007AFF',
    description: '工作日程、打卡、内部通讯',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['工作'],
  },
  {
    id: 'property',
    name: '房源管理',
    icon: '🏠',
    category: 'background',
    requiredBackground: ['房产中介'],
    color: '#34C759',
    description: '房源信息、客户跟进',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['工作'],
  },
];

// ============================================================
// 可选 App
// ============================================================

export const optionalApps: AppDefinition[] = [
  {
    id: 'forum',
    name: '论坛',
    icon: '📋',
    category: 'optional',
    color: '#FF9500',
    description: '综合论坛：资讯、讨论、求助',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['社交', '社区'],
    liName: '暗面论坛',
  },
  {
    id: 'shopping',
    name: '购物',
    icon: '🛒',
    category: 'optional',
    color: '#FF2D55',
    description: '在线购物、订单管理',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['生活', '购物'],
    liName: '暗市',
  },
  {
    id: 'social_media',
    name: '社交媒体',
    icon: '📱',
    category: 'optional',
    color: '#AF52DE',
    description: '动态、点赞、评论',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['社交'],
    liName: '暗面社交',
  },
  {
    id: 'news',
    name: '新闻',
    icon: '📰',
    category: 'optional',
    color: '#FF3B30',
    description: '新闻资讯、热点追踪',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['资讯'],
    liName: '暗面快讯',
  },
  {
    id: 'music',
    name: '音乐',
    icon: '🎵',
    category: 'optional',
    color: '#FF2D55',
    description: '在线音乐、歌单',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['娱乐'],
  },
  {
    id: 'video',
    name: '视频',
    icon: '🎬',
    category: 'optional',
    color: '#8E8E93',
    description: '短视频、直播',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['娱乐'],
  },
  {
    id: 'fitness',
    name: '运动健康',
    icon: '🏃',
    category: 'optional',
    color: '#34C759',
    description: '步数、运动记录、健康数据',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    storeTags: ['生活', '健康'],
  },
  {
    id: 'map_app',
    name: '地图导航',
    icon: '🗺️',
    category: 'optional',
    color: '#34C759',
    description: '地图、导航、周边',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Clean,
    isDock: true,
    liName: '暗面地图',
  },
];

// ============================================================
// NSFW App
// ============================================================

export const nsfwApps: AppDefinition[] = [
  {
    id: 'dating',
    name: '心动配对',
    icon: '❤️',
    category: 'nsfw',
    color: '#FF2D55',
    description: 'AI 智能配对，遇见有缘人',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Suggestive,
    nsfwMode: 'visible',
    storeTags: ['社交', '交友', '成人'],
    liName: '暗缘',
  },
  {
    id: 'adult_forum',
    name: '深夜论坛',
    icon: '🌙',
    category: 'nsfw',
    color: '#5856D6',
    description: '匿名成人社区，畅所欲言',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Mature,
    nsfwMode: 'visible',
    storeTags: ['社区', '成人'],
    liName: '禁忌版块',
  },
  {
    id: 'nsfw_gallery',
    name: '私密空间',
    icon: '🔒',
    category: 'nsfw',
    color: '#8E8E93',
    description: '内容订阅、创作者发布',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Explicit,
    nsfwMode: 'visible',
    storeTags: ['订阅', '成人'],
    liName: '暗室',
  },
  {
    id: 'live_stream',
    name: '直播',
    icon: '📺',
    category: 'nsfw',
    color: '#FF9500',
    description: '观看直播、弹幕互动',
    version: '1.0.0',
    isSystem: false,
    nsfwLevel: NsfwLevel.Suggestive,
    nsfwMode: 'content-transform',
    storeTags: ['娱乐', '直播'],
    liName: '暗播',
  },
];

// ============================================================
// 工具函数
// ============================================================

/** 所有 App 注册表 */
export const allAppDefinitions: AppDefinition[] = [
  ...universalApps,
  ...backgroundApps,
  ...optionalApps,
  ...nsfwApps,
];

/** 根据 ID 查找 App 定义 */
export function findAppById(id: string): AppDefinition | undefined {
  return allAppDefinitions.find(app => app.id === id);
}

/** 获取指定分类的 App */
export function getAppsByCategory(category: AppCategory): AppDefinition[] {
  return allAppDefinitions.filter(app => app.category === category);
}

/** 获取背景匹配的 App */
export function getAppsForBackground(backgroundName: string): AppDefinition[] {
  return backgroundApps.filter(
    app => app.requiredBackground?.includes(backgroundName)
  );
}

/** 获取 Dock App（固定在底部） */
export function getDockApps(): AppDefinition[] {
  return allAppDefinitions.filter(app => app.isDock);
}

/** 检查 App 是否为 NSFW */
export function isNsfwApp(app: AppDefinition): boolean {
  return app.category === 'nsfw' || (app.nsfwLevel ?? 0) > 0;
}
