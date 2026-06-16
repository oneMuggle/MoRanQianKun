/**
 * 统一后果系统 — 数据结构
 * 所有NSFW行为的后果汇总、传播、衰减
 */

// ==================== 后果类型 ====================

export type 后果类型 =
  | '短期情绪'
  | '中期关系'
  | '长期人格'
  | '声誉影响'
  | '行为模式';

export type 后果严重度 = '轻微' | '中等' | '严重' | '极端';

export interface 后果条目 {
  id: string;
  类型: 后果类型;
  严重度: 后果严重度;
  描述: string;
  来源事件: string;
  持续时间: number;  // 持续回合数
  已持续回合: number;
  影响值: number;    // -100 到 +100
  创建时间: string;
  过期时间: string;
  是否激活: boolean;
}

export interface 后果系统状态 {
  活跃后果: 后果条目[];
  历史后果: 后果条目[];
  总后果数: number;
  最后更新时间: string;
}

// ==================== 纯函数 ====================

/**
 * 添加后果
 */
export function 添加后果(
  状态: 后果系统状态,
  新后果: Omit<后果条目, 'id' | '已持续回合' | '创建时间' | '过期时间' | '是否激活'>
): 后果系统状态 {
  const 现在 = new Date();
  const 后果: 后果条目 = {
    ...新后果,
    id: `consequence_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    已持续回合: 0,
    创建时间: 现在.toISOString(),
    过期时间: new Date(现在.getTime() + 新后果.持续时间 * 3600000).toISOString(),
    是否激活: true,
  };

  return {
    ...状态,
    活跃后果: [...状态.活跃后果, 后果],
    总后果数: 状态.总后果数 + 1,
    最后更新时间: 现在.toISOString(),
  };
}

/**
 * 后果衰减/过期处理
 */
export function 计算后果衰减(状态: 后果系统状态): 后果系统状态 {
  const 新活跃后果: 后果条目[] = [];
  const 新历史后果: 后果条目[] = [...状态.历史后果];

  for (const 后果 of 状态.活跃后果) {
    const 新回合 = 后果.已持续回合 + 1;

    if (新回合 >= 后果.持续时间) {
      新历史后果.push({ ...后果, 是否激活: false });
    } else {
      const 衰减比例 = 1 - (新回合 / 后果.持续时间);
      const 新影响值 = 后果.影响值 * 衰减比例;

      新活跃后果.push({
        ...后果,
        已持续回合: 新回合,
        影响值: Math.round(新影响值),
      });
    }
  }

  return {
    ...状态,
    活跃后果: 新活跃后果,
    历史后果: 新历史后果,
    最后更新时间: new Date().toISOString(),
  };
}

/**
 * 获取指定类型的综合影响
 */
export function 获取综合影响(
  状态: 后果系统状态,
  类型?: 后果类型
): number {
  const 过滤后果 = 类型
    ? 状态.活跃后果.filter(c => c.类型 === 类型)
    : 状态.活跃后果;

  if (过滤后果.length === 0) return 0;

  const 严重度权重: Record<后果严重度, number> = {
    '轻微': 0.5,
    '中等': 1.0,
    '严重': 1.5,
    '极端': 2.0,
  };

  let 总权重 = 0;
  let 加权影响和 = 0;

  for (const 后果 of 过滤后果) {
    const 权重 = 严重度权重[后果.严重度];
    总权重 += 权重;
    加权影响和 += 后果.影响值 * 权重;
  }

  return 总权重 > 0 ? Math.round(加权影响和 / 总权重) : 0;
}

/**
 * 获取后果摘要（用于AI提示词注入）
 */
export function 获取后果摘要(状态: 后果系统状态): string {
  if (状态.活跃后果.length === 0) return '';

  const 活跃摘要 = 状态.活跃后果
    .filter(c => Math.abs(c.影响值) > 10)
    .slice(0, 5)
    .map(c => `[后果] ${c.描述}（影响:${c.影响值 > 0 ? '+' : ''}${c.影响值}，剩余${c.持续时间 - c.已持续回合}回合）`);

  return 活跃摘要.join('\n');
}

export function 创建初始后果系统(): 后果系统状态 {
  return {
    活跃后果: [],
    历史后果: [],
    总后果数: 0,
    最后更新时间: new Date().toISOString(),
  };
}
