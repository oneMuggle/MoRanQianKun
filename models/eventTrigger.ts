/**
 * eventTrigger.ts
 * 游戏事件触发器类型定义 V2
 *
 * V1: 基础触发（回合偏移、绝对、表达式）
 * V2: 增强条件求值、事件链、周期事件、事件分组
 */

/**
 * 触发条件类型 (V1)
 */
export type 触发条件 =
    | { kind: '回合偏移'; 偏移量: number }
    | { kind: '回合绝对'; 目标回合: number }
    | { kind: '条件表达式'; 表达式: string };

// ==================== V2 增强条件 ====================

/**
 * 增强条件求值器 (V2)
 */
export type 增强条件 =
    | { kind: '属性比较'; 属性路径: string; 操作符: '>' | '<' | '>=' | '<=' | '==' | '!='; 值: number | string }
    | { kind: '状态检查'; 检查项: string; 期望值: unknown }
    | { kind: '概率'; 概率: number }
    | { kind: '且'; 条件列表: 增强条件[] }
    | { kind: '或'; 条件列表: 增强条件[] }
    | { kind: '非'; 条件: 增强条件 };

/**
 * 事件链配置 (V2)
 */
export interface 事件链 {
    源事件ID: string;
    目标事件ID: string;
    触发后延迟: number; // 回合延迟，默认0
}

/**
 * 周期性配置 (V2)
 */
export interface 周期性配置 {
    间隔回合: number;
    终止回合?: number;
    最大触发次数?: number;
}

/**
 * 事件分组 (V2)
 */
export interface 事件分组 {
    id: string;
    名称: string;
    描述?: string;
    事件ID列表: string[];
    互斥: boolean; // 同组事件是否互斥
}

/**
 * 事件状态
 */
export type 事件状态 = '待触发' | '已触发' | '已过期' | '已取消';

/**
 * 游戏事件结构
 */
export interface 游戏事件 {
    id: string;
    类型: '预约' | '条件' | '定时' | '周期' | '链式';
    名称: string;
    描述?: string;
    触发条件: 触发条件;
    事件数据: Record<string, unknown>;
    状态: 事件状态;
    创建回合: number;
    触发回合?: number;
    优先级?: number;
    标签?: string[];
    过期回合?: number;
    // V2 字段
    周期性配置?: 周期性配置;
    事件链列表?: 事件链[];
    增强条件?: 增强条件;
    已触发次数?: number;
    事件分组ID?: string;
}

/**
 * 事件更新结果
 */
export interface 事件更新 {
    事件ID: string;
    新状态: 事件状态;
    更新字段?: Partial<游戏事件>;
}

/**
 * 解析后的事件更新信号
 */
export interface 解析事件更新信号 {
    事件ID: string;
    新状态: string;
    额外数据?: Record<string, unknown>;
}
