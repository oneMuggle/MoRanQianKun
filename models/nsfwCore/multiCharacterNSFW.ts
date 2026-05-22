/**
 * NSFW 核心 — 多角色关系管理
 * 多角色关系网、嫉妒/冲突系统、关系平衡策略、多角关系成就
 */

import type { NSFW资源状态 } from './resources';
import { 获得亲密度代币, 修改声誉 } from './resources';

// ==================== 类型定义 ====================

export interface 角色关系节点 {
  角色ID: string;
  角色名称: string;
  亲密度: number;
  信任度: number;
  嫉妒值: number;
  关系状态: '陌生' | '朋友' | '暧昧' | '恋人' | '专属';
  最后互动时间: string;
}

export interface 多角关系网 {
  角色列表: 角色关系节点[];
  活跃关系: string[];
}

export interface 嫉妒冲突结果 {
  触发冲突: boolean;
  冲突角色: string[];
  冲突严重度: '轻微' | '中等' | '严重';
  描述: string;
}

export interface 平衡策略结果 {
  成功: boolean;
  资源变化: NSFW资源状态;
  关系变化: Record<string, number>;
  描述: string;
}

export type 平衡策略 = '隐瞒关系' | '公开协商' | '时间分配' | '专注一人';

// ==================== 核心函数 ====================

export function 初始化多角关系网(): 多角关系网 {
  return { 角色列表: [], 活跃关系: [] };
}

export function 添加角色关系(
  关系网: 多角关系网,
  角色: 角色关系节点
): 多角关系网 {
  const 已存在 = 关系网.角色列表.find(r => r.角色ID === 角色.角色ID);
  if (已存在) return 关系网;

  return {
    ...关系网,
    角色列表: [...关系网.角色列表, 角色],
  };
}

export function 更新角色关系(
  关系网: 多角关系网,
  角色ID: string,
  更新: Partial<Pick<角色关系节点, '亲密度' | '信任度' | '嫉妒值' | '关系状态' | '最后互动时间'>>
): 多角关系网 {
  return {
    ...关系网,
    角色列表: 关系网.角色列表.map(r =>
      r.角色ID === 角色ID ? { ...r, ...更新 } : r
    ),
  };
}

/**
 * 嫉妒值计算
 */
export function 计算嫉妒变化(
  当前角色ID: string,
  关系网: 多角关系网,
  互动亲密度变化: number
): { 其他角色嫉妒变化: Record<string, number>; 描述: string } {
  const 当前角色 = 关系网.角色列表.find(r => r.角色ID === 当前角色ID);
  if (!当前角色 || 当前角色.关系状态 === '陌生') {
    return { 其他角色嫉妒变化: {}, 描述: '' };
  }

  const 变化: Record<string, number> = {};
  const 描述列表: string[] = [];

  for (const 角色 of 关系网.角色列表) {
    if (角色.角色ID === 当前角色ID) continue;

    const 基础嫉妒 = 当前角色.亲密度 / 100;
    const 互动加成 = 互动亲密度变化 / 50;
    const 嫉妒增量 = Math.round(基础嫉妒 * 互动加成 * 10);

    if (嫉妒增量 > 0) {
      变化[角色.角色ID] = 嫉妒增量;
      描述列表.push(`${角色.角色名称} 嫉妒 +${嫉妒增量}`);
    }
  }

  return {
    其他角色嫉妒变化: 变化,
    描述: 描述列表.length > 0 ? 描述列表.join('，') : '无嫉妒变化',
  };
}

/**
 * 嫉妒冲突判定
 */
export function 嫉妒冲突判定(
  关系网: 多角关系网,
  阈值: number = 70
): 嫉妒冲突结果 {
  const 高嫉妒角色 = 关系网.角色列表.filter(r => r.嫉妒值 >= 阈值);

  if (高嫉妒角色.length < 2) {
    return { 触发冲突: false, 冲突角色: [], 冲突严重度: '轻微', 描述: '嫉妒值未达到冲突阈值' };
  }

  const 平均嫉妒 = 高嫉妒角色.reduce((sum, r) => sum + r.嫉妒值, 0) / 高嫉妒角色.length;
  const 严重度 = 平均嫉妒 >= 90 ? '严重' as const : 平均嫉妒 >= 80 ? '中等' as const : '轻微' as const;

  return {
    触发冲突: true,
    冲突角色: 高嫉妒角色.map(r => r.角色ID),
    冲突严重度: 严重度,
    描述: `${高嫉妒角色.map(r => r.角色名称).join(' 和 ')} 之间爆发冲突！`,
  };
}

