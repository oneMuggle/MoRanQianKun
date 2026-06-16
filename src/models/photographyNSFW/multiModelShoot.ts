/**
 * 写真约拍 — 多人拍摄模式
 * 2-3 名模特同时拍摄，模特间互动、默契/竞争/嫉妒，群体动态管理
 */

import type { NSFW资源状态 } from '../nsfwCore/resources';
import { 获得亲密度代币, 修改声誉 } from '../nsfwCore/resources';

// ==================== 类型定义 ====================

export interface 模特拍摄状态 {
  模特ID: string;
  模特名称: string;
  情绪值: number;
  信任度: number;
  嫉妒值: number;
  默契度: Record<string, number>;
  当前服装: string;
  拍摄意愿: '积极' | '配合' | '消极' | '拒绝';
}

export interface 多人拍摄会话 {
  id: string;
  模特列表: 模特拍摄状态[];
  当前回合: number;
  总回合数: number;
  拍摄进度: number;
  作品质量: number;
  群体动态: '和谐' | '竞争' | '紧张' | '冲突';
}

export interface 模特间事件 {
  类型: '默契互动' | '竞争升级' | '嫉妒爆发' | '互相鼓励' | '冷战';
  涉及模特: string[];
  描述: string;
  影响: { 情绪变化: Record<string, number>; 信任变化: Record<string, number> };
}

export interface 拍摄回合结果 {
  新会话: 多人拍摄会话;
  资源变化: NSFW资源状态;
  发生事件: 模特间事件 | null;
  描述: string;
}

// ==================== 核心函数 ====================

export function 创建多人拍摄会话(
  模特列表: { ID: string; 名称: string; 服装?: string }[]
): 多人拍摄会话 {
  return {
    id: `multi_shoot_${Date.now()}`,
    模特列表: 模特列表.map(m => ({
      模特ID: m.ID,
      模特名称: m.名称,
      情绪值: 60,
      信任度: 50,
      嫉妒值: 0,
      默契度: {},
      当前服装: m.服装 || '日常便装',
      拍摄意愿: '配合' as const,
    })),
    当前回合: 0,
    总回合数: 6,
    拍摄进度: 0,
    作品质量: 50,
    群体动态: '和谐' as const,
  };
}

export function 计算群体动态(会话: 多人拍摄会话): 多人拍摄会话['群体动态'] {
  const 平均嫉妒 = 会话.模特列表.reduce((sum, m) => sum + m.嫉妒值, 0) / 会话.模特列表.length;
  const 平均信任 = 会话.模特列表.reduce((sum, m) => sum + m.信任度, 0) / 会话.模特列表.length;
  const 拒绝人数 = 会话.模特列表.filter(m => m.拍摄意愿 === '拒绝').length;

  if (拒绝人数 > 0 || 平均嫉妒 >= 80) return '冲突';
  if (平均嫉妒 >= 50 || 平均信任 <= 30) return '紧张';
  if (平均嫉妒 >= 30 && 平均信任 < 50) return '竞争';
  return '和谐';
}

function 检测模特间事件(会话: 多人拍摄会话): 模特间事件 | null {
  const 动态 = 计算群体动态(会话);

  if (动态 === '冲突') {
    const 高嫉妒 = 会话.模特列表.filter(m => m.嫉妒值 >= 70);
    if (高嫉妒.length >= 2) {
      return {
        类型: '嫉妒爆发',
        涉及模特: 高嫉妒.map(m => m.模特ID),
        描述: `${高嫉妒.map(m => m.模特名称).join(' 和 ')} 之间爆发冲突！`,
        影响: {
          情绪变化: Object.fromEntries(高嫉妒.map(m => [m.模特ID, -20])),
          信任变化: Object.fromEntries(高嫉妒.map(m => [m.模特ID, -15])),
        },
      };
    }
  }

  if (动态 === '竞争') {
    const 竞争者 = 会话.模特列表.filter(m => m.情绪值 >= 70);
    if (竞争者.length >= 2) {
      return {
        类型: '竞争升级',
        涉及模特: 竞争者.map(m => m.模特ID),
        描述: `${竞争者.map(m => m.模特名称).join(' 和 ')} 之间的竞争加剧`,
        影响: {
          情绪变化: Object.fromEntries(竞争者.map(m => [m.模特ID, 10])),
          信任变化: Object.fromEntries(竞争者.map(m => [m.模特ID, -5])),
        },
      };
    }
  }

  for (let i = 0; i < 会话.模特列表.length; i++) {
    for (let j = i + 1; j < 会话.模特列表.length; j++) {
      const a = 会话.模特列表[i];
      const b = 会话.模特列表[j];
      const 默契 = (a.默契度[b.模特ID] || 0) + (b.默契度[a.模特ID] || 0);
      if (默契 >= 80) {
        return {
          类型: '默契互动',
          涉及模特: [a.模特ID, b.模特ID],
          描述: `${a.模特名称} 和 ${b.模特名称} 配合默契`,
          影响: {
            情绪变化: { [a.模特ID]: 10, [b.模特ID]: 10 },
            信任变化: { [a.模特ID]: 5, [b.模特ID]: 5 },
          },
        };
      }
    }
  }

  return null;
}

