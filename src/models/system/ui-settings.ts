/**
 * models/system/ui-settings.ts
 *
 * Day 32: UI 文字样式 / 字体 / 性能监控 等运行时设置。
 * 类型别名从 ./types 拉取；interface 在此文件内完整声明。
 */

import type {
    字体资源结构,
    区域文字样式结构,
    UI文字样式结构,
    可用视觉区域,
    可用UI文字令牌,
} from './types';

// ============================== 视觉设置结构（含 UI 文字样式 / 音乐） ==============================

export interface 视觉设置结构 {
    时间显示格式: '传统' | '数字';
    背景图片?: string; // URL 或 Base64
    常驻壁纸?: string; // URL 或 Base64
    渲染层数: number; // New: Default 30
    字体大小?: number; // 兼容旧字段，默认 16
    段落间距?: number; // 兼容旧字段，默认 1.6
    AI思考流式折叠?: boolean; // 默认 true，流式与常规回合中默认折叠思考内容
    底部滚动关闭显示?: boolean; // 默认 false，开启后隐藏底部世界大事滚动区
    字体资源列表?: 字体资源结构[];
    区域文字样式?: Partial<Record<可用视觉区域, 区域文字样式结构>>;
    UI文字样式?: Partial<Record<可用UI文字令牌, UI文字样式结构>>;

    // 背景音乐设置
    启用背景音乐?: boolean;
    全局音量?: number; // 0 到 100
    音频播放模式?: 'list-loop' | 'single-loop' | 'random';
    当前播放曲目ID?: string;
}

// ============================== 性能监控配置 ==============================

/**
 * 性能监控配置结构
 * 用于控制性能监控功能的开关和阈值
 */
export interface 性能监控配置结构 {
    启用性能监控: boolean;       // 默认 false
    显示FPS: boolean;           // 默认 false
    AI响应慢阈值ms: number;     // 默认 10000ms (10秒)
    生图慢阈值ms: number;        // 默认 30000ms (30秒)
    显示性能面板: boolean;       // 默认 false
    启用渲染分析: boolean;       // 默认 false
    启用内存追踪: boolean;       // 默认 false
    启用AI队列监控: boolean;     // 默认 false
    慢操作显示条数: number;      // 默认 10
}

export const 默认性能监控配置: 性能监控配置结构 = {
    启用性能监控: false,
    显示FPS: false,
    AI响应慢阈值ms: 10000,
    生图慢阈值ms: 30000,
    显示性能面板: false,
    启用渲染分析: false,
    启用内存追踪: false,
    启用AI队列监控: false,
    慢操作显示条数: 10,
};

// 重新导出 types 中的 UI 相关 interface
export type {
    字体资源结构,
    区域文字样式结构,
    UI文字样式结构,
    MusicTrack,
} from './types';
