/**
 * BDSM 模块 AI 工作流测试脚本
 * 使用测试 API: https://gcli.ggchan.dev/
 * 验证 5 个核心函数的 AI 调用路径
 */

import { 生成调教任务, 生成日常指令, 评价任务完成, 生成契约条款, 判定关系阶段推进 } from './hooks/useGame/bdsmTaskWorkflow';
import type { 当前可用接口结构 } from './utils/apiConfig';
import { 生成设备原始消息, 解析AIBDSM帖子 } from './hooks/useGame/deviceAiWorkflow';
import { 计算BDSM帖子总影响, 应用BDSM帖子影响, 判定寻主召奴联系结果, 生成联系初始对话 } from './hooks/useGame/bdsmForumEngine';
import { 构建见面场景提示词, 解析见面结果 } from './hooks/useGame/bdsmMeetingWorkflow';
import { 请求模型文本 } from './services/ai/chatCompletionClient';

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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test1_生成调教任务() {
  console.log('\n========== 测试 1: 生成调教任务 ==========');
  try {
    const 结果 = await 生成调教任务({
      契约类型: '口头约定',
      契约状态: '口头约定',
      服从度: 30,
      权力倾向: '支配',
      关系阶段: '试探',
      已解锁场景: [],
      历史任务数量: 2,
      NPC性格特征: '苏婉',
    }, TEST_API);

    if (结果.length === 0) {
      console.log('FAIL: 未返回任何任务');
      return false;
    }

    console.log(`OK: 生成 ${结果.length} 个任务`);
    结果.forEach((t, i) => {
      console.log(`  任务 ${i + 1}: [${t.类型}] ${t.标题} (难度: ${t.难度})`);
    });

    const 无效任务 = 结果.filter(t => !t.类型 || !t.标题 || !t.描述 || !t.难度);
    if (无效任务.length > 0) {
      console.log(`WARN: ${无效任务.length} 个任务缺少必填字段`);
      return false;
    }
    console.log('PASS: 所有字段完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test2_生成日常指令() {
  console.log('\n========== 测试 2: 生成日常指令 ==========');
  try {
    // 直接调用 workflow
    const 结果 = await 生成日常指令({
      服从度: 45,
      契约状态: '口头约定',
      关系阶段: '确立',
      已发布指令数: 0,
      NPC性格特征: '苏婉',
    }, TEST_API);

    if (结果.length === 0) {
      console.log('FAIL: 未返回任何指令（可能是 JSON 提取失败或解析失败）');
      return false;
    }

    console.log(`OK: 生成 ${结果.length} 条指令`);
    结果.forEach((item, i) => {
      console.log(`  指令 ${i + 1}: [${item.分类}] ${item.内容} (持续: ${item.持续时间})`);
    });

    const 无效指令 = 结果.filter(i => !i.内容 || !i.分类 || !i.持续时间);
    if (无效指令.length > 0) {
      console.log(`WARN: ${无效指令.length} 条指令缺少必填字段`);
      return false;
    }
    console.log('PASS: 所有字段完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test3_评价任务完成() {
  console.log('\n========== 测试 3: 评价任务完成 ==========');
  try {
    const 结果 = await 评价任务完成(
      { 类型: '服从测试', 难度: '初级', 描述: '在公共场合保持沉默十分钟' },
      '玩家成功完成了任务，虽然有些犹豫但最终做到了',
      45,
      '苏婉',
      TEST_API
    );

    console.log(`OK: 评价 = ${结果.评价}, 服从度变化 = ${结果.服从度变化}`);
    console.log(`  反馈: ${结果.反馈}`);
    console.log(`  后续影响: ${结果.后续影响}`);

    if (!结果.评价 || 结果.服从度变化 === undefined) {
      console.log('FAIL: 缺少评价或服从度变化');
      return false;
    }
    console.log('PASS: 评价完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test4_生成契约条款() {
  console.log('\n========== 测试 4: 生成契约条款 ==========');
  try {
    const 结果 = await 生成契约条款(
      '书面契约',
      '确立',
      60,
      '支配',
      ['不伤害身体', '不涉及第三人', '保持学业优先'],
      TEST_API
    );

    console.log(`OK: 生成 ${结果.条款.length} 条条款`);
    结果.条款.forEach((c, i) => {
      console.log(`  条款 ${i + 1}: ${c}`);
    });
    console.log(`  安全词: ${结果.安全词}`);
    console.log(`  有效期: ${结果.有效期}`);
    console.log(`  双方义务: ${结果.双方义务}`);

    if (结果.条款.length === 0) {
      console.log('FAIL: 未返回任何条款');
      return false;
    }
    console.log('PASS: 契约完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test5_判定关系阶段推进() {
  console.log('\n========== 测试 5: 判定关系阶段推进 ==========');
  try {
    const 结果 = await 判定关系阶段推进(
      '试探',
      55,
      6,
      2,
      0,
      '口头约定',
      '最近互动良好，双方信任度提升',
      TEST_API
    );

    console.log(`是否推进: ${结果.是否推进}`);
    console.log(`下一阶段: ${结果.下一阶段 || '无'}`);
    console.log(`理由: ${结果.理由}`);
    console.log(`未满足条件: ${(结果.未满足条件 || []).join(', ') || '全部满足'}`);

    console.log('PASS: 阶段判定完成');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test6_论坛帖子生成解析() {
  console.log('\n========== 测试 6: 论坛帖子生成 + 解析 ==========');
  try {
    const rawItems = await 生成设备原始消息({
      eraId: 'contemporary_campus',
      mode: 'li',
      appType: 'bdsn',
      context: { 当前场景: '校园日常', 角色名: '测试玩家', 当前位置: '', 世界状态: '' },
      count: 5,
    }, TEST_API, TEST_API, 5);

    if (!rawItems || rawItems.length === 0) {
      console.log('FAIL: 未返回任何原始消息');
      return false;
    }
    console.log(`OK: AI 返回 ${rawItems.length} 条原始消息`);

    const 帖子列表 = 解析AIBDSM帖子(rawItems);
    if (帖子列表.length === 0) {
      console.log('FAIL: 解析后无有效帖子');
      return false;
    }

    console.log(`OK: 解析出 ${帖子列表.length} 个 BDSM 帖子`);
    帖子列表.forEach((p, i) => {
      console.log(`  帖子 ${i + 1}: [${p.子分类 || '未分类'}] ${p.标题?.slice(0, 30) || '(无标题)'} (影响: ${p.影响等级 || '未知'})`);
      if (p.寻主召奴信息) {
        console.log(`    -> 寻主召奴: ${p.寻主召奴信息.招募方角色 || '未指定'}`);
      }
    });

    const 无效帖子 = 帖子列表.filter(p => !p.标题 && !p.内容);
    if (无效帖子.length > 0) {
      console.log(`WARN: ${无效帖子.length} 个帖子缺少标题和内容`);
    }
    console.log('PASS: 论坛帖子生成 + 解析完成');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test7_论坛影响计算() {
  console.log('\n========== 测试 7: 论坛影响计算 ==========');
  try {
    // 模拟 3 个不同影响等级的帖子
    const mockPosts = [
      { id: 'post-1', 标题: '匿名讨论贴', 内容: '讨论内容', 子分类: '匿名讨论' as const, 影响等级: '轻微' as const },
      { id: 'post-2', 标题: '经验分享', 内容: '分享内容', 子分类: '经验交流' as const, 影响等级: '中等' as const },
      { id: 'post-3', 标题: '寻主贴', 内容: '寻主内容', 子分类: '寻主召奴' as const, 影响等级: '严重' as const,
        寻主召奴信息: { 招募方角色: '召奴' as const, 期望关系类型: '主/奴', 是否已联系: false, 联系状态: '未联系' as const, 解锁NPC姓名: '测试NPC' } },
    ] as any;

    const 影响结果 = 计算BDSM帖子总影响({ 帖子列表: mockPosts, 内容强度: '中度' });
    console.log(`总推进值: ${影响结果.总推进值}`);
    影响结果.影响明细.forEach((d, i) => {
      console.log(`  影响 ${i + 1}: ${d.帖子ID} -> +${d.推进值}`);
    });

    // 模拟应用影响到 NPC 档案
    const mockNpcProfile = {
      姓名: '测试NPC',
      服从度: { 当前值: 30, 未完成指令数: 0 },
      BDSM关系: { 阶段: '初识' as const, 服从度: 30, 安全词: '月光', 权力倾向: '支配', 契约记录: [] },
      欲望阶段: '探索期',
    };

    const 应用结果 = 应用BDSM帖子影响({ NPC档案: mockNpcProfile as any, 推进值: 影响结果.总推进值 });
    console.log(`应用后服从度: ${应用结果.更新后档案.BDSM关系?.服从度 || 应用结果.更新后档案.服从度?.当前值 || 'N/A'}`);
    if (应用结果.阶段升级) {
      console.log(`阶段升级: ${应用结果.阶段升级}`);
    }

    console.log('PASS: 论坛影响计算完成');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test8_寻主召奴联系判定() {
  console.log('\n========== 测试 8: 寻主召奴联系判定 ==========');
  try {
    const 联系结果 = 判定寻主召奴联系结果({ 玩家欲望阶段: '试探' as any, 内容强度: '中度', 玩家社交NPC数: 3 });
    console.log(`联系结果: ${联系结果.结果}`);
    console.log(`成功概率: ${联系结果.成功概率}%`);

    // 模拟一个寻主召奴帖子
    const mockPost = {
      id: 'post-contact',
      标题: '寻找主人',
      内容: '希望能找到一位温柔的主人...',
      子分类: '寻主召奴' as const,
      影响等级: '严重' as const,
      寻主召奴信息: {
        招募方角色: '召奴' as const,
        期望关系类型: '主/奴',
        是否已联系: false,
        联系状态: '未联系' as const,
        解锁NPC姓名: '苏婉',
      },
    } as any;

    const 初始对话 = 生成联系初始对话(mockPost);
    console.log(`初始对话: ${初始对话?.slice(0, 50) || '(空)'}`);

    if (!初始对话 || 初始对话.length === 0) {
      console.log('FAIL: 初始对话为空');
      return false;
    }
    console.log('PASS: 寻主召奴联系判定完成');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test9_私聊工作流() {
  console.log('\n========== 测试 9: 私聊工作流 ==========');
  try {
    const 执行私聊发送工作流 = (await import('./hooks/useGame/privateChatWorkflow')).执行私聊发送工作流;

    const 私聊上下文 = {
      npcId: 'npc-test-001',
      npcName: '苏婉',
      玩家姓名: '测试玩家',
      会话历史: [
        { sender: 'npc', content: '你好，我是苏婉。', isMe: false },
        { sender: 'player', content: '最近怎么样？', isMe: true },
      ],
      校园系统: {
        欲望系统: {
          NPC欲望档案: {
            'npc-test-001': {
              姓名: '苏婉',
              性格特征: '温柔内向',
              身份: '文学社成员',
              欲望阶段: '探索期',
              服从度: { 当前值: 40, 未完成指令数: 1 },
              BDSM关系: {
                阶段: '试探',
                服从度: 40,
                安全词: '月光',
                权力倾向: '支配',
                契约记录: [],
                日常指令: [{ 内容: '保持礼貌', 分类: '行为', 持续时间: '长期', 是否完成: false, 奖励提示: '好感度提升', 惩罚提示: '服从度下降' }],
                调教任务: [],
                里程碑: [],
                违约次数: 0,
                完美服从次数: 0,
                完成任务数: 3,
              },
            },
          },
        },
      },
      apiConfig: TEST_API,
    };

    const 回复结果 = await 执行私聊发送工作流(私聊上下文, '我们来聊聊契约的事吧');
    console.log(`NPC 回复: ${回复结果.npcReply?.slice(0, 80) || '(空)'}`);
    if (回复结果.状态更新) {
      console.log(`状态更新: ${JSON.stringify(回复结果.状态更新).slice(0, 100)}`);
    }

    if (!回复结果.npcReply || 回复结果.npcReply.length === 0) {
      console.log('FAIL: NPC 回复为空');
      return false;
    }
    console.log('PASS: 私聊工作流完成');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test10_见面场景生成() {
  console.log('\n========== 测试 10: 见面场景生成 ==========');
  try {
    const 提示词 = 构建见面场景提示词({
      NPC姓名: '苏婉',
      NPC性格特征: '温柔内向，喜欢文学',
      关系阶段: '确立',
      服从度: 60,
      权力倾向: '支配',
      契约类型: '书面契约',
      契约条款: ['使用特定称呼', '保守关系秘密', '每周至少见面一次'],
      安全词: '月光',
      底线列表: ['不伤害身体', '不涉及第三人'],
      见面地点: '图书馆花园',
      见面时间: '3 回合后',
      私聊协商摘要: '双方协商确定了见面时间和地点',
      历史任务摘要: '- 完成服从测试任务 x3\n- 日常指令完成率 80%',
      已解锁场景: ['服从测试', '角色扮演'],
    });

    console.log(`提示词长度: ${提示词.length} 字符`);
    console.log(`提示词预览: ${提示词.slice(0, 100)}...`);

    // 调用 AI 生成见面场景
    const { 规范化文本补全消息链 } = await import('./services/ai/chatCompletionClient');
    const messages = 规范化文本补全消息链([
      {
        role: 'system',
        content: '你是一个互动小说生成器。请根据给定的上下文生成一段第三人称见面场景描述。要有氛围感和情绪张力，给出 2-3 个互动选项。',
      },
      { role: 'user', content: 提示词 },
    ]);

    const 场景文本 = await 请求模型文本(TEST_API, messages, { temperature: 0.8 });
    console.log(`场景文本长度: ${场景文本.length} 字符`);
    console.log(`场景预览: ${场景文本.slice(0, 120)}...`);

    const 解析结果 = 解析见面结果(场景文本);
    console.log(`见面成功: ${解析结果.见面成功}`);
    console.log(`服从度变化: ${解析结果.服从度变化 || '无'}`);
    console.log(`场景描述长度: ${解析结果.场景描述?.length || 0} 字符`);

    if (!解析结果.场景描述 || 解析结果.场景描述.length === 0) {
      console.log('FAIL: 场景描述为空');
      return false;
    }
    console.log('PASS: 见面场景生成完成');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function main() {
  console.log('BDSM 模块全流程测试');
  console.log('API: https://gcli.ggchan.dev/');
  console.log('='.repeat(50));

  const results: Record<string, boolean> = {};

  results['测试1_生成调教任务'] = await test1_生成调教任务();
  await sleep(3000);

  results['测试2_生成日常指令'] = await test2_生成日常指令();
  await sleep(3000);

  results['测试3_评价任务完成'] = await test3_评价任务完成();
  await sleep(3000);

  results['测试4_生成契约条款'] = await test4_生成契约条款();
  await sleep(3000);

  results['测试5_判定关系阶段推进'] = await test5_判定关系阶段推进();
  await sleep(3000);

  results['测试6_论坛帖子生成解析'] = await test6_论坛帖子生成解析();
  await sleep(3000);

  results['测试7_论坛影响计算'] = await test7_论坛影响计算();
  await sleep(1000);

  results['测试8_寻主召奴联系判定'] = await test8_寻主召奴联系判定();
  await sleep(1000);

  results['测试9_私聊工作流'] = await test9_私聊工作流();
  await sleep(3000);

  results['测试10_见面场景生成'] = await test10_见面场景生成();

  console.log('\n' + '='.repeat(50));
  console.log('测试结果汇总:');
  let passCount = 0;
  for (const [name, ok] of Object.entries(results)) {
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}`);
    if (ok) passCount++;
  }
  console.log(`总计: ${passCount}/${Object.keys(results).length} 通过`);

  if (passCount === Object.keys(results).length) {
    console.log('\n所有测试通过！BDSM 模块全流程 AI 调用路径正常工作。');
  } else {
    console.log(`\n${Object.keys(results).length - passCount} 个测试失败。`);
  }
}

main().catch(err => {
  console.error('测试脚本执行异常:', err);
  process.exit(1);
});
