// API接口、图片生成、角色锚点相关配置定义
// 从 models/system.ts 拆分而来

import { 生图筛选性别类型, 生图筛选重要性类型 } from './imageGeneration';

export type 接口供应商类型 = 'gemini' | 'claude' | 'openai' | 'deepseek' | 'zhipu' | 'openai_compatible' | 'grok';

export type OpenAI兼容方案类型 = 'custom' | 'siliconflow' | 'together' | 'groq';

export type 请求协议覆盖类型 = 'auto' | 'openai' | 'gemini' | 'claude' | 'deepseek';

export type 图片响应格式类型 = 'url' | 'b64_json';
export type 文生图后端类型 = 'openai' | 'novelai' | 'sd_webui' | 'comfyui' | 'grok';
export type 文生图接口路径模式类型 = 'preset' | 'custom';
export type 文生图预设接口路径类型 = 'openai_images' | 'openai_chat' | 'novelai_generate' | 'sd_txt2img' | 'comfyui_prompt';
export type 生图画风类型 = '通用' | '二次元' | '写实' | '国风';
export type NovelAI采样器类型 = 'k_euler' | 'k_euler_ancestral' | 'k_dpmpp_2m' | 'k_dpmpp_2s_ancestral' | 'k_dpmpp_sde' | 'k_dpmpp_2m_sde';
export type NovelAI噪点表类型 = 'native' | 'karras' | 'exponential' | 'polyexponential';

export interface 文生图接口配置结构 {
    id: string;
    名称: string;
    后端类型: 文生图后端类型;
    模型: string;
    API地址: string;
    API密钥: string;
    接口路径模式: 文生图接口路径模式类型;
    预设接口路径: 文生图预设接口路径类型;
    自定义接口路径: string;
    响应格式: 图片响应格式类型;
    OpenAI自定义格式: boolean;
    ComfyUI工作流JSON: string;
    NovelAI启用自定义参数: boolean;
    NovelAI采样器: NovelAI采样器类型;
    NovelAI噪点表: NovelAI噪点表类型;
    NovelAI步数: number;
    NovelAI负面提示词: string;
    createdAt: number;
    updatedAt: number;
}

export type 画师串预设适用范围类型 = 'npc' | 'scene' | 'player' | 'all';
export type 词组转化器提示词预设类型 = 'nai' | 'npc' | 'scene' | 'scene_judge' | 'player';
export type 角色锚点来源类型 = 'ai_extract' | 'manual' | 'imported';
export type 图片词组序列化策略类型 = 'flat' | 'nai_character_segments' | 'gemini_structured' | 'grok_structured';

export interface 画师串预设结构 {
    id: string;
    名称: string;
    适用范围: 画师串预设适用范围类型;
    画师串: string;
    正面提示词: string;
    负面提示词: string;
    createdAt: number;
    updatedAt: number;
}

export interface 词组转化器提示词预设结构 {
    id: string;
    名称: string;
    类型: 词组转化器提示词预设类型;
    提示词: string;
    角色锚定模式提示词?: string;
    场景角色锚定模式提示词?: string;
    无锚点回退提示词?: string;
    输出格式提示词?: string;
    createdAt: number;
    updatedAt: number;
}

export interface 角色锚点特征结构 {
    外貌标签?: string[];
    身材标签?: string[];
    胸部标签?: string[];
    发型标签?: string[];
    发色标签?: string[];
    眼睛标签?: string[];
    肤色标签?: string[];
    年龄感标签?: string[];
    服装基底标签?: string[];
    特殊特征标签?: string[];
}

export interface 角色锚点结构 {
    id: string;
    npcId: string;
    名称: string;
    是否启用: boolean;
    生成时默认附加: boolean;
    场景生图自动注入: boolean;
    正面提示词: string;
    负面提示词: string;
    结构化特征?: 角色锚点特征结构;
    来源: 角色锚点来源类型;
    原始提取文本?: string;
    提取模型信息?: string;
    createdAt: number;
    updatedAt: number;
}

export type PNG画风预设来源类型 = 'novelai' | 'sd_webui' | 'unknown';

