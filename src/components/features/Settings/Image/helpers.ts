/**
 * ImageGenerationSettings — 纯函数与常量
 *
 * 提取自原 ImageGenerationSettings.tsx（v3 路线图 Phase B1 PR1）。
 * 无 React 依赖、无副作用，可独立测试。
 */

import type {
    功能模型占位配置结构,
    画师串预设结构,
    画师串预设适用范围类型,
    词组转化器提示词预设结构,
    词组转化器提示词预设类型,
    文生图接口配置结构,
    文生图后端类型
} from '@/types';
import type {
    生图模型字段,
    画师串适用页签,
    词组预设页签,
    页面选项,
    后端选项,
    接口路径模式选项_,
    预设接口路径选项_,
    NovelAI采样器选项_,
    NovelAI噪点表选项_
} from './types';

// ----- 初始化器 -----

export const 初始化模型列表 = (): Record<生图模型字段, string[]> => ({
    文生图模型使用模型: [],
    场景生图模型使用模型: [],
    主角生图模型使用模型: [],
    词组转化器使用模型: [],
    PNG提炼使用模型: []
});

export const 初始化加载状态 = (): Record<生图模型字段, boolean> => ({
    文生图模型使用模型: false,
    场景生图模型使用模型: false,
    主角生图模型使用模型: false,
    词组转化器使用模型: false,
    PNG提炼使用模型: false
});

// ----- 页面 / 后端选项 -----

export const 基础页面选项: 页面选项[] = [
    { value: 'basic', label: '基础' },
    { value: 'provider', label: '接口设置' },
    { value: 'transformer', label: '转化器' },
    { value: 'presets', label: '预设管理' },
    { value: 'automation', label: '自动任务' },
    { value: 'retry', label: '重试设置' },
    { value: 'player', label: '主角' }
];

export const 文生图后端选项: 后端选项[] = [
    { value: 'openai', label: 'OpenAI 兼容' },
    { value: 'grok', label: 'Grok (xAI)' },
    { value: 'novelai', label: 'NovelAI 官方' },
    { value: 'sd_webui', label: 'Stable Diffusion WebUI' },
    { value: 'comfyui', label: 'ComfyUI' }
];

export const 接口路径模式选项: 接口路径模式选项_[] = [
    { value: 'preset', label: '预设路径' },
    { value: 'custom', label: '自定义路径' }
];

export const 预设路径选项映射: Record<
    功能模型占位配置结构['文生图后端类型'],
    预设接口路径选项_[]
> = {
    openai: [
        { value: 'openai_images', label: '/v1/images/generations' },
        { value: 'openai_chat', label: '/v1/chat/completions' }
    ],
    grok: [{ value: 'openai_chat', label: '/v1/chat/completions' }],
    novelai: [{ value: 'novelai_generate', label: '/ai/generate-image' }],
    sd_webui: [{ value: 'sd_txt2img', label: '/sdapi/v1/txt2img' }],
    comfyui: [{ value: 'comfyui_prompt', label: '/prompt' }]
};

// ----- NovelAI 数据 -----

export const NovelAI模型建议 = ['nai-diffusion-4-5-full', 'nai-diffusion-4-5-curated', 'nai-diffusion-4-full'];

export const NovelAI采样器选项: NovelAI采样器选项_[] = [
    { value: 'k_euler_ancestral', label: 'Euler Ancestral' },
    { value: 'k_euler', label: 'Euler' },
    { value: 'k_dpmpp_2m', label: 'DPM++ 2M' },
    { value: 'k_dpmpp_2s_ancestral', label: 'DPM++ 2S Ancestral' },
    { value: 'k_dpmpp_sde', label: 'DPM++ SDE' },
    { value: 'k_dpmpp_2m_sde', label: 'DPM++ 2M SDE' }
];

export const NovelAI噪点表选项: NovelAI噪点表选项_[] = [
    { value: 'karras', label: 'Karras' },
    { value: 'native', label: 'Native' },
    { value: 'exponential', label: 'Exponential' },
    { value: 'polyexponential', label: 'Polyexponential' }
];

