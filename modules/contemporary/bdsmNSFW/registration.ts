// BDSM 独立 NSFW 模块注册

import type { StoryModule, 游戏状态快照 } from '../../../utils/storyModule/types';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { BDSM系统设置 } from '../../../models/bdsmNSFW';
import { 默认BDSM系统设置, 规范化BDSM系统设置 } from '../../../models/bdsmNSFW';
import { 构建BDSM完整叙事约束 } from '../../../prompts/runtime/bdsmNSFW';

// ==================== 运行时参数 ====================

interface BDSM运行时参数 {
  权力倾向: string;
  服从度: number;
  已解锁SM场景: string[];
  活跃任务摘要: string;
  日常指令列表: string[];
  契约状态摘要: string;
  关系阶段: string;
  NSFW内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用BDSM论坛: boolean;
  启用BDSM调教任务: boolean;
  启用BDSM契约系统: boolean;
  启用BDSM关系管线: boolean;
  启用BDSM多角色关系: boolean;
}

// ==================== 参数提取 ====================

function 提取BDSM参数(
  gameState: 游戏状态快照,
  settings: BDSM系统设置
): BDSM运行时参数 | null {
  const 校园系统 = gameState.校园系统 as Record<string, unknown> | undefined;
  if (!校园系统) return null;

  const 欲望系统 = 校园系统.欲望系统 as Record<string, unknown> | undefined;
  const NPC欲望档案 = 欲望系统?.NPC欲望档案 as Record<string, any> | undefined;

  // 查找有 BDSM 关系的 NPC
  const bdsmNPCs: any[] = [];
  if (NPC欲望档案) {
    for (const [id, npc] of Object.entries(NPC欲望档案)) {
      const n = npc as any;
      if (n.BDSM关系 || n.权力倾向 || n.服从度) {
        n.id = id;
        bdsmNPCs.push(n);
      }
    }
  }

  // 也检查独立的BDSM关系状态
  const bdsm关系状态 = 校园系统.BDSM关系状态 as Record<string, any> | undefined;
  if (bdsm关系状态 && Object.keys(bdsm关系状态).length > 0) {
    for (const [id, rel] of Object.entries(bdsm关系状态)) {
      const r = rel as any;
      if (r.阶段 && r.阶段 !== '初识') {
        if (!bdsmNPCs.some(n => n.id === id)) {
          const 对应NPC = NPC欲望档案?.[id] as any;
          const 条目: any = { id, ...r };
          if (对应NPC) {
            条目.姓名 = 对应NPC.姓名;
            条目.权力倾向 = 对应NPC.权力倾向;
            条目.服从度 = 对应NPC.服从度;
          }
          bdsmNPCs.push(条目);
        }
      }
    }
  }

  if (bdsmNPCs.length === 0) return null;

  const 主NPC = bdsmNPCs[0];
  const 权力倾向 = (主NPC.权力倾向 as string) ?? '切换者';
  const 服从度 = (主NPC.服从度 as number) ?? 50;
  const 已解锁场景 = (主NPC.已解锁SM场景 as string[]) ?? [];
  const 关系阶段 = (主NPC.BDSM关系?.阶段 as string) ?? (主NPC.阶段 as string) ?? '初识';

  const 活跃任务 = (主NPC.BDSM关系?.任务历史 as any[] | undefined)
    ?.filter((t: any) => t.状态 === '进行中' || t.状态 === '待接受') ?? [];

  const 日常指令 = (主NPC.BDSM关系?.日常指令 as any[] | undefined)
    ?.filter((d: any) => !d.是否完成)
    .map((d: any) => d.内容) ?? [];

  const 契约 = (主NPC.BDSM关系?.契约记录 as any[] | undefined)
    ?.filter((c: any) => c.状态 !== '未缔结' && c.状态 !== '已解除')?.[0];

  const 任务摘要 = 活跃任务.length > 0
    ? 活跃任务.map((t: any) => `${t.标题}(${t.类型}/${t.难度}/${t.状态})`).join('；')
    : '无活跃任务';

  const 契约摘要 = 契约
    ? `类型=${契约.类型} 状态=${契约.状态} 条款=${(契约.条款列表 as string[] | []).join('；')}`
    : '无活跃契约';

  return {
    权力倾向,
    服从度,
    已解锁SM场景: 已解锁场景,
    活跃任务摘要: 任务摘要,
    日常指令列表: 日常指令,
    契约状态摘要: 契约摘要,
    关系阶段,
    NSFW内容强度: settings.BDSM内容强度,
    启用BDSM论坛: settings.启用BDSM论坛,
    启用BDSM调教任务: settings.启用BDSM调教任务,
    启用BDSM契约系统: settings.启用BDSM契约系统,
    启用BDSM关系管线: settings.启用BDSM关系管线,
    启用BDSM多角色关系: settings.启用BDSM多角色关系,
  };
}

// ==================== 提示词构建 ====================

function 构建BDSM叙事约束(params: BDSM运行时参数): string {
  return 构建BDSM完整叙事约束({
    权力倾向: params.权力倾向 as any,
    服从度: params.服从度,
    已解锁SM场景: params.已解锁SM场景 as any[],
    活跃任务: [],
    日常指令: params.日常指令列表,
    契约状态: undefined,
  });
}

// ==================== 模块注册 ====================

const BDSM独立NSFW模块: StoryModule<BDSM系统设置, BDSM运行时参数> = {
  id: 'bdsmNSFW',
  name: 'BDSM独立NSFW',
  eraId: 'contemporary',
  version: '1.0.0',
  priority: 75,
  category: 'nsfw',
  description: '全时代可用 BDSM 独立系统：权力天平、服从度、契约、调教任务、论坛、关系管线',
  masterToggleKey: '启用BDSM独立系统',
  dependencies: [],
  defaultSettings: 默认BDSM系统设置,
  normalizeSettings: (raw) => 规范化BDSM系统设置(raw as Partial<BDSM系统设置>),
  extractPromptParams: 提取BDSM参数,
  buildPromptFragment: (params) => 构建BDSM叙事约束(params),
  responseTag: 'BDSM状态更新',
};

故事模块注册表.注册模块(BDSM独立NSFW模块);
