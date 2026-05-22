/**
 * 派对/聚会场景
 * 多 NPC 同时互动，派对小游戏，派对后果系统
 */

import type { NSFW资源状态 } from '../nsfwCore/resources';
import { 获得亲密度代币, 修改声誉 } from '../nsfwCore/resources';

// ==================== 类型定义 ====================

export type 派对类型 = '家庭派对' | '公司聚会' | '同学聚餐' | '主题派对' | 'KTV包厢' | '密室逃脱';

export type 派对游戏类型 = '真心话大冒险' | '国王游戏' | '骰子游戏' | '默契测试' | '抽签配对';

export interface 派对NPC {
  ID: string;
  名称: string;
  亲密等级: number;
  当前情绪: number;
  醉酒度: number;
  警戒心: number;
}

export interface 派对会话 {
  id: string;
  类型: 派对类型;
  NPC列表: 派对NPC[];
  当前回合: number;
  最大回合: number;
  派对氛围: '轻松' | '暧昧' | '紧张' | '失控';
  已发生事件: 派对事件[];
}

export interface 派对事件 {
  类型: '暧昧互动' | '游戏互动' | '冲突' | '醉酒' | '流言';
  描述: string;
  涉及NPC: string[];
  影响: { 亲密变化: Record<string, number>; 声誉变化: number };
}

export interface 派对回合结果 {
  新会话: 派对会话;
  事件: 派对事件 | null;
  资源变化: NSFW资源状态;
  描述: string;
}

// ==================== 核心函数 ====================

export function 创建派对会话(
  类型: 派对类型,
  NPC列表: { ID: string; 名称: string; 亲密等级: number }[]
): 派对会话 {
  return {
    id: `party_${Date.now()}`,
    类型,
    NPC列表: NPC列表.map(n => ({
      ...n,
      当前情绪: 60,
      醉酒度: 0,
      警戒心: 50,
    })),
    当前回合: 0,
    最大回合: 8,
    派对氛围: '轻松' as const,
    已发生事件: [],
  };
}

function 计算派对氛围(会话: 派对会话): 派对会话['派对氛围'] {
  const 平均情绪 = 会话.NPC列表.reduce((sum, n) => sum + n.当前情绪, 0) / Math.max(1, 会话.NPC列表.length);
  const 平均醉酒 = 会话.NPC列表.reduce((sum, n) => sum + n.醉酒度, 0) / Math.max(1, 会话.NPC列表.length);

  if (平均醉酒 >= 70 || 平均情绪 <= 20) return '失控';
  if (平均醉酒 >= 40 && 平均情绪 >= 70) return '暧昧';
  if (平均情绪 <= 30) return '紧张';
  return '轻松';
}

