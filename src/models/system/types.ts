/**
 * models/system/types.ts
 *
 * 集中存放 models/system 中跨子模块共用的"小"类型声明。
 * 范围：仅 type alias / 小型 interface（< 30 行），不包含大型结构体与 const/function。
 * 大型 interface 跟随各自职责进入 *.config.ts 子文件。
 *
 * Day 31: 从 models/system.ts 抽离所有纯类型定义至此。
 */

// ============================== API 与图片生成（小类型 — re-export 自 api-config） ==============================
// 这些类型在 models/api-config.ts 中已有完整定义，本文件不重复声明。
// 通过 ./api-config 子模块统一对外暴露，避免 TS2308 冲突。

export type {
    接口供应商类型,
    OpenAI兼容方案类型,
    请求协议覆盖类型,
    图片响应格式类型,
    文生图后端类型,
    文生图接口路径模式类型,
    文生图预设接口路径类型,
    生图画风类型,
    NovelAI采样器类型,
    NovelAI噪点表类型,
    画师串预设适用范围类型,
    词组转化器提示词预设类型,
    角色锚点来源类型,
    图片词组序列化策略类型,
    PNG画风预设来源类型,
} from './api-config';

// ============================== UI/视觉（小类型） ==============================

export type 可用视觉区域 = '聊天' | '旁白' | '角色对话' | '判定' | '顶部栏' | '左侧栏' | '右侧栏' | '角色档案';
export type 可用UI文字令牌 = '页面标题' | '分组标题' | '正文' | '辅助文本' | '按钮' | '标签' | '数字' | '等宽信息';

// ============================== 游戏配置（小类型） ==============================

export type 剧情风格类型 = '后宫' | '修炼' | '一般' | '修罗场' | '纯爱' | 'NTL后宫';
export type NTL后宫档位 = '禁止乱伦' | '假乱伦' | '无限制';
export type 酒馆提示词后处理类型 = '未选择' | '单一用户' | '严格' | '半严格';
export type 武力等级 = '低武' | '中武' | '高武' | '修仙';
export type NSFW场景类型 = '无' | '点到为止' | '适度展开' | '完全展开';
export type 时代背景 = '古代' | '近代' | '现代' | '近未来' | '未来' | '自定义';
export type 体系类型 = '武侠' | '志怪' | '双修';
export type 剧情推进速度 = '缓慢' | '正常' | '快速' | '跳过至关键节点';
export type 行动选项增强档位 = '缓慢' | '正常' | '快速' | '跳过至关键节点';
export type 能力类型 = '传统武侠' | '修仙体系' | '超能力线' | '混合世界';
export type 超能力分类 = '心灵感应' | '念力' | '预知' | '治愈' | '元素操控' | '时空' | '变身' | '灵能' | '高科技' | '综合' | '未觉醒';
export type 觉醒程度 = '未觉醒' | '初觉' | '小成' | '大成' | '巅峰';
export type 游戏难度 = 'relaxed' | 'easy' | 'normal' | 'hard' | 'extreme';
export type 初始关系模板类型 = '独行少系' | '家族牵引' | '师门牵引' | '世家官门' | '青梅旧识' | '旧仇旧债';
export type 关系侧重类型 = '亲情' | '友情' | '师门' | '情缘' | '利益' | '仇怨';
export type 开局切入偏好类型 = '日常低压' | '在途起手' | '家宅起手' | '门派起手' | '风波前夜';
export type 同人来源类型 = '小说' | '动漫' | '游戏' | '影视';
export type 同人融合强度类型 = '轻度映射' | '中度混编' | '显性同台';
export type 酒馆预设消息角色类型 = 'system' | 'user' | 'assistant';
export type 行动选项输入模式类型 = '追加' | '替换';
export type SaveType = 'manual' | 'auto';
export type ThemePreset = 'ink' | 'azure' | 'ember' | 'jade' | 'violet' | 'moon' | 'crimson' | 'sand';
export type PromptCategory = '核心设定' | '数值设定' | '难度设定' | '写作设定' | '自定义' | '运行时' | '运行时Schema';

