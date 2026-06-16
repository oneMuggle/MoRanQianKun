/**
 * services/dbService/_helpers.ts
 *
 * 数据库服务内部 helper（2026-06-03 从 dbService/index.ts 提取）
 * 供 saves/settings/imageAssets 等子模块复用
 */

import type { 存档结构 } from './types';

/** 深拷贝（JSON 序列化） */
export const 深拷贝 = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** 文本编码器（用于字节数估算） */
export const 文本编码器 = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

/** pad2：两位数补零 */
export const pad2 = (n: number): string => Math.trunc(n).toString().padStart(2, '0');

/** 估算设置摘要 */
export const 估算设置摘要 = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return '空值';
    if (typeof value === 'boolean') return value ? '已开启' : '已关闭';
    if (typeof value === 'string') return value.trim() ? `${value.trim().slice(0, 24)}${value.trim().length > 24 ? '...' : ''}` : '空字符串';
    if (Array.isArray(value)) {
        return `${value.length} 项`;
    }
    if (typeof value === 'object') {
        const objectKeys = Object.keys(value as Record<string, unknown>).length;
        return `${objectKeys} 个字段`;
    }
    return String(value);
};

/** 估算字符串字节数 */
export const 估算字符串字节数 = (value: string): number => {
    if (!value) return 0;
    if (!文本编码器) return value.length * 2;
    const chunkSize = 32768;
    let total = 0;
    for (let index = 0; index < value.length; index += chunkSize) {
        total += 文本编码器.encode(value.slice(index, index + chunkSize)).length;
    }
    return total;
};

/** 估算对象字节数（递归） */
export const 估算对象字节数 = (value: unknown, seen: WeakSet<object> = new WeakSet()): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') return 估算字符串字节数(value);
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 4;
    if (typeof value === 'bigint') return value.toString().length;
    if (typeof value !== 'object') return 0;
    if (value instanceof Uint8Array) return value.byteLength;
    if (value instanceof ArrayBuffer) return value.byteLength;
    if (seen.has(value)) return 0;
    seen.add(value);

    if (Array.isArray(value)) {
        return value.reduce((total, item) => total + 1 + 估算对象字节数(item, seen), 2);
    }

    return Object.entries(value as Record<string, unknown>).reduce((total, [key, child]) => (
        total + 估算字符串字节数(key) + 估算对象字节数(child, seen) + 2
    ), 2);
};

/** 读取环境时间文本（存档去重键用） */
export const 读取环境时间文本 = (env: any): string => {
    if (typeof env?.时间 === 'string' && env.时间.trim()) return env.时间.trim();
    const 年 = Number(env?.年);
    const 月 = Number(env?.月);
    const 日 = Number(env?.日);
    const 时 = Number(env?.时);
    const 分 = Number(env?.分);
    if ([年, 月, 日, 时, 分].every(Number.isFinite)) {
        return `${Math.trunc(年)}:${pad2(月)}:${pad2(日)}:${pad2(时)}:${pad2(分)}`;
    }
    return '';
};

/** 存档去重键 */
export const 构建存档去重键 = (save: {
    类型?: unknown;
    时间戳?: unknown;
    角色数据?: any;
    环境信息?: any;
    历史记录?: unknown;
}, safeNumber: (v: unknown, fb: number) => number): string => {
    const type = save?.类型 === 'auto' ? 'auto' : 'manual';
    const ts = Math.max(0, Math.floor(safeNumber(save?.时间戳, 0)));
    const name = typeof save?.角色数据?.姓名 === 'string' ? save.角色数据.姓名.trim() : '';
    const envTime = 读取环境时间文本(save?.环境信息);
    const historyCount = Array.isArray(save?.历史记录) ? save.历史记录.length : 0;
    return `${type}|${ts}|${name}|${envTime}|${historyCount}`;
};

