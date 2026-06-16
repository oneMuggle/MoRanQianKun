// 人物关系谱数据模型

// ── 关系分类 ──
export type 关系分类 =
  | '亲情'
  | '友情'
  | '爱情'
  | '敌对'
  | '师徒'
  | '同门'
  | '主从'
  | '恩仇'
  | '陌路';

export const 关系分类颜色: Record<关系分类, string> = {
  '亲情': '#FFB6C1',
  '友情': '#4A90D9',
  '爱情': '#E74C3C',
  '敌对': '#8B0000',
  '师徒': '#F5A623',
  '同门': '#50C878',
  '主从': '#9B59B6',
  '恩仇': '#E67E22',
  '陌路': '#95A5A6',
};

export const 关系分类图标: Record<关系分类, string> = {
  '亲情': '👨‍👩‍👧',
  '友情': '🤝',
  '爱情': '❤️',
  '敌对': '⚔️',
  '师徒': '📖',
  '同门': '🏯',
  '主从': '👑',
  '恩仇': '⛓️',
  '陌路': '🚶',
};

// ── 关系阶段（递进式） ──
export type 关系谱阶段 =
  | '素未谋面'
  | '初识'
  | '点头之交'
  | '熟识'
  | '挚交'
  | '知己'
  | '生死之交';

export const 关系谱阶段顺序: 关系谱阶段[] = ['素未谋面', '初识', '点头之交', '熟识', '挚交', '知己', '生死之交'];

export const 关系谱阶段阈值 = {
  '素未谋面': 0,
  '初识': 5,
  '点头之交': 15,
  '熟识': 30,
  '挚交': 50,
  '知己': 70,
  '生死之交': 90,
};

// ── 关系事件类型 ──
export type 关系事件类型 =
  | '初识'
  | '对话'
  | '赠礼'
  | '相助'
  | '冲突'
  | '结缘'
  | '决裂'
  | '突破'
  | '其他';

export const 关系事件图标: Record<关系事件类型, string> = {
  '初识': '🌱',
  '对话': '💬',
  '赠礼': '🎁',
  '相助': '🤲',
  '冲突': '⚡',
  '结缘': '💫',
  '决裂': '💔',
  '突破': '🌟',
  '其他': '📝',
};

// ── 关系事件记录（时间线条目） ──
export interface 关系事件记录 {
  id: string;
  时间: string;
  事件类型: 关系事件类型;
  标题: string;
  描述: string;
  好感度变化?: number;
  亲密度变化?: number;
  信任度变化?: number;
  感情值变化?: number;
}

// ── 关系网络中的一条边 ──
export interface 人物关系边 {
  id: string;
  主体姓名: string;
  客体姓名: string;
  客体ID?: string;
  关系分类: 关系分类;
  关系阶段: 关系谱阶段;
  关系描述: string;
  好感度: number;
  亲密度: number;
  信任度: number;
  感情值: number;
  互动次数: number;
  最近互动时间?: string;
  事件记录: 关系事件记录[];
  双向关系?: boolean;
}

// ── 完整的关系网络 ──
export interface 关系网络数据 {
  主角姓名: string;
  关系边列表: 人物关系边[];
  最后更新时间: string;
}

// ── 图谱数据结构（用于可视化） ──
export interface 图谱节点 {
  id: string;
  姓名: string;
  性别?: '男' | '女';
  是主角: boolean;
  x: number;
  y: number;
}

export interface 图谱边 {
  id: string;
  source: string;
  target: string;
  关系分类: 关系分类;
  关系阶段: 关系谱阶段;
  关系描述: string;
  好感度: number;
}

// ── 工具函数 ──

/** 根据综合分数计算关系阶段 */
export const 计算关系谱阶段 = (好感度: number, 亲密度: number, 信任度: number, 感情值: number): 关系谱阶段 => {
  const 综合分 = (好感度 + 亲密度 + 信任度 + 感情值) / 4;
  for (let i = 关系谱阶段顺序.length - 1; i >= 0; i--) {
    const 阶段 = 关系谱阶段顺序[i];
    if (!阶段) continue;
    const 阈值 = 关系谱阶段阈值[阶段];
    if (综合分 >= 阈值) return 阶段;
  }
  return '素未谋面';
};

/** 根据现有关系状态文本推断关系分类 */
export const 推断关系分类 = (关系状态: string, 好感度: number): 关系分类 => {
  const text = 关系状态 || '';
  if (text.includes('仇') || text.includes('敌') || text.includes('恨')) return '敌对';
  if (text.includes('师') || text.includes('徒') || text.includes('师傅')) return '师徒';
  if (text.includes('同门') || text.includes('师兄') || text.includes('师妹')) return '同门';
  if (text.includes('主') || text.includes('仆') || text.includes('从')) return '主从';
  if (text.includes('夫妻') || text.includes('恋人') || text.includes('情人') || text.includes('爱')) return '爱情';
  if (text.includes('亲') || text.includes('父子') || text.includes('母子') || text.includes('兄妹') || text.includes('姐妹') || text.includes('兄弟') || text.includes('家族')) return '亲情';
  if (text.includes('恩') || text.includes('报') || text.includes('债')) return '恩仇';
  if (好感度 >= 60) return '友情';
  if (好感度 >= 20) return '陌路';
  return '陌路';
};

