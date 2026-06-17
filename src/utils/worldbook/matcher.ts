import type { 世界书结构, 世界书条目结构, 世界书条目形态, 世界书作用域, 世界书类型 } from '@/models/worldbook';
import type { 聊天记录结构 } from '@/types';
import { 环境时间转标准串 } from '../../hooks/useGame/time/timeUtils';
import { 默认作用域, 世界书预算映射, 世界书本体槽位值, 世界书命中参数 } from './types';
import {
    读取文本,
    规范化时间线时间,
    规范化世界书条目,
    规范化世界书列表,
    渲染世界书模板文本
} from './parser';

// ============ 文本提取（环境/社交/历史/世界） ============

export const 提取环境文本 = (environment: any): string[] => {
    if (!environment || typeof environment !== 'object') return [];
    return [environment?.大地点, environment?.中地点, environment?.小地点, environment?.具体地点, environment?.时间]
        .map((item) => 读取文本(item).trim())
        .filter(Boolean);
};

export const 提取社交文本 = (social: any[]): string[] => (
    (Array.isArray(social) ? social : []).flatMap((npc) => {
        if (!npc || typeof npc !== 'object') return [];
        return [npc?.姓名, npc?.称号, npc?.身份, npc?.所属势力, npc?.当前位置]
            .map((item) => 读取文本(item).trim())
            .filter(Boolean);
    })
);

export const 提取历史文本 = (history: 聊天记录结构[]): string[] => (
    (Array.isArray(history) ? history : [])
        .slice(-12)
        .map((item) => 读取文本(item?.content).trim())
        .filter(Boolean)
);

export const 提取世界文本 = (world: any): string[] => {
    if (!world || typeof world !== 'object') return [];
    const ongoingEvents = Array.isArray(world?.进行中事件) ? world.进行中事件 : [];
    return ongoingEvents.flatMap((event: any) => [event?.标题, event?.发生地点, event?.类型]
        .map((item) => 读取文本(item).trim())
        .filter(Boolean));
};

// ============ 命中判定 ============

export const 作用域命中 = (entryScopes: 世界书作用域[], activeScopes: 世界书作用域[]): boolean => {
    if (entryScopes.includes('all')) return true;
    return activeScopes.some((scope) => entryScopes.includes(scope));
};

