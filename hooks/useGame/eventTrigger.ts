/**
 * eventTrigger.ts
 * 游戏事件触发器核心逻辑
 *
 * 提供统一的事件触发机制，支持：
 * 1. 回合偏移触发（基于创建回合 + 偏移量）
 * 2. 绝对回合触发（指定目标回合）
 * 3. 条件表达式触发（字符串条件）
 *
 * 纯函数，不直接修改状态，返回操作指令供调用方应用。
 */

import type {
    游戏事件,
    触发条件,
    事件状态,
    增强条件,
} from '../../models/eventTrigger';

// ==================== 常量 ====================

const 默认优先级 = 0;

// ==================== 触发检查 ====================

/**
 * 检查是否有到期的游戏事件
 *
 * @param 事件列表 - 游戏事件数组
 * @param 当前回合 - 当前游戏回合
 * @returns 到期且可触发的事件数组
 */
export const 检查到期事件 = (
    事件列表: 游戏事件[] | undefined,
    当前回合: number
): 游戏事件[] => {
    if (!事件列表 || 事件列表.length === 0) return [];

    return 事件列表
        .filter(事件 => {
            // 只检查待触发状态的事件
            if (事件.状态 !== '待触发') return false;

            // 检查是否已过期
            if (事件.过期回合 !== undefined && 当前回合 > 事件.过期回合) {
                return false;
            }

            // 计算触发回合
            const 触发回合 = 计算触发回合(事件);
            if (触发回合 === null) return false;

            return 当前回合 >= 触发回合;
        })
        .sort((a, b) => (b.优先级 ?? 默认优先级) - (a.优先级 ?? 默认优先级));
};

/**
 * 计算事件的触发回合
 *
 * @param 事件 - 游戏事件
 * @returns 触发回合数，如果无法计算则返回 null
 */
export const 计算触发回合 = (事件: 游戏事件): number | null => {
    switch (事件.触发条件.kind) {
        case '回合偏移':
            return (事件.创建回合 || 0) + 事件.触发条件.偏移量;
        case '回合绝对':
            return 事件.触发条件.目标回合;
        case '条件表达式':
            // 条件表达式需要外部求值器，这里返回 null
            // 调用方需要自行判断
            return null;
        default:
            return null;
    }
};

// ==================== 提示词构建 ====================

/**
 * 构建事件注入提示词，供 systemPromptBuilder 注入到主剧情 prompt
 *
 * @param 事件 - 游戏事件
 * @returns 注入提示词字符串
 */
export const 构建事件注入提示词 = (事件: 游戏事件): string => {
    const 触发回合 = 计算触发回合(事件);
    const 触发回合描述 = 触发回合 !== null ? `（触发回合: ${触发回合}）` : '';

    const 基础描述 = `## ${事件.名称} 事件触发${触发回合描述}`;

    const 事件描述 = 事件.描述
        ? `\n${事件.描述}`
        : '';

    const 事件数据块 = Object.keys(事件.事件数据).length > 0
        ? `\n事件数据：\n${JSON.stringify(事件.事件数据, null, 2)}`
        : '';

    return `${基础描述}${事件描述}${事件数据块}

请在本次剧情中处理此事件的触发与展开。
事件结束后，请在回复末尾输出以下标签来更新事件状态：

<事件更新>
{"id": "${事件.id}", "新状态": "已触发"}
</事件更新>
`;
};

// ==================== 响应解析 ====================

/**
 * 解析 AI 响应中的 <事件更新> 标签
 *
 * @param responseText - AI 响应文本
 * @returns 事件更新信号，如果未找到则返回 null
 */
export const 解析事件更新信号 = (
    responseText: string
): {
    事件ID: string;
    新状态: string;
    额外数据?: Record<string, unknown>;
} | null => {
    const match = responseText.match(/<事件更新>\s*([\s\S]*?)\s*<\/事件更新>/);
    if (!match) return null;

    try {
        const data = JSON.parse(match[1]);
        if (data.id) {
            return {
                事件ID: data.id,
                新状态: data.新状态 || '已触发',
                额外数据: data.额外数据,
            };
        }
    } catch {
        // ignore parse errors
    }

    return null;
};

