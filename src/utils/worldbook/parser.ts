import type {
    世界书预设组结构,
    世界书结构,
    世界书条目结构,
    世界书条目形态,
    世界书内置分类,
    世界书注入模式,
    世界书作用域,
    世界书类型
} from './types';
import { normalizeCanonicalGameTime } from '../../hooks/useGame/time/timeUtils';
import {
    默认作用域,
    默认类型,
    默认注入模式,
    默认条目形态,
    全部流程作用域,
    类型标签映射,
    条目形态标签映射,
    世界书作用域说明,
    是本体槽位,
    内置世界书ID
} from './types';

// ============ 通用读取 / 工具函数 ============

export const 读取文本 = (value: unknown): string => (typeof value === 'string' ? value : '');

export const 读取字符串数组 = (value: unknown): string[] => (
    Array.isArray(value)
        ? value.map((item) => 读取文本(item).trim()).filter(Boolean)
        : []
);

export const 去重字符串数组 = (list: string[]): string[] => Array.from(new Set(list.filter(Boolean)));

export const 生成ID = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const 展开作用域列表 = (scopes: 世界书作用域[]): 世界书作用域[] => {
    const baseScopes = Array.isArray(scopes) && scopes.length > 0 ? scopes : 默认作用域;
    if (baseScopes.includes('all')) return [...全部流程作用域];
    return baseScopes.filter((scope) => scope !== 'all');
};

// ============ 默认配置 ============

export const 获取条目形态默认配置 = (形态: 世界书条目形态): Pick<世界书条目结构, '条目形态' | '类型' | '作用域' | '注入模式' | '优先级' | '时间线开始时间' | '时间线结束时间'> => {
    switch (形态) {
        case 'timeline_outline':
            return {
                条目形态: 'timeline_outline',
                类型: 'world_lore',
                作用域: ['all'],
                注入模式: 'always',
                优先级: 120,
                时间线开始时间: '',
                时间线结束时间: ''
            };
        case 'time_injection':
            return {
                条目形态: 'time_injection',
                类型: 'world_lore',
                作用域: ['all'],
                注入模式: 'always',
                优先级: 90,
                时间线开始时间: '',
                时间线结束时间: ''
            };
        default:
            return {
                条目形态: 'normal',
                类型: 默认类型,
                作用域: 默认作用域,
                注入模式: 默认注入模式,
                优先级: 50,
                时间线开始时间: '',
                时间线结束时间: ''
            };
    }
};

// ============ 模板渲染 ============

export const 渲染世界书模板文本 = (
    content: string,
    variables?: Record<string, string | number | boolean | null | undefined>
): string => {
    const source = 读取文本(content);
    const rendered = source.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_match, key) => {
        const value = variables?.[key];
        if (value === null || value === undefined || value === false) return '';
        return String(value);
    });
    return rendered
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

// ============ 注入说明（注入行为描述） ============

