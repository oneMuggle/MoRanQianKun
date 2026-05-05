/**
 * 动态难度调整工作流
 * 根据玩家表现自动调整游戏难度
 */

import { 游戏统计, 游戏难度, 难度调整记录, 默认游戏统计 } from '../../models/system';

/** 难度等级顺序 */
const 难度等级顺序: 游戏难度[] = ['relaxed', 'easy', 'normal', 'hard', 'extreme'];

/** 难度评估阈值配置 */
export interface 难度评估阈值 {
    降难度: {
        胜率低于: number;      // 战斗胜率 < 此值时考虑降难度
        死亡次数超过: number;   // 死亡次数 > 此值时考虑降难度
        连续失败超过: number;  // 连续失败 > 此值时考虑降难度
    };
    升难度: {
        胜率高于: number;       // 战斗胜率 > 此值时考虑升难度
        任务完成率高于: number; // 任务完成率 > 此值时考虑升难度
        越级成功率高: number;   // 越级成功率 > 此值时考虑升难度
    };
    冷却回合数: number;        // 至少多少回合后才能再次调整
    升降幅度: number;          // 每次最多调整几级
}

export const 默认难度评估阈值: 难度评估阈值 = {
    降难度: {
        胜率低于: 0.3,
        死亡次数超过: 3,
        连续失败超过: 3,
    },
    升难度: {
        胜率高于: 0.7,
        任务完成率高于: 0.8,
        越级成功率高: 0.6,
    },
    冷却回合数: 10,
    升降幅度: 1,
};

/** 评估结果 */
export interface 难度评估结果 {
    是否调整: boolean;
    调整方向: 'up' | 'down' | 'none';
    目标难度: 游戏难度 | null;
    原因: string;
    当前评级: number;         // 0-100
    评级说明: string;
}

/**
 * 计算战斗胜率
 */
export function 计算战斗胜率(stats: 游戏统计): number {
    if (stats.战斗次数 === 0) return 0.5; // 无战斗记录时默认50%
    return stats.胜利次数 / stats.战斗次数;
}

/**
 * 计算任务完成率
 */
export function 计算任务完成率(stats: 游戏统计): number {
    const total = stats.任务完成次数 + stats.任务失败次数;
    if (total === 0) return 0.5; // 无任务记录时默认50%
    return stats.任务完成次数 / total;
}

/**
 * 计算越级成功率
 */
export function 计算越级成功率(stats: 游戏统计): number {
    if (stats.跨境挑战次数 === 0) return 0.5; // 无越级挑战时默认50%
    return stats.跨境成功次数 / stats.跨境挑战次数;
}

/**
 * 计算综合评级 (0-100)
 */
export function 计算综合评级(stats: 游戏统计): number {
    const 胜率评级 = 计算战斗胜率(stats) * 100;
    const 任务评级 = 计算任务完成率(stats) * 100;
    const 生存评级 = Math.max(0, 100 - stats.死亡次数 * 10);
    const 越级评级 = 计算越级成功率(stats) * 100;

    // 加权求和
    const 综合评级 = 
        胜率评级 * 0.30 +   // 30% 战斗胜率
        任务评级 * 0.20 +   // 20% 任务完成率
        生存评级 * 0.25 +   // 25% 生存指数
        越级评级 * 0.15 +   // 15% 越级成功率
        50 * 0.10;          // 10% 基础分

    return Math.round(Math.max(0, Math.min(100, 综合评级)));
}

/**
 * 根据评级获取对应难度
 */
export function 评级转难度(评级: number): 游戏难度 {
    if (评级 <= 20) return 'relaxed';
    if (评级 <= 40) return 'easy';
    if (评级 <= 60) return 'normal';
    if (评级 <= 80) return 'hard';
    return 'extreme';
}

/**
 * 获取难度等级索引
 */
function 获取难度索引(difficulty: 游戏难度): number {
    return 难度等级顺序.indexOf(difficulty);
}

/**
 * 评估玩家表现并返回调整建议
 */