/** 生成关系边 ID */
export const 生成关系边ID = (主体: string, 客体: string): string => `${主体}->${客体}`;

/** 创建默认关系网络 */
export const 创建默认关系网络 = (主角姓名: string): 关系网络数据 => ({
  主角姓名,
  关系边列表: [],
  最后更新时间: new Date().toISOString(),
});

/** 创建人物关系边 */
export const 创建人物关系边 = (
  主体姓名: string,
  客体姓名: string,
  客体ID?: string,
  关系分类?: 关系分类,
  关系阶段?: 关系谱阶段,
  关系描述?: string,
): 人物关系边 => ({
  id: 生成关系边ID(主体姓名, 客体姓名),
  主体姓名,
  客体姓名,
  ...(客体ID !== undefined && { 客体ID }),
  关系分类: 关系分类 || '陌路',
  关系阶段: 关系阶段 || '素未谋面',
  关系描述: 关系描述 || '',
  好感度: 0,
  亲密度: 0,
  信任度: 0,
  感情值: 0,
  互动次数: 0,
  事件记录: [],
});

/** 获取关系摘要 */
export const 获取关系摘要 = (边: 人物关系边): string => {
  const 阶段 = 边.关系阶段;
  const 分类 = 边.关系分类;
  const 描述 = 边.关系描述 ? `（${边.关系描述}）` : '';
  return `${分类} · ${阶段}${描述}`;
};

/** 验证关系边数据完整性 */
export const 验证关系边 = (边: 人物关系边): boolean => {
  if (!边.主体姓名 || !边.客体姓名) return false;
  if (!关系分类颜色[边.关系分类]) return false;
  if (!关系谱阶段顺序.includes(边.关系阶段)) return false;
  if (边.好感度 < 0 || 边.好感度 > 100) return false;
  if (边.亲密度 < 0 || 边.亲密度 > 100) return false;
  if (边.信任度 < 0 || 边.信任度 > 100) return false;
  if (边.感情值 < 0 || 边.感情值 > 100) return false;
  return true;
};

/** 根据关系边列表构建图谱数据（节点和边） */
export const 将关系网络转为图谱数据 = (
  网络: 关系网络数据,
  性别映射?: Map<string, '男' | '女'>,
): { nodes: 图谱节点[]; edges: 图谱边[] } => {
  const nodeMap = new Map<string, 图谱节点>();
  const edges: 图谱边[] = [];

  // 确保主角节点存在
  nodeMap.set(网络.主角姓名, {
    id: 网络.主角姓名,
    姓名: 网络.主角姓名,
    是主角: true,
    x: 0,
    y: 0,
  });

  // 从关系边构建节点和边
  for (const 边 of 网络.关系边列表) {
    if (!nodeMap.has(边.主体姓名)) {
      const 主体性别 = 性别映射?.get(边.主体姓名);
      nodeMap.set(边.主体姓名, {
        id: 边.主体姓名,
        姓名: 边.主体姓名,
        是主角: false,
        ...(主体性别 !== undefined && { 性别: 主体性别 }),
        x: 0,
        y: 0,
      });
    }

    if (!nodeMap.has(边.客体姓名)) {
      const 客体性别 = 性别映射?.get(边.客体姓名);
      nodeMap.set(边.客体姓名, {
        id: 边.客体姓名,
        姓名: 边.客体姓名,
        是主角: false,
        ...(客体性别 !== undefined && { 性别: 客体性别 }),
        x: 0,
        y: 0,
      });
    }

    edges.push({
      id: 边.id,
      source: 边.主体姓名,
      target: 边.客体姓名,
      关系分类: 边.关系分类,
      关系阶段: 边.关系阶段,
      关系描述: 边.关系描述,
      好感度: 边.好感度,
    });
  }

  // 径向布局：主角在中心，其他节点均匀分布在圆环上
  const 非主角节点 = Array.from(nodeMap.values()).filter(n => !n.是主角);
  const 半径 = 200;
  for (let i = 0; i < 非主角节点.length; i++) {
    const 节点 = 非主角节点[i];
    if (!节点) continue;
    const 角度 = (2 * Math.PI * i) / 非主角节点.length - Math.PI / 2;
    节点.x = Math.cos(角度) * 半径;
    节点.y = Math.sin(角度) * 半径;
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
};