export const 获取世界书条目注入说明 = (entry: Pick<世界书条目结构, '条目形态' | '类型' | '作用域' | '内置槽位' | '时间线开始时间' | '时间线结束时间'>): string => {
    const scopeList = Array.isArray(entry.作用域) && entry.作用域.length > 0 ? entry.作用域 : 默认作用域;
    const resolvedScopes = 展开作用域列表(scopeList).filter((scope) => scope !== 'recall');
    const uniqueScopes = 去重字符串数组(resolvedScopes) as 世界书作用域[];
    const isBuiltinBaseSlot = 是本体槽位(entry.内置槽位);
    const entryShape = entry.条目形态 || 默认条目形态;
    const buildDetail = (scope: 世界书作用域): string => {
        switch (scope) {
            case 'main':
                switch (entry.类型) {
                    case 'world_lore': return isBuiltinBaseSlot ? '主剧情：接管世界观本体槽位' : '主剧情：追加到 `core_world` 世界观母本末尾';
                    case 'system_rule': return isBuiltinBaseSlot ? '主剧情：接管系统规则本体槽位' : '主剧情：并入系统规则区 `otherPrompts`';
                    case 'command_rule': return isBuiltinBaseSlot ? '主剧情：接管命令规则本体槽位' : '主剧情：并入输出协议中的命令规则段';
                    case 'output_rule': return isBuiltinBaseSlot ? '主剧情：接管输出规则本体槽位' : '主剧情：并入输出协议末尾';
                    default: return '主剧情：追加到主流程提示词';
                }
            case 'opening':
                switch (entry.类型) {
                    case 'world_lore': return isBuiltinBaseSlot ? '开局生成：接管世界观本体槽位' : '开局生成：追加到开局世界观母本末尾';
                    case 'system_rule': return isBuiltinBaseSlot ? '开局生成：接管系统规则本体槽位' : '开局生成：并入开局系统规则区';
                    case 'command_rule': return isBuiltinBaseSlot ? '开局生成：接管命令规则本体槽位' : '开局生成：并入开局输出协议中的命令规则段';
                    case 'output_rule': return isBuiltinBaseSlot ? '开局生成：接管输出规则本体槽位' : '开局生成：并入开局输出协议末尾';
                    default: return '开局生成：追加到开局流程提示词';
                }
            case 'world_evolution':
                switch (entry.类型) {
                    case 'world_lore': return isBuiltinBaseSlot ? '世界演变：接管世界观本体槽位' : '世界演变：作为独立 API 的世界观附加段';
                    case 'system_rule': return isBuiltinBaseSlot ? '世界演变：接管系统规则本体槽位' : '世界演变：作为独立 API 的系统规则附加段';
                    case 'command_rule': return isBuiltinBaseSlot ? '世界演变：接管命令规则本体槽位' : '世界演变：作为独立 API 的命令规则附加段';
                    case 'output_rule': return isBuiltinBaseSlot ? '世界演变：接管输出规则本体槽位' : '世界演变：作为独立 API 的输出规则附加段';
                    default: return '世界演变：附加到独立 API 请求';
                }
            case 'variable_calibration':
                switch (entry.类型) {
                    case 'world_lore': return '变量生成：附加到变量上下文中的世界/背景补充段';
                    case 'system_rule': return '变量生成：附加到变量规则段';
                    case 'command_rule': return '变量生成：附加到变量命令约束段';
                    case 'output_rule': return '变量生成：附加到变量输出约束段';
                    default: return '变量生成：附加到独立 API 请求';
                }
            case 'story_plan':
                switch (entry.类型) {
                    case 'world_lore': return '剧情规划：附加到剧情规划上下文中的世界/时间线补充段';
                    case 'system_rule': return '剧情规划：附加到剧情规划规则段';
                    case 'command_rule': return '剧情规划：附加到剧情规划命令约束段';
                    case 'output_rule': return '剧情规划：附加到剧情规划输出约束段';
                    default: return '剧情规划：附加到独立 API 请求';
                }
            case 'heroine_plan':
                switch (entry.类型) {
                    case 'world_lore': return '女主规划：附加到女主规划上下文中的世界/时间线补充段';
                    case 'system_rule': return '女主规划：附加到女主规划规则段';
                    case 'command_rule': return '女主规划：附加到女主规划命令约束段';
                    case 'output_rule': return '女主规划：附加到女主规划输出约束段';
                    default: return '女主规划：附加到独立 API 请求';
                }
            case 'tavern':
                switch (entry.类型) {
                    case 'world_lore': return '酒馆模式：追加到酒馆世界观段';
                    case 'system_rule': return '酒馆模式：并入酒馆系统规则段';
                    case 'command_rule': return '酒馆模式：并入酒馆命令规则段';
                    case 'output_rule': return '酒馆模式：并入酒馆输出规则段';
                    default: return '酒馆模式：附加到酒馆组包流程';
                }
            default:
                return '附加到对应流程的提示词区';
        }
    };
    const detailText = uniqueScopes.length > 0
        ? uniqueScopes.map(buildDetail).join(' / ')
        : '当前未配置有效作用域';
    const typeLabel = 类型标签映射[entry.类型] || '附加条目';
    const shapeLabel = 条目形态标签映射[entryShape] || 条目形态标签映射.normal;
    const scopeLabel = scopeList.includes('all')
        ? '全部流程'
        : uniqueScopes.map((scope) => 世界书作用域说明[scope] || scope).join(' / ');
    const timeText = entryShape === 'time_injection'
        ? ` · 时间区间 ${entry.时间线开始时间 || '未设起点'} ~ ${entry.时间线结束时间 || '未设终点'}`
        : '';
    return `${shapeLabel} · ${typeLabel} · ${scopeLabel || '未配置作用域'} · ${detailText}${timeText}`;
};