export function 评估玩家表现(
    stats: 游戏统计,
    当前难度: 游戏难度,
    阈值: 难度评估阈值 = 默认难度评估阈值
): 难度评估结果 {
    const 当前评级 = 计算综合评级(stats);
    const 胜率 = 计算战斗胜率(stats);
    const 任务完成率 = 计算任务完成率(stats);
    const 越级成功率 = 计算越级成功率(stats);
    
    const 当前索引 = 获取难度索引(当前难度);
    const 回合差 = stats.总回合数 - stats.上次调整后回合数;

    // 检查冷却期
    if (回合差 < 阈值.冷却回合数) {
        return {
            是否调整: false,
            调整方向: 'none',
            目标难度: null,
            原因: `冷却中（已过 ${回合差}/${阈值.冷却回合数} 回合）`,
            当前评级,
            评级说明: 获取评级说明(当前评级)
        };
    }

    // 检查降难度条件
    if (
        胜率 < 阈值.降难度.胜率低于 ||
        stats.死亡次数 > 阈值.降难度.死亡次数超过 ||
        stats.连续失败次数 > 阈值.降难度.连续失败超过
    ) {
        // 可以降难度
        const 降级目标 = Math.max(0, 当前索引 - 阈值.升降幅度);
        const 目标难度 = 难度等级顺序[降级目标];
        
        let 原因 = '玩家表现不佳：';
        if (胜率 < 阈值.降难度.胜率低于) 原因 += `胜率偏低(${Math.round(胜率 * 100)}%) `;
        if (stats.死亡次数 > 阈值.降难度.死亡次数超过) 原因 += `死亡过多(${stats.死亡次数}次) `;
        if (stats.连续失败次数 > 阈值.降难度.连续失败超过) 原因 += `连续失败(${stats.连续失败次数}次) `;

        return {
            是否调整: true,
            调整方向: 'down',
            目标难度,
            原因: 原因.trim(),
            当前评级,
            评级说明: 获取评级说明(当前评级)
        };
    }

    // 检查升难度条件
    if (
        胜率 > 阈值.升难度.胜率高于 &&
        任务完成率 > 阈值.升难度.任务完成率高于 &&
        越级成功率 > 阈值.升难度.越级成功率高
    ) {
        // 可以升难度
        const 升级目标 = Math.min(难度等级顺序.length - 1, 当前索引 + 阈值.升降幅度);
        const 目标难度 = 难度等级顺序[升级目标];
        
        const 原因 = `玩家表现出色：胜率高(${Math.round(胜率 * 100)}%)、任务完成率高(${Math.round(任务完成率 * 100)}%)、越级成功率高(${Math.round(越级成功率 * 100)}%)`;

        return {
            是否调整: true,
            调整方向: 'up',
            目标难度,
            原因,
            当前评级,
            评级说明: 获取评级说明(当前评级)
        };
    }

    // 无需调整
    return {
        是否调整: false,
        调整方向: 'none',
        目标难度: null,
        原因: '玩家表现正常',
        当前评级,
        评级说明: 获取评级说明(当前评级)
    };
}

/**
 * 获取评级说明
 */
function 获取评级说明(评级: number): string {
    if (评级 <= 20) return '新手试炼';
    if (评级 <= 40) return '初入江湖';
    if (评级 <= 60) return '小有所成';
    if (评级 <= 80) return '江湖高手';
    return '一代宗师';
}

/**
 * 创建难度调整记录
 */
export function 创建难度调整记录(
    原难度: 游戏难度,
    新难度: 游戏难度,
    原因: string,
    stats: 游戏统计
): 难度调整记录 {
    return {
        时间: Date.now(),
        原难度,
        新难度,
        原因,
        玩家表现: {
            胜率: 计算战斗胜率(stats),
            死亡次数: stats.死亡次数,
            任务完成率: 计算任务完成率(stats)
        }
    };
}

/**
 * 更新游戏统计 - 战斗结算后调用
 */
export function 更新战斗统计(
    stats: 游戏统计,
    结果: '胜利' | '失败' | '死亡',
    是否跨境: boolean = false
): 游戏统计 {
    const updated = { ...stats };
    updated.总回合数 += 1;
    updated.战斗次数 += 1;

    if (结果 === '胜利') {
        updated.胜利次数 += 1;
        updated.连续胜利次数 += 1;
        updated.连续失败次数 = 0;
        if (是否跨境) {
            updated.跨境挑战次数 += 1;
            updated.跨境成功次数 += 1;
        }
    } else if (结果 === '失败') {
        updated.失败次数 += 1;
        updated.连续失败次数 += 1;
        updated.连续胜利次数 = 0;
        if (是否跨境) {
            updated.跨境挑战次数 += 1;
        }
    } else if (结果 === '死亡') {
        updated.死亡次数 += 1;
        updated.连续失败次数 += 1;
        updated.连续胜利次数 = 0;
        if (是否跨境) {
            updated.跨境挑战次数 += 1;
        }
    }

    return updated;
}

/**
 * 更新游戏统计 - 任务结算后调用
 */
export function 更新任务统计(
    stats: 游戏统计,
    结果: '完成' | '失败'
): 游戏统计 {
    const updated = { ...stats };
    updated.总回合数 += 1;

    if (结果 === '完成') {
        updated.任务完成次数 += 1;
    } else {
        updated.任务失败次数 += 1;
    }

    return updated;
}

/**
 * 更新游戏统计 - 濒死时调用
 */
export function 更新濒死统计(stats: 游戏统计): 游戏统计 {
    return {
        ...stats,
        濒死次数: stats.濒死次数 + 1
    };
}

/**
 * 执行难度调整
 */
export function 执行难度调整(
    stats: 游戏统计,
    当前难度: 游戏难度,
    阈值: 难度评估阈值 = 默认难度评估阈值
): {
    updatedStats: 游戏统计;
    调整结果: 难度评估结果;
} {
    const 评估结果 = 评估玩家表现(stats, 当前难度, 阈值);

    if (!评估结果.是否调整 || !评估结果.目标难度) {
        return { updatedStats: stats, 调整结果: 评估结果 };
    }

    // 创建调整记录
    const 记录 = 创建难度调整记录(
        当前难度,
        评估结果.目标难度,
        评估结果.原因,
        stats
    );

    // 更新统计
    const updatedStats: 游戏统计 = {
        ...stats,
        难度调整历史: [...stats.难度调整历史, 记录],
        上次调整后回合数: stats.总回合数
    };

    return { updatedStats, 调整结果: 评估结果 };
}

/**
 * 重置游戏统计（用于新游戏开始）
 */
export function 重置游戏统计(): 游戏统计 {
    return 默认游戏统计();
}
