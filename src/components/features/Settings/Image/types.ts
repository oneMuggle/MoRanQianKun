/**
 * ImageGenerationSettings — 公共类型定义
 *
 * 提取自原 ImageGenerationSettings.tsx（v3 路线图 Phase B1 PR1）。
 * 与 helpers.ts 配合，承载 Settings panel 共享的 Props / Context / 子类型。
 */

import type {
    接口设置结构,
    功能模型占位配置结构,
    文生图接口配置结构,
    文生图后端类型,
    画师串预设适用范围类型,
    词组转化器提示词预设类型
} from '@/types';

export interface Props {
    settings: 接口设置结构;
    onSave: (settings: 接口设置结构) => void;
}

export type 生图模型字段 =
    | '文生图模型使用模型'
    | '场景生图模型使用模型'
    | '主角生图模型使用模型'
    | '词组转化器使用模型'
    | 'PNG提炼使用模型';

export type 设置分页 = 'basic' | 'provider' | 'transformer' | 'presets' | 'automation' | 'retry' | 'player';

export type 画师串适用页签 = 'npc' | 'scene' | 'player';

export type 词组预设页签 = 'nai' | 'npc' | 'scene' | 'player';

export type TestResultModal = {
    open: boolean;
    title: string;
    content: string;
    ok: boolean;
};

export type WorkflowItem = {
    path: string;
    name: string;
    category: string;
};

export type 页面选项 = { value: 设置分页; label: string };

export type 后端选项 = { value: 功能模型占位配置结构['文生图后端类型']; label: string };

export type 接口路径模式选项_ = {
    value: 功能模型占位配置结构['文生图接口路径模式'];
    label: string;
};

export type 预设接口路径选项_ = {
    value: 功能模型占位配置结构['文生图预设接口路径'];
    label: string;
};

export type NovelAI采样器选项_ = {
    value: 功能模型占位配置结构['NovelAI采样器'];
    label: string;
};

export type NovelAI噪点表选项_ = {
    value: 功能模型占位配置结构['NovelAI噪点表'];
    label: string;
};

/**
 * 创建空文生图配置时使用的运行时标识
 */
export type { 画师串预设适用范围类型, 词组转化器提示词预设类型, 文生图接口配置结构, 文生图后端类型 };
