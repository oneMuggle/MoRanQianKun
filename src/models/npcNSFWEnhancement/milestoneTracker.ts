/**
 * NPC NSFW 增强模块 — 里程碑追踪
 * 定义NSFW里程碑、检测触发条件、追踪解锁进度
 */

import { NPC结构 } from '../social';
import type {
  里程碑定义,
  已解锁里程碑,
  里程碑追踪状态,
  里程碑触发上下文,
} from './types';

// ==================== 里程碑定义库 ====================

export const 全部里程碑定义: 里程碑定义[] = [
  // --- 首次类 ---
  {
    id: 'first_intimacy',
    名称: '初体验',
    类别: '首次',
    稀有度: '普通',
    描述: '第一次经历NSFW场景',
    触发条件: (npc, ctx) => ctx.事件类型 === '亲密互动' && npc.是否处女 === false && (npc.初夜时间 === ctx.游戏时间),
  },
  {
    id: 'first_exposure',
    名称: '初次暴露',
    类别: '首次',
    稀有度: '普通',
    描述: '第一次在公共或半公共场所暴露',
    触发条件: (_npc, ctx) => ctx.事件类型 === '暴露' || ctx.事件类型 === '公共冒险',
  },
  {
    id: 'first_roleplay',
    名称: '角色扮演初体验',
    类别: '首次',
    稀有度: '普通',
    描述: '第一次尝试角色扮演',
    触发条件: (_npc, ctx) => ctx.事件类型 === '角色扮演',
  },

  // --- 关系进展 ---
  {
    id: 'all_fetishes_discovered',
    名称: '完全了解',
    类别: '关系进展',
    稀有度: '稀有',
    描述: '发现某NPC的所有隐藏偏好',
    触发条件: (npc) => npc.性癖档案 !== undefined &&
      npc.性癖档案.隐藏偏好.length === 0 &&
      npc.性癖档案.核心偏好.length >= 5,
  },
  {
    id: 'deep_bond',
    名称: '灵魂伴侣',
    类别: '关系进展',
    稀有度: '史诗',
    描述: '与某NPC的亲密度达到最高等级',
    触发条件: (npc) => (npc.亲密度等级 ?? 0) >= 10,
  },
  {
    id: 'personality_unlock',
    名称: '真面目',
    类别: '关系进展',
    稀有度: '稀有',
    描述: '触发某NPC的里人格',
    触发条件: (npc) => npc.当前人格状态 === '里',
  },

  // --- 性癖发现 ---
  {
    id: 'fetish_collector',
    名称: '性癖收藏家',
    类别: '性癖发现',
    稀有度: '史诗',
    描述: '累计解锁10种不同性癖',
    触发条件: (npc) => (npc.性癖档案?.核心偏好.length ?? 0) >= 10,
  },
  {
    id: 'taboo_breaker',
    名称: '禁忌突破',
    类别: '性癖发现',
    稀有度: '稀有',
    描述: '将某性癖强度提升至满级(5)',
    触发条件: (npc) => npc.性癖档案?.核心偏好.some(p => p.强度 === 5) ?? false,
  },
  {
    id: 'sensitive_expert',
    名称: '敏感点大师',
    类别: '性癖发现',
    稀有度: '稀有',
    描述: '完全开发某NPC的所有敏感点',
    触发条件: (npc) => npc.敏感点档案?.主要敏感点.every(p => p.开发程度 === '完全开发') ?? false,
  },

  // --- 场景成就 ---
  {
    id: 'public_adventurer',
    名称: '公共冒险家',
    类别: '场景成就',
    稀有度: '稀有',
    描述: '在5个不同场所经历NSFW场景',
    触发条件: (_npc, ctx) => ctx.事件类型 === '场所记录' && Number(ctx.事件描述) >= 5,
  },
  {
    id: 'night_owl',
    名称: '夜猫子',
    类别: '场景成就',
    稀有度: '普通',
    描述: '在深夜/凌晨经历NSFW场景',
    触发条件: (_npc, ctx) => {
      const 时 = 提取小时(ctx.游戏时间);
      return 时 >= 22 || 时 < 5;
    },
  },
  {
    id: 'exhibitionist',
    名称: '暴露狂',
    类别: '场景成就',
    稀有度: '稀有',
    描述: '在完全暴露状态下互动',
    触发条件: (_npc, ctx) => ctx.事件类型 === '完全暴露',
  },

  // --- 特殊事件 ---
  {
    id: 'first_pregnancy',
    名称: '新生命',
    类别: '特殊事件',
    稀有度: '史诗',
    描述: '第一次受孕成功',
    触发条件: (_npc, ctx) => ctx.事件类型 === '受孕成功',
  },
  {
    id: 'parenthood',
    名称: '为人父母',
    类别: '特殊事件',
    稀有度: '传说',
    描述: '第一次经历分娩',
    触发条件: (_npc, ctx) => ctx.事件类型 === '分娩完成',
  },
  {
    id: 'personality_reversal',
    名称: '人格反转',
    类别: '特殊事件',
    稀有度: '史诗',
    描述: '经历NPC的人格翻转事件',
    触发条件: (_npc, ctx) => ctx.事件类型 === '人格翻转',
  },

  // --- 收集类 ---
  {
    id: 'cg_collector_10',
    名称: 'CG收藏家(10)',
    类别: '收集',
    稀有度: '普通',
    描述: '收集10张CG',
    触发条件: (_npc, ctx) => ctx.事件类型 === 'CG收集' && Number(ctx.事件描述) >= 10,
  },
  {
    id: 'cg_collector_50',
    名称: 'CG收藏家(50)',
    类别: '收集',
    稀有度: '史诗',
    描述: '收集50张CG',
    触发条件: (_npc, ctx) => ctx.事件类型 === 'CG收集' && Number(ctx.事件描述) >= 50,
  },
];

