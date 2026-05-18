// 房产 SLG - 设施建造、升级、拆除与房间扩建工作流

import type {
    房产数据结构, 房间结构, 全局设施结构, 房间设施结构,
    建造中设施, 房产系统状态, 房产变更记录
} from '../../../models/property/types';
import { 按ID查找设施预设 } from '../../../models/property/facilityPresets';

// ─── 工具函数 ───

const generateID = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const parseTimeToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0];
};

// ─── 设施建造 ───

/**
 * 将设施加入建造队列，返回更新后的房产系统状态
 */
export const 开始建造设施 = (
    房产系统: 房产系统状态,
    设施ID: string,
    目标位置: string | null,  // null = 全局设施, 否则为房间ID
    品质: 房间设施结构['品质'] = '凡品',
    当前游戏时间: string = '0:0:0:00:00'
): 房产系统状态 => {
    const preset = 按ID查找设施预设(设施ID);
    if (!preset) {
        return 房产系统;
    }

    const 建造项: 建造中设施 = {
        id: generateID('build'),
        设施ID: preset.设施ID,
        设施名称: preset.名称,
        设施类别: preset.类别,
        目标位置: 目标位置,
        开始时间: 当前游戏时间,
        预计完成时间: 当前游戏时间,
        品质
    };

    return {
        ...房产系统,
        建造队列: [...房产系统.建造队列, 建造项]
    };
};

// ─── 完成建造 ───

/**
 * 从建造队列中取出设施，安装到房产上
 */
export const 完成建造设施 = (
    房产: 房产数据结构,
    建造项: 建造中设施
): 房产数据结构 => {
    const preset = 按ID查找设施预设(建造项.设施ID);
    if (!preset) return 房产;

    const 设施等级 = 建造项.品质 === '传说' ? 5 : 建造项.品质 === '绝世' ? 4 : 建造项.品质 === '极品' ? 3 : 建造项.品质 === '上品' ? 2 : 1;
    const 最大耐久度 = 100;

    const 变更: 房产变更记录 = {
        变更类型: '建造',
        变更描述: `建造完成: ${建造项.设施名称}`,
        变更时间: 建造项.预计完成时间,
        消耗资源: { 资金: preset.基础价格 }
    };

    if (建造项.目标位置 === null) {
        const 新设施: 全局设施结构 = {
            id: generateID('facility'),
            设施ID: preset.设施ID,
            设施名称: preset.名称,
            设施类别: preset.类别,
            设施等级,
            品质: 建造项.品质,
            建造完成时间: 建造项.预计完成时间,
            耐久度: 最大耐久度,
            最大耐久度: 最大耐久度,
            位置引用: null
        };
        return {
            ...房产,
            设施列表: [...房产.设施列表, 新设施],
            扩建历史: [...房产.扩建历史, 变更]
        };
    } else {
        const 新房间设施: 房间设施结构 = {
            id: generateID('room_facility'),
            设施ID: preset.设施ID,
            设施名称: preset.名称,
            设施类别: preset.类别,
            设施等级,
            品质: 建造项.品质,
            建造完成时间: 建造项.预计完成时间,
            耐久度: 最大耐久度,
            最大耐久度: 最大耐久度
        };
        const 新房间列表 = 房产.房间列表.map(room => {
            if (room.id === 建造项.目标位置) {
                return {
                    ...room,
                    已建设施: [...room.已建设施, 新房间设施]
                };
            }
            return room;
        });
        return {
            ...房产,
            房间列表: 新房间列表,
            扩建历史: [...房产.扩建历史, 变更]
        };
    }
};

// ─── 升级设施 ───

/**
 * 升级现有设施到下一等级（如果预设支持升级）
 */
export const 升级设施 = (
    房产: 房产数据结构,
    设施引用ID: string,
    是否在房间: boolean
): 房产数据结构 => {
    const 设施列表 = 是否在房间
        ? 房产.房间列表.flatMap(r => r.已建设施)
        : 房产.设施列表;

    const 设施 = 设施列表.find(f => f.id === 设施引用ID);
    if (!设施) return 房产;

    const preset = 按ID查找设施预设(设施.设施ID);
    if (!preset || !preset.可升级 || !preset.升级目标ID) return 房产;

    const 新Preset = 按ID查找设施预设(preset.升级目标ID);
    if (!新Preset) return 房产;

    const 新等级 = Math.min(设施.设施等级 + 1, 5);
    const 变更: 房产变更记录 = {
        变更类型: '升级',
        变更描述: `${设施.设施名称} → ${新Preset.名称}`,
        变更时间: '',
        消耗资源: { 资金: 新Preset.基础价格 }
    };

    if (是否在房间) {
        const 新房间列表 = 房产.房间列表.map(room => ({
            ...room,
            已建设施: room.已建设施.map(f => {
                if (f.id === 设施引用ID) {
                    return {
                        ...f,
                        设施ID: 新Preset.设施ID,
                        设施名称: 新Preset.名称,
                        设施类别: 新Preset.类别,
                        设施等级: 新等级,
                        耐久度: 100,
                        最大耐久: 100
                    };
                }
                return f;
            })
        }));
        return {
            ...房产,
            房间列表: 新房间列表,
            扩建历史: [...房产.扩建历史, 变更]
        };
    } else {
        return {
            ...房产,
            设施列表: 房产.设施列表.map(f => {
                if (f.id === 设施引用ID) {
                    return {
                        ...f,
                        设施ID: 新Preset.设施ID,
                        设施名称: 新Preset.名称,
                        设施类别: 新Preset.类别,
                        设施等级: 新等级,
                        耐久度: 100,
                        最大耐久: 100
                    };
                }
                return f;
            }),
            扩建历史: [...房产.扩建历史, 变更]
        };
    }
};

