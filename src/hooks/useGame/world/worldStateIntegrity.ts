import type { 世界数据结构 } from '../../../models/world';

export type 世界状态问题 = {
  类型: '孤立NPC引用' | '无效地点' | '事件状态异常' | '时间悖论' | '重复实体' | '引用完整性';
  严重程度: 'error' | 'warning' | 'info';
  描述: string;
  路径?: string;
  实体?: string;
};

export type 世界状态校验结果 = {
  有效: boolean;
  问题列表: 世界状态问题[];
  修复数: number;
};

/**
 * 时间字符串转排序值（用于比较）
 * 格式: YYYY:MM:DD:HH:mm
 */
const 时间转排序值 = (raw: unknown): number | null => {
  if (!raw || typeof raw !== 'string') return null;
  const canonical = raw.trim();
  const m = canonical.match(/^(\d{1,6}):(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return ((((year * 12) + month) * 31 + day) * 24 + hour) * 60 + minute;
};

/**
 * 获取所有有效地点名称集合
 */
const 提取有效地点名称 = (world: 世界数据结构): Set<string> => {
  const names = new Set<string>();

  // 地图地点
  for (const map of world.地图 || []) {
    if (map.名称) names.add(map.名称);
    for (const building of map.内部建筑 || []) {
      if (building) names.add(building);
    }
  }

  // 独立建筑
  for (const building of world.建筑 || []) {
    if (building.名称) names.add(building.名称);
  }

  // 大地点/中地点/小地点（从归属结构）
  const addFrom归属 = (归属: { 大地点?: string; 中地点?: string; 小地点?: string } | null) => {
    if (!归属) return;
    if (归属.大地点) names.add(归属.大地点);
    if (归属.中地点) names.add(归属.中地点);
    if (归属.小地点) names.add(归属.小地点);
  };

  for (const map of world.地图 || []) {
    addFrom归属(map.归属);
  }
  for (const building of world.建筑 || []) {
    addFrom归属(building.归属);
  }

  // Note: NPC current positions are NOT included in valid locations.
  // Position validation checks against known maps/buildings only.

  return names;
};

/**
 * 获取所有NPC名称集合
 */
const 提取NPC名称集合 = (world: 世界数据结构): Set<string> => {
  const names = new Set<string>();
  for (const npc of world.活跃NPC列表 || []) {
    if (npc.姓名) names.add(npc.姓名);
  }
  return names;
};

/**
 * 校验NPC位置完整性 - 检查NPC当前位置是否有效
 */
export const 校验NPC位置完整性 = (world: 世界数据结构): 世界状态问题[] => {
  const issues: 世界状态问题[] = [];
  const validLocations = 提取有效地点名称(world);

  for (const npc of world.活跃NPC列表 || []) {
    if (npc.当前位置 && !validLocations.has(npc.当前位置)) {
      issues.push({
        类型: '无效地点',
        严重程度: 'warning',
        描述: `NPC "${npc.姓名}" 的当前位置 "${npc.当前位置}" 不是有效地点`,
        实体: npc.姓名
      });
    }
  }

  return issues;
};

/**
 * 校验事件状态一致性
 */
export const 校验事件状态一致性 = (world: 世界数据结构): 世界状态问题[] => {
  const issues: 世界状态问题[] = [];

  // 待执行事件校验
  for (const evt of world.待执行事件 || []) {
    if (!evt.计划执行时间) {
      issues.push({
        类型: '事件状态异常',
        严重程度: 'error',
        描述: `待执行事件 "${evt.事件名}" 缺少计划执行时间`,
        实体: evt.事件名
      });
    }
  }

  // 进行中事件校验
  for (const evt of world.进行中事件 || []) {
    if (!evt.开始时间) {
      issues.push({
        类型: '事件状态异常',
        严重程度: 'error',
        描述: `进行中事件 "${evt.事件名}" 缺少开始时间`,
        实体: evt.事件名
      });
    }
  }

  return issues;
};

/**
 * 校验事件时间悖论 - 检查事件时间逻辑
 */
export const 校验事件时间悖论 = (world: 世界数据结构): 世界状态问题[] => {
  const issues: 世界状态问题[] = [];

  for (const evt of world.进行中事件 || []) {
    const startSort = 时间转排序值(evt.开始时间);
    const endSort = 时间转排序值(evt.预计结束时间);
    if (startSort !== null && endSort !== null && endSort < startSort) {
      issues.push({
        类型: '时间悖论',
        严重程度: 'error',
        描述: `进行中事件 "${evt.事件名}" 的预计结束时间早于开始时间`,
        实体: evt.事件名
      });
    }
  }

  return issues;
};

/**
 * 校验孤立NPC引用 - 检查事件中的NPC引用是否在活跃NPC列表中
 */
export const 校验孤立NPC引用 = (world: 世界数据结构): 世界状态问题[] => {
  const issues: 世界状态问题[] = [];
  const npcNames = 提取NPC名称集合(world);

  const 检查引用 = (
    实体名称: string,
    关联人物: string[],
    关联势力: string[]
  ) => {
    for (const name of 关联人物 || []) {
      if (name && !npcNames.has(name)) {
        issues.push({
          类型: '孤立NPC引用',
          严重程度: 'warning',
          描述: `事件/镜头 "${实体名称}" 引用的NPC "${name}" 不在活跃NPC列表中`,
          实体: 实体名称
        });
      }
    }
  };

  // 检查待执行事件
  for (const evt of world.待执行事件 || []) {
    检查引用(evt.事件名, evt.关联人物, evt.关联势力);
  }

  // 检查进行中事件
  for (const evt of world.进行中事件 || []) {
    检查引用(evt.事件名, evt.关联人物, evt.关联势力);
  }

  // 检查已结算事件
  for (const evt of world.已结算事件 || []) {
    检查引用(evt.事件名, evt.关联人物, evt.关联势力);
  }

  // 检查世界镜头规划
  for (const shot of world.世界镜头规划 || []) {
    检查引用(shot.镜头标题, shot.关联人物, []);
  }

  // 检查江湖史册
  for (const entry of world.江湖史册 || []) {
    检查引用(entry.标题, entry.关联人物, entry.关联势力);
  }

  return issues;
};

/**
 * 校验引用完整性 - 检查事件关联的地点、分解组等是否存在
 */
export const 校验引用完整性 = (world: 世界数据结构): 世界状态问题[] => {
  const issues: 世界状态问题[] = [];
  const validLocations = 提取有效地点名称(world);

  const 检查地点引用 = (
    实体名称: string,
    关联地点: string[],
    类型: string
  ) => {
    for (const loc of 关联地点 || []) {
      if (loc && !validLocations.has(loc)) {
        issues.push({
          类型: '引用完整性',
          严重程度: 'info',
          描述: `${类型} "${实体名称}" 引用的地点 "${loc}" 不在已知地点列表中`,
          实体: 实体名称
        });
      }
    }
  };

  for (const evt of world.待执行事件 || []) {
    检查地点引用(evt.事件名, evt.关联地点, '待执行事件');
  }
  for (const evt of world.进行中事件 || []) {
    检查地点引用(evt.事件名, evt.关联地点, '进行中事件');
  }
  for (const evt of world.已结算事件 || []) {
    检查地点引用(evt.事件名, evt.关联地点, '已结算事件');
  }

  return issues;
};

/**
 * 校验世界状态完整性 - 综合检查所有问题
 */
export const 校验世界状态完整性 = (world: 世界数据结构): 世界状态校验结果 => {
  const allIssues: 世界状态问题[] = [
    ...校验NPC位置完整性(world),
    ...校验事件状态一致性(world),
    ...校验事件时间悖论(world),
    ...校验孤立NPC引用(world),
    ...校验引用完整性(world)
  ];

  const errors = allIssues.filter(i => i.严重程度 === 'error');
  return {
    有效: errors.length === 0,
    问题列表: allIssues,
    修复数: 0
  };
};

/**
 * 修复NPC位置问题 - 将无效位置设为空字符串
 */
const 修复NPC位置问题 = (world: 世界数据结构): 世界数据结构 => {
  const validLocations = 提取有效地点名称(world);
  return {
    ...world,
    活跃NPC列表: (world.活跃NPC列表 || []).map(npc => ({
      ...npc,
      当前位置: npc.当前位置 && validLocations.has(npc.当前位置)
        ? npc.当前位置
        : ''
    }))
  };
};

/**
 * 修复事件时间悖论 - 调整结束时间
 */
const 修复事件时间悖论 = (world: 世界数据结构): 世界数据结构 => {
  return {
    ...world,
    进行中事件: (world.进行中事件 || []).map(evt => {
      const startSort = 时间转排序值(evt.开始时间);
      const endSort = 时间转排序值(evt.预计结束时间);
      if (startSort !== null && endSort !== null && endSort < startSort) {
        // 将结束时间调整为开始时间 + 1天
        const startParts = evt.开始时间.match(/^(\d{1,6}):(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
        if (startParts) {
          const [, year, month, day, hour] = startParts;
          const nextDay = Number(day) + 1;
          return {
            ...evt,
            预计结束时间: `${year}:${month}:${String(nextDay).padStart(2, '0')}:${hour}:00`
          };
        }
      }
      return evt;
    })
  };
};

/**
 * 修复孤立NPC引用 - 移除不存在的NPC引用
 */
const 修复孤立NPC引用 = (world: 世界数据结构): 世界数据结构 => {
  const npcNames = 提取NPC名称集合(world);

  const 过滤NPC引用 = (names: string[]): string[] => {
    return (names || []).filter(name => !name || npcNames.has(name));
  };

  return {
    ...world,
    待执行事件: (world.待执行事件 || []).map(evt => ({
      ...evt,
      关联人物: 过滤NPC引用(evt.关联人物),
      关联势力: 过滤NPC引用(evt.关联势力)
    })),
    进行中事件: (world.进行中事件 || []).map(evt => ({
      ...evt,
      关联人物: 过滤NPC引用(evt.关联人物),
      关联势力: 过滤NPC引用(evt.关联势力)
    })),
    已结算事件: (world.已结算事件 || []).map(evt => ({
      ...evt,
      关联人物: 过滤NPC引用(evt.关联人物),
      关联势力: 过滤NPC引用(evt.关联势力)
    })),
    世界镜头规划: (world.世界镜头规划 || []).map(shot => ({
      ...shot,
      关联人物: 过滤NPC引用(shot.关联人物)
    })),
    江湖史册: (world.江湖史册 || []).map(entry => ({
      ...entry,
      关联人物: 过滤NPC引用(entry.关联人物),
      关联势力: 过滤NPC引用(entry.关联势力)
    }))
  };
};

/**
 * 修复世界状态孤立引用 - 执行所有修复
 */
export const 修复世界状态孤立引用 = (world: 世界数据结构): 世界数据结构 => {
  return 修复孤立NPC引用(修复事件时间悖论(修复NPC位置问题(world)));
};

/**
 * 综合校验并修复世界状态
 */
export const 校验并修复世界状态 = (world: 世界数据结构): {
  world: 世界数据结构;
  result: 世界状态校验结果;
} => {
  const originalIssues = 校验世界状态完整性(world);
  const fixedWorld = 修复世界状态孤立引用(world);
  const fixedIssues = 校验世界状态完整性(fixedWorld);

  const 修复数量 = originalIssues.问题列表.length - fixedIssues.问题列表.length;

  return {
    world: fixedWorld,
    result: {
      有效: fixedIssues.有效,
      问题列表: fixedIssues.问题列表,
      修复数: Math.max(0, 修复数量)
    }
  };
};
