// 房产 SLG 经营系统 - 经营引擎（纯函数）

import type {
    房产数据结构, 经营状态结构, 房客结构, 房间结构,
    经营计算结果, 房客满意度结果
} from '../../../models/property/types';
import { 按ID查找设施预设 } from '../../../models/property/facilityPresets';
import { 按类型查找房客预设 } from '../../../models/property/tenantPresets';

// ─── 工具函数 ───

const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

// ─── 计算房产吸引力 ───

/**
 * 房产吸引力 = 基础值(10) + 房间数 * 5 + 设施吸引力加成总和 + 房产等级 * 3
 */
export const 计算房产吸引力 = (房产: 房产数据结构): number => {
    const 房间加成 = 房产.房间列表.length * 5;
    const 设施加成 = 房产.设施列表.reduce((sum, f) => {
        const preset = 按ID查找设施预设(f.设施ID);
        return sum + (preset ? preset.吸引力加成 * f.设施等级 : 0);
    }, 0);
    const 房间设施加成 = 房产.房间列表.reduce((sum, room) =>
        sum + room.已建设施.reduce((s, f) => {
            const preset = 按ID查找设施预设(f.设施ID);
            return s + (preset ? preset.吸引力加成 * f.设施等级 : 0);
        }, 0), 0);
    const 等级加成 = 房产.房产等级 * 3;

    return Math.round(10 + 房间加成 + 设施加成 + 房间设施加成 + 等级加成);
};

// ─── 计算舒适度 ───

/**
 * 舒适度 = 基础值(5) + 设施舒适度加成均值 + 房间等级均值 * 5
 */
export const 计算舒适度 = (房产: 房产数据结构): number => {
    const allFacilities = [
        ...房产.设施列表,
        ...房产.房间列表.flatMap(r => r.已建设施)
    ];

    if (allFacilities.length === 0) return 5;

    const 设施舒适 = allFacilities.reduce((sum, f) => {
        const preset = 按ID查找设施预设(f.设施ID);
        return sum + (preset ? preset.舒适度加成 * f.设施等级 : 0);
    }, 0);

    const 房间等级均值 = 房产.房间列表.length > 0
        ? 房产.房间列表.reduce((s, r) => s + r.房间等级, 0) / 房产.房间列表.length
        : 0;

    return Math.round(5 + 设施舒适 / allFacilities.length + 房间等级均值 * 5);
};

// ─── 计算安全性 ───

/**
 * 安全性 = 基础值(10) + 安全类设施加成总和
 */
export const 计算安全性 = (房产: 房产数据结构): number => {
    const 安全设施 = 房产.设施列表.filter(f => {
        const preset = 按ID查找设施预设(f.设施ID);
        return preset?.类别 === '安全';
    });

    const 安全加成 = 安全设施.reduce((sum, f) => {
        const preset = 按ID查找设施预设(f.设施ID);
        return sum + (preset ? 10 * f.设施等级 : 0);
    }, 0);

    return Math.round(10 + 安全加成);
};

// ─── 计算房客满意度 ───

/**
 * 满意度受以下因素影响：
 * 1. 设施匹配度（偏好设施命中 + 厌恶设施命中）
 * 2. 房间等级
 * 3. 房产舒适度
 * 4. 基础衰减率
 */
export const 计算房客满意度 = (
    房客: 房客结构,
    房产: 房产数据结构
): 房客满意度结果 => {
    const preset = 按类型查找房客预设(房客.房客类型);
    const 原因: string[] = [];
    let 变化值 = 0;

    if (!preset) {
        return { 房客Id: 房客.id, 当前满意度: clamp(房客.满意度 - 2, 0, 100), 变化值: -2, 原因: ['未知房客类型'] };
    }

    // 设施匹配
    const room = 房产.房间列表.find(r => r.id === 房客.入住房间ID);
    const allFacilityIDs = new Set([
        ...房产.设施列表.map(f => f.设施ID),
        ...(room?.已建设施.map(f => f.设施ID) ?? [])
    ]);

    const 命中偏好 = preset.偏好设施.filter(id => allFacilityIDs.has(id));
    const 命中厌恶 = preset.厌恶设施.filter(id => allFacilityIDs.has(id));

    if (命中偏好.length > 0) {
        变化值 += 命中偏好.length * 3;
        原因.push(`偏好设施命中 ${命中偏好.length} 项`);
    }
    if (命中厌恶.length > 0) {
        变化值 -= 命中厌恶.length * 5;
        原因.push(`厌恶设施命中 ${命中厌恶.length} 项`);
    }

    // 房间等级加成
    if (room) {
        变化值 += room.房间等级;
        原因.push(`房间等级 ${room.房间等级}`);
    }

    // 基础衰减
    变化值 -= preset.满意度衰减率;
    原因.push(`基础衰减 -${preset.满意度衰减率}`);

    // 舒适度加成
    const 舒适度 = 计算舒适度(房产);
    if (舒适度 > 30) {
        变化值 += 1;
        原因.push('高舒适度加成');
    }

    return {
        房客Id: 房客.id,
        当前满意度: clamp(房客.满意度 + 变化值, 0, 100),
        变化值,
        原因
    };
};

// ─── 计算应付租金 ───

/**
 * 租金 = 房间等级 * 100 * 房客类型倍率 * (1 + 租金加成%)
 */