// ==================== 事件状态更新 ====================

/**
 * 计算事件的新状态（不可变更新）
 *
 * @param 事件 - 当前事件
 * @param 新状态 - 新状态
 * @param 额外数据 - 可选的额外更新数据
 * @returns 更新后的事件
 */
export const 计算事件新状态 = (
    事件: 游戏事件,
    新状态: 事件状态,
    额外数据?: Record<string, unknown>
): 游戏事件 => {
    return {
        ...事件,
        状态: 新状态,
        触发回合: 事件.触发回合 ?? 计算触发回合(事件),
        ...(额外数据 ? { 事件数据: { ...事件.事件数据, ...额外数据 } } : {}),
    };
};

/**
 * 批量更新事件状态
 *
 * @param 事件列表 - 原始事件列表
 * @param 更新映射 - 事件ID到新状态的映射
 * @returns 更新后的事件列表
 */
export const 批量更新事件状态 = (
    事件列表: 游戏事件[],
    更新映射: Record<string, 事件状态>
): 游戏事件[] => {
    return 事件列表.map(事件 => {
        const 新状态 = 更新映射[事件.id];
        if (新状态 && 事件.状态 === '待触发') {
            return 计算事件新状态(事件, 新状态);
        }
        return 事件;
    });
};

// ==================== 事件创建辅助 ====================

/**
 * 创建回合偏移事件
 */
export const 创建回合偏移事件 = (
    id: string,
    名称: string,
    偏移量: number,
    事件数据: Record<string, unknown> = {},
    选项?: {
        描述?: string;
        优先级?: number;
        过期回合?: number;
        标签?: string[];
    }
): 游戏事件 => ({
    id,
    类型: '预约',
    名称,
    描述: 选项?.描述,
    触发条件: { kind: '回合偏移', 偏移量 },
    事件数据,
    状态: '待触发',
    创建回合: 0, // 创建时由调用方设置
    优先级: 选项?.优先级,
    过期回合: 选项?.过期回合,
    标签: 选项?.标签,
});

/**
 * 创建绝对回合事件
 */
export const 创建绝对回合事件 = (
    id: string,
    名称: string,
    目标回合: number,
    事件数据: Record<string, unknown> = {},
    选项?: {
        描述?: string;
        优先级?: number;
        过期回合?: number;
        标签?: string[];
    }
): 游戏事件 => ({
    id,
    类型: '定时',
    名称,
    描述: 选项?.描述,
    触发条件: { kind: '回合绝对', 目标回合 },
    事件数据,
    状态: '待触发',
    创建回合: 0,
    优先级: 选项?.优先级,
    过期回合: 选项?.过期回合,
    标签: 选项?.标签,
});

/**
 * 创建条件表达式事件
 */
export const 创建条件事件 = (
    id: string,
    名称: string,
    表达式: string,
    事件数据: Record<string, unknown> = {},
    选项?: {
        描述?: string;
        优先级?: number;
        过期回合?: number;
        标签?: string[];
    }
): 游戏事件 => ({
    id,
    类型: '条件',
    名称,
    描述: 选项?.描述,
    触发条件: { kind: '条件表达式', 表达式 },
    事件数据,
    状态: '待触发',
    创建回合: 0,
    优先级: 选项?.优先级,
    过期回合: 选项?.过期回合,
    标签: 选项?.标签,
});

// ==================== V2 增强条件求值 ====================

/**
 * 从嵌套对象中获取属性值
 */