// ============ 规范化辅助 ============

export const 规范化作用域列表 = (value: unknown): 世界书作用域[] => {
    const list = 读取字符串数组(value).filter((item): item is 世界书作用域 => (
        item === 'main'
        || item === 'opening'
        || item === 'world_evolution'
        || item === 'variable_calibration'
        || item === 'story_plan'
        || item === 'heroine_plan'
        || item === 'tavern'
        || item === 'all'
    ));
    if (list.includes('all')) return ['all'];
    return list.length > 0 ? 去重字符串数组(list) as 世界书作用域[] : 默认作用域;
};

export const 规范化条目形态 = (value: unknown): 世界书条目形态 => (
    value === 'timeline_outline' || value === 'time_injection' || value === 'normal'
        ? value
        : 默认条目形态
);

export const 规范化类型 = (value: unknown): 世界书类型 => (
    value === 'world_lore' || value === 'system_rule' || value === 'command_rule' || value === 'output_rule'
        ? value
        : 默认类型
);

export const 规范化注入模式 = (value: unknown): 世界书注入模式 => (
    value === 'match_any' || value === 'always'
        ? value
        : 默认注入模式
);

export const 规范化时间线时间 = (value: unknown): string => {
    const text = 读取文本(value).trim();
    if (!text) return '';
    const direct = normalizeCanonicalGameTime(text);
    if (direct) return direct;
    const match = text.match(/^(\d{1,6})[-/年](\d{1,2})[-/月](\d{1,2})(?:日)?(?:\s+|[T])?(\d{1,2})[:：时](\d{1,2})/);
    if (!match) return '';
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    if (
        !Number.isFinite(year) ||
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59
    ) {
        return '';
    }
    return normalizeCanonicalGameTime(`${year}:${String(month).padStart(2, '0')}:${String(day).padStart(2, '0')}:${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`) || '';
};

export const 规范化时间线区间 = (start: unknown, end: unknown): { start: string; end: string } => {
    const normalizedStart = 规范化时间线时间(start);
    const normalizedEnd = 规范化时间线时间(end);
    if (normalizedStart && normalizedEnd && normalizedStart > normalizedEnd) {
        return { start: normalizedEnd, end: normalizedStart };
    }
    return { start: normalizedStart, end: normalizedEnd };
};

// ============ 空对象创建器 ============

export const 创建空世界书条目 = (形态: 世界书条目形态 = 默认条目形态): 世界书条目结构 => {
    const now = Date.now();
    const defaults = 获取条目形态默认配置(形态);
    return {
        id: 生成ID('worldbook_entry'),
        标题: 形态 === 'timeline_outline' ? '未命名时间线大纲条目' : 形态 === 'time_injection' ? '未命名时间注入条目' : '未命名条目',
        内容: '',
        条目形态: defaults.条目形态,
        类型: defaults.类型,
        作用域: defaults.作用域,
        注入说明: 获取世界书条目注入说明(defaults),
        注入模式: defaults.注入模式,
        时间线开始时间: defaults.时间线开始时间,
        时间线结束时间: defaults.时间线结束时间,
        关键词: [],
        优先级: defaults.优先级,
        启用: true,
        内置: false,
        创建时间: now,
        更新时间: now
    } as 世界书条目结构;
};

export const 创建空世界书 = (): 世界书结构 => {
    const now = Date.now();
    return {
        id: 生成ID('worldbook'),
        标题: '未命名世界书',
        描述: '',
        常驻大纲: '',
        启用: true,
        内置: false,
        条目: [创建空世界书条目()],
        创建时间: now,
        更新时间: now
    };
};

export const 创建空世界书预设组 = (books: 世界书结构[] = []): 世界书预设组结构 => {
    const now = Date.now();
    const normalizedBooks = 规范化世界书列表(books);
    return {
        id: 生成ID('worldbook_group'),
        名称: '未命名预设组',
        描述: '',
        启用: true,
        书籍快照: normalizedBooks,
        创建时间: now,
        更新时间: now
    };
};

// ============ 规范化（条目 / 书籍 / 预设组） ============