/**
 * 关系平衡策略执行
 */
export function 执行平衡策略(
  策略: 平衡策略,
  关系网: 多角关系网,
  资源状态: NSFW资源状态,
  专注角色ID?: string
): 平衡策略结果 {
  const 关系变化: Record<string, number> = {};
  let 新资源 = { ...资源状态 };
  const 描述列表: string[] = [`执行策略「${策略}」`];

  switch (策略) {
    case '隐瞒关系': {
      for (const 角色 of 关系网.角色列表) {
        const 嫉妒减少 = Math.round(角色.嫉妒值 * 0.2);
        const 信任减少 = 5;
        关系变化[角色.角色ID] = -信任减少;
        描述列表.push(`${角色.角色名称} 嫉妒-${嫉妒减少}，信任-${信任减少}`);
      }
      新资源 = 修改声誉(新资源, -5, '隐瞒关系导致风评下降').新状态;
      break;
    }
    case '公开协商': {
      for (const 角色 of 关系网.角色列表) {
        if (角色.信任度 >= 60) {
          const 嫉妒减少 = Math.round(角色.嫉妒值 * 0.4);
          关系变化[角色.角色ID] = 0;
          描述列表.push(`${角色.角色名称} 嫉妒-${嫉妒减少}`);
        } else {
          关系变化[角色.角色ID] = -15;
          描述列表.push(`${角色.角色名称} 信任-15`);
        }
      }
      新资源 = 获得亲密度代币(新资源, 10, '公开协商奖励').新状态;
      break;
    }
    case '时间分配': {
      for (const 角色 of 关系网.角色列表) {
        const 嫉妒减少 = Math.round(角色.嫉妒值 * 0.15);
        关系变化[角色.角色ID] = -3;
        描述列表.push(`${角色.角色名称} 嫉妒-${嫉妒减少}`);
      }
      新资源 = 修改声誉(新资源, 3, '公平对待获得好评').新状态;
      break;
    }
    case '专注一人': {
      if (!专注角色ID) {
        return { 成功: false, 资源变化: 新资源, 关系变化: {}, 描述: '需要指定专注的角色' };
      }
      for (const 角色 of 关系网.角色列表) {
        if (角色.角色ID === 专注角色ID) {
          关系变化[角色.角色ID] = 15;
          描述列表.push(`${角色.角色名称} 亲密+15`);
        } else {
          关系变化[角色.角色ID] = 10;
          描述列表.push(`${角色.角色名称} 嫉妒+10`);
        }
      }
      break;
    }
  }

  return { 成功: true, 资源变化: 新资源, 关系变化, 描述: 描述列表.join('，') };
}

/**
 * 多角关系成就判定
 */
export function 多角关系成就判定(关系网: 多角关系网): { 成就: string[]; 代币奖励: number } {
  const 成就: string[] = [];
  let 代币奖励 = 0;

  const 高亲密角色 = 关系网.角色列表.filter(r => r.亲密度 >= 70);
  const 高信任角色 = 关系网.角色列表.filter(r => r.信任度 >= 70);
  const 低嫉妒角色 = 关系网.角色列表.filter(r => r.嫉妒值 <= 20);

  if (关系网.角色列表.length >= 2 && 高亲密角色.length >= 2) {
    成就.push('情场高手');
    代币奖励 += 30;
  }
  if (关系网.角色列表.length >= 3 && 低嫉妒角色.length >= 3) {
    成就.push('平衡大师');
    代币奖励 += 50;
  }
  if (高信任角色.length >= 2 && 关系网.角色列表.length >= 2) {
    成就.push('信任网络');
    代币奖励 += 40;
  }
  if (关系网.角色列表.length >= 3 && 关系网.角色列表.every(r => r.关系状态 === '恋人' || r.关系状态 === '专属')) {
    成就.push('后宫之主');
    代币奖励 += 100;
  }

  return { 成就, 代币奖励 };
}