export function 执行拍摄回合(
  会话: 多人拍摄会话,
  策略: '推进尺度' | '保持当前' | '放缓节奏' | '安抚模特',
  资源状态: NSFW资源状态
): 拍摄回合结果 {
  if (会话.当前回合 >= 会话.总回合数) {
    return { 新会话: 会话, 资源变化: 资源状态, 发生事件: null, 描述: '拍摄已结束' };
  }

  const 新模特列表 = 会话.模特列表.map(m => ({ ...m, 默契度: { ...m.默契度 } }));
  let 新资源 = { ...资源状态 };
  const 描述列表: string[] = [`第 ${会话.当前回合 + 1} 回合`];

  switch (策略) {
    case '推进尺度': {
      for (const 模特 of 新模特列表) {
        if (模特.信任度 >= 60) {
          模特.情绪值 = Math.min(100, 模特.情绪值 + 5);
          模特.嫉妒值 = Math.min(100, 模特.嫉妒值 + 8);
        } else if (模特.信任度 >= 40) {
          模特.情绪值 = Math.max(0, 模特.情绪值 - 5);
          模特.嫉妒值 = Math.min(100, 模特.嫉妒值 + 12);
          模特.拍摄意愿 = '消极';
        } else {
          模特.拍摄意愿 = '拒绝';
          模特.情绪值 = Math.max(0, 模特.情绪值 - 15);
        }
      }
      会话.拍摄进度 = Math.min(100, 会话.拍摄进度 + 20);
      会话.作品质量 = Math.min(100, 会话.作品质量 + 10);
      描述列表.push('推进拍摄尺度');
      break;
    }
    case '保持当前': {
      for (const 模特 of 新模特列表) {
        模特.情绪值 = Math.min(100, 模特.情绪值 + 2);
        模特.嫉妒值 = Math.max(0, 模特.嫉妒值 + 3);
      }
      会话.拍摄进度 = Math.min(100, 会话.拍摄进度 + 12);
      描述列表.push('保持当前节奏');
      break;
    }
    case '放缓节奏': {
      for (const 模特 of 新模特列表) {
        模特.情绪值 = Math.min(100, 模特.情绪值 + 8);
        模特.嫉妒值 = Math.max(0, 模特.嫉妒值 - 5);
        模特.信任度 = Math.min(100, 模特.信任度 + 3);
      }
      会话.拍摄进度 = Math.min(100, 会话.拍摄进度 + 8);
      描述列表.push('放缓节奏，稳定情绪');
      break;
    }
    case '安抚模特': {
      const 最低信任 = [...新模特列表].sort((a, b) => a.信任度 - b.信任度)[0];
      if (最低信任) {
        最低信任.情绪值 = Math.min(100, 最低信任.情绪值 + 15);
        最低信任.嫉妒值 = Math.max(0, 最低信任.嫉妒值 - 10);
        最低信任.信任度 = Math.min(100, 最低信任.信任度 + 8);
        if (最低信任.拍摄意愿 === '拒绝') 最低信任.拍摄意愿 = '消极';
        else if (最低信任.拍摄意愿 === '消极') 最低信任.拍摄意愿 = '配合';
        描述列表.push(`安抚 ${最低信任.模特名称}`);
      }
      会话.拍摄进度 = Math.min(100, 会话.拍摄进度 + 5);
      break;
    }
  }

  for (let i = 0; i < 新模特列表.length; i++) {
    for (let j = i + 1; j < 新模特列表.length; j++) {
      const a = 新模特列表[i];
      const b = 新模特列表[j];
      if (a.情绪值 >= 60 && b.情绪值 >= 60) {
        const 增量 = 策略 === '放缓节奏' ? 3 : 策略 === '安抚模特' ? 5 : 1;
        a.默契度[b.模特ID] = Math.min(100, (a.默契度[b.模特ID] || 0) + 增量);
        b.默契度[a.模特ID] = Math.min(100, (b.默契度[a.模特ID] || 0) + 增量);
      }
    }
  }

  const 发生事件 = 检测模特间事件({ ...会话, 模特列表: 新模特列表 });
  if (发生事件) {
    for (const [id, 变化] of Object.entries(发生事件.影响.情绪变化)) {
      const 模特 = 新模特列表.find(m => m.模特ID === id);
      if (模特) 模特.情绪值 = Math.max(0, Math.min(100, 模特.情绪值 + 变化));
    }
    for (const [id, 变化] of Object.entries(发生事件.影响.信任变化)) {
      const 模特 = 新模特列表.find(m => m.模特ID === id);
      if (模特) 模特.信任度 = Math.max(0, Math.min(100, 模特.信任度 + 变化));
    }
    描述列表.push(发生事件.描述);
  }

  会话.群体动态 = 计算群体动态({ ...会话, 模特列表: 新模特列表 });
  会话.模特列表 = 新模特列表;
  会话.当前回合++;

  const 回合代币 = 5 + Math.round(会话.作品质量 / 20);
  新资源 = 获得亲密度代币(新资源, 回合代币, '多人拍摄收益').新状态;
  描述列表.push(`获得 ${回合代币} 代币`);

  return { 新会话: 会话, 资源变化: 新资源, 发生事件, 描述: 描述列表.join('，') };
}