export function 进行派对游戏(
  会话: 派对会话,
  游戏类型: 派对游戏类型,
  资源状态: NSFW资源状态
): 派对回合结果 {
  if (会话.当前回合 >= 会话.最大回合) {
    return { 新会话: 会话, 事件: null, 资源变化: 资源状态, 描述: '派对已结束' };
  }

  let 新资源 = { ...资源状态 };
  const 描述列表: string[] = [`第 ${会话.当前回合 + 1} 回合: ${游戏类型}`];
  const 新NPC列表 = 会话.NPC列表.map(n => ({ ...n }));

  for (const npc of 新NPC列表) {
    npc.醉酒度 = Math.min(100, npc.醉酒度 + Math.round(5 + Math.random() * 10));
    npc.警戒心 = Math.max(0, npc.警戒心 - Math.round(npc.醉酒度 * 0.1));
    npc.当前情绪 = Math.min(100, npc.当前情绪 + Math.round(Math.random() * 10 - 3));
  }

  let 事件: 派对事件 | null = null;

  switch (游戏类型) {
    case '真心话大冒险': {
      const 参与者 = [...新NPC列表].sort(() => Math.random() - 0.5).slice(0, Math.min(2, 新NPC列表.length));
      if (参与者.length >= 2) {
        const 亲密度变化 = Math.round(3 + Math.random() * 5);
        事件 = {
          类型: '暧昧互动',
          描述: `${参与者[0].名称} 和 ${参与者[1].名称} 在真心话中互表心意`,
          涉及NPC: 参与者.map(p => p.ID),
          影响: {
            亲密变化: Object.fromEntries(参与者.map(p => [p.ID, 亲密度变化])),
            声誉变化: 0,
          },
        };
        参与者[0].当前情绪 += 10;
        参与者[1].当前情绪 += 10;
      }
      break;
    }
    case '国王游戏': {
      const 参与者 = [...新NPC列表].sort(() => Math.random() - 0.5).slice(0, Math.min(3, 新NPC列表.length));
      if (参与者.length >= 2) {
        const 高醉酒 = 参与者.find(p => p.醉酒度 >= 60);
        if (高醉酒) {
          事件 = {
            类型: '暧昧互动',
            描述: `${高醉酒.名称} 在醉酒状态下接受了国王指令`,
            涉及NPC: 参与者.map(p => p.ID),
            影响: {
              亲密变化: Object.fromEntries(参与者.map(p => [p.ID, 5])),
              声誉变化: -3,
            },
          };
          新资源 = 修改声誉(新资源, -3, '国王游戏暧昧').新状态;
        }
      }
      break;
    }
    case '骰子游戏': {
      const 输家 = 新NPC列表[Math.floor(Math.random() * 新NPC列表.length)];
      事件 = {
        类型: '游戏互动',
        描述: `${输家.名称} 在骰子游戏中输了，接受了惩罚`,
        涉及NPC: [输家.ID],
        影响: {
          亲密变化: { [输家.ID]: 2 },
          声誉变化: 0,
        },
      };
      break;
    }
    case '默契测试': {
      if (新NPC列表.length >= 2) {
        const 最佳配对 = [...新NPC列表].sort((a, b) => b.亲密等级 - a.亲密等级).slice(0, 2);
        const 默契成功 = Math.random() < (最佳配对[0].亲密等级 + 最佳配对[1].亲密等级) / 200;
        事件 = {
          类型: 默契成功 ? '暧昧互动' : '冲突',
          描述: 默契成功
            ? `${最佳配对[0].名称} 和 ${最佳配对[1].名称} 默契满分`
            : `${最佳配对[0].名称} 和 ${最佳配对[1].名称} 默契测试失败`,
          涉及NPC: 最佳配对.map(p => p.ID),
          影响: {
            亲密变化: Object.fromEntries(最佳配对.map(p => [p.ID, 默契成功 ? 8 : -3])),
            声誉变化: 默契成功 ? 2 : 0,
          },
        };
        if (默契成功) 新资源 = 修改声誉(新资源, 2, '默契测试成功').新状态;
      }
      break;
    }
    case '抽签配对': {
      if (新NPC列表.length >= 2) {
        const 随机配对 = [...新NPC列表].sort(() => Math.random() - 0.5).slice(0, 2);
        事件 = {
          类型: '暧昧互动',
          描述: `抽签结果：${随机配对[0].名称} 和 ${随机配对[1].名称} 配对`,
          涉及NPC: 随机配对.map(p => p.ID),
          影响: {
            亲密变化: Object.fromEntries(随机配对.map(p => [p.ID, 4])),
            声誉变化: 0,
          },
        };
      }
      break;
    }
  }

  const 醉酒NPC = 新NPC列表.filter(n => n.醉酒度 >= 80);
  if (醉酒NPC.length > 0 && !事件) {
    事件 = {
      类型: '醉酒',
      描述: `${醉酒NPC.map(n => n.名称).join('、')} 醉意明显`,
      涉及NPC: 醉酒NPC.map(n => n.ID),
      影响: {
        亲密变化: {},
        声誉变化: -2,
      },
    };
    新资源 = 修改声誉(新资源, -2, '派对醉酒').新状态;
  }

  if (事件) {
    for (const [id, 变化] of Object.entries(事件.影响.亲密变化)) {
      const npc = 新NPC列表.find(n => n.ID === id);
      if (npc) npc.当前情绪 = Math.max(0, Math.min(100, npc.当前情绪 + 变化));
    }
    会话.已发生事件.push(事件);
    描述列表.push(事件.描述);
  }

  会话.派对氛围 = 计算派对氛围({ ...会话, NPC列表: 新NPC列表 });
  会话.NPC列表 = 新NPC列表;
  会话.当前回合++;

  新资源 = 获得亲密度代币(新资源, 3 + 会话.已发生事件.length, '派对收益').新状态;
  描述列表.push(`获得 ${3 + 会话.已发生事件.length} 代币`);

  return { 新会话: 会话, 事件, 资源变化: 新资源, 描述: 描述列表.join('，') };
}

export function 结算派对(
  会话: 派对会话,
  资源状态: NSFW资源状态
): { 新资源状态: NSFW资源状态; 成就: string[]; 描述: string } {
  let 新资源 = { ...资源状态 };
  const 成就: string[] = [];
  const 描述列表: string[] = ['派对结算'];

  const 高亲密NPC = 会话.NPC列表.filter(n => n.亲密等级 >= 60);
  const 醉酒NPC = 会话.NPC列表.filter(n => n.醉酒度 >= 70);

  if (高亲密NPC.length >= 2) {
    成就.push('派对焦点');
    新资源 = 获得亲密度代币(新资源, 20, '成就奖励').新状态;
  }
  if (会话.已发生事件.filter(e => e.类型 === '暧昧互动').length >= 3) {
    成就.push('暧昧大师');
    新资源 = 获得亲密度代币(新资源, 25, '成就奖励').新状态;
  }
  if (醉酒NPC.length === 0 && 会话.NPC列表.length >= 3) {
    成就.push('清醒达人');
    新资源 = 获得亲密度代币(新资源, 15, '成就奖励').新状态;
  }

  if (会话.派对氛围 === '失控') {
    新资源 = 修改声誉(新资源, -10, '派对失控').新状态;
    描述列表.push('派对失控，声誉-10');
  }

  return { 新资源状态: 新资源, 成就, 描述: 描述列表.join('，') };
}
