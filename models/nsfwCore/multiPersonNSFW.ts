/**
 * 多人 NSFW 玩法 — 类型定义
 * 双修大会、嫉妒之夜、和谐之夜、争宠事件、晋升仪式
 */

import type { 欲望阶段 } from '../campusNSFW';
import type { NSFW场景类型 } from '../../models/system';

// ==================== 双修大会 ====================

export type 双修参与人数 = 2 | 3 | 4 | 5;

export interface 双修大会成员摘要 {
  npcId: string;
  姓名: string;
  位分: string;
  位分等级: number;
  亲密度等级: number;
  对其他人和谐度: number;  // 0-100
}

export interface 双修大会参数 {
  参与成员: 双修大会成员摘要[];
  参与人数: 双修参与人数;
  平均和谐度: number;
  总精力消耗: number;
}

export interface 双修大会结果 {
  成功: boolean;
  风险触发: boolean;
  属性奖励: { 属性类型: string; 数值: number }[];
  专属组合: string | null;
  和谐度变化: number;
  嫉妒变化: Record<string, number>;  // npcId -> 变化值
  描述: string;
  叙事提示词: string;
}

// ==================== 嫉妒之夜 ====================

export type 安抚类型 = '温柔安抚' | '深情承诺' | '强势占有' | '暂不回应';

export interface 嫉妒之夜成员摘要 {
  npcId: string;
  姓名: string;
  嫉妒值: number;
  信任度: number;
  亲密度等级: number;
  欲望阶段: 欲望阶段;
}

export interface 嫉妒之夜参数 {
  成员: 嫉妒之夜成员摘要;
  嫉妒原因: string;
}

export interface 嫉妒之夜安抚选项 {
  类型: 安抚类型;
  名称: string;
  描述: string;
  精力消耗: number;
  道具消耗?: string;
  成功率: number;
  成功效果: { 嫉妒变化: number; 信任变化: number; 亲密度变化: number; 其他成员嫉妒变化?: number };
  失败效果: { 嫉妒变化: number; 信任变化: number; 触发后续事件?: string };
}

export interface 嫉妒之夜结果 {
  安抚类型: 安抚类型;
  是否成功: boolean;
  嫉妒变化: number;
  信任变化: number;
  亲密度变化: number;
  其他成员嫉妒变化: Record<string, number>;
  触发后续事件: string | null;
  描述: string;
  叙事提示词: string;
}

// ==================== 和谐之夜 ====================

export type 和谐之夜活动类型 = '品茶夜话' | '温泉共浴' | '集体双修' | '赏月谈心';

export interface 和谐之夜成员摘要 {
  npcId: string;
  姓名: string;
  亲密度等级: number;
  信任度: number;
}

export interface 和谐之夜参数 {
  参与成员: 和谐之夜成员摘要[];
  活动类型: 和谐之夜活动类型;
  当前和谐度: number;
  精力消耗: number;
}

export interface 和谐之夜结果 {
  和谐度变化: number;
  每人亲密度变化: number;
  每人信任变化: number;
  双修收益倍率: number;
  解锁内容: string | null;
  可能触发事件: string | null;
  描述: string;
  叙事提示词: string;
}

// ==================== 争宠事件 ====================

export interface 争宠事件成员摘要 {
  npcId: string;
  姓名: string;
  亲密度等级: number;
  嫉妒值: number;
  信任度: number;
}

export interface 争宠事件参数 {
  邀约成员: 争宠事件成员摘要[];
  可用行动点: number;
}

export type 争宠事件选择 =
  | { 类型: '选择成员'; 目标NpcId: string }
  | { 类型: '全部拒绝' }
  | { 类型: '说服一起' };

export interface 争宠事件结果 {
  选择: 争宠事件选择;
  是否成功: boolean;
  亲密度变化: Record<string, number>;
  嫉妒变化: Record<string, number>;
  和谐度变化: number;
  描述: string;
}

// ==================== 晋升仪式 ====================

export type 仪式规模 = '简朴仪式' | '隆重仪式' | '私密独处';

export interface 晋升仪式参数 {
  npcId: string;
  姓名: string;
  原排位: string;
  新排位: string;
  仪式规模: 仪式规模;
  亲密代币消耗: number;
  精力消耗: number;
}

export interface 晋升仪式结果 {
  信任变化: number;
  亲密度变化: number;
  和谐度变化: number;
  其他成员嫉妒变化: number;
  获得亲密代币: number;
  解锁内容: string | null;
  描述: string;
  叙事提示词: string;
}

// ==================== 多人 NSFW 场景生成 ====================

export type 多人NSFW场景类型 = '双修大会' | '嫉妒之夜' | '和谐之夜' | '晋升仪式' | '争宠之夜';

export interface 多人NSFW场景成员摘要 {
  姓名: string;
  位分: string;
  亲密度等级: number;
  嫉妒值: number;
  和谐度: number;
  欲望阶段: 欲望阶段;
  人格特征: string;
}

