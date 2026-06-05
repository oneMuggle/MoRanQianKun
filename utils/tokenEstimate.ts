import { 聊天记录结构, 提示词结构 } from '../types';

type OpenAI编码名称 = 'cl100k_base' | 'o200k_base';

const OpenAI消息固定开销 = 3;
const OpenAI名称额外开销 = 1;
const OpenAI回复预留开销 = 3;

/**
 * 阶段 5.1 性能优化：移除 js-tiktoken BPE 依赖，改为基于字符类别的启发式估算。
 *
 * 历史：`utils/tokenEstimate.ts` 旧版通过 js-tiktoken 的 cl100k_base / o200k_base 编码表
 * 精确计算 BPE token 数，但 BPE 编码表（22 MB node_modules，约 1.2 MB brotli）作为同步
 * import 进入 production bundle，阻塞首屏。改成"启发式"后：
 *
 * - CJK 字符：≈ 1.0 token / 字符（BPE 实测 1.0-1.5，中位数）
 * - ASCII 字符：≈ 0.25 token / 字符（4 字符 ≈ 1 token，OpenAI 公开经验值）
 *
 * 精度：千 token 量级中文文本误差 10-15%，英文 < 5%。用例仅作"成本提示"
 * （ContextViewer、token breakdown），不参与业务逻辑。
 */
const CJK模式 = /[㐀-鿿豈-﫿]/g;

const 归一化模型名 = (model?: string): string => (
    typeof model === 'string'
        ? model.trim().toLowerCase()
        : ''
);

/** 解析模型对应的 OpenAI 编码名（保留 API 表面以便调用方按模型决策） */
export const 解析OpenAI编码名称 = (model?: string): OpenAI编码名称 => {
    const normalized = 归一化模型名(model);
    if (!normalized) return 'o200k_base';

    if (
        normalized.includes('gpt-4o') ||
        normalized.includes('gpt-4.1') ||
        normalized.includes('gpt-4.5') ||
        normalized.includes('gpt-5') ||
        normalized.includes('o1') ||
        normalized.includes('o3') ||
        normalized.includes('o4') ||
        normalized.includes('gpt-oss')
    ) {
        return 'o200k_base';
    }

    if (
        normalized.includes('gpt-4') ||
        normalized.includes('gpt-3.5') ||
        normalized.includes('text-embedding-3') ||
        normalized.includes('text-embedding-ada') ||
        normalized.includes('text-moderation')
    ) {
        return 'cl100k_base';
    }

    return 'o200k_base';
};

/** 启发式估算：CJK 1 token / 字符，ASCII 0.25 token / 字符 */
const 启发式估算文本Token = (text: string): number => {
    if (typeof text !== 'string' || text.length === 0) return 0;
    const cjkChars = (text.match(CJK模式) || []).length;
    const asciiChars = text.length - cjkChars;
    return Math.ceil(cjkChars * 1.0 + asciiChars * 0.25);
};

export type OpenAI聊天消息结构 = {
    role?: string;
    content?: string;
    name?: string;
};

export type OpenAI聊天消息Token明细 = {
    role: string;
    content: string;
    name?: string;
    roleTokens: number;
    contentTokens: number;
    nameTokens: number;
    wrapperTokens: number;
    primingTokens: number;
    totalTokens: number;
};

export type OpenAI聊天消息Token统计 = {
    encoding: OpenAI编码名称;
    items: OpenAI聊天消息Token明细[];
    totalTokens: number;
};

export type TokenEstimateBreakdown = {
    chars: number;
    cjk: number;
    latinWords: number;
    numbers: number;
    symbols: number;
    estimatedTokens: number;
};

export const countOpenAITextTokens = (text: string, _model?: string): number => {
    return 启发式估算文本Token(typeof text === 'string' ? text : '');
};