export const 规范化世界书条目 = (raw: unknown, fallback?: Partial<世界书条目结构>): 世界书条目结构 => {
    const source = raw && typeof raw === 'object' ? raw as Partial<世界书条目结构> : {};
    const base = fallback || {};
    const now = Date.now();
    const isBuiltinEntry = source.内置 === true || base.内置 === true;
    const entryShape = 规范化条目形态(source.条目形态 ?? base.条目形态);
    const shapeDefaults = 获取条目形态默认配置(entryShape);
    const id = 读取文本(source.id ?? base.id).trim() || 生成ID('worldbook_entry');
    const title = 读取文本(source.标题 ?? base.标题).trim() || '未命名条目';
    const content = 读取文本(source.内容 ?? base.内容);
    const priorityRaw = Number(source.优先级 ?? base.优先级 ?? shapeDefaults.优先级 ?? 50);
    const priority = Number.isFinite(priorityRaw) ? Math.max(0, Math.min(999, Math.floor(priorityRaw))) : 50;
    const timeline = 规范化时间线区间(
        source.时间线开始时间 ?? base.时间线开始时间 ?? shapeDefaults.时间线开始时间,
        source.时间线结束时间 ?? base.时间线结束时间 ?? shapeDefaults.时间线结束时间
    );
    const createdAtRaw = Number(source.创建时间 ?? base.创建时间 ?? now);
    const updatedAtRaw = Number(source.更新时间 ?? base.更新时间 ?? now);
    return {
        id,
        标题: title,
        内容: content,
        条目形态: entryShape,
        类型: 规范化类型(source.类型 ?? base.类型 ?? shapeDefaults.类型),
        作用域: 规范化作用域列表(source.作用域 ?? base.作用域 ?? shapeDefaults.作用域),
        内置槽位: isBuiltinEntry ? (读取文本(source.内置槽位 ?? base.内置槽位 ?? id).trim() || id) : undefined,
        内置分类: isBuiltinEntry ? (读取文本(source.内置分类 ?? base.内置分类).trim() as 世界书内置分类) : undefined,
        注入说明: 读取文本(source.注入说明 ?? base.注入说明).trim(),
        注入模式: 规范化注入模式(source.注入模式 ?? base.注入模式 ?? shapeDefaults.注入模式),
        时间线开始时间: timeline.start,
        时间线结束时间: timeline.end,
        关键词: 去重字符串数组(读取字符串数组(source.关键词 ?? base.关键词)),
        优先级: priority,
        启用: source.启用 !== undefined ? source.启用 === true : base.启用 !== false,
        内置: isBuiltinEntry,
        创建时间: Number.isFinite(createdAtRaw) ? Math.floor(createdAtRaw) : now,
        更新时间: Number.isFinite(updatedAtRaw) ? Math.floor(updatedAtRaw) : now
    } as 世界书条目结构;
};