const 获取嵌套属性 = (obj: unknown, 路径: string): unknown => {
    const parts = 路径.split('.');
    let current: unknown = obj;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (typeof current === 'object') {
            current = (current as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }
    return current;
};

/**
 * 比较两个值
 */
const 比较值 = (
    左值: unknown,
    操作符: '>' | '<' | '>=' | '<=' | '==' | '!=',
    右值: unknown
): boolean => {
    switch (操作符) {
        case '>': return (左值 as number) > (右值 as number);
        case '<': return (左值 as number) < (右值 as number);
        case '>=': return (左值 as number) >= (右值 as number);
        case '<=': return (左值 as number) <= (右值 as number);
        case '==': return 左值 == 右值;
        case '!=': return 左值 != 右值;
        default: return false;
    }
};

/**
 * 求值增强条件 (V2)
 *
 * @param 条件 - 增强条件
 * @param 游戏状态 - 游戏状态对象
 * @returns 条件是否满足
 */
export const 求值增强条件 = (
    条件: 增强条件,
    游戏状态: Record<string, unknown>
): boolean => {
    switch (条件.kind) {
        case '属性比较': {
            const 实际值 = 获取嵌套属性(游戏状态, 条件.属性路径);
            return 比较值(实际值, 条件.操作符, 条件.值);
        }
        case '状态检查': {
            const 实际值 = 获取嵌套属性(游戏状态, 条件.检查项);
            return 实际值 === 条件.期望值;
        }
        case '概率': {
            return Math.random() < 条件.概率;
        }
        case '且': {
            return 条件.条件列表.every(c => 求值增强条件(c, 游戏状态));
        }
        case '或': {
            return 条件.条件列表.some(c => 求值增强条件(c, 游戏状态));
        }
        case '非': {
            return !求值增强条件(条件.条件, 游戏状态);
        }
        default:
            return false;
    }
};

// ==================== V2 周期性事件 ====================

/**
 * 检查周期性事件是否应触发 (V2)
 *
 * @param 事件 - 游戏事件
 * @param 当前回合 - 当前回合
 * @returns 是否应触发
 */
export const 检查周期性触发 = (
    事件: 游戏事件,
    当前回合: number
): boolean => {
    if (事件.状态 !== '待触发') return false;
    if (!事件.周期性配置) return false;

    const { 间隔回合, 终止回合, 最大触发次数 } = 事件.周期性配置;
    const 已触发次数 = 事件.已触发次数 || 0;

    // 检查最大触发次数
    if (最大触发次数 !== undefined && 已触发次数 >= 最大触发次数) {
        return false;
    }

    // 检查终止回合
    if (终止回合 !== undefined && 当前回合 > 终止回合) {
        return false;
    }

    // 检查是否到间隔
    const 初始触发回合 = 计算触发回合(事件);
    if (初始触发回合 === null) return false;

    const 距初始触发 = 当前回合 - 初始触发回合;
    return 距初始触发 > 0 && 距初始触发 % 间隔回合 === 0;
};

/**
 * 获取周期性事件的下一触发回合 (V2)
 */
export const 获取下一触发回合 = (
    事件: 游戏事件,
    当前回合: number
): number | null => {
    if (!事件.周期性配置) return null;

    const { 间隔回合, 终止回合, 最大触发次数 } = 事件.周期性配置;
    const 已触发次数 = 事件.已触发次数 || 0;

    if (最大触发次数 !== undefined && 已触发次数 >= 最大触发次数) {
        return null;
    }

    const 初始触发回合 = 计算触发回合(事件);
    if (初始触发回合 === null) return null;

    let 下一触发 = 初始触发回合 + 间隔回合;
    while (下一触发 <= 当前回合) {
        下一触发 += 间隔回合;
    }

    if (终止回合 !== undefined && 下一触发 > 终止回合) {
        return null;
    }

    return 下一触发;
};

// ==================== V2 事件链 ====================

/**
 * 查找事件链中应触发的事件 (V2)
 *
 * @param 源事件ID - 源事件ID
 * @param 事件列表 - 所有事件列表
 * @param 当前回合 - 当前回合
 * @returns 应触发的事件列表
 */
export const 查找链式触发事件 = (
    源事件ID: string,
    事件列表: 游戏事件[],
    当前回合: number
): 游戏事件[] => {
    const now = Date.now();
    return 事件列表.filter(事件 => {
        if (事件.状态 !== '待触发') return false;

        // 检查是否是链式事件
        if (!事件.事件链列表 || 事件.事件链列表.length === 0) return false;

        // 查找以源事件ID为起点的链
        return 事件.事件链列表.some(链 => {
            if (链.源事件ID !== 源事件ID) return false;

            // 检查延迟
            const 目标触发回合 = (事件.触发回合 || 0) + 链.触发后延迟;
            return 当前回合 >= 目标触发回合;
        });
    });
};

/**
 * 清理已过期事件 (V2)
 *
 * @param 事件列表 - 事件列表
 * @param 当前回合 - 当前回合
 * @returns 清理后的事件列表
 */
export const 清理已过期事件 = (
    事件列表: 游戏事件[],
    当前回合: number
): 游戏事件[] => {
    return 事件列表.filter(事件 => {
        // 删除已取消、已过期且已超过保留期限的事件
        if (事件.状态 === '已取消') return false;
        if (事件.状态 === '已过期') {
            // 保留最近过期的，不超过10个
            const 过期回合 = 事件.过期回合 || (事件.创建回合 + 100);
            return 当前回合 - 过期回合 < 10;
        }
        return true;
    });
};

// ==================== V2 事件分组 ====================

/**
 * 处理事件分组互斥 (V2)
 * 同一互斥组中只保留最高优先级的事件
 *
 * @param 事件列表 - 待处理的事件列表
 * @param 分组ID - 分组ID
 * @returns 保留的事件列表
 */
export const 处理事件组互斥 = (
    事件列表: 游戏事件[],
    分组ID: string
): 游戏事件[] => {
    const 分组内事件 = 事件列表.filter(e => e.事件分组ID === 分组ID);

    if (分组内事件.length <= 1) return 事件列表;

    // 按优先级排序，取最高优先级
    const 排序后 = [...分组内事件].sort(
        (a, b) => (b.优先级 ?? 0) - (a.优先级 ?? 0)
    );
    const 最高优先级事件 = 排序后[0];

    // 从原列表中移除同组事件，保留最高优先级
    const 其他事件 = 事件列表.filter(e => e.事件分组ID !== 分组ID);
    return [...其他事件, 最高优先级事件];
};

/**
 * 获取分组内所有待触发事件 (V2)
 */
export const 获取分组待触发事件 = (
    事件列表: 游戏事件[],
    分组ID: string
): 游戏事件[] => {
    return 事件列表.filter(
        e => e.事件分组ID === 分组ID && e.状态 === '待触发'
    );
};

// ==================== V2 事件更新辅助 ====================

/**
 * 更新周期性事件的触发计数 (V2)
 */
export const 更新周期触发计数 = (事件: 游戏事件): 游戏事件 => {
    if (事件.类型 !== '周期') return 事件;

    return {
        ...事件,
        已触发次数: (事件.已触发次数 || 0) + 1,
    };
};

/**
 * 检查事件是否应自动过期 (V2)
 */
export const 检查事件过期 = (
    事件: 游戏事件,
    当前回合: number
): 游戏事件 | null => {
    if (事件.状态 !== '待触发') return null;

    // 基于过期回合检查
    if (事件.过期回合 !== undefined && 当前回合 > 事件.过期回合) {
        return { ...事件, 状态: '已过期' as const };
    }

    // 基于周期性配置检查
    if (事件.周期性配置?.最大触发次数 !== undefined) {
        const 已触发次数 = 事件.已触发次数 || 0;
        if (已触发次数 >= 事件.周期性配置.最大触发次数) {
            return { ...事件, 状态: '已过期' as const };
        }
    }

    return null;
};

// ==================== 工具函数 ====================

/**
 * 获取事件的简短描述
 */
export const 获取事件描述 = (事件: 游戏事件): string => {
    const 状态标记 = 事件.状态 !== '待触发' ? `[${事件.状态}]` : '';
    const 优先级标记 = 事件.优先级 !== undefined ? `⚡${事件.优先级}` : '';
    const 触发回合 = 计算触发回合(事件);

    let 触发条件描述 = '';
    switch (事件.触发条件.kind) {
        case '回合偏移':
            触发条件描述 = `${事件.创建回合 || 0} + ${事件.触发条件.偏移量} = ${触发回合}`;
            break;
        case '回合绝对':
            触发条件描述 = `回合 ${事件.触发条件.目标回合}`;
            break;
        case '条件表达式':
            触发条件描述 = `条件: ${事件.触发条件.表达式}`;
            break;
    }

    return `${状态标记}${优先级标记}${事件.名称} (${触发条件描述})`;
};