// ----- 后端判断 -----

export const 获取后端设置标签 = (backend: 功能模型占位配置结构['文生图后端类型']): string => {
    switch (backend) {
        case 'sd_webui':
            return 'WebUI 设置';
        case 'comfyui':
            return 'ComfyUI 设置';
        case 'novelai':
            return 'NovelAI 设置';
        case 'openai':
        default:
            return '后端设置';
    }
};

export const 图片后端需要模型选择 = (backend: 功能模型占位配置结构['文生图后端类型']): boolean => {
    return backend === 'openai' || backend === 'grok' || backend === 'novelai';
};

export const 图片后端需要鉴权 = (backend: 功能模型占位配置结构['文生图后端类型']): boolean => {
    return backend === 'openai' || backend === 'grok' || backend === 'novelai';
};

// ----- 常量 -----

export const ComfyUI工作流占位提示 =
    '__PROMPT__ / {{prompt}}，__NEGATIVE_PROMPT__ / {{negative_prompt}}，__WIDTH__ / {{width}}，__HEIGHT__ / {{height}}，__STEPS__ / {{steps}}，__CFG__ / {{cfg}}，__CFG_RESCALE__ / {{cfg_rescale}}，__SAMPLER__ / {{sampler}}，__SCHEDULER__ / {{scheduler}}，__SEED__ / {{seed}}，__SMEA__ / {{smea}}，__SMEA_DYN__ / {{smea_dyn}}';

export const 页面容器样式 = 'rounded-2xl border border-fuchsia-500/20 bg-black/25 p-5 space-y-5';
export const 卡片样式 = 'rounded-xl border border-white/10 bg-black/20 p-4 space-y-4';
export const 标签样式 = 'text-sm font-bold text-fuchsia-200';

// ----- 工厂函数 -----

export const 生成预设ID = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const 创建文生图配置模板 = (backend: 文生图后端类型): 文生图接口配置结构 => {
    const now = Date.now();
    return {
        id: 生成预设ID('img_api'),
        名称: `文生图配置 ${new Date(now).toLocaleTimeString()}`,
        后端类型: backend,
        模型: '',
        API地址: backend === 'novelai'
            ? 'https://image.novelai.net'
            : backend === 'grok'
                ? 'https://api.x.ai/v1'
                : '',
        API密钥: '',
        接口路径模式: 'preset',
        预设接口路径: 预设路径选项映射[backend][0]?.value || 'openai_images',
        自定义接口路径: '',
        响应格式: 'url',
        OpenAI自定义格式: false,
        ComfyUI工作流JSON: '',
        NovelAI启用自定义参数: false,
        NovelAI采样器: 'k_euler_ancestral',
        NovelAI噪点表: 'karras',
        NovelAI步数: 28,
        NovelAI负面提示词: '',
        createdAt: now,
        updatedAt: now
    };
};

export const 创建空画师串预设 = (scope: 画师串适用页签): 画师串预设结构 => {
    const now = Date.now();
    return {
        id: 生成预设ID('artist_preset'),
        名称: scope === 'scene'
            ? '新建场景画师串'
            : scope === 'player'
                ? '新建主角画师串'
                : '新建NPC画师串',
        适用范围: scope as 画师串预设适用范围类型 || 'npc',
        画师串: '',
        正面提示词: '',
        负面提示词: '',
        createdAt: now,
        updatedAt: now
    };
};

export const 创建空词组预设 = (scope: 词组预设页签): 词组转化器提示词预设结构 => {
    const now = Date.now();
    return {
        id: 生成预设ID('transformer_preset'),
        名称: scope === 'nai'
            ? '新建NAI提示词'
            : scope === 'scene'
                ? '新建场景提示词'
                : scope === 'player'
                    ? '新建主角提示词'
                    : '新建NPC提示词',
        类型: scope as 词组转化器提示词预设类型,
        提示词: '',
        createdAt: now,
        updatedAt: now
    };
};
