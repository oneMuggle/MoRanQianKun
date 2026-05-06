// 视觉设置、主题、UI文字样式、性能监控配置定义
// 从 models/system.ts 拆分而来

export type 可用视觉区域 = '聊天' | '旁白' | '角色对话' | '判定' | '顶部栏' | '左侧栏' | '右侧栏' | '角色档案';
export type 可用UI文字令牌 = '页面标题' | '分组标题' | '正文' | '辅助文本' | '按钮' | '标签' | '数字' | '等宽信息';

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

export interface 视觉设置结构 {
    时间显示格式: '传统' | '数字';
    背景图片?: string;
    常驻壁纸?: string;
    渲染层数: number;
    字体大小?: number;
    段落间距?: number;
    AI思考流式折叠?: boolean;
    底部滚动关闭显示?: boolean;
    字体资源列表?: 字体资源结构[];
    区域文字样式?: Partial<Record<可用视觉区域, 区域文字样式结构>>;
    UI文字样式?: Partial<Record<可用UI文字令牌, UI文字样式结构>>;
    启用背景音乐?: boolean;
    全局音量?: number;
    音频播放模式?: 'list-loop' | 'single-loop' | 'random';
    当前播放曲目ID?: string;
}

export interface MusicTrack {
    id: string;
    名称: string;
    URL: string;
    时长: number;
    封面URL?: string;
    歌词?: string;
}

/** 性能监控配置结构 */
export interface 性能监控配置结构 {
    启用性能监控: boolean;
    显示FPS: boolean;
    AI响应慢阈值ms: number;
    生图慢阈值ms: number;
}

export const 默认性能监控配置: 性能监控配置结构 = {
    启用性能监控: false,
    显示FPS: false,
    AI响应慢阈值ms: 10000,
    生图慢阈值ms: 30000,
};

export type ThemePreset = 'ink' | 'azure' | 'ember' | 'jade' | 'violet' | 'moon' | 'crimson' | 'sand';
