/**
 * 双修大会引擎
 * 处理多人双修的触发、计算、结果应用
 */

import type { NPC结构 } from '../../../models/social';
import type { NSFW资源状态 } from '../../../models/nsfwCore/resources';
import { 计算亲密度等级 } from '../../../models/intimacy';
import {
  双修大会参数,
  双修大会结果,
  双修大会成员摘要,
  双修参与人数,
  后宫系统状态,
  多人NSFW场景参数,
} from '../../../models/nsfwCore/multiPersonNSFW';
import {
  验证双修大会条件,
  计算双修大会精力消耗,
  计算多人双修收益,
  计算多人双修风险,
  生成多人NSFW叙事约束,
} from '../../../models/nsfwCore/multiPersonNSFWUtils';

/**
 * 从 NPC 结构提取双修大会成员摘要
 */
export function 从NPC提取成员摘要(
  npc: NPC结构,
  位分: string,
  位分等级: number,
  对其他人和谐度: number
): 双修大会成员摘要 {
  return {
    npcId: npc.id,
    姓名: npc.姓名,
    位分,
    位分等级,
    亲密度等级: 计算亲密度等级(npc.好感度),
    对其他人和谐度,
  };
}

/**
 * 触发双修大会
 */
export function 触发双修大会(
  参与成员: 双修大会成员摘要[],
  后宫系统: 后宫系统状态,
  资源状态: NSFW资源状态,
  时代ID: string,
  基础叙事约束: string
): {
  成功: boolean;
  结果: 双修大会结果 | null;
  新资源状态: NSFW资源状态;
  错误: string | null;
} {
  const 人数 = 参与成员.length as 双修参与人数;

  // 1. 验证参与条件
  const 验证 = 验证双修大会条件(参与成员, 后宫系统.后宫等级);
  if (!验证.通过) {
    return { 成功: false, 结果: null, 新资源状态: 资源状态, 错误: 验证.失败原因 };
  }

  // 2. 计算精力消耗
  const 精力消耗 = 计算双修大会精力消耗(人数);

  if (资源状态.精力值 < 精力消耗) {
    return {
      成功: false,
      结果: null,
      新资源状态: 资源状态,
      错误: `精力不足！需要 ${精力消耗} 精力，当前只有 ${资源状态.精力值}`,
    };
  }

  const 新资源状态: NSFW资源状态 = {
    ...资源状态,
    精力值: 资源状态.精力值 - 精力消耗,
  };

  // 3. 计算平均和谐度
  const 平均和谐度 = 参与成员.reduce((sum, m) => sum + m.对其他人和谐度, 0) / 参与成员.length;

  // 4. 计算收益
  const 参数: 双修大会参数 = {
    参与成员,
    参与人数: 人数,
    平均和谐度,
    总精力消耗: 精力消耗,
  };
  const 收益 = 计算多人双修收益(参数);

  // 5. 计算风险
  const 风险 = 计算多人双修风险(人数, 平均和谐度);
  const 风险触发 = Math.random() * 100 < 风险.风险值;

  // 6. 计算嫉妒变化
  const 嫉妒变化: Record<string, number> = {};
  if (风险触发) {
    for (const 成员 of 后宫系统.成员列表) {
      const 是否参与 = 参与成员.some(m => m.npcId === 成员.npcId);
      if (!是否参与) {
        嫉妒变化[成员.npcId] = Math.floor(Math.random() * 15) + 10;
      }
    }
  }

  // 7. 生成叙事提示词
  const 叙事参数: 多人NSFW场景参数 = {
    场景类型: '双修大会',
    参与成员: 参与成员.map(m => ({
      姓名: m.姓名,
      位分: m.位分,
      亲密度等级: m.亲密度等级,
      嫉妒值: 后宫系统.成员列表.find(hm => hm.npcId === m.npcId)?.嫉妒值 ?? 0,
      和谐度: m.对其他人和谐度,
      欲望阶段: '克制' as any,
      人格特征: '',
    })),
    当前互动成员: 参与成员[0]?.姓名 ?? '',
    是否多人场景: true,
    成员间关系摘要: 后宫系统.配对关系
      .filter(r => 参与成员.some(m => m.npcId === r.npcIdA || m.npcId === r.npcIdB))
      .map(r => `${r.npcIdA}与${r.npcIdB}: ${r.关系类型}`)
      .join('；') || '无明显关系',
    平均和谐度,
    内容强度: 平均和谐度 >= 70 ? '完全展开' : 平均和谐度 >= 50 ? '适度展开' : '点到为止',
    时代ID,
  };
  const 叙事提示词 = 生成多人NSFW叙事约束(叙事参数, 基础叙事约束);

  // 8. 构建结果
  const 结果: 双修大会结果 = {
    成功: true,
    风险触发,
    属性奖励: 收益.基础属性,
    专属组合: 收益.专属组合,
    和谐度变化: 收益.和谐度修正,
    嫉妒变化,
    描述: `双修大会（${人数}人）: 获得 ${收益.基础属性.map(a => `${a.属性类型}+${a.数值}`).join('、')}${风险触发 ? '，但触发风险，部分成员嫉妒上升' : ''}`,
    叙事提示词,
  };

  return { 成功: true, 结果, 新资源状态, 错误: null };
}

/**
 * 应用双修大会结果到游戏状态
 */
export function 应用双修大会结果(
  后宫系统: 后宫系统状态,
  结果: 双修大会结果
): 后宫系统状态 {
  const 新和谐度 = Math.max(0, Math.min(100, 后宫系统.和谐度 + 结果.和谐度变化));

  const 新成员列表 = 后宫系统.成员列表.map(成员 => {
    const 嫉妒增量 = 结果.嫉妒变化[成员.npcId] ?? 0;
    return {
      ...成员,
      嫉妒值: Math.max(0, Math.min(100, 成员.嫉妒值 + 嫉妒增量)),
    };
  });

  const 新事件历史 = [
    ...后宫系统.事件历史,
    {
      类型: '双修大会' as const,
      描述: 结果.描述,
      时间: new Date().toISOString(),
      参与成员: Object.keys(结果.嫉妒变化),
    },
  ];

  return {
    ...后宫系统,
    成员列表: 新成员列表,
    和谐度: 新和谐度,
    事件历史: 新事件历史,
    活跃冲突: 结果.风险触发
      ? [...后宫系统.活跃冲突, '双修大会引发嫉妒']
      : 后宫系统.活跃冲突,
  };
}
