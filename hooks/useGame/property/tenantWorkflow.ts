// 房产 SLG - 房客招揽、入住、退租、满意度管理工作流

import type {
    房产数据结构, 房客结构, 房间结构, 房产变更记录, 房客类型
} from '../../../models/property/types';
import { 按类型查找房客预设, 随机选择房客类型 } from '../../../models/property/tenantPresets';
import { 计算房产吸引力, 计算房客满意度, 检查房客退租 } from './propertyEngine';

// ─── 工具函数 ───

const generateID = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ─── 招揽房客 ───

/**
 * 基于房产吸引力，从 NPC 池中招揽新房客入住空闲房间
 */
export const 招揽房客 = (
    房产: 房产数据结构,
    当前游戏时间: string,
    NPC池子: Array<{ id: string; 姓名: string }> = []
): 房产数据结构 => {
    const 空闲房间 = 房产.房间列表.filter(r => r.房间状态 === '空闲' && r.当前房客Id === null);
    if (空闲房间.length === 0) return 房产;

    const 吸引力 = 计算房产吸引力(房产);
    const 可招揽数量 = Math.min(
        空闲房间.length,
        吸引力 >= 80 ? 3 : 吸引力 >= 50 ? 2 : 1
    );

    let 新房产 = 房产;
    for (let i = 0; i < 可招揽数量; i++) {
        const 房间 = 空闲房间[i];
        if (!房间) break;

        const 房客类型 = 随机选择房客类型(吸引力) as 房客类型;
        const preset = 按类型查找房客预设(房客类型);
        if (!preset) continue;

        const npc = NPC池子.length > 0
            ? NPC池子[Math.floor(Math.random() * NPC池子.length)]
            : { id: generateID('npc'), 姓名: '未知房客' };

        const 新房客: 房客结构 = {
            id: generateID('tenant'),
            NPC姓名: npc.姓名,
            NPC引用ID: npc.id,
            入住房间ID: 房间.id,
            入住时间: 当前游戏时间,
            租约到期时间: 当前游戏时间,
            租金: 0,
            满意度: 50,
            房客类型,
            性格标签: [...preset.性格标签池].sort(() => Math.random() - 0.5).slice(0, 2),
            特殊需求: [...preset.特殊需求池].sort(() => Math.random() - 0.5).slice(0, 1),
            关系状态: '良好'
        };

        新房产 = {
            ...新房产,
            房客列表: [...新房产.房客列表, 新房客],
            房间列表: 新房产.房间列表.map(r =>
                r.id === 房间.id
                    ? { ...r, 当前房客Id: 新房客.id, 房间状态: '使用中' as const }
                    : r
            )
        };
    }

    return 新房产;
};

// ─── 房客退租 ───

/**
 * 处理房客退租，释放房间
 */
export const 处理房客退租 = (
    房产: 房产数据结构,
    退租房客ID列表: string[]
): 房产数据结构 => {
    const 变更: 房产变更记录[] = [];
    const 退租房客 = 房产.房客列表.filter(f => 退租房客ID列表.includes(f.id));

    const 新房间列表 = 房产.房间列表.map(room => {
        const 退租 = 退租房客.some(f => f.入住房间ID === room.id);
        if (退租) {
            return { ...room, 当前房客Id: null, 房间状态: '空闲' as const };
        }
        return room;
    });

    const 新房客列表 = 房产.房客列表.filter(f => !退租房客ID列表.includes(f.id));

    for (const 房客 of 退租房客) {
        变更.push({
            变更类型: '房客退租',
            变更描述: `${房客.NPC姓名} (${房客.房客类型}) 退租`,
            变更时间: '',
            消耗资源: {}
        });
    }

    return {
        ...房产,
        房间列表: 新房间列表,
        房客列表: 新房客列表,
        扩建历史: [...房产.扩建历史, ...变更]
    };
};

// ─── 自动退租检查 ───

/**
 * 检查并自动处理满意度低于阈值的房客退租
 */
export const 自动退租检查 = (房产: 房产数据结构): 房产数据结构 => {
    const 退租列表 = 检查房客退租(房产);
    if (退租列表.length === 0) return 房产;

    const 退租ID列表 = 退租列表.map(f => f.id);
    return 处理房客退租(房产, 退租ID列表);
};

// ─── 更新房客满意度 ───

/**
 * 批量更新所有房客满意度
 */
export const 更新房客满意度 = (房产: 房产数据结构): 房产数据结构 => {
    const 新房客列表 = 房产.房客列表.map(房客 => {
        const 满意度结果 = 计算房客满意度(房客, 房产);
        return {
            ...房客,
            满意度: 满意度结果.当前满意度
        };
    });

    return {
        ...房产,
        房客列表: 新房客列表
    };
};

// ─── 获取房客满意度报告 ───

/**
 * 返回所有房客的满意度摘要
 */
export const 获取房客满意度报告 = (
    房产: 房产数据结构
): Array<{ 房客姓名: string; 房客类型: string; 满意度: number; 状态: string }> => {
    return 房产.房客列表.map(房客 => {
        const 状态 = 房客.满意度 >= 70 ? '满意'
            : 房客.满意度 >= 40 ? '一般'
                : 房客.满意度 >= 20 ? '不满' : '愤怒';
        return {
            房客姓名: 房客.NPC姓名,
            房客类型: 房客.房客类型,
            满意度: 房客.满意度,
            状态
        };
    });
};

// ─── 驱逐房客 ───

/**
 * 房东主动驱逐房客
 */
export const 驱逐房客 = (
    房产: 房产数据结构,
    房客ID: string,
    原因: string = ''
): 房产数据结构 => {
    const 房客 = 房产.房客列表.find(f => f.id === 房客ID);
    if (!房客) return 房产;

    return 处理房客退租(房产, [房客ID]);
};

// ─── 分配房间 ───

/**
 * 将房客分配到指定房间
 */
export const 分配房间 = (
    房产: 房产数据结构,
    房客ID: string,
    目标房间ID: string
): 房产数据结构 => {
    const 房客 = 房产.房客列表.find(f => f.id === 房客ID);
    const 房间 = 房产.房间列表.find(r => r.id === 目标房间ID);

    if (!房客 || !房间) return 房产;
    if (房间.当前房客Id !== null && 房间.当前房客Id !== 房客ID) return 房产;

    const 旧房间ID = 房客.入住房间ID;

    const 新房间列表 = 房产.房间列表.map((r: 房间结构) => {
        if (r.id === 旧房间ID && r.id !== 目标房间ID) {
            return { ...r, 当前房客Id: null, 房间状态: '空闲' as const };
        }
        if (r.id === 目标房间ID) {
            return { ...r, 当前房客Id: 房客ID, 房间状态: '使用中' as const };
        }
        return r;
    });

    const 新房客列表 = 房产.房客列表.map(f =>
        f.id === 房客ID ? { ...f, 入住房间ID: 目标房间ID } : f
    );

    return {
        ...房产,
        房间列表: 新房间列表,
        房客列表: 新房客列表
    };
};