export interface PNG解析参数结构 {
    采样器?: string;
    噪声计划?: string;
    步数?: number;
    CFG强度?: number;
    CFGScale?: number;
    CFG重缩放?: number;
    反向提示引导强度?: number;
    ClipSkip?: number;
    宽度?: number;
    高度?: number;
    随机种子?: number;
    SMEA?: boolean;
    SMEA动态?: boolean;
    动态阈值?: boolean;
    动态阈值百分位?: number;
    动态阈值模拟CFG?: number;
    高Sigma跳过CFG?: number;
    低Sigma跳过CFG?: number;
    偏好布朗噪声?: boolean;
    Euler祖先采样Bug兼容?: boolean;
    精细细节增强?: boolean;
    最小化Sigma无穷?: boolean;
    高分修复?: string;
    Hires修复?: {
        放大倍数?: number;
        步数?: number;
        放大器?: string;
        去噪强度?: number;
    };
    ADetailer?: {
        模型?: string;
        正向提示词?: string;
        负向提示词?: string;
    };
    模型?: string;
    V4正向提示?: {
        useCoords?: boolean;
        useOrder?: boolean;
        legacyUc?: boolean;
        characterCaptions?: Array<string | Record<string, unknown>>;
    };
    V4负向提示?: {
        useCoords?: boolean;
        useOrder?: boolean;
        legacyUc?: boolean;
        characterCaptions?: Array<string | Record<string, unknown>>;
    };
    原始参数?: Record<string, unknown>;
    LoRA列表?: Array<{
        名称: string;
        权重?: number;
    }>;
}

export interface PNG画风预设结构 {
    id: string;
    名称: string;
    来源: PNG画风预设来源类型;
    原始正面提示词: string;
    剥离后正面提示词: string;
    AI提炼正面提示词: string;
    正面提示词: string;
    负面提示词: string;
    画师串: string;
    画师命中项: string[];
    优先复刻原参数?: boolean;
    参数?: PNG解析参数结构;
    封面?: string;
    原始元数据?: string;
    元数据标签?: Record<string, string>;
    createdAt: number;
    updatedAt: number;
}

export interface 模型词组转化器预设结构 {
    id: string;
    名称: string;
    是否启用: boolean;
    模型专属提示词: string;
    锚定模式模型提示词?: string;
    词组序列化策略?: 图片词组序列化策略类型;
    NPC词组转化器提示词预设ID: string;
    场景词组转化器提示词预设ID: string;
    场景判定提示词预设ID: string;
    createdAt: number;
    updatedAt: number;
}

export interface 单接口配置结构 {
    id: string;
    名称: string;
    供应商: 接口供应商类型;
    兼容方案?: OpenAI兼容方案类型;
    协议覆盖?: 请求协议覆盖类型;
    baseUrl: string;
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
    createdAt: number;
    updatedAt: number;
}

