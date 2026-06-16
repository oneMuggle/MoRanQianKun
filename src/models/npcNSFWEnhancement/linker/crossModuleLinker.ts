/**
 * NSFW 跨模块联动 — 跨模块联动引擎
 * 规则驱动的跨模块事件传导
 */

import type {
  跨模块联动状态,
  联动规则,
  已激活联动,
  跨模块事件,
  引擎类型,
  态度类型,
} from './types';

// Re-import to avoid circular dependency
function 记录记忆(
  状态: 跨模块联动状态,
  npc姓名: string,
  源引擎: import('./types').引擎类型,
  事件: string,
  事件描述: string,
  严重程度: number,
  态度: import('./types').态度类型,
  影响行为: string[],
  游戏时间: string
): void {
  if (!状态.npc记忆[npc姓名]) 状态.npc记忆[npc姓名] = [];
  状态.npc记忆[npc姓名].push({
    id: `auto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    源引擎, 事件, 事件描述, 时间戳: 游戏时间,
    严重程度, 态度, 记忆强度: 严重程度 * 20, 衰减速率: 2, 影响行为,
  });
}

export const 全部联动规则: 联动规则[] = [
  {
    id: 'bar_to_driver_drunk',
    源事件: '醉酒',
    源引擎: 'barNSFW',
    目标引擎: 'urbanDriver',
    效果类型: '概率修正',
    效果描述: '醉酒乘客事件触发概率+30%',
    效果值: 30,
    延迟回合: 0,
  },
  {
    id: 'bar_to_exposure_reputation',
    源事件: '冲突',
    源引擎: 'barNSFW',
    目标引擎: 'exposure',
    效果类型: '风险调整',
    效果描述: '名誉受损，暴露风险+20%',
    效果值: 20,
    延迟回合: 1,
  },
  {
    id: 'photo_to_campus_rumor',
    源事件: '泄露',
    源引擎: 'photography',
    目标引擎: 'campus',
    效果类型: '流言传播',
    效果描述: '流言等级+2',
    效果值: 2,
    延迟回合: 2,
  },
  {
    id: 'nightlife_to_biz_unlock',
    源事件: 'VIP互动',
    源引擎: 'nightlife',
    目标引擎: 'bdsm',
    效果类型: '场景解锁',
    效果描述: '解锁高级场景',
    效果值: 1,
    延迟回合: 0,
    触发条件: 'VIP互动累积≥3次',
  },
  {
    id: 'campus_to_private_gossip',
    源事件: '流言',
    源引擎: 'campus',
    目标引擎: 'privateChat',
    效果类型: '行为改变',
    效果描述: 'NPC在私聊中可能提及流言',
    效果值: 50,
    延迟回合: 1,
  },
  {
    id: 'exposure_to_global_rumor',
    源事件: '公共暴露',
    源引擎: 'exposure',
    目标引擎: 'barNSFW',
    效果类型: '态度变化',
    效果描述: '其他NPC可能产生疏离态度',
    效果值: 15,
    延迟回合: 3,
  },
  {
    id: 'bdsm_to_campus_attitude',
    源事件: '会议冲突',
    源引擎: 'bdsm',
    目标引擎: 'campus',
    效果类型: '态度变化',
    效果描述: '校园NPC态度偏向疏离',
    效果值: 10,
    延迟回合: 2,
  },
];

export function 初始化跨模块状态(): 跨模块联动状态 {
  return { 事件历史: [], npc记忆: {}, npc声誉: {}, 已激活联动: [], 最后更新时间: '' };
}

export function 处理联动事件(
  状态: 跨模块联动状态,
  事件: 跨模块事件,
  游戏时间: string
): 已激活联动[] {
  const 新联动: 已激活联动[] = [];
  for (const 规则 of 全部联动规则) {
    if (事件.源引擎 !== 规则.源引擎) continue;
    if (!事件.事件类型.includes(规则.源事件) &&
        !事件.标签.includes(规则.源事件) &&
        !事件.事件描述.includes(规则.源事件)) continue;

    新联动.push({
      规则Id: 规则.id,
      源事件Id: 事件.id,
      目标引擎: 规则.目标引擎,
      激活时间: 游戏时间,
      剩余延迟: 规则.延迟回合,
      已执行: false,
    });
  }
  状态.已激活联动.push(...新联动);
  状态.最后更新时间 = 游戏时间;
  return 新联动;
}

export function 执行到期联动(
  状态: 跨模块联动状态,
  游戏时间: string
): 已激活联动[] {
  const 已执行: 已激活联动[] = [];
  for (const 联动 of 状态.已激活联动) {
    if (联动.已执行) continue;
    if (联动.剩余延迟 > 0) { 联动.剩余延迟--; continue; }

    const 规则 = 全部联动规则.find(r => r.id === 联动.规则Id);
    if (!规则) continue;
    const 源事件 = 状态.事件历史.find(e => e.id === 联动.源事件Id);
    if (!源事件) continue;

    应用联动效果(状态, 规则, 源事件, 游戏时间);
    联动.已执行 = true;
    已执行.push(联动);
  }
  状态.已激活联动 = 状态.已激活联动.filter(l => !l.已执行).slice(-20);
  状态.最后更新时间 = 游戏时间;
  return 已执行;
}

function 应用联动效果(
  状态: 跨模块联动状态,
  规则: 联动规则,
  源事件: 跨模块事件,
  游戏时间: string
): void {
  for (const npc姓名 of 源事件.涉及NPC) {
    let 态度: 态度类型 = '中立';
    const 影响行为: string[] = [];

    switch (规则.效果类型) {
      case '态度变化':
        态度 = 源事件.严重程度 >= 3 ? '疏离' : '好奇';
        影响行为.push(`对${规则.目标引擎}相关事件态度改变`);
        break;
      case '场景解锁':
        态度 = '亲近';
        影响行为.push(`解锁${规则.目标引擎}新场景`);
        break;
      case '流言传播':
        态度 = '好奇';
        影响行为.push(`在${规则.目标引擎}中传播流言`);
        break;
      case '风险调整':
        态度 = '厌恶';
        影响行为.push(`${规则.目标引擎}风险等级提升`);
        break;
      default:
        态度 = '中立';
    }

    记录记忆(状态, npc姓名, 规则.源引擎, 规则.效果类型, 规则.效果描述, 源事件.严重程度, 态度, 影响行为, 游戏时间);
  }
}

export function 获取待执行联动(
  状态: 跨模块联动状态,
  目标引擎?: 引擎类型
): 已激活联动[] {
  return 状态.已激活联动.filter(l => !l.已执行 && (目标引擎 ? l.目标引擎 === 目标引擎 : true));
}

export function 生成联动摘要(状态: 跨模块联动状态): string | null {
  const 待执行 = 获取待执行联动(状态);
  if (!待执行.length) return null;
  return `待执行联动：${待执行.map(l => {
    const 规则 = 全部联动规则.find(r => r.id === l.规则Id);
    return `${规则?.效果描述 ?? l.规则Id}(延迟${l.剩余延迟}回合)`;
  }).join('；')}`;
}
