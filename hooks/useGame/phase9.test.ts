/**
 * Phase 9 单元测试 — 任务/门派引擎 + 子组件
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkTaskTransition,
  areAllObjectivesComplete,
  canAcceptTask,
} from './rpg/task/taskStateMachine';
import { distributeRewards, parseRewardDescription } from './rpg/task/rewardDistributor';
import {
  addContribution,
  spendContribution,
  calculateRank,
  getNextRankInfo,
} from './rpg/sect/contributionManager';
import { refreshMissions } from './rpg/sect/missionRefreshManager';
import {
  addFunds,
  spendFunds,
  addSupplies,
  spendSupplies,
  investConstruction,
  calculateDailyMaintenance,
} from './rpg/sect/economyManager';
import {
  initializePosts,
  assignToPost,
  removeFromPost,
  calculatePostOutput,
} from './rpg/sect/memberDispatcher';
import {
  calculatePriceMultiplier,
  calculateFinalPrice,
  calculateBatchPrices,
} from './rpg/sect/dynamicPricing';
import { RpgTaskEngine, createRpgTaskEngine } from './engine/rpgTaskEngine';
import { RpgSectEngine, createRpgSectEngine } from './engine/rpgSectEngine';
import type { 任务结构 } from '../../models/task';
import type { 角色数据结构 } from '../../models/character';
import type { 详细门派结构, 门派任务 } from '../../models/sect';

// ==================== Helpers ====================

function makePlayerCharacter(): 角色数据结构 {
  return {
    ID: 'player-1',
    力量: 15,
    敏捷: 12,
    体质: 10,
    根骨: 8,
    悟性: 10,
    福源: 5,
    当前精力: 100,
    最大精力: 100,
    当前内力: 50,
    最大内力: 50,
    当前饱腹: 80,
    最大饱腹: 100,
    当前口渴: 30,
    最大口渴: 100,
    当前生命: 100,
    最大生命: 100,
    头部当前血量: 30,
    头部最大血量: 30,
    头部状态: '正常',
    胸部当前血量: 40,
    胸部最大血量: 40,
    胸部状态: '正常',
    腹部当前血量: 35,
    腹部最大血量: 35,
    腹部状态: '正常',
    左手当前血量: 20,
    左手最大血量: 20,
    左手状态: '正常',
    右手当前血量: 20,
    右手最大血量: 20,
    右手状态: '正常',
    左腿当前血量: 25,
    左腿最大血量: 25,
    左腿状态: '正常',
    右腿当前血量: 25,
    右腿最大血量: 25,
    右腿状态: '正常',
    功法列表: [],
    当前经验: 0,
    当前等级: 1,
    境界: '初学',
    当前坐标X: 0,
    当前坐标Y: 0,
    当前负重: 0,
  } as unknown as 角色数据结构;
}

function makeTask(overrides: Partial<任务结构> = {}): 任务结构 {
  return {
    标题: '测试任务',
    描述: '这是一个测试任务',
    类型: '支线',
    发布人: 'NPC',
    发布地点: '客栈',
    推荐境界: '',
    当前状态: '进行中',
    目标列表: [
      { 描述: '目标1', 当前进度: 0, 总需进度: 1, 完成状态: false },
    ],
    奖励描述: ['获得 500 银两', '获得 200 经验'],
    ...overrides,
  };
}

function makeSect(): 详细门派结构 {
  return {
    ID: 'sect-1',
    名称: '青云门',
    简介: '正道大派',
    门规: ['不得欺压同门', '不得背叛师门'],
    门派资金: 1000,
    门派物资: 500,
    建设度: 10,
    玩家职位: '杂役弟子',
    玩家贡献: 0,
    任务列表: [],
    兑换列表: [],
    重要成员: [],
  };
}

// ==================== Task: taskStateMachine ====================

describe('taskStateMachine', () => {
  it('transitions from 进行中 to 可提交 when objectives complete', () => {
    const task = makeTask();
    const result = checkTaskTransition(task, 'objectives_complete');
    expect(result.canTransition).toBe(true);
    expect(result.nextState).toBe('可提交');
  });

  it('allows progress_update while in 进行中', () => {
    const task = makeTask();
    const result = checkTaskTransition(task, 'progress_update');
    expect(result.canTransition).toBe(true);
    expect(result.nextState).toBe('进行中');
  });

  it('transitions from 可提交 to 已完成 on submit', () => {
    const task = makeTask({ 当前状态: '可提交' });
    const result = checkTaskTransition(task, 'submit');
    expect(result.canTransition).toBe(true);
    expect(result.nextState).toBe('已完成');
  });

  it('transitions from 进行中 to 已失败 on fail', () => {
    const task = makeTask();
    const result = checkTaskTransition(task, 'fail');
    expect(result.canTransition).toBe(true);
    expect(result.nextState).toBe('已失败');
  });

  it('blocks transition from completed state', () => {
    const task = makeTask({ 当前状态: '已完成' });
    const result = checkTaskTransition(task, 'submit');
    expect(result.canTransition).toBe(false);
  });

  it('blocks invalid action', () => {
    const task = makeTask({ 当前状态: '进行中' });
    const result = checkTaskTransition(task, 'invalid_action');
    expect(result.canTransition).toBe(false);
  });

  it('detects all objectives complete', () => {
    const task = makeTask({
      目标列表: [
        { 描述: 'A', 当前进度: 1, 总需进度: 1, 完成状态: true },
        { 描述: 'B', 当前进度: 1, 总需进度: 1, 完成状态: true },
      ],
    });
    expect(areAllObjectivesComplete(task)).toBe(true);
  });

  it('detects partial objectives', () => {
    const task = makeTask({
      目标列表: [
        { 描述: 'A', 当前进度: 1, 总需进度: 1, 完成状态: true },
        { 描述: 'B', 当前进度: 0, 总需进度: 1, 完成状态: false },
      ],
    });
    expect(areAllObjectivesComplete(task)).toBe(false);
  });

  it('canAcceptTask allows new task', () => {
    const task = makeTask();
    const result = canAcceptTask(task, '大成', []);
    expect(result.canAccept).toBe(true);
  });

  it('canAcceptTask rejects duplicate', () => {
    const task = makeTask();
    const existing = makeTask({ 当前状态: '进行中' });
    const result = canAcceptTask(task, '大成', [existing]);
    expect(result.canAccept).toBe(false);
  });

  it('canAcceptTask rejects if realm too low', () => {
    const task = makeTask({ 推荐境界: '大成' });
    const result = canAcceptTask(task, '初学', []);
    expect(result.canAccept).toBe(false);
  });
});

// ==================== Task: rewardDistributor ====================

describe('rewardDistributor', () => {
  it('distributes silver and experience rewards', () => {
    const result = distributeRewards(makePlayerCharacter(), {
      silver: 500,
      experience: 200,
    });
    expect(result.success).toBe(true);
    expect(result.narrative).toContain('银两+500');
    expect(result.narrative).toContain('经验+200');
  });

  it('parses reward descriptions', () => {
    const rewards = parseRewardDescription([
      '获得 500 银两',
      '获得 200 经验',
      '获得 50 贡献',
    ]);
    expect(rewards.silver).toBe(500);
    expect(rewards.experience).toBe(200);
    expect(rewards.sectContribution).toBe(50);
  });

  it('handles empty rewards', () => {
    const result = distributeRewards(makePlayerCharacter(), {});
    expect(result.success).toBe(true);
    expect(result.narrative).toContain('无实质奖励');
  });
});

// ==================== Sect: contributionManager ====================

describe('contributionManager', () => {
  it('adds contribution', () => {
    const result = addContribution(100, 50);
    expect(result.success).toBe(true);
    expect(result.newContribution).toBe(150);
  });

  it('rejects negative contribution', () => {
    const result = addContribution(100, -10);
    expect(result.success).toBe(false);
  });

  it('spends contribution', () => {
    const result = spendContribution(100, 50);
    expect(result.success).toBe(true);
    expect(result.newContribution).toBe(50);
  });

  it('rejects spending more than available', () => {
    const result = spendContribution(100, 150);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('贡献不足');
  });

  it('calculates rank from contribution', () => {
    expect(calculateRank(0)).toBe('杂役弟子');
    expect(calculateRank(100)).toBe('外门弟子');
    expect(calculateRank(500)).toBe('内门弟子');
    expect(calculateRank(2000)).toBe('真传弟子');
    expect(calculateRank(5000)).toBe('执事');
    expect(calculateRank(15000)).toBe('长老');
    expect(calculateRank(50000)).toBe('副掌门');
    expect(calculateRank(100000)).toBe('掌门');
  });

  it('gets next rank info', () => {
    const info = getNextRankInfo(150);
    expect(info.currentRank).toBe('外门弟子');
    expect(info.nextRank).toBe('内门弟子');
    expect(info.needed).toBe(350);
  });

  it('next rank info at max rank', () => {
    const info = getNextRankInfo(100000);
    expect(info.currentRank).toBe('掌门');
    expect(info.nextRank).toBeNull();
  });
});

// ==================== Sect: missionRefreshManager ====================

describe('missionRefreshManager', () => {
  it('generates new missions for all types', () => {
    const missions = refreshMissions([], 2);
    expect(missions.length).toBe(8); // 4 types * 2
  });

  it('retains active missions', () => {
    const activeMission: 门派任务 = {
      id: 'active-1',
      类型: '日常',
      标题: '进行中任务',
      描述: '描述',
      难度: '普通',
      当前状态: '进行中',
      奖励资金: 100,
      奖励贡献: 20,
      截止日期: '2026:05:13:12:00',
      发布日期: '2026:05:12:12:00',
      刷新日期: '',
    };
    const missions = refreshMissions([activeMission], 1);
    expect(missions.length).toBe(5); // 1 active + 4 new
    expect(missions[0].id).toBe('active-1');
  });

  it('generates tasks with valid deadline format', () => {
    const missions = refreshMissions([], 1);
    for (const m of missions) {
      expect(m.截止日期).toMatch(/^\d{4}:\d{2}:\d{2}:\d{2}:\d{2}$/);
    }
  });
});

// ==================== Sect: economyManager ====================

describe('economyManager', () => {
  const initialState = { 门派资金: 1000, 门派物资: 500, 建设度: 10 };

  it('adds funds', () => {
    const result = addFunds(initialState, 200);
    expect(result.success).toBe(true);
    expect(result.newState.门派资金).toBe(1200);
  });

  it('spends funds', () => {
    const result = spendFunds(initialState, 300);
    expect(result.success).toBe(true);
    expect(result.newState.门派资金).toBe(700);
  });

  it('rejects spending more than available', () => {
    const result = spendFunds(initialState, 2000);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('资金不足');
  });

  it('adds supplies', () => {
    const result = addSupplies(initialState, 100);
    expect(result.newState.门派物资).toBe(600);
  });

  it('spends supplies', () => {
    const result = spendSupplies(initialState, 200);
    expect(result.newState.门派物资).toBe(300);
  });

  it('invests in construction', () => {
    const result = investConstruction(initialState, 500);
    expect(result.success).toBe(true);
    expect(result.newState.建设度).toBe(15); // 10 + 500/100
    expect(result.newState.门派资金).toBe(500);
  });

  it('rejects investment below threshold', () => {
    const result = investConstruction(initialState, 50);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('不足以增加建设度');
  });

  it('calculates daily maintenance', () => {
    const maint = calculateDailyMaintenance(100);
    expect(maint.income).toBe(50); // 100 * 0.5
    expect(maint.expense).toBe(30); // 100 * 0.3
    expect(maint.net).toBe(20);
  });
});

// ==================== Sect: memberDispatcher ====================

describe('memberDispatcher', () => {
  let posts: ReturnType<typeof initializePosts>;

  beforeEach(() => {
    posts = initializePosts();
  });

  it('initializes posts with correct structure', () => {
    expect(posts.length).toBe(5);
    expect(posts[0].assignedMembers).toEqual([]);
  });

  it('assigns member to post', () => {
    const result = assignToPost(posts, 'member-1', '巡逻');
    expect(result.success).toBe(true);

    posts[0].assignedMembers.push('member-1');
    expect(posts[0].assignedMembers).toContain('member-1');
  });

  it('rejects assignment when post is full', () => {
    posts[0].assignedMembers = ['m1', 'm2', 'm3'];
    const result = assignToPost(posts, 'm4', '巡逻');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('岗位已满');
  });

  it('rejects assignment when member already assigned', () => {
    posts[0].assignedMembers.push('member-1');
    const result = assignToPost(posts, 'member-1', '建设');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('成员已在其他岗位');
  });

  it('removes member from post', () => {
    posts[0].assignedMembers.push('member-1');
    const result = removeFromPost(posts, 'member-1');
    expect(result.success).toBe(true);
    expect(posts[0].assignedMembers).not.toContain('member-1');
  });

  it('calculates post output', () => {
    const members: Array<{ ID: string; 能力值: number }> = [
      { ID: 'm1', 能力值: 80 },
      { ID: 'm2', 能力值: 60 },
    ];
    posts[0].assignedMembers = ['m1', 'm2'];

    const output = calculatePostOutput(posts[0], members as any);
    expect(output.totalEfficiency).toBeGreaterThan(0);
    expect(output.totalEfficiency).toBeLessThanOrEqual(1);
  });
});

// ==================== Sect: dynamicPricing ====================

describe('dynamicPricing', () => {
  const config = { basePrice: 100, minPrice: 50, maxPrice: 200, volatility: 0.5 };

  it('returns 1.0 when demand is zero', () => {
    const mult = calculatePriceMultiplier(config, { supply: 10, demand: 0 });
    expect(mult).toBe(1.0);
  });

  it('increases price when supply < demand', () => {
    const mult = calculatePriceMultiplier(config, { supply: 5, demand: 10 });
    expect(mult).toBeGreaterThan(1.0);
  });

  it('decreases price when supply > demand', () => {
    const mult = calculatePriceMultiplier(config, { supply: 20, demand: 10 });
    expect(mult).toBeLessThan(1.0);
  });

  it('clamps multiplier between 0.5 and 2.0', () => {
    const extremeLow = calculatePriceMultiplier(config, { supply: 1, demand: 100 });
    const extremeHigh = calculatePriceMultiplier(config, { supply: 100, demand: 1 });
    expect(extremeLow).toBeGreaterThanOrEqual(0.5);
    expect(extremeHigh).toBeLessThanOrEqual(2.0);
  });

  it('calculates final price within bounds', () => {
    const price = calculateFinalPrice(config, { supply: 100, demand: 1 });
    expect(price).toBeGreaterThanOrEqual(50);
    expect(price).toBeLessThanOrEqual(200);
  });

  it('calculates batch prices', () => {
    const configs = [config, { ...config, basePrice: 200 }];
    const demands = [
      { supply: 10, demand: 10 },
      { supply: 5, demand: 10 },
    ];
    const prices = calculateBatchPrices(configs, demands);
    expect(prices.length).toBe(2);
  });
});

// ==================== Engine: RpgTaskEngine ====================

describe('RpgTaskEngine', () => {
  let engine: RpgTaskEngine;

  beforeEach(() => {
    engine = createRpgTaskEngine();
  });

  it('starts with empty task list', () => {
    expect(engine.taskList).toHaveLength(0);
  });

  it('accepts a task', () => {
    const task = makeTask();
    const result = engine.acceptTask(task, '大成');
    expect(result.success).toBe(true);
    expect(engine.taskList).toHaveLength(1);
  });

  it('rejects accepting duplicate task', () => {
    const task = makeTask();
    engine.acceptTask(task, '大成');
    const result = engine.acceptTask(task, '大成');
    expect(result.success).toBe(false);
  });

  it('updates task progress', () => {
    const task = makeTask();
    engine.acceptTask(task, '大成');
    const result = engine.updateTaskProgress('测试任务', 0);
    expect(result.success).toBe(true);
  });

  it('submits a completable task', () => {
    const task = makeTask({
      当前状态: '可提交',
      目标列表: [
        { 描述: 'A', 当前进度: 1, 总需进度: 1, 完成状态: true },
      ],
    });
    (engine as any)._taskList = [task];

    const result = engine.submitTask('测试任务', makePlayerCharacter());
    expect(result.success).toBe(true);
    expect(engine.completedTasks).toHaveLength(1);
  });

  it('fails a task', () => {
    const task = makeTask();
    engine.acceptTask(task, '大成');
    const result = engine.failTask('测试任务', '主动放弃');
    expect(result.success).toBe(true);
  });

  it('advanceTurn expires overdue tasks', () => {
    const pastDeadline = '2000:01:01:00:00';
    const task = makeTask({ 截止时间: pastDeadline });
    engine.acceptTask(task, '大成');

    const turnResult = engine.advanceTurn();
    expect(turnResult.eventsTriggered.length).toBeGreaterThan(0);
  });

  it('getSnapshot returns task state', () => {
    const task = makeTask();
    engine.acceptTask(task, '大成');
    const snapshot = engine.getSnapshot();
    expect(snapshot.engineStates.rpgTask.activeTaskCount).toBe(1);
  });

  it('reset clears all tasks', () => {
    engine.acceptTask(makeTask(), '大成');
    engine.reset();
    expect(engine.taskList).toHaveLength(0);
    expect(engine.completedTasks).toHaveLength(0);
  });
});

// ==================== Engine: RpgSectEngine ====================

describe('RpgSectEngine', () => {
  let engine: RpgSectEngine;

  beforeEach(() => {
    engine = createRpgSectEngine();
  });

  it('starts without sect data', () => {
    expect(engine.sectData).toBeNull();
  });

  it('initializes sect', () => {
    const sect = makeSect();
    const result = engine.initialize(sect);
    expect(result.success).toBe(true);
    expect(engine.sectData?.名称).toBe('青云门');
  });

  it('gains contribution', () => {
    engine.initialize(makeSect());
    const result = engine.gainContribution(150);
    expect(result.success).toBe(true);
    expect(engine.sectData?.玩家贡献).toBe(150);
  });

  it('uses contribution', () => {
    engine.initialize(makeSect());
    engine.gainContribution(200);
    const result = engine.useContribution(100);
    expect(result.success).toBe(true);
    expect(engine.sectData?.玩家贡献).toBe(100);
  });

  it('invests in construction', () => {
    engine.initialize(makeSect());
    const result = engine.investInConstruction(500);
    expect(result.success).toBe(true);
    expect(engine.sectData?.建设度).toBeGreaterThan(10);
  });

  it('refreshes tasks', () => {
    engine.initialize(makeSect());
    const result = engine.refreshTasks(1);
    expect(result.success).toBe(true);
    expect(engine.sectData?.任务列表?.length).toBe(4); // 4 types * 1
  });

  it('dispatches and recalls member', () => {
    engine.initialize(makeSect());
    const dispatch = engine.dispatchMember('m1', '巡逻');
    expect(dispatch.success).toBe(true);

    const recall = engine.recallMember('m1');
    expect(recall.success).toBe(true);
  });

  it('calculates item price', () => {
    const item = {
      id: 'item-1',
      物品名称: '丹药',
      类型: '丹药' as const,
      兑换价格: 100,
      库存: 10,
      要求职位: '外门弟子',
    };
    const price = engine.calculateItemPrice(item, { supply: 5, demand: 10 });
    expect(price).toBeGreaterThanOrEqual(50);
    expect(price).toBeLessThanOrEqual(200);
  });

  it('returns contribution info when not in sect', () => {
    const info = engine.getContributionInfo();
    expect(info.currentRank).toBe('无门派');
  });

  it('returns contribution info when in sect', () => {
    engine.initialize(makeSect());
    const info = engine.getContributionInfo();
    expect(info.currentRank).toBe('杂役弟子');
    expect(info.contribution).toBe(0);
  });

  it('daily maintenance', () => {
    engine.initialize(makeSect());
    const result = engine.dailyMaintenance();
    expect(result.success).toBe(true);
  });

  it('getSnapshot returns sect state', () => {
    engine.initialize(makeSect());
    const snapshot = engine.getSnapshot();
    expect(snapshot.engineStates.rpgSect.sectName).toBe('青云门');
  });

  it('reset clears sect data', () => {
    engine.initialize(makeSect());
    engine.reset();
    expect(engine.sectData).toBeNull();
  });
});