export const 时间串转序数 = (value?: string): number | null => {
    const canonical = 规范化时间线时间(value);
    if (!canonical) return null;
    const match = canonical.match(/^(\d{1,6}):(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return null;
    return ((((Number(match[1]) * 12) + Number(match[2])) * 31 + Number(match[3])) * 24 + Number(match[4])) * 60 + Number(match[5]);
};

export const 时间线命中 = (entry: 世界书条目结构, currentTimeText: string): boolean => {
    const current = 时间串转序数(currentTimeText);
    if (current === null) return !(entry.时间线开始时间 || entry.时间线结束时间);
    const start = 时间串转序数(entry.时间线开始时间);
    const end = 时间串转序数(entry.时间线结束时间);
    if (start !== null && current < start) return false;
    if (end !== null && current > end) return false;
    return true;
};

// ============ 扁平化 ============

export const 扁平化世界书条目 = (books: 世界书结构[]): 世界书条目结构[] => (
    规范化世界书列表(books).flatMap((book) => {
        if (book.启用 === false) return [];
        const allowAppendRoute = true;
        const outlineEntry = allowAppendRoute && (book.常驻大纲 || '').trim()
            ? [{
                id: `${book.id}__outline`,
                标题: book.标题 ? `${book.标题} / 常驻大纲` : '常驻大纲',
                内容: (book.常驻大纲 || '').trim(),
                条目形态: 'timeline_outline' as 世界书条目形态,
                类型: 'world_lore' as 世界书类型,
                作用域: ['all'] as 世界书作用域[],
                注入模式: 'always',
                时间线开始时间: '',
                时间线结束时间: '',
                关键词: [],
                优先级: 1000,
                启用: true,
                创建时间: book.创建时间,
                更新时间: book.更新时间
            }]
            : [];
        return [...outlineEntry, ...(book.条目 || [])]
            .map((entry) => 规范化世界书条目(entry))
            .filter((entry) => entry.启用 !== false)
            .map((entry) => ({
                ...entry,
                标题: book.标题 ? `${book.标题} / ${entry.标题}` : entry.标题
            }));
    })
);

// ============ 内置槽位查询 ============

export const 获取内置世界书槽位原文 = (
    books: 世界书结构[] | undefined,
    slotId: 世界书本体槽位值 | string
): string => {
    const normalizedBooks = 规范化世界书列表(Array.isArray(books) ? books : []);
    for (const book of normalizedBooks) {
        for (const entry of Array.isArray(book.条目) ? book.条目 : []) {
            const normalizedEntry = 规范化世界书条目(entry);
            if (normalizedEntry.启用 === false) continue;
            if ((normalizedEntry.内置槽位 || normalizedEntry.id) === slotId) {
                return normalizedEntry.内容 || '';
            }
        }
    }
    return '';
};

export const 获取内置世界书槽位内容 = (params: {
    books?: 世界书结构[];
    slotId: 世界书本体槽位值 | string;
    fallback: string;
    variables?: Record<string, string | number | boolean | null | undefined>;
}): string => {
    const slotContent = 获取内置世界书槽位原文(params.books, params.slotId);
    return 渲染世界书模板文本(slotContent || params.fallback, params.variables);
};

// ============ 风格槽位 ID ============

const 获取剧情风格槽位ID = (
    _scope: 'main' | 'opening',
    style: import('../../models/system').剧情风格类型,
    ntlTier?: import('../../models/system').NTL后宫档位
): string => {
    if (style === 'NTL后宫') {
        if (ntlTier === '假乱伦') return 'builtin_slot_style_ntl_fake_incest';
        if (ntlTier === '禁止乱伦') return 'builtin_slot_style_ntl_no_incest';
        return 'builtin_slot_style_ntl_unlimited';
    }
    const styleKeyMap: Record<Exclude<import('../../models/system').剧情风格类型, 'NTL后宫'>, string> = {
        一般: 'general',
        修炼: 'cultivation',
        后宫: 'harem',
        修罗场: 'shura',
        纯爱: 'pure_love'
    };
    return `builtin_slot_style_${styleKeyMap[style as Exclude<import('../../models/system').剧情风格类型, 'NTL后宫'>] || 'general'}`;
};

export const 获取剧情风格世界书槽位 = (
    scope: 'main' | 'opening',
    style: import('../../models/system').剧情风格类型,
    ntlTier?: import('../../models/system').NTL后宫档位
): string => 获取剧情风格槽位ID(scope, style, ntlTier);

// ============ 选择生效条目 ============

export const 选择生效世界书条目 = ({
    books,
    scopes,
    environment,
    social,
    history,
    world,
    extraTexts,
    maxChars
}: 世界书命中参数): 世界书条目结构[] => {
    const activeScopes = Array.isArray(scopes) && scopes.length > 0 ? scopes : 默认作用域;
    const currentTimeText = 环境时间转标准串(environment) || 读取文本(environment?.时间).trim();
    const corpus = [
        ...提取环境文本(environment),
        ...提取社交文本(Array.isArray(social) ? social : []),
        ...提取历史文本(Array.isArray(history) ? history : []),
        ...提取世界文本(world),
        ...(Array.isArray(extraTexts) ? extraTexts.map((item) => 读取文本(item).trim()).filter(Boolean) : [])
    ].join('\n').toLowerCase();
    const budget = typeof maxChars === 'number' && Number.isFinite(maxChars)
        ? Math.max(0, Math.floor(maxChars))
        : Math.max(...activeScopes.map((scope) => 世界书预算映射[scope] || 0));

    const selected: 世界书条目结构[] = [];
    let totalChars = 0;

    扁平化世界书条目(books).forEach((entry) => {
        if (!作用域命中(entry.作用域 || 默认作用域, activeScopes)) return;
        if (!(entry.内容 || '').trim()) return;
        if (!时间线命中(entry, currentTimeText)) return;
        if (entry.注入模式 === 'match_any') {
            const keywords = Array.isArray(entry.关键词) ? entry.关键词.map((item) => item.trim().toLowerCase()).filter(Boolean) : [];
            if (keywords.length <= 0) return;
            if (!keywords.some((keyword) => corpus.includes(keyword))) return;
        }
        const estimated = `${entry.标题}\n${entry.内容}`.length;
        if (budget > 0 && selected.length > 0 && totalChars + estimated > budget) return;
        selected.push(entry);
        totalChars += estimated;
    });

    return selected;
};

// ============ 注入文本构建 ============

const 类型标题映射: Record<世界书类型, string> = {
    world_lore: '附加世界观',
    system_rule: '附加系统规则',
    command_rule: '附加命令规则',
    output_rule: '附加输出规则'
};

const 构建分组文本 = (label: string, entries: 世界书条目结构[]): string => {
    const sections = entries.map((entry) => {
        const title = (entry.标题 || '').trim();
        const body = (entry.内容 || '').trim();
        if (!body) return '';
        return [`### ${title || '未命名条目'}`, body].filter(Boolean).join('\n');
    }).filter(Boolean);
    if (sections.length <= 0) return '';
    return `【${label}】\n${sections.join('\n\n')}`;
};

export const 构建世界书注入文本 = (params: 世界书命中参数): {
    selectedEntries: 世界书条目结构[];
    worldLoreText: string;
    systemRuleText: string;
    commandRuleText: string;
    outputRuleText: string;
    combinedText: string;
} => {
    const selectedEntries = 选择生效世界书条目(params);
    const grouped = {
        world_lore: selectedEntries.filter((entry) => entry.类型 === 'world_lore'),
        system_rule: selectedEntries.filter((entry) => entry.类型 === 'system_rule'),
        command_rule: selectedEntries.filter((entry) => entry.类型 === 'command_rule'),
        output_rule: selectedEntries.filter((entry) => entry.类型 === 'output_rule')
    };
    const worldLoreText = 构建分组文本(类型标题映射.world_lore, grouped.world_lore);
    const systemRuleText = 构建分组文本(类型标题映射.system_rule, grouped.system_rule);
    const commandRuleText = 构建分组文本(类型标题映射.command_rule, grouped.command_rule);
    const outputRuleText = 构建分组文本(类型标题映射.output_rule, grouped.output_rule);
    const combinedText = [worldLoreText, systemRuleText, commandRuleText, outputRuleText].filter(Boolean).join('\n\n');

    return {
        selectedEntries,
        worldLoreText,
        systemRuleText,
        commandRuleText,
        outputRuleText,
        combinedText
    };
};