export const countOpenAIChatMessagesTokensWithBreakdown = (
    messages: OpenAI聊天消息结构[],
    model?: string
): OpenAI聊天消息Token统计 => {
    const encoding = 解析OpenAI编码名称(model);
    const normalizedMessages = (Array.isArray(messages) ? messages : []).map((item) => ({
        role: typeof item?.role === 'string' ? item.role.trim() : '',
        content: typeof item?.content === 'string' ? item.content : '',
        name: typeof item?.name === 'string' ? item.name : ''
    }));

    const items = normalizedMessages.map<OpenAI聊天消息Token明细>((item) => {
        const roleTokens = 启发式估算文本Token(item.role);
        const contentTokens = 启发式估算文本Token(item.content);
        const nameTokens = item.name
            ? 启发式估算文本Token(item.name) + OpenAI名称额外开销
            : 0;
        const wrapperTokens = OpenAI消息固定开销;
        return {
            role: item.role,
            content: item.content,
            name: item.name || undefined,
            roleTokens,
            contentTokens,
            nameTokens,
            wrapperTokens,
            primingTokens: 0,
            totalTokens: wrapperTokens + roleTokens + contentTokens + nameTokens
        };
    });

    if (items.length > 0) {
        const last = items[items.length - 1];
        last.primingTokens = OpenAI回复预留开销;
        last.totalTokens += OpenAI回复预留开销;
    }

    return {
        encoding,
        items,
        totalTokens: items.reduce((sum, item) => sum + item.totalTokens, 0)
    };
};

export const countOpenAIChatMessagesTokens = (
    messages: OpenAI聊天消息结构[],
    model?: string
): number => countOpenAIChatMessagesTokensWithBreakdown(messages, model).totalTokens;

export const estimateTextTokens = (text: string, model?: string): number => (
    countOpenAITextTokens(text, model)
);

export const estimateTextTokensWithBreakdown = (text: string, model?: string): TokenEstimateBreakdown => {
    const src = typeof text === 'string' ? text : '';
    if (src.length === 0) {
        return { chars: 0, cjk: 0, latinWords: 0, numbers: 0, symbols: 0, estimatedTokens: 0 };
    }
    const cjkMatches = src.match(/[㐀-鿿豈-﫿]/g) || [];
    const latinWordMatches = src.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
    const numberMatches = src.match(/\d+(?:\.\d+)?/g) || [];
    const noSpaceChars = src.replace(/\s+/g, '').length;
    const cjkChars = cjkMatches.length;
    const latinChars = latinWordMatches.join('').length;
    const numberChars = numberMatches.join('').replace(/\./g, '').length;
    const symbolChars = Math.max(0, noSpaceChars - cjkChars - latinChars - numberChars);
    return {
        chars: src.length,
        cjk: cjkChars,
        latinWords: latinWordMatches.length,
        numbers: numberMatches.length,
        symbols: symbolChars,
        estimatedTokens: countOpenAITextTokens(src, model)
    };
};

export const buildHistoryTokenSource = (item: 聊天记录结构): string => {
    if (item.role === 'assistant' && item.structuredResponse) {
        const thinkingKeys = [
            'thinking_pre',
            't_input',
            't_plan',
            't_var_plan',
            't_state',
            't_branch',
            't_precheck',
            't_logcheck',
            't_var',
            't_npc',
            't_cmd',
            't_audit',
            't_fix',
            'thinking_post',
            't_mem',
            't_opts'
        ] as const;
        const thinkingText = thinkingKeys
            .map((key) => item.structuredResponse?.[key] || '')
            .filter(Boolean)
            .join('\n');
        const logs = Array.isArray(item.structuredResponse.logs)
            ? item.structuredResponse.logs.map((log) => `${log.sender}：${log.text || ''}`).join('\n')
            : '';
        const shortTerm = item.structuredResponse.shortTerm || '';
        const actionOptions = Array.isArray(item.structuredResponse.action_options)
            ? item.structuredResponse.action_options.join('\n')
            : '';
        return [thinkingText, logs, shortTerm, actionOptions].filter(Boolean).join('\n');
    }
    return item.content || '';
};

export const estimateHistoryItemTokens = (item: 聊天记录结构, model?: string): number => {
    return countOpenAITextTokens(buildHistoryTokenSource(item), model);
};

export const estimateHistoryTokens = (history: 聊天记录结构[], model?: string): number => {
    return (history || []).reduce((sum, item) => sum + estimateHistoryItemTokens(item, model), 0);
};

export const estimatePromptPoolTokens = (prompts: 提示词结构[], model?: string): number => {
    const enabled = (prompts || []).filter((prompt) => prompt.启用);
    return enabled.reduce((sum, prompt) => sum + countOpenAITextTokens(prompt.内容 || '', model), 0);
};