export interface 多人NSFW场景参数 {
  场景类型: 多人NSFW场景类型;
  参与成员: 多人NSFW场景成员摘要[];
  当前互动成员: string;  // 当前叙事焦点成员
  是否多人场景: boolean;
  成员间关系摘要: string;
  平均和谐度: number;
  内容强度: NSFW场景类型;
  时代ID: string;
}

// ==================== 后宫专属道具 ====================

export interface 后宫道具效果 {
  目标和谐度变化?: number;
  目标嫉妒变化?: number;
  全员和谐度变化?: number;
  全员亲密度变化?: number;
  全员信任变化?: number;
  buff?: string;
  持续回合?: number;
  消耗行动点?: number;
  目标人数?: number;
  永久?: boolean;
  解锁?: string;
  需目标嫉妒?: number;
  需双方嫉妒?: number;
}

// ==================== 后宫 Buff ====================

export interface 后宫Buff {
  id: string;
  名称: string;
  描述: string;
  持续回合: number | 'permanent';
  效果: {
    双修收益倍率?: number;
    和谐度锁定?: boolean;
    独处亲密度加成?: number;  // 百分比, 如 50 = +50%
    行动点上限变化?: number;
    亲密代币获取倍率?: number;
    嫉妒增长速度倍率?: number;  // <1 减缓, >1 加速
  };
}

// ==================== 后宫系统状态 ====================

export interface 后宫成员记录 {
  npcId: string;
  姓名: string;
  位分: string;
  位分等级: number;
  亲密度等级: number;
  嫉妒值: number;       // 0-100
  和谐度: number;       // 0-100, 对其他成员的平均和谐度
  信任度: number;       // 0-100
  贡献度: number;       // 独处次数累计
  互动历史: string[];
}

export interface 成员配对关系 {
  npcIdA: string;
  npcIdB: string;
  关系类型: '陌生' | '友善' | '竞争' | '嫉妒' | '和谐' | '同盟' | '敌对' | '姐妹';
  和谐度: number;       // 0-100
  紧张度: number;       // 0-100
}

export interface 后宫事件记录 {
  类型: 多人NSFW场景类型;
  描述: string;
  时间: string;  // ISO
  参与成员: string[];  // npcId 列表
}

export type 后宫等级类型 = '新建立' | '发展中' | '稳定' | '繁荣' | '鼎盛';

export interface 后宫系统状态 {
  成员列表: 后宫成员记录[];
  配对关系: 成员配对关系[];
  后宫等级: 后宫等级类型;
  后宫称号: string;
  和谐度: number;           // 0-100, 全局后宫和谐水平
  活跃冲突: string[];        // 当前未解决的冲突描述
  事件历史: 后宫事件记录[];
  后宫资金: number;          // 后宫专属资源池
  行动点: number;            // 当前可用行动点
  行动点上限: number;
  后宫Buff列表: 后宫Buff[];
}

// ==================== 常量定义 ====================

/** 双修大会人数门槛 */
export const 双修大会门槛: Record<双修参与人数, { 最低和谐度: number; 最低后宫等级: 后宫等级类型 }> = {
  2: { 最低和谐度: 50, 最低后宫等级: '新建立' },
  3: { 最低和谐度: 55, 最低后宫等级: '稳定' },
  4: { 最低和谐度: 65, 最低后宫等级: '繁荣' },
  5: { 最低和谐度: 75, 最低后宫等级: '鼎盛' },
};

/** 双修大会精力消耗 */
export const 双修大会精力消耗: Record<双修参与人数, number> = {
  2: 25,
  3: 45,
  4: 65,
  5: 85,
};

/** 和谐之夜活动配置 */
export const 和谐之夜活动配置: Record<和谐之夜活动类型, {
  精力消耗: number;
  NSFW档位: NSFW场景类型;
  和谐度变化: number;
  每人亲密度变化: number;
  每人信任变化: number;
  解锁内容: string | null;
  可能触发事件: string | null;
  双修收益倍率: number;
}> = {
  '品茶夜话': {
    精力消耗: 10,
    NSFW档位: '点到为止',
    和谐度变化: 5,
    每人亲密度变化: 1,
    每人信任变化: 2,
    解锁内容: null,
    可能触发事件: '姐妹谈心羁绊事件',
    双修收益倍率: 1.0,
  },
  '温泉共浴': {
    精力消耗: 25,
    NSFW档位: '适度展开',
    和谐度变化: 10,
    每人亲密度变化: 2,
    每人信任变化: 3,
    解锁内容: '温泉专属多人场景',
    可能触发事件: null,
    双修收益倍率: 1.0,
  },
  '集体双修': {
    精力消耗: 40,
    NSFW档位: '完全展开',
    和谐度变化: 15,
    每人亲密度变化: 3,
    每人信任变化: 5,
    解锁内容: '和谐同心被动',
    可能触发事件: null,
    双修收益倍率: 1.5,
  },
  '赏月谈心': {
    精力消耗: 5,
    NSFW档位: '无',
    和谐度变化: 8,
    每人亲密度变化: 0,
    每人信任变化: 3,
    解锁内容: null,
    可能触发事件: '成员背景故事解锁',
    双修收益倍率: 1.0,
  },
};