export const 规范化世界书 = (raw: unknown, fallback?: Partial<世界书结构>): 世界书结构 => {
    const source = raw && typeof raw === 'object' ? raw as Partial<世界书结构> : {};
    const base = fallback || {};
    const now = Date.now();
    const id = 读取文本(source.id ?? base.id).trim() || 生成ID('worldbook');
    const title = 读取文本(source.标题 ?? base.标题).trim() || '未命名世界书';
    const description = 读取文本(source.描述 ?? base.描述);
    const outline = 读取文本(source.常驻大纲 ?? base.常驻大纲);
    const createdAtRaw = Number(source.创建时间 ?? base.创建时间 ?? now);
    const updatedAtRaw = Number(source.更新时间 ?? base.更新时间 ?? now);
    const rawEntries = Array.isArray(source.条目)
        ? source.条目
        : Array.isArray((source as any).entries)
            ? (source as any).entries
            : Array.isArray(base.条目)
                ? base.条目
                : [];
    const entryMap = new Map<string, 世界书条目结构>();
    rawEntries.forEach((item: unknown) => {
        const normalized = 规范化世界书条目(item);
        entryMap.set(normalized.id, normalized);
    });
    const entries = Array.from(entryMap.values()).sort((a, b) => {
        const priorityDiff = (b.优先级 || 0) - (a.优先级 || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return (b.更新时间 || 0) - (a.更新时间 || 0);
    });
    return {
        id,
        标题: title,
        描述: description,
        常驻大纲: outline,
        启用: source.启用 !== undefined ? source.启用 === true : base.启用 !== false,
        内置: source.内置 !== undefined ? source.内置 === true : base.内置 !== true,
        条目: entries,
        创建时间: Number.isFinite(createdAtRaw) ? Math.floor(createdAtRaw) : now,
        更新时间: Number.isFinite(updatedAtRaw) ? Math.floor(updatedAtRaw) : now
    };
};

export const 规范化世界书预设组 = (raw: unknown, fallback?: Partial<世界书预设组结构>): 世界书预设组结构 => {
    const source = raw && typeof raw === 'object' ? raw as Partial<世界书预设组结构> : {};
    const base = fallback || {};
    const now = Date.now();
    const id = 读取文本(source.id ?? base.id).trim() || 生成ID('worldbook_group');
    const 名称 = 读取文本(source.名称 ?? base.名称).trim() || '未命名预设组';
    const 描述 = 读取文本(source.描述 ?? base.描述);
    const 书籍快照 = 规范化世界书列表(source.书籍快照 ?? (source as any).books ?? base.书籍快照 ?? []);
    const createdAtRaw = Number(source.创建时间 ?? base.创建时间 ?? now);
    const updatedAtRaw = Number(source.更新时间 ?? base.更新时间 ?? now);
    return {
        id,
        名称,
        描述,
        启用: source.启用 !== undefined ? source.启用 === true : base.启用 !== false,
        书籍快照,
        创建时间: Number.isFinite(createdAtRaw) ? Math.floor(createdAtRaw) : now,
        更新时间: Number.isFinite(updatedAtRaw) ? Math.floor(updatedAtRaw) : now
    };
};

// ============ 旧版条目迁移 ============

const 旧版条目转世界书 = (entries: unknown[]): 世界书结构[] => {
    if (!Array.isArray(entries) || entries.length <= 0) return [];
    const now = Date.now();
    return [{
        id: 生成ID('worldbook'),
        标题: '导入世界书',
        描述: '由旧版单层条目结构自动转换',
        启用: true,
        条目: entries.map((item) => 规范化世界书条目(item)),
        创建时间: now,
        更新时间: now
    }];
};

// ============ 列表规范化 ============

export const 规范化世界书列表 = (raw: unknown): 世界书结构[] => {
    const list = (() => {
        if (Array.isArray(raw)) {
            const looksLikeBook = raw.some((item) => item && typeof item === 'object' && (Array.isArray((item as any).条目) || Array.isArray((item as any).entries)));
            return looksLikeBook ? raw : 旧版条目转世界书(raw);
        }
        if (raw && typeof raw === 'object') {
            const maybeBooks = (raw as any).books;
            if (Array.isArray(maybeBooks)) return maybeBooks;
            const maybeEntries = (raw as any).entries;
            if (Array.isArray(maybeEntries)) return 旧版条目转世界书(maybeEntries);
        }
        return [];
    })();

    const map = new Map<string, 世界书结构>();
    list.forEach((item) => {
        const normalized = 规范化世界书(item);
        if (normalized.内置 === true || normalized.id === 内置世界书ID) return;
        const entries = (normalized.条目 || []).map((entry) => {
            const normalizedEntry = 规范化世界书条目(entry);
            return {
                ...normalizedEntry,
                注入说明: normalizedEntry.注入说明 || 获取世界书条目注入说明(normalizedEntry)
            };
        });
        const finalBook = {
            ...normalized,
            内置: false,
            常驻大纲: normalized.常驻大纲,
            条目: entries
        } as 世界书结构;
        map.set(finalBook.id, finalBook);
    });
    return Array.from(map.values()).sort((a, b) => (b.更新时间 || 0) - (a.更新时间 || 0));
};

export const 规范化世界书预设组列表 = (raw: unknown): 世界书预设组结构[] => {
    const list = (() => {
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object') {
            const maybeGroups = (raw as any).groups;
            if (Array.isArray(maybeGroups)) return maybeGroups;
        }
        return [];
    })();
    const map = new Map<string, 世界书预设组结构>();
    list.forEach((item) => {
        const normalized = 规范化世界书预设组(item);
        map.set(normalized.id, normalized);
    });
    return Array.from(map.values()).sort((a, b) => (b.更新时间 || 0) - (a.更新时间 || 0));
};