export function 结算多人拍摄(
  会话: 多人拍摄会话,
  资源状态: NSFW资源状态
): { 新资源状态: NSFW资源状态; 作品评分: number; 成就: string[]; 描述: string } {
  let 新资源 = { ...资源状态 };
  const 成就: string[] = [];
  const 描述列表: string[] = ['拍摄结算'];

  const 平均信任 = 会话.模特列表.reduce((sum, m) => sum + m.信任度, 0) / 会话.模特列表.length;
  const 拒绝人数 = 会话.模特列表.filter(m => m.拍摄意愿 === '拒绝').length;

  const 作品评分 = Math.round(
    会话.作品质量 * 0.6
    + (100 - 会话.模特列表.reduce((sum, m) => sum + m.嫉妒值, 0) / 会话.模特列表.length) * 0.2
    + 平均信任 * 0.2
  );

  const 代币奖励 = Math.round(作品评分 / 5);
  新资源 = 获得亲密度代币(新资源, 代币奖励, '多人拍摄完成奖励').新状态;
  描述列表.push(`获得 ${代币奖励} 代币奖励`);

  if (平均信任 >= 70 && 会话.模特列表.length >= 2) 成就.push('和谐团队');
  if (拒绝人数 === 0 && 会话.模特列表.length >= 3) 成就.push('全员配合');
  if (作品评分 >= 80) 成就.push('大师之作');
  if (成就.length > 0) {
    新资源 = 获得亲密度代币(新资源, 成就.length * 15, '成就奖励').新状态;
  }

  if (拒绝人数 > 0) {
    新资源 = 修改声誉(新资源, -拒绝人数 * 5, `模特不满(${拒绝人数}人拒绝)`).新状态;
    描述列表.push(`${拒绝人数} 名模特拒绝继续合作`);
  }

  return { 新资源状态: 新资源, 作品评分, 成就, 描述: 描述列表.join('，') };
}
