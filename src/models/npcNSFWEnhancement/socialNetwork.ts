/**
 * NPC 社交网络系统 — 数据结构
 * NPC间关系、流言传播、声誉管理
 */

// ==================== 社交网络 ====================

export type 关系类型 = '友谊' | '竞争' | '敌对' | '暧昧' | '主从' | '师徒' | '血缘' | '同事' | '陌生人';

export interface NPC关系 {
  目标NPCID: string;
  目标姓名: string;
  关系类型: 关系类型;
  关系强度: number;  // 0-100
  信任度: number;    // 0-100，影响秘密分享
  共享秘密: boolean;
  最后互动时间: string;
  关系日志: 关系变化日志[];
}

export interface 关系变化日志 {
  时间: string;
  变化类型: '提升' | '降低' | '类型变化' | '事件触发';
  旧强度: number;
  新强度: number;
  触发事件: string;
}

// ==================== 声誉系统 ====================

export type 声誉圈子 = '学校' | '职场' | '街坊' | '江湖' | '暗网' | '朋友圈';

export interface 声誉记录 {
  圈子: 声誉圈子;
  声誉值: number;      // -100 到 +100
  标签: string[];      // 如"清纯"、"放荡"、"神秘"等
  最后更新时间: string;
}

// ==================== 流言系统 ====================

export type 流言严重度 = '轻微' | '中等' | '严重' | '毁灭性';

export interface 流言 {
  id: string;
  内容: string;
  创建时间: string;
  传播范围: string[];  // 知道这个流言的NPC ID列表
  传播速度: number;    // 每回合传播概率 0-1
  严重度: 流言严重度;
  影响值: number;      // 对声誉的影响 -50 到 +50
  真实度: number;      // 0-1，流言的真实程度
  来源NPC?: string;    // 流言来源
  目标NPC: string;     // 流言针对的NPC
  已传播回合数: number;
  最大传播回合: number;
}

export interface 社交网络状态 {
  关系列表: NPC关系[];
  声誉记录: 声誉记录[];
  流言列表: 流言[];
  最后更新时间: string;
}

// ==================== 纯函数 ====================

/**
 * 计算关系变化
 */
export function 计算关系变化(
  当前关系: NPC关系,
  变化量: number,
  触发事件: string
): NPC关系 {
  const 新强度 = clamp(当前关系.关系强度 + 变化量, 0, 100);

  let 新关系类型 = 当前关系.关系类型;
  if (新强度 > 80 && 当前关系.关系类型 === '友谊') {
    新关系类型 = '暧昧';
  } else if (新强度 < 20 && 当前关系.关系类型 === '暧昧') {
    新关系类型 = '竞争';
  } else if (新强度 < 10) {
    新关系类型 = '敌对';
  }

  return {
    ...当前关系,
    关系强度: 新强度,
    关系类型: 新关系类型,
    最后互动时间: new Date().toISOString(),
    关系日志: [
      ...当前关系.关系日志,
      {
        时间: new Date().toISOString(),
        变化类型: 变化量 > 0 ? '提升' : '降低',
        旧强度: 当前关系.关系强度,
        新强度,
        触发事件,
      },
    ],
  };
}

/**
 * 流言传播判定
 */
export function 流言传播判定(流言: 流言, 在场NPC列表: string[]): { 新流言: 流言; 新传播对象: string[] } {
  const 新传播对象: string[] = [];

  for (const npcId of 在场NPC列表) {
    if (流言.传播范围.includes(npcId)) continue;

    if (Math.random() < 流言.传播速度) {
      新传播对象.push(npcId);
    }
  }

  const 新流言: 流言 = {
    ...流言,
    传播范围: [...流言.传播范围, ...新传播对象],
    已传播回合数: 流言.已传播回合数 + 1,
  };

  return { 新流言, 新传播对象 };
}

/**
 * 计算流言对声誉的影响
 */
export function 计算流言声誉影响(
  当前声誉: 声誉记录,
  新流言: 流言
): 声誉记录 {
  const 影响值 = 新流言.影响值 * 新流言.真实度;
  const 新声誉值 = clamp(当前声誉.声誉值 + 影响值, -100, 100);

  const 新标签 = [...当前声誉.标签];
  if (新流言.严重度 === '严重' || 新流言.严重度 === '毁灭性') {
    if (!新标签.includes('绯闻')) {
      新标签.push('绯闻');
    }
  }

  return {
    ...当前声誉,
    声誉值: 新声誉值,
    标签: 新标签,
    最后更新时间: new Date().toISOString(),
  };
}

export function 创建初始社交网络(预设关系?: NPC关系[]): 社交网络状态 {
  return {
    关系列表: 预设关系 ?? [],
    声誉记录: [],
    流言列表: [],
    最后更新时间: new Date().toISOString(),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
