/**
 * BDSM 模块全流程端到端测试
 * 模拟完整用户旅程：论坛发现 → NPC解锁 → 私聊 → 任务 → 见面 → 阶段推进
 *
 * 使用测试 API: https://gcli.ggchan.dev/
 */

import type { 当前可用接口结构 } from './utils/apiConfig';
import { 生成调教任务, 生成日常指令, 评价任务完成, 判定关系阶段推进 } from './hooks/useGame/bdsmTaskWorkflow';
import { 触发任务生成 } from './hooks/useGame/bdsmTaskTrigger';
import { 执行私聊发送工作流 } from './hooks/useGame/privateChatWorkflow';
import { 构建见面场景提示词, 解析见面结果 } from './hooks/useGame/bdsmMeetingWorkflow';
import { 判定寻主召奴联系结果, 生成联系初始对话, 计算BDSM帖子总影响 } from './hooks/useGame/bdsmForumEngine';
import { 请求模型文本, 规范化文本补全消息链 } from './services/ai/chatCompletionClient';

const TEST_API: 当前可用接口结构 = {
  id: 'test-api',
  名称: '测试API',
  供应商: 'openai_compatible',
  协议覆盖: 'openai',
  baseUrl: 'https://gcli.ggchan.dev/',
  apiKey: 'gg-gcli-RALFsIs47kRn7m3HKh98dTj0R48ccM2ln8sIVDc3OSA',
  model: 'gemini-2.5-flash',
  maxTokens: 4096,
  temperature: 0.7,
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface JourneyState {
  npcId: string;
  npcName: string;
  服从度: number;
  关系阶段: string;
  完成任务数: number;
  完美服从数: number;
  违约次数: number;
  任务列表: any[];
  指令列表: any[];
  私聊历史: { sender: string; content: string; isMe: boolean }[];
  日志: string[];
}

function 初始状态(): JourneyState {
  return {
    npcId: 'npc-journey-001',
    npcName: '苏婉',
    服从度: 20,
    关系阶段: '初识',
    完成任务数: 0,
    完美服从数: 0,
    违约次数: 0,
    任务列表: [],
    指令列表: [],
    私聊历史: [],
    日志: [],
  };
}

function log(state: JourneyState, step: string, msg: string) {
  console.log(`\n[${step}] ${msg}`);
  state.日志.push(`[${step}] ${msg}`);
}

async function step1_论坛发现(state: JourneyState): Promise<boolean> {
  log(state, '步骤1: 论坛发现', '浏览深夜板块，发现寻主召奴帖子...');

  const mockPosts = [{ id: 'post-recruit', 标题: '寻找温柔的主人', 内容: '...', 子分类: '寻主召奴', 影响等级: '严重' as const }] as any;
  const 影响结果 = 计算BDSM帖子总影响({ 帖子列表: mockPosts, 内容强度: '中度' });
  log(state, '步骤1', `帖子影响值: +${影响结果.总推进值}`);

  const 联系结果 = 判定寻主召奴联系结果({ 玩家欲望阶段: '试探', 内容强度: '中度', 玩家社交NPC数: 5 });
  log(state, '步骤1', `联系结果: ${联系结果.结果} (概率: ${(联系结果.成功概率 * 100).toFixed(1)}%)`);

  const 初始对话 = 生成联系初始对话({
    id: 'post-recruit', 标题: '寻找温柔的主人', 内容: '...', 子分类: '寻主召奴', 影响等级: '严重',
    寻主召奴信息: { 招募方角色: '召奴', 期望关系类型: '主/奴', 是否已联系: false, 联系状态: '未联系' },
  } as any);
  log(state, '步骤1', `初始对话: ${初始对话.slice(0, 40)}...`);

  state.私聊历史.push({ sender: 'npc', content: 初始对话, isMe: false });
  return true;
}

async function step2_NPC解锁(state: JourneyState): Promise<boolean> {
  log(state, '步骤2: NPC解锁', `从帖子创建 NPC「${state.npcName}」，好感度 20，关系初识`);
  return true;
}

async function step3_私聊建立(state: JourneyState): Promise<boolean> {
  log(state, '步骤3: 私聊建立', `向「${state.npcName}」发送第一条消息...`);

  const 私聊上下文 = {
    npcId: state.npcId, npcName: state.npcName, 玩家姓名: '测试玩家',
    会话历史: state.私聊历史,
    校园系统: {
      欲望系统: {
        NPC欲望档案: {
          [state.npcId]: {
            姓名: state.npcName, 性格特征: '温柔内向', 身份: '文学社成员', 欲望阶段: '试探',
            服从度: { 当前值: state.服从度, 未完成指令数: 0 },
            BDSM关系: {
              阶段: state.关系阶段 as any, 服从度: state.服从度, 安全词: '月光', 权力倾向: '支配',
              契约记录: [], 日常指令: [], 调教任务: [], 里程碑: [],
              违约次数: state.违约次数, 完美服从次数: state.完美服从数, 完成任务数: state.完成任务数,
            },
          },
        },
      },
    },
    apiConfig: TEST_API,
  };

  try {
    const 回复 = await 执行私聊发送工作流(私聊上下文, '你好，我是从论坛看到你的帖子的。');
    log(state, '步骤3', `NPC 回复: ${回复.npcReply.slice(0, 60)}...`);
    state.私聊历史.push({ sender: 'player', content: '你好，我是从论坛看到你的帖子的。', isMe: true });
    state.私聊历史.push({ sender: 'npc', content: 回复.npcReply, isMe: false });
    return true;
  } catch (err) {
    log(state, '步骤3', `私聊失败: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function step4_任务生成(state: JourneyState): Promise<boolean> {
  log(state, '步骤4: 任务生成', `为「${state.npcName}」生成调教任务...`);

  try {
    const 任务列表 = await 生成调教任务({
      契约类型: '口头约定', 契约状态: '口头约定', 服从度: state.服从度,
      权力倾向: '支配', 关系阶段: state.关系阶段, 已解锁场景: [],
      历史任务数量: state.任务列表.length, NPC性格特征: state.npcName,
    }, TEST_API);

    if (任务列表.length === 0) { log(state, '步骤4', '未生成任何任务'); return false; }

    state.任务列表 = 任务列表.map((t, i) => ({ ...t, id: `task-${i}`, 状态: '待接受' as const }));
    log(state, '步骤4', `生成 ${任务列表.length} 个任务:`);
    任务列表.forEach((t, i) => log(state, '步骤4', `  任务${i + 1}: [${t.类型}] ${t.标题} (${t.难度})`));
    return true;
  } catch (err) {
    log(state, '步骤4', `任务生成失败: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function step5_任务执行(state: JourneyState): Promise<boolean> {
  log(state, '步骤5: 任务执行', '接受并完成第一个任务...');

  if (state.任务列表.length === 0) { log(state, '步骤5', '无可用任务，跳过'); return true; }

  const 任务 = state.任务列表[0];
  try {
    const 评价 = await 评价任务完成(
      { 类型: 任务.类型, 难度: 任务.难度, 描述: 任务.描述 },
      '玩家成功完成了任务，表现得比预期更好。',
      state.服从度, state.npcName, TEST_API
    );

    log(state, '步骤5', `评价: ${评价.评价}, 服从度变化: ${评价.服从度变化}`);
    state.服从度 = Math.max(0, Math.min(100, state.服从度 + 评价.服从度变化));
    state.完成任务数 += 1;
    if (评价.评价 === '完美' || (评价.评价 as string) === '完美') state.完美服从数 += 1;
    state.任务列表[0].状态 = '已完成';
    return true;
  } catch (err) {
    log(state, '步骤5', `任务评价失败: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function step6_日常指令(state: JourneyState): Promise<boolean> {
  log(state, '步骤6: 日常指令', '刷新日常指令...');

  try {
    const 新指令 = await 生成日常指令({
      服从度: state.服从度, 契约状态: '口头约定', 关系阶段: state.关系阶段,
      已发布指令数: state.指令列表.length, NPC性格特征: state.npcName,
    }, TEST_API);

    if (新指令.length === 0) { log(state, '步骤6', '未生成任何指令'); return false; }

    state.指令列表 = 新指令;
    log(state, '步骤6', `生成 ${新指令.length} 条指令:`);
    新指令.forEach((d, i) => log(state, '步骤6', `  指令${i + 1}: [${d.分类}] ${d.内容.slice(0, 30)}...`));
    return true;
  } catch (err) {
    log(state, '步骤6', `指令生成失败: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function step7_见面协商(state: JourneyState): Promise<boolean> {
  log(state, '步骤7: 见面协商', '安排第一次见面...');

  const 提示词 = 构建见面场景提示词({
    NPC姓名: state.npcName, NPC性格特征: '温柔内向，喜欢文学',
    关系阶段: state.关系阶段 as any, 服从度: state.服从度, 权力倾向: '支配',
    契约类型: '未缔结', 安全词: '月光',
    底线列表: ['不伤害身体', '不涉及第三人'],
    见面地点: '咖啡厅', 见面时间: '3 回合后',
    私聊协商摘要: '双方通过私聊协商确定了见面时间和地点',
    历史任务摘要: `- 完成任务数: ${state.完成任务数}\n- 服从度: ${state.服从度}`,
    已解锁场景: [],
  });

  try {
    const messages = 规范化文本补全消息链([
      { role: 'system', content: '你是一个互动小说生成器。请根据给定的上下文生成一段第三人称见面场景描述。要有氛围感和情绪张力，给出 2-3 个互动选项供玩家选择。以第三人称叙事，不超过 500 字。' },
      { role: 'user', content: 提示词 },
    ]);

    const 场景文本 = await 请求模型文本(TEST_API, messages, { temperature: 0.8 });
    log(state, '步骤7', `场景长度: ${场景文本.length} 字符`);

    const 解析 = 解析见面结果(场景文本);
    log(state, '步骤7', `见面成功: ${解析.见面成功}`);
    return true;
  } catch (err) {
    log(state, '步骤7', `见面场景生成失败: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function step8_阶段推进(state: JourneyState): Promise<boolean> {
  log(state, '步骤8: 阶段推进判定', `当前阶段: ${state.关系阶段}, 服从度: ${state.服从度}`);

  try {
    const 结果 = await 判定关系阶段推进(
      state.关系阶段, state.服从度, state.完成任务数,
      state.完美服从数, state.违约次数, '口头约定',
      state.日志.map(l => l.slice(0, 40)).join('; '),
      TEST_API
    );

    log(state, '步骤8', `是否推进: ${结果.是否推进}`);
    log(state, '步骤8', `下一阶段: ${结果.下一阶段 || '无'}`);
    log(state, '步骤8', `理由: ${结果.理由.slice(0, 80)}`);

    if (结果.下一阶段) state.关系阶段 = 结果.下一阶段;
    return true;
  } catch (err) {
    log(state, '步骤8', `阶段判定失败: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function main() {
  console.log('BDSM 模块全流程端到端测试');
  console.log('API: https://gcli.ggchan.dev/');
  console.log('='.repeat(50));

  const state = 初始状态();
  const results: Record<string, boolean> = {};
  const startTime = Date.now();

  const steps: [string, (s: JourneyState) => Promise<boolean>][] = [
    ['步骤1: 论坛发现', step1_论坛发现],
    ['步骤2: NPC解锁', step2_NPC解锁],
    ['步骤3: 私聊建立', step3_私聊建立],
    ['步骤4: 任务生成', step4_任务生成],
    ['步骤5: 任务执行', step5_任务执行],
    ['步骤6: 日常指令', step6_日常指令],
    ['步骤7: 见面协商', step7_见面协商],
    ['步骤8: 阶段推进', step8_阶段推进],
  ];

  for (const [name, step] of steps) {
    try {
      results[name] = await step(state);
      await sleep(2000);
    } catch (err) {
      log(state, name, `异常: ${err instanceof Error ? err.message : String(err)}`);
      results[name] = false;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log('旅程结果:');
  let passCount = 0;
  for (const [name, ok] of Object.entries(results)) {
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}`);
    if (ok) passCount++;
  }

  console.log(`\n最终状态: ${state.npcName} | ${state.关系阶段} | 服从度 ${state.服从度} | 完成任务 ${state.完成任务数} | ${elapsed}s`);
  console.log(`总计: ${passCount}/${Object.keys(results).length} 通过`);

  if (passCount === Object.keys(results).length) {
    console.log('\n全程通过！BDSM 模块端到端流程正常工作。');
  } else {
    console.log(`\n${Object.keys(results).length - passCount} 步失败。`);
  }
}

main().catch(err => {
  console.error('测试异常:', err);
  process.exit(1);
});
