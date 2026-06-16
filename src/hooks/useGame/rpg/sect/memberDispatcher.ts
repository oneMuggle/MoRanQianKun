/**
 * memberDispatcher.ts
 *
 * 门派成员派遣管理 — 成员岗位分配与产出计算
 */

export interface SectMember {
  ID: string;
  名称: string;
  职位: string;
  岗位: string | null;
  能力值: number;
}

export interface PostAssignment {
  postId: string;
  postName: string;
  assignedMembers: string[];
  maxSlots: number;
}

export interface DispatchResult {
  success: boolean;
  reason?: string;
}

export interface PostOutput {
  postId: string;
  postName: string;
  totalEfficiency: number;
  dailyYield: number;
}

const POST_CONFIGS: Record<string, { maxSlots: number; baseYield: number }> = {
  '巡逻': { maxSlots: 3, baseYield: 20 },
  '建设': { maxSlots: 5, baseYield: 30 },
  '修炼': { maxSlots: 2, baseYield: 10 },
  '外交': { maxSlots: 2, baseYield: 15 },
  '后勤': { maxSlots: 3, baseYield: 25 },
};

export function assignToPost(
  assignments: PostAssignment[],
  memberId: string,
  postId: string,
): DispatchResult & { newAssignments?: PostAssignment[] } {
  const config = POST_CONFIGS[postId];
  if (!config) {
    return { success: false, reason: `未知岗位: ${postId}` };
  }

  const assignment = assignments.find((a) => a.postId === postId);
  if (!assignment) {
    return { success: false, reason: '岗位不存在' };
  }

  if (assignment.assignedMembers.length >= assignment.maxSlots) {
    return { success: false, reason: '岗位已满' };
  }

  for (const a of assignments) {
    if (a.assignedMembers.includes(memberId)) {
      return { success: false, reason: '成员已在其他岗位' };
    }
  }

  // 不可变更新：返回新的 assignments 数组
  const newAssignments = assignments.map((a) =>
    a.postId === postId
      ? { ...a, assignedMembers: [...a.assignedMembers, memberId] }
      : a,
  );

  return { success: true, newAssignments };
}

export function removeFromPost(
  assignments: PostAssignment[],
  memberId: string,
): DispatchResult & { newAssignments?: PostAssignment[] } {
  const idx = assignments.findIndex((a) => a.assignedMembers.includes(memberId));
  if (idx < 0) {
    return { success: false, reason: '成员未在任何岗位' };
  }

  // 不可变更新：返回新的 assignments 数组
  const newAssignments = assignments.map((a, i) =>
    i === idx
      ? { ...a, assignedMembers: a.assignedMembers.filter((id) => id !== memberId) }
      : a,
  );

  return { success: true, newAssignments };
}

export function calculatePostOutput(
  assignment: PostAssignment,
  members: SectMember[],
): PostOutput {
  const config = POST_CONFIGS[assignment.postId];
  const baseYield = config?.baseYield ?? 10;

  const assignedMembers = members.filter((m) =>
    assignment.assignedMembers.includes(m.ID),
  );

  const totalAbility = assignedMembers.reduce((sum, m) => sum + m.能力值, 0);
  const maxPossibleAbility = assignment.maxSlots * 100;
  const totalEfficiency = assignedMembers.length > 0
    ? Math.min(1, totalAbility / maxPossibleAbility)
    : 0;

  return {
    postId: assignment.postId,
    postName: assignment.postName,
    totalEfficiency,
    dailyYield: Math.floor(baseYield * totalEfficiency),
  };
}

export function initializePosts(): PostAssignment[] {
  return Object.entries(POST_CONFIGS).map(([id, config]) => ({
    postId: id,
    postName: id,
    assignedMembers: [],
    maxSlots: config.maxSlots,
  }));
}
