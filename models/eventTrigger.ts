/**
 * eventTrigger.ts
 * 游戏事件触发器类型定义
 */

/**
 * 触发条件类型
 */
export type 触发条件 =
    | { kind: '回合偏移'; 偏移量: number }
    | { kind: '回合绝对'; 目标回合: number }
    | { kind: '条件表达式'; 表达式: string };

/**
 * 事件状态
 */
export type 事件状态 = '待触发' | '已触发' | '已过期' | '已取消';

/**
 * 游戏事件结构
 */
export interface 游戏事件 {
    id: string;
    类型: '预约' | '条件' | '定时';
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