export interface 功能模型占位配置结构 {
    主剧情使用模型: string;
    剧情回忆独立模型开关: boolean;
    剧情回忆静默确认: boolean;
    剧情回忆完整原文条数N: number;
    剧情回忆最早触发回合: number;
    记忆总结独立模型开关: boolean;
    世界演变独立模型开关: boolean;
    变量计算独立模型开关: boolean;
    规划分析独立模型开关: boolean;
    女主规划独立模型开关: boolean;
    剧情规划独立模型开关: boolean;
    文章优化独立模型开关: boolean;
    小说拆分功能启用: boolean;
    小说拆分独立模型开关: boolean;
    剧情回忆使用模型: string;
    剧情回忆使用配置ID: string;
    剧情回忆API地址: string;
    剧情回忆API密钥: string;
    记忆总结使用模型: string;
    记忆总结使用配置ID: string;
    记忆总结API地址: string;
    记忆总结API密钥: string;
    世界演变使用模型: string;
    世界演变使用配置ID: string;
    世界演变API地址: string;
    世界演变API密钥: string;
    变量计算使用模型: string;
    变量计算使用配置ID: string;
    变量计算API地址: string;
    变量计算API密钥: string;
    规划分析使用模型: string;
    规划分析使用配置ID: string;
    规划分析API地址: string;
    规划分析API密钥: string;
    女主规划使用模型: string;
    女主规划使用配置ID: string;
    女主规划API地址: string;
    女主规划API密钥: string;
    剧情规划使用模型: string;
    剧情规划使用配置ID: string;
    剧情规划API地址: string;
    剧情规划API密钥: string;
    文章优化使用模型: string;
    文章优化使用配置ID: string;
    文章优化API地址: string;
    文章优化API密钥: string;
    文章优化提示词: string;
    设备消息独立模型开关: boolean;
    设备消息使用模型: string;
    设备消息使用配置ID: string;
    设备消息API地址: string;
    设备消息API密钥: string;
    小说拆分使用模型: string;
    小说拆分API地址: string;
    小说拆分API密钥: string;
    小说拆分RPM限制: number;
    小说拆分按N章分组: number;
    小说拆分单次处理批量: number;
    小说拆分自动重试次数: number;
    小说拆分后台运行: boolean;
    小说拆分自动续跑: boolean;
    小说拆分主剧情注入: boolean;
    小说拆分规划分析注入: boolean;
    小说拆分世界演变注入: boolean;
    小说拆分主剧情注入上限: number;
    小说拆分详细注入上限: number;
    文生图功能启用: boolean;
    文生图配置列表: 文生图接口配置结构[];
    当前文生图配置ID: string | null;
    文生图后端类型: 文生图后端类型;
    文生图模型使用模型: string;
    文生图模型API地址: string;
    文生图模型API密钥: string;
    ComfyUI工作流JSON: string;
    comfyui地址模式: 'api' | 'cnb';
    cnbComfyui地址: string;
    cnbComfyui场景地址: string;
    场景comfyui地址模式: 'api' | 'cnb';
    场景生图独立接口启用: boolean;
    场景生图使用配置ID: string | null;
    场景生图后端类型: 文生图后端类型;
    场景生图模型使用模型: string;
    场景生图模型API地址: string;
    场景生图模型API密钥: string;
    场景ComfyUI工作流JSON: string;
    文生图接口路径模式: 文生图接口路径模式类型;
    文生图预设接口路径: 文生图预设接口路径类型;
    文生图接口路径: string;
    文生图响应格式: 图片响应格式类型;
    文生图OpenAI自定义格式: boolean;
    画师串预设列表: 画师串预设结构[];
    当前NPC画师串预设ID: string;
    当前场景画师串预设ID: string;
    当前NPCPNG画风预设ID: string;
    当前场景PNG画风预设ID: string;
    自动NPC生图画风: 生图画风类型;
    自动场景生图画风: 生图画风类型;
    自动场景生图构图要求?: '纯场景' | '故事快照';
    自动场景生图横竖屏?: '横屏' | '竖屏';
    自动场景生图分辨率?: string;
    NovelAI启用自定义参数: boolean;
    NovelAI采样器: NovelAI采样器类型;
    NovelAI噪点表: NovelAI噪点表类型;
    NovelAI步数: number;
    NovelAI负面提示词: string;
    NPC生图使用词组转化器: boolean;
    词组转化兼容模式: boolean;
    香闺秘档特写强制裸体语义: boolean;
    词组转化器启用独立模型: boolean;
    词组转化器使用模型: string;
    词组转化器API地址: string;
    词组转化器API密钥: string;
    词组转化器提示词: string;
    模型词组转化器预设列表: 模型词组转化器预设结构[];
    词组转化器提示词预设列表: 词组转化器提示词预设结构[];
    当前NAI词组转化器提示词预设ID: string;
    当前NPC词组转化器提示词预设ID: string;
    当前场景词组转化器提示词预设ID: string;
    当前场景判定提示词预设ID: string;
    角色锚点列表: 角色锚点结构[];
    当前角色锚点ID: string;
    PNG画风预设列表: PNG画风预设结构[];
    当前PNG画风预设ID: string;
    PNG提炼启用独立模型: boolean;
    PNG提炼使用模型: string;
    PNG提炼API地址: string;
    PNG提炼API密钥: string;
    场景生图启用: boolean;
    主角生图启用: boolean;
    NPC生图启用: boolean;
    NPC生图性别筛选: 生图筛选性别类型;
    NPC生图重要性筛选: 生图筛选重要性类型;
    // 主角生图独立配置
    主角生图独立接口启用: boolean;
    主角生图后端类型: 文生图后端类型;
    主角生图模型使用模型: string;
    主角生图模型API地址: string;
    主角生图模型API密钥: string;
    主角画师串预设ID: string;
    主角PNG画风预设ID: string;
    主角词组转化器预设ID: string;
    提示词生成重试次数: number;
    图片生成重试次数: number;
}

export interface 接口设置结构 {
    activeConfigId: string | null;
    configs: 单接口配置结构[];
    功能模型占位: 功能模型占位配置结构;
}