/** 嫉妒之夜安抚选项配置 */
export const 嫉妒之夜安抚选项配置: Record<Exclude<安抚类型, '暂不回应'>, {
  名称: string;
  描述: string;
  精力消耗: number;
  道具消耗?: string;
  成功效果: { 嫉妒变化: number; 信任变化: number; 亲密度变化: number; 其他成员嫉妒变化?: number };
  失败效果: { 嫉妒变化: number; 信任变化: number; 触发后续事件?: string };
}> = {
  '温柔安抚': {
    名称: '温柔安抚',
    描述: '耐心倾听她的委屈，温柔拥抱',
    精力消耗: 15,
    成功效果: { 嫉妒变化: -35, 信任变化: 10, 亲密度变化: 3 },
    失败效果: { 嫉妒变化: 15, 信任变化: -5, 触发后续事件: '冷战' },
  },
  '深情承诺': {
    名称: '深情承诺',
    描述: '送上真诚礼物，表达对她的重视',
    精力消耗: 8,
    道具消耗: '真诚礼物',
    成功效果: { 嫉妒变化: -25, 信任变化: 20, 亲密度变化: 2 },
    失败效果: { 嫉妒变化: 10, 信任变化: -3 },
  },
  '强势占有': {
    名称: '强势占有',
    描述: '用行动证明她在你心中的位置',
    精力消耗: 20,
    成功效果: { 嫉妒变化: -40, 信任变化: 5, 亲密度变化: 5, 其他成员嫉妒变化: 10 },
    失败效果: { 嫉妒变化: 20, 信任变化: -10, 触发后续事件: '冷战' },
  },
};

/** 仪式规模配置 */
export const 仪式规模配置: Record<仪式规模, {
  亲密代币消耗: number;
  精力消耗: number;
  NSFW档位: NSFW场景类型;
  信任变化: number;
  亲密度变化: number;
  和谐度变化: number;
  其他成员嫉妒变化: number;
  获得亲密代币: number;
  解锁内容: string | null;
}> = {
  '简朴仪式': {
    亲密代币消耗: 5,
    精力消耗: 5,
    NSFW档位: '点到为止',
    信任变化: 10,
    亲密度变化: 2,
    和谐度变化: 0,
    其他成员嫉妒变化: 0,
    获得亲密代币: 0,
    解锁内容: null,
  },
  '隆重仪式': {
    亲密代币消耗: 20,
    精力消耗: 10,
    NSFW档位: '适度展开',
    信任变化: 25,
    亲密度变化: 3,
    和谐度变化: 10,
    其他成员嫉妒变化: 5,
    获得亲密代币: 0,
    解锁内容: null,
  },
  '私密独处': {
    亲密代币消耗: 8,
    精力消耗: 8,
    NSFW档位: '完全展开',
    信任变化: 15,
    亲密度变化: 5,
    和谐度变化: 0,
    其他成员嫉妒变化: 0,
    获得亲密代币: 5,
    解锁内容: '专属风情场景',
  },
};

/** 专属组合效果定义 */
export const 专属组合效果: Record<string, { 成员组合: string[]; 描述: string; 属性加成: { 属性类型: string; 数值: number }[]; 战斗Buff: string | null }> = {
  '冰玉同心': {
    成员组合: [],  // 运行时通过 npcId 匹配
    描述: '小龙女与王语嫣的特殊默契，冰玉般的同心之力',
    属性加成: [{ 属性类型: '根骨', 数值: 2 }],
    战斗Buff: '冰玉护体: 防御力 +20%',
  },
  '智勇双全': {
    成员组合: [],
    描述: '赵敏与黄蓉的智慧与勇气结合',
    属性加成: [{ 属性类型: '悟性', 数值: 2 }, { 属性类型: '力量', 数值: 2 }],
    战斗Buff: '智谋百出: 暴击率 +15%',
  },
  '三才阵': {
    成员组合: [],
    描述: '三人组成的天地人三才之势',
    属性加成: [{ 属性类型: '体质', 数值: 3 }],
    战斗Buff: '后宫战法: 三人联合作战',
  },
  '四象阵': {
    成员组合: [],
    描述: '四人组成的四象方位',
    属性加成: [
      { 属性类型: '体质', 数值: 4 },
      { 属性类型: '力量', 数值: 1 },
      { 属性类型: '敏捷', 数值: 1 },
      { 属性类型: '悟性', 数值: 1 },
      { 属性类型: '根骨', 数值: 1 },
      { 属性类型: '福源', 数值: 1 },
    ],
    战斗Buff: '四象归一: 全属性 +10%',
  },
  '五行圆满': {
    成员组合: [],
    描述: '五人组成的五行圆满之势',
    属性加成: [
      { 属性类型: '力量', 数值: 5 },
      { 属性类型: '敏捷', 数值: 5 },
      { 属性类型: '体质', 数值: 5 },
      { 属性类型: '根骨', 数值: 5 },
      { 属性类型: '悟性', 数值: 5 },
      { 属性类型: '福源', 数值: 5 },
    ],
    战斗Buff: '万花丛中: 全属性 +25%',
  },
};
