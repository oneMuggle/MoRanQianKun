// 房产 SLG 经营系统 - 核心类型定义

import type { 物品品质 } from '../item';

// ─── 设施类别 ───

export type 设施类别 = '寝具' | '卫浴' | '餐饮' | '休闲' | '修炼' | '安全' | '装饰' | '功能';

// ─── 房产类型 ───

export type 房产类型 = '民居' | '客栈' | '民宿' | '庄园' | '商铺' | '青楼' | '武馆' | '医馆';

// ─── 房间类型 ───

export type 房间类型 = '客房' | '卧室' | '功能房' | '公共区域' | '储藏室';

// ─── 房间状态 ───

export type 房间状态 = '空闲' | '使用中' | '维修中' | '装修中';

// ─── 事件类型 ───

export type 经营事件类型 = '纠纷' | '损坏' | '访客' | '好评' | '差评' | '特殊事件';

// ─── 变更类型 ───

export type 房产变更类型 = '扩建' | '拆除' | '升级' | '装修' | '建造' | '房客入住' | '房客退租';

// ─── 房客类型 ───

export type 房客类型 = '江湖客' | '商人' | '文人' | '侠客' | '隐士' | '官差' | '游医' | '艺伎';

// ─── 房客关系状态 ───

export type 房客关系状态 = '良好' | '一般' | '不满' | '愤怒' | '退租中';

// ─── 设施预设结构 ───

export interface 设施预设结构 {
    设施ID: string;
    名称: string;
    类别: 设施类别;
    描述: string;
    基础价格: number;
    建造时间: string;       // 'DD:HH:MM' 格式，表示建造所需游戏时间
    吸引力加成: number;
    舒适度加成: number;
    租金加成: number;
    维护费用: number;
    耐久损耗: number;       // 每回合耐久损耗
    可升级: boolean;
    升级目标ID?: string;
    特殊效果?: string[];
    时代: string[];         // ['古代', '现代', '未来']
}

// ─── 房客类型预设 ───

export interface 房客类型预设 {
    类型: 房客类型;
    基础租金倍率: number;
    偏好设施: string[];     // 设施ID列表
    厌恶设施: string[];
    性格标签池: string[];
    特殊需求池: string[];
    满意度衰减率: number;   // 每回合衰减
    退租阈值: number;       // 满意度低于此值可能退租
}

// ─── 房间设施结构 ───

export interface 房间设施结构 {
    id: string;
    设施ID: string;         // 引用预设
    设施名称: string;
    设施类别: 设施类别;
    设施等级: number;       // 1-5
    品质: 物品品质;
    建造完成时间: string;
    耐久度: number;         // 0-100
    最大耐久度: number;
}

// ─── 全局设施结构 ───

export interface 全局设施结构 {
    id: string;
    设施ID: string;         // 引用预设
    设施名称: string;
    设施类别: 设施类别;
    设施等级: number;       // 1-5
    品质: 物品品质;
    建造完成时间: string;
    耐久度: number;         // 0-100
    最大耐久度: number;
    位置引用: string | null; // null 表示全局设施，否则为房间ID
}

// ─── 房间结构 ───

export interface 房间结构 {
    id: string;
    房间名称: string;
    房间类型: 房间类型;
    房间等级: number;       // 1-5
    房间品质: 物品品质;
    面积: number;
    已建设施: 房间设施结构[];
    当前房客Id: string | null;
    房间状态: 房间状态;
}

// ─── 房客结构 ───

export interface 房客结构 {
    id: string;
    NPC姓名: string;
    NPC引用ID: string;
    入住房间ID: string;
    入住时间: string;
    租约到期时间: string;
    租金: number;           // 每回合租金
    满意度: number;         // 0-100
    房客类型: 房客类型;
    性格标签: string[];
    特殊需求: string[];
    关系状态: 房客关系状态;
}

// ─── 经营事件影响 ───

export interface 经营事件影响 {
    资金变化?: number;
    名誉变化?: number;
    满意度变化?: number;
}

// ─── 经营事件结构 ───

export interface 经营事件结构 {
    id: string;
    事件类型: 经营事件类型;
    事件描述: string;
    触发时间: string;
    影响: 经营事件影响;
    已处理: boolean;
}

// ─── 经营待处理事件 ───

export interface 经营待处理事件 {
    id: string;
    事件类型: 经营事件类型;
    事件描述: string;
    触发时间: string;
    选项: Array<{ 标签: string; 影响: 经营事件影响 }>;
}

// ─── 经营状态结构 ───

export interface 经营状态结构 {
    总资金: number;
    总收入: number;
    总支出: number;
    当前回合收入: number;
    名誉值: number;
    吸引力: number;
    舒适度: number;
    安全性: number;
    事件日志: 经营事件结构[];
    待处理事件: 经营待处理事件[];
    每日开销: number;
}

// ─── 房产变更记录 ───

export interface 房产变更记录 {
    变更类型: 房产变更类型;
    变更描述: string;
    变更时间: string;
    消耗资源: { 资金?: number; 材料?: Record<string, number> };
}

// ─── 房产数据结构 ───

export interface 房产数据结构 {
    房产名称: string;
    房产类型: 房产类型;
    房产等级: number;           // 1-10
    当前经验: number;
    升级所需经验: number;
    房产位置: string;
    房间列表: 房间结构[];
    设施列表: 全局设施结构[];
    房客列表: 房客结构[];
    经营状态: 经营状态结构;
    扩建历史: 房产变更记录[];
}

// ─── 建造中设施 ───

export interface 建造中设施 {
    id: string;
    设施ID: string;
    设施名称: string;
    设施类别: 设施类别;
    目标位置: string | null;    // null=全局, 否则=房间ID
    开始时间: string;
    预计完成时间: string;
    品质: 物品品质;
}

// ─── 房产扩展状态（挂载到游戏主状态） ───

export interface 房产系统状态 {
    已解锁: boolean;            // 是否已解锁房产系统
    当前房产: 房产数据结构 | null;
    建造队列: 建造中设施[];
}

// ─── 工具函数类型 ───

export interface 经营计算结果 {
    吸引力: number;
    舒适度: number;
    安全性: number;
    回合收入: number;
    回合支出: number;
    维护费用: number;
}

export interface 房客满意度结果 {
    房客Id: string;
    当前满意度: number;
    变化值: number;
    原因: string[];
}