// ============================== 小型结构体（跨子模块引用） ==============================

export interface 货币模板 {
    单位列表: string[];
    默认初始值: Record<string, number>;
}

export interface 字体资源结构 {
    id: string;
    名称: string;
    fontFamily: string;
    来源: 'system' | 'upload';
    文件名?: string;
    mimeType?: string;
    dataUrl?: string;
}

export interface 区域文字样式结构 {
    启用自定义?: boolean;
    字体ID?: string;
    字体颜色?: string;
    字号?: number;
    行高?: number;
    字形?: 'normal' | 'italic';
}

export interface UI文字样式结构 {
    启用自定义?: boolean;
    字体ID?: string;
    字体颜色?: string;
    字号?: number;
    行高?: number;
    字形?: 'normal' | 'italic';
}

export interface 图片管理设置结构 {
    场景图历史上限: number;
}

export interface MusicTrack {
    id: string;
    名称: string;
    URL: string; // Data URL or Blob URL
    时长: number;
    封面URL?: string;
    歌词?: string; // LRC format
}

export interface 难度调整记录 {
    时间: number;
    原难度: 游戏难度;
    新难度: 游戏难度;
    原因: string;
    玩家表现: {
        胜率: number;
        死亡次数: number;
        任务完成率: number;
    };
}

export interface 时代信息结构 {
    配置ID: string;
    名称: string;
    时代背景: 时代背景;
}

export interface 时代主题映射 {
    [eraId: string]: {
        推荐主题: ThemePreset;
        主题描述: string;
    };
}

// 角色锚点特征结构 / 角色锚点结构 在 ./api-config 中已定义（来自 models/api-config.ts）
export type { 角色锚点特征结构, 角色锚点结构 } from './api-config';

export interface 同人角色替换规则结构 {
    原名称: string;
    替换为: string;
}

export interface 酒馆预设提示词结构 {
    identifier: string;
    name?: string;
    role: 酒馆预设消息角色类型;
    content: string;
    system_prompt?: boolean;
}

export interface 酒馆预设顺序项结构 {
    identifier: string;
    enabled: boolean;
}

export interface 酒馆预设顺序结构 {
    character_id: number;
    order: 酒馆预设顺序项结构[];
}

export interface 酒馆预设结构 {
    prompts: 酒馆预设提示词结构[];
    prompt_order: 酒馆预设顺序结构[];
}

export interface 酒馆预设条目结构 {
    id: string;
    名称: string;
    预设: 酒馆预设结构;
    角色ID?: number | null;
    导入时间?: number;
}

export interface 回忆条目结构 {
    名称: string; // 例如：【回忆001】
    概括: string; // 对应短期记忆
    原文: string; // 对应即时记忆
    回合: number; // 顺序号
    记录时间: string; // YYYY:MM:DD:HH:MM
    时间戳: string; // YYYY:MM:DD:HH:MM
}

export interface 聊天记录结构 {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    gameTime?: string; // 结构化时间戳字符串
    inputTokens?: number; // 上传/输入token估算值
    responseDurationSec?: number; // 发送到完整回复结束耗时（秒）
    outputTokens?: number; // AI输出token估算值
    [key: string]: any; // Allow extensibility for structuredResponse etc.
}

export interface 存档元数据结构 {
    schemaVersion?: number;
    历史记录条数?: number;
    历史记录是否裁剪?: boolean;
    自动存档签名?: string;
}

export interface 核心提示词快照结构 {
    世界观母本?: string;
    境界体系?: string;
}

export interface 节日结构 {
    id: string;
    名称: string;
    月: number;
    日: number;
    描述: string;
    效果: string; // 如：鬼怪出现率增加
}

export interface 提示词结构 {
    id: string;
    标题: string;
    内容: string;
    类型: PromptCategory;
    启用: boolean;
    版本?: string;
    更新时间?: string;
}
