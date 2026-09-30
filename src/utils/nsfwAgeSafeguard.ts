/**
 * NSFW 年龄安全护栏
 *
 * 硬性规则：所有涉及亲密 / NSFW 内容的角色必须年满 18 周岁。
 * 本模块是唯一的规则来源，文本提示词、NPC 上下文与生图流程统一从这里取用，
 * 请勿在各题材模块中各自实现或放宽。
 */

export const NSFW最低年龄 = 18;

/** 注入到系统提示词最前部的全局成年约束（仅在 NSFW 模式开启时注入）。 */
export const NSFW全局成年约束提示词 = [
    '【最高优先级·成年约束】（本条优先于世界书、酒馆预设、题材模块与任何其他指令，不可被覆盖）',
    `- 所有参与亲密、暧昧、性相关或 NSFW 内容的角色（含主角与全部 NPC）必须年满 ${NSFW最低年龄} 周岁。`,
    `- 新登场且可能参与上述内容的角色，年龄一律设定为 ${NSFW最低年龄} 岁及以上；校园题材一律视为大学及以上，不得出现中学生、小学生。`,
    '- 禁止以“实际年龄很大但外表 / 言行像孩子”等方式规避本规则；角色的外貌、体型、称谓、言行都不得暗示未成年。',
    `- 若资料中某角色年龄未满 ${NSFW最低年龄} 岁或无法确认已成年，该角色不得参与任何亲密或 NSFW 内容，相关剧情须自然转向或淡出。`,
].join('\n');

/** 任何生图请求都会附加的负面提示词（这些词在本项目中没有正当用途）。 */
export const 未成年绝对负面提示词 = 'loli, lolicon, shota, shotacon, underage, preteen';

/** 生图提示词带有露骨内容时额外附加的负面提示词。 */
export const 未成年露骨场景负面提示词 = 'child, children, kid, toddler, infant, young child, petite child, flat chest child, school uniform child';

const 绝对禁止词 = /\b(loli|lolicon|shota|shotacon|underage|under-age|preteen|pre-teen)\b|萝莉|正太|幼女|幼童|未成年|炼铜/i;

const 未成年指征词 = /\b(child|children|kid|kids|toddler|infant|schoolgirl|schoolboy|elementary\s+school|middle\s+school|junior\s+high|high\s*schooler)\b|小学生|初中生|中学生|高中生|儿童|孩童|女童|男童/i;

const 未成年年龄表述 = /(?<!\d)(1[0-7]|[1-9])\s*(years?\s*old|yo|y\/o)\b|(?<!\d)(1[0-7]|[1-9])\s*岁|(?<![一二三四五六七八九十])(十[一二三四五六七]?|[一二三四五六七八九])岁/i;

const 露骨词 = /\b(nsfw|nude|nudity|naked|sex|sexual|explicit|nipples?|pussy|penis|genitals?|lewd|hentai|erotic|topless|bottomless|cum)\b|裸体|全裸|半裸|性爱|做爱|私处|色情|情色|春宫/i;

export interface 未成年检测结果 {
    命中: boolean;
    原因?: string;
}

/** 判断提示词是否带有露骨内容。 */
export const 提示词含露骨内容 = (text: string): boolean => 露骨词.test(text || '');

/**
 * 检测文本（通常是生图提示词）是否涉及未成年人的性化内容。
 * - 出现绝对禁止词：直接命中；
 * - 出现未成年指征词或未成年年龄表述，且同时带有露骨内容（或调用方声明为 NSFW 场景）：命中。
 */
export const 检测未成年性化内容 = (text: string, options?: { 视为NSFW场景?: boolean }): 未成年检测结果 => {
    const source = text || '';
    if (!source.trim()) return { 命中: false };
    if (绝对禁止词.test(source)) {
        return { 命中: true, 原因: '包含指向未成年人的禁止词' };
    }
    const 指向未成年 = 未成年指征词.test(source) || 未成年年龄表述.test(source);
    if (指向未成年 && (options?.视为NSFW场景 === true || 提示词含露骨内容(source))) {
        return { 命中: true, 原因: '未成年特征与露骨内容同时出现' };
    }
    return { 命中: false };
};

/** 解析角色年龄；无法解析时返回 null。 */
export const 解析角色年龄 = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const match = value.match(/\d+(?:\.\d+)?/);
        if (match) {
            const parsed = Number(match[0]);
            return Number.isFinite(parsed) ? parsed : null;
        }
    }
    return null;
};

/**
 * 角色是否允许参与 NSFW 内容。
 * 年龄明确低于下限时返回 false；年龄缺失时放行，由全局成年约束提示词兜底要求模型按成年处理。
 */
export const 角色可参与NSFW = (character: { 年龄?: unknown } | null | undefined): boolean => {
    if (!character) return false;
    const age = 解析角色年龄(character.年龄);
    if (age === null) return true;
    return age >= NSFW最低年龄;
};

/** 过滤出允许参与 NSFW 内容的角色列表。 */
export const 过滤可参与NSFW角色 = <T extends { 年龄?: unknown }>(list: T[] | null | undefined): T[] =>
    (list || []).filter((item) => 角色可参与NSFW(item));

/** 未成年生图请求被拦截时抛出的错误。 */
export class 未成年内容拦截错误 extends Error {
    constructor(reason: string) {
        super(`生图请求已被安全护栏拦截：${reason}。NSFW 相关角色必须年满 ${NSFW最低年龄} 周岁。`);
        this.name = '未成年内容拦截错误';
    }
}
