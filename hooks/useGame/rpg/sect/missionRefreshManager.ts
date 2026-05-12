/**
 * missionRefreshManager.ts
 *
 * 门派任务刷新管理 — 定期刷新可接取任务列表
 */

import type { 门派任务, 门派任务类型, 门派任务状态 } from '../../../../models/sect';

const TASK_NAMES: Record<门派任务类型, string[]> = {
  '日常': ['巡逻山门', '打扫演武场', '整理藏书阁', '照料灵草园', '锻造武器', '炼制丹药'],
  '悬赏': ['剿灭山贼', '护送商队', '追捕叛徒', '探查秘境', '救援同门', '夺回失地'],
  '建设': ['修缮院墙', '扩建练功房', '加固防御阵法', '清理灵脉', '种植灵树', '搭建炼丹炉'],
  '历练': ['闯荡江湖', '拜访名门', '寻找秘籍', '试炼新功', '探索古墓', '论剑大会'],
};

const DIFFICULTY_REWARDS: Record<string, { 资金: number; 贡献: number }> = {
  '简单': { 资金: 50, 贡献: 10 },
  '普通': { 资金: 150, 贡献: 30 },
  '困难': { 资金: 300, 贡献: 80 },
  '极难': { 资金: 600, 贡献: 150 },
};

const DIFFICULTY_DEADLINES: Record<string, number> = {
  '简单': 24,
  '普通': 48,
  '困难': 72,
  '极难': 120,
};

/**
 * 生成单个任务
 */
function generateTask(
  type: 门派任务类型,
  index: number,
): 门派任务 {
  const names = TASK_NAMES[type];
  const name = names[index % names.length];
  const difficulties: Array<'简单' | '普通' | '困难' | '极难'> = ['简单', '普通', '困难', '极难'];
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const rewards = DIFFICULTY_REWARDS[difficulty];

  const now = new Date();
  const nowStr = `${now.getFullYear()}:${String(now.getMonth() + 1).padStart(2, '0')}:${String(now.getDate()).padStart(2, '0')}:${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const deadlineHours = DIFFICULTY_DEADLINES[difficulty];
  const deadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);
  const deadlineStr = `${deadline.getFullYear()}:${String(deadline.getMonth() + 1).padStart(2, '0')}:${String(deadline.getDate()).padStart(2, '0')}:${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}`;

  return {
    id: `sect-${type}-${Date.now()}-${index}`,
    类型: type,
    标题: name,
    描述: `${type}任务：${name}`,
    难度: difficulty,
    当前状态: '可接取' as 门派任务状态,
    奖励资金: rewards.资金,
    奖励贡献: rewards.贡献,
    截止日期: deadlineStr,
    发布日期: nowStr,
    刷新日期: '',
  };
}

/**
 * 刷新门派任务列表
 * 保留进行中的任务，其余替换为新任务
 */
export function refreshMissions(
  currentMissions: 门派任务[],
  missionCountPerType: number = 2,
): 门派任务[] {
  const activeMissions = currentMissions.filter(
    (m) => m.当前状态 === '进行中',
  );

  const types: 门派任务类型[] = ['日常', '悬赏', '建设', '历练'];
  const newMissions: 门派任务[] = [];

  for (const type of types) {
    for (let i = 0; i < missionCountPerType; i++) {
      newMissions.push(generateTask(type, i));
    }
  }

  return [...activeMissions, ...newMissions];
}