/** 清洗导入存档 */
export const 清洗导入存档 = (raw: any, safeNumber: (v: unknown, fb: number) => number): Omit<存档结构, 'id'> | null => {
    if (!raw || typeof raw !== 'object') return null;
    if (!raw.角色数据 || typeof raw.角色数据 !== 'object') return null;
    if (!raw.环境信息 && typeof raw.环境信息 !== 'object') return null;

    const 类型: 'manual' | 'auto' = raw.类型 === 'auto' ? 'auto' : 'manual';
    const 时间戳 = Math.max(1, Math.floor(safeNumber(raw.时间戳, Date.now())));
    const history = Array.isArray(raw.历史记录) ? raw.历史记录 : [];
    const 元数据 = raw.元数据 && typeof raw.元数据 === 'object' ? raw.元数据 : undefined;

    const normalized: Omit<存档结构, 'id'> = {
        类型,
        时间戳,
        描述: typeof raw.描述 === 'string' ? raw.描述 : undefined,
        元数据: 元数据 ? 深拷贝(元数据) : undefined,
        游戏初始时间: typeof raw.游戏初始时间 === 'string' ? raw.游戏初始时间 : undefined,
        角色数据: 深拷贝(raw.角色数据),
        环境信息: 深拷贝(raw.环境信息),
        历史记录: 深拷贝(history),
        社交: Array.isArray(raw.社交) ? 深拷贝(raw.社交) : undefined,
        世界: raw.世界 && typeof raw.世界 === 'object' ? 深拷贝(raw.世界) : undefined,
        战斗: raw.战斗 && typeof raw.战斗 === 'object' ? 深拷贝(raw.战斗) : undefined,
        玩家门派: raw.玩家门派 && typeof raw.玩家门派 === 'object' ? 深拷贝(raw.玩家门派) : undefined,
        任务列表: Array.isArray(raw.任务列表) ? 深拷贝(raw.任务列表) : undefined,
        约定列表: Array.isArray(raw.约定列表) ? 深拷贝(raw.约定列表) : undefined,
        剧情: raw.剧情 && typeof raw.剧情 === 'object' ? 深拷贝(raw.剧情) : undefined,
        剧情规划: raw.剧情规划 && typeof raw.剧情规划 === 'object' ? 深拷贝(raw.剧情规划) : undefined,
        女主剧情规划: raw.女主剧情规划 && typeof raw.女主剧情规划 === 'object' ? 深拷贝(raw.女主剧情规划) : undefined,
        同人剧情规划: raw.同人剧情规划 && typeof raw.同人剧情规划 === 'object' ? 深拷贝(raw.同人剧情规划) : undefined,
        同人女主剧情规划: raw.同人女主剧情规划 && typeof raw.同人女主剧情规划 === 'object' ? 深拷贝(raw.同人女主剧情规划) : undefined,
        记忆系统: raw.记忆系统 && typeof raw.记忆系统 === 'object' ? 深拷贝(raw.记忆系统) : undefined,
        openingConfig: raw.openingConfig && typeof raw.openingConfig === 'object' ? 深拷贝(raw.openingConfig) : undefined,
        游戏设置: raw.游戏设置 && typeof raw.游戏设置 === 'object' ? 深拷贝(raw.游戏设置) : undefined,
        记忆配置: raw.记忆配置 && typeof raw.记忆配置 === 'object' ? 深拷贝(raw.记忆配置) : undefined,
        视觉设置: raw.视觉设置 && typeof raw.视觉设置 === 'object' ? 深拷贝(raw.视觉设置) : undefined,
        场景图片档案: raw.场景图片档案 && typeof raw.场景图片档案 === 'object' ? 深拷贝(raw.场景图片档案) : undefined,
        核心提示词快照: raw.核心提示词快照 && typeof raw.核心提示词快照 === 'object' ? 深拷贝(raw.核心提示词快照) : undefined,
        角色锚点列表: Array.isArray(raw.角色锚点列表) ? 深拷贝(raw.角色锚点列表) : undefined,
        当前角色锚点ID: typeof raw.当前角色锚点ID === 'string' ? raw.当前角色锚点ID : undefined,
        校园系统: raw.校园系统 && typeof raw.校园系统 === 'object' ? 深拷贝(raw.校园系统) : undefined,
        校规系统: raw.校规系统 && typeof raw.校规系统 === 'object' ? 深拷贝(raw.校规系统) : undefined,
        催眠系统: raw.催眠系统 && typeof raw.催眠系统 === 'object' ? 深拷贝(raw.催眠系统) : undefined,
        写真系统: raw.写真系统 && typeof raw.写真系统 === 'object' ? 深拷贝(raw.写真系统) : undefined,
        都市网约车系统: raw.都市网约车系统 && typeof raw.都市网约车系统 === 'object' ? 深拷贝(raw.都市网约车系统) : undefined,
        关系谱: raw.关系谱 && typeof raw.关系谱 === 'object' ? 深拷贝(raw.关系谱) : undefined,
    };

    return normalized;
};