export const 计算应付租金 = (
    房客: 房客结构,
    房间: 房间结构,
    房产: 房产数据结构
): number => {
    const preset = 按类型查找房客预设(房客.房客类型);
    const 倍率 = preset?.基础租金倍率 ?? 1.0;

    // 计算租金加成
    let 租金加成 = 0;
    const allFacilities = [
        ...房产.设施列表,
        ...房间.已建设施
    ];
    for (const f of allFacilities) {
        const preset_f = 按ID查找设施预设(f.设施ID);
        if (preset_f) {
            租金加成 += preset_f.租金加成 * f.设施等级 * 0.01;
        }
    }

    const 基础租金 = 房间.房间等级 * 100;
    return Math.round(基础租金 * 倍率 * (1 + 租金加成));
};

// ─── 计算维护费用 ───

/**
 * 维护费用 = 设施维护费用总和 + 耐久损耗修复费用
 */
export const 计算维护费用 = (房产: 房产数据结构): number => {
    const allFacilities = [
        ...房产.设施列表,
        ...房产.房间列表.flatMap(r => r.已建设施)
    ];

    let 总维护费 = 0;
    for (const f of allFacilities) {
        const preset = 按ID查找设施预设(f.设施ID);
        if (preset) {
            总维护费 += preset.维护费用 * f.设施等级;
        }
    }

    // 低耐久设施额外修复费
    const 破损设施 = allFacilities.filter(f => f.耐久度 < 30);
    const 修复费 = 破损设施.length * 50;

    return 总维护费 + 修复费;
};

// ─── 计算经验值获取 ───

/**
 * 经验值获取 = 房客数量 * 10 + 设施总数 * 5 + 收入 / 100
 */
export const 计算经验值获取 = (房产: 房产数据结构, 当前收入: number): number => {
    const 房客经验 = 房产.房客列表.length * 10;
    const 设施总数 = 房产.设施列表.length +
        房产.房间列表.reduce((s, r) => s + r.已建设施.length, 0);
    const 设施经验 = 设施总数 * 5;
    const 收入经验 = Math.floor(当前收入 / 100);

    return 房客经验 + 设施经验 + 收入经验;
};

// ─── 推进经营回合（核心纯函数） ───

/**
 * 每回合调用，返回新的房产状态
 * 纯函数：不修改原对象，返回新对象
 */
export const 推进经营回合 = (
    房产: 房产数据结构
): 房产数据结构 => {
    // 1. 计算本轮经营指标
    const 吸引力 = 计算房产吸引力(房产);
    const 舒适度 = 计算舒适度(房产);
    const 安全性 = 计算安全性(房产);
    const 维护费用 = 计算维护费用(房产);

    // 2. 计算房客租金收入与满意度
    let 总收入 = 0;
    const 新房客列表: 房客结构[] = [];

    for (const 房客 of 房产.房客列表) {
        const room = 房产.房间列表.find(r => r.id === 房客.入住房间ID);
        if (room) {
            总收入 += 计算应付租金(房客, room, 房产);
        }

        const 满意度结果 = 计算房客满意度(房客, 房产);
        新房客列表.push({
            ...房客,
            满意度: 满意度结果.当前满意度
        });
    }

    // 3. 设施耐久损耗
    const 新设施列表 = 房产.设施列表.map(f => {
        const preset = 按ID查找设施预设(f.设施ID);
        const 损耗 = preset ? preset.耐久损耗 : 1;
        return {
            ...f,
            耐久度: clamp(f.耐久度 - 损耗, 0, f.最大耐久度)
        };
    });

    const 新房间列表 = 房产.房间列表.map(room => ({
        ...room,
        已建设施: room.已建设施.map(f => {
            const preset = 按ID查找设施预设(f.设施ID);
            const 损耗 = preset ? preset.耐久损耗 : 1;
            return {
                ...f,
                耐久度: clamp(f.耐久度 - 损耗, 0, f.最大耐久度)
            };
        })
    }));

    // 4. 计算经验值
    const 经验获取 = 计算经验值获取(房产, 总收入);
    const 新经验 = 房产.当前经验 + 经验获取;

    // 5. 更新经营状态
    const 新经营状态: 房产数据结构['经营状态'] = {
        ...房产.经营状态,
        总资金: 房产.经营状态.总资金 + 总收入 - 维护费用,
        总收入: 房产.经营状态.总收入 + 总收入,
        总支出: 房产.经营状态.总支出 + 维护费用,
        当前回合收入: 总收入,
        吸引力,
        舒适度,
        安全性,
        每日开销: 维护费用
    };

    return {
        ...房产,
        房间列表: 新房间列表,
        设施列表: 新设施列表,
        房客列表: 新房客列表,
        经营状态: 新经营状态,
        当前经验: 新经验
    };
};

// ─── 检查房客退租 ───

/**
 * 检查满意度低于阈值的房客，返回需要退租的列表
 */
export const 检查房客退租 = (房产: 房产数据结构): 房客结构[] => {
    return 房产.房客列表.filter(房客 => {
        const preset = 按类型查找房客预设(房客.房客类型);
        return preset && 房客.满意度 < preset.退租阈值;
    });
};

// ─── 生成经营摘要 ───

export const 生成经营摘要 = (房产: 房产数据结构): string => {
    const { 经营状态, 房产名称, 房产等级, 房客列表, 设施列表 } = 房产;
    return [
        `【${房产名称}】等级 ${房产等级}`,
        `资金: ${经营状态.总资金} | 本回合收入: +${经营状态.当前回合收入}`,
        `房客: ${房客列表.length} 人 | 设施: ${设施列表.length} 件`,
        `吸引力: ${经营状态.吸引力} | 舒适度: ${经营状态.舒适度} | 安全性: ${经营状态.安全性}`
    ].join(' | ');
};