// ==================== 里程碑追踪 ====================

export function 初始化里程碑状态(): 里程碑追踪状态 {
  return {
    已解锁: [],
    进度: {},
    最后检查时间: '',
  };
}

/**
 * 检查并触发里程碑
 */
export function 检查里程碑(
  状态: 里程碑追踪状态,
  npc: NPC结构,
  上下文: 里程碑触发上下文
): 已解锁里程碑[] {
  const 新解锁: 已解锁里程碑[] = [];
  const 已解锁Ids = new Set(状态.已解锁.map(m => m.里程碑Id));

  for (const 定义 of 全部里程碑定义) {
    if (已解锁Ids.has(定义.id)) continue;

    try {
      if (定义.触发条件(npc, 上下文)) {
        const 新里程碑: 已解锁里程碑 = {
          里程碑Id: 定义.id,
          解锁时间: 上下文.游戏时间,
          关联NpcId: 上下文.关联NpcId,
          关联Npc姓名: 上下文.关联NpcId ? npc.姓名 : undefined,
          备注: 定义.描述,
        };
        状态.已解锁.push(新里程碑);
        新解锁.push(新里程碑);
      }
    } catch {
      // 忽略单个里程碑检测失败
    }
  }

  状态.最后检查时间 = 上下文.游戏时间;
  return 新解锁;
}

/**
 * 更新里程碑进度（对渐进式里程碑）
 */
export function 更新里程碑进度(
  状态: 里程碑追踪状态,
  里程碑Id: string,
  增量: number = 1,
  上限: number = 100
): number {
  const 当前 = 状态.进度[里程碑Id] ?? 0;
  状态.进度[里程碑Id] = Math.min(上限, 当前 + 增量);
  return 状态.进度[里程碑Id];
}

// ==================== 查询 ====================

export function 获取已解锁里程碑(状态: 里程碑追踪状态): 已解锁里程碑[] {
  return [...状态.已解锁].sort((a, b) => b.解锁时间.localeCompare(a.解锁时间));
}

export function 获取未解锁里程碑(状态: 里程碑追踪状态): 里程碑定义[] {
  const 已解锁Ids = new Set(状态.已解锁.map(m => m.里程碑Id));
  return 全部里程碑定义.filter(d => !已解锁Ids.has(d.id));
}

export function 按类别分组里程碑(
  状态: 里程碑追踪状态
): Record<string, { 已解锁: 已解锁里程碑[]; 未解锁: 里程碑定义[] }> {
  const 结果: Record<string, { 已解锁: 已解锁里程碑[]; 未解锁: 里程碑定义[] }> = {};
  const 类别 = ['首次', '关系进展', '性癖发现', '场景成就', '特殊事件', '收集'];

  for (const 类 of 类别) {
    结果[类] = {
      已解锁: 状态.已解锁.filter(m =>
        全部里程碑定义.find(d => d.id === m.里程碑Id)?.类别 === 类
      ),
      未解锁: 全部里程碑定义.filter(d => d.类别 === 类 &&
        !状态.已解锁.some(m => m.里程碑Id === d.id)
      ),
    };
  }

  return 结果;
}

export function 生成里程碑摘要(状态: 里程碑追踪状态): string | null {
  if (状态.已解锁.length === 0) return null;

  const 总数 = 全部里程碑定义.length;
  const 已解锁数 = 状态.已解锁.length;
  const 最近 = 状态.已解锁
    .sort((a, b) => b.解锁时间.localeCompare(a.解锁时间))
    .slice(0, 2)
    .map(m => m.备注 || m.里程碑Id)
    .join('、');

  return `里程碑：${已解锁数}/${总数}（最近：${最近}）`;
}

function 提取小时(时间串: string): number {
  const parts = 时间串.split(':');
  if (parts.length < 4) return 12;
  const 时 = Number(parts[3]);
  return isNaN(时) ? 12 : 时;
}