// ─── 拆除设施 ───

/**
 * 拆除设施，返还部分资金
 */
export const 拆除设施 = (
    房产: 房产数据结构,
    设施引用ID: string,
    是否在房间: boolean,
    返还比例: number = 0.3
): 房产数据结构 => {
    const 设施列表 = 是否在房间
        ? 房产.房间列表.flatMap(r => r.已建设施)
        : 房产.设施列表;

    const 设施 = 设施列表.find(f => f.id === 设施引用ID);
    if (!设施) return 房产;

    const preset = 按ID查找设施预设(设施.设施ID);
    const 返还资金 = preset ? Math.floor(preset.基础价格 * 返还比例) : 0;

    const 变更: 房产变更记录 = {
        变更类型: '拆除',
        变更描述: `拆除 ${设施.设施名称}, 返还 ${返还资金} 资金`,
        变更时间: '',
        消耗资源: {}
    };

    if (是否在房间) {
        const 新房间列表 = 房产.房间列表.map(room => ({
            ...room,
            已建设施: room.已建设施.filter(f => f.id !== 设施引用ID)
        }));
        return {
            ...房产,
            房间列表: 新房间列表,
            经营状态: {
                ...房产.经营状态,
                总资金: 房产.经营状态.总资金 + 返还资金
            },
            扩建历史: [...房产.扩建历史, 变更]
        };
    } else {
        return {
            ...房产,
            设施列表: 房产.设施列表.filter(f => f.id !== 设施引用ID),
            经营状态: {
                ...房产.经营状态,
                总资金: 房产.经营状态.总资金 + 返还资金
            },
            扩建历史: [...房产.扩建历史, 变更]
        };
    }
};

// ─── 房间扩建 ───

/**
 * 添加新房间到房产
 */
export const 扩建房间 = (
    房产: 房产数据结构,
    房间名称: string,
    房间类型: 房间结构['房间类型'],
    面积: number,
    建造费用: number
): 房产数据结构 => {
    const 新房间: 房间结构 = {
        id: generateID('room'),
        房间名称,
        房间类型,
        房间等级: 1,
        房间品质: '凡品',
        面积,
        已建设施: [],
        当前房客Id: null,
        房间状态: '空闲'
    };

    const 变更: 房产变更记录 = {
        变更类型: '扩建',
        变更描述: `新建房间: ${房间名称} (${房间类型})`,
        变更时间: '',
        消耗资源: { 资金: 建造费用 }
    };

    return {
        ...房产,
        房间列表: [...房产.房间列表, 新房间],
        经营状态: {
            ...房产.经营状态,
            总资金: 房产.经营状态.总资金 - 建造费用
        },
        扩建历史: [...房产.扩建历史, 变更]
    };
};

// ─── 升级房间 ───

/**
 * 升级房间等级
 */
export const 升级房间 = (
    房产: 房产数据结构,
    房间ID: string,
    升级费用: number
): 房产数据结构 => {
    const 新房间列表 = 房产.房间列表.map(room => {
        if (room.id === 房间ID && room.房间等级 < 5) {
            return {
                ...room,
                房间等级: room.房间等级 + 1
            };
        }
        return room;
    });

    const 变更: 房产变更记录 = {
        变更类型: '升级',
        变更描述: `房间升级`,
        变更时间: '',
        消耗资源: { 资金: 升级费用 }
    };

    return {
        ...房产,
        房间列表: 新房间列表,
        经营状态: {
            ...房产.经营状态,
            总资金: 房产.经营状态.总资金 - 升级费用
        },
        扩建历史: [...房产.扩建历史, 变更]
    };
};

// ─── 处理建造队列 ───

/**
 * 检查建造队列中已完成的设施，自动安装到房产
 */
export const 处理建造队列 = (
    房产: 房产数据结构,
    房产系统: 房产系统状态,
    当前游戏时间: string
): { 房产: 房产数据结构; 房产系统: 房产系统状态; 完成列表: string[] } => {
    const 完成列表: string[] = [];
    let 新房产 = 房产;
    const 剩余队列 = 房产系统.建造队列.filter(item => {
        新房产 = 完成建造设施(新房产, item);
        完成列表.push(item.设施名称);
        return false;
    });

    return {
        房产: 新房产,
        房产系统: { ...房产系统, 建造队列: 剩余队列 },
        完成列表
    };
};

// ─── 检查建造资金 ───

/**
 * 检查是否有足够资金建造指定设施
 */
export const 检查建造资金 = (房产: 房产数据结构, 设施ID: string): boolean => {
    const preset = 按ID查找设施预设(设施ID);
    if (!preset) return false;
    return 房产.经营状态.总资金 >= preset.基础价格;
};
