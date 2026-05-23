/**
 * 事后演化系统 — Aftercare Evolution
 * 护理行为的长期影响、创伤系统、性格微调
 */

// ==================== 护理长期影响 ====================

export type 护理质量 = '无视' | '敷衍' | '温柔' | '用心';

export interface 护理累积记录 {
  总护理次数: number;
  质量分布: Record<护理质量, number>;
  最近护理序列: { 质量: 护理质量; 时间: string }[];
  创伤阈值: number;
  连续负面次数: number;
  最后更新时间: string;
}

export interface 创伤条目 {
  id: string;
  类型: '信任受损' | '身体记忆' | '情感封闭' | '依赖加深';
  严重程度: number;
  触发条件: string;
  行为表现: string;
  治愈条件: string;
  创建时间: string;
  已治愈: boolean;
  治愈时间?: string;
}

export interface 性格微调条目 {
  原始特质: string;
  微调后特质: string;
  偏移度: number;
  驱动因素: string;
  生效时间: string;
}

// ==================== 核心函数 ====================

export function 记录护理影响(
  累积: 护理累积记录,
  质量: 护理质量,
  游戏时间: string
): 护理累积记录 {
  const 新分布 = { ...累积.质量分布 };
  新分布[质量] = (新分布[质量] ?? 0) + 1;
  const 新序列 = [...累积.最近护理序列, { 质量, 时间: 游戏时间 }].slice(-10);
  const 连续负面 = (质量 === '无视' || 质量 === '敷衍')
    ? 累积.连续负面次数 + 1
    : 0;

  return {
    ...累积,
    总护理次数: 累积.总护理次数 + 1,
    质量分布: 新分布,
    最近护理序列: 新序列,
    连续负面次数: 连续负面,
    最后更新时间: new Date().toISOString(),
  };
}

export function 检查创伤触发(
  累积: 护理累积记录,
  当前情境: string,
  已有创伤: 创伤条目[] = []
): 创伤条目 | null {
  if (累积.连续负面次数 >= 累积.创伤阈值) {
    const 已有信任受损 = 已有创伤.some(t => t.类型 === '信任受损' && !t.已治愈);
    if (!已有信任受损) {
      return {
        id: `trauma_${Date.now()}`,
        类型: '信任受损',
        严重程度: Math.min(5, Math.floor(累积.连续负面次数 / 3)),
        触发条件: '下次亲密互动时',
        行为表现: '表现出抗拒、恐惧或不信任的态度',
        治愈条件: '连续3次温柔以上质量的护理',
        创建时间: new Date().toISOString(),
        已治愈: false,
      };
    }
  }

  for (const 创伤 of 已有创伤) {
    if (创伤.已治愈) continue;
    if (创伤.触发条件 && 当前情境.includes(创伤.触发条件.replace('时', ''))) {
      return 创伤;
    }
  }

  return null;
}

export function 计算性格微调(
  累积: 护理累积记录,
  原始性格: string
): 性格微调条目[] {
  const 微调列表: 性格微调条目[] = [];
  const 总数 = 累积.总护理次数;
  if (总数 < 5) return 微调列表;

  const { 质量分布 } = 累积;
  const 无视比例 = (质量分布['无视'] ?? 0) / 总数;
  const 用心比例 = (质量分布['用心'] ?? 0) / 总数;
  const 温柔比例 = (质量分布['温柔'] ?? 0) / 总数;

  if (无视比例 > 0.5) {
    微调列表.push({
      原始特质: 原始性格,
      微调后特质: `${原始性格}，但变得更加冷漠和防备`,
      偏移度: Math.round(无视比例 * 60),
      驱动因素: `长期被无视（${Math.round(无视比例 * 100)}%）`,
      生效时间: new Date().toISOString(),
    });
  }

  if (用心比例 > 0.4) {
    微调列表.push({
      原始特质: 原始性格,
      微调后特质: `${原始性格}，对护理者产生了明显的依赖`,
      偏移度: Math.round(用心比例 * 50),
      驱动因素: `长期被用心护理（${Math.round(用心比例 * 100)}%）`,
      生效时间: new Date().toISOString(),
    });
  }

  if (温柔比例 > 0.5 && 无视比例 < 0.1) {
    微调列表.push({
      原始特质: 原始性格,
      微调后特质: `${原始性格}，更加信任和依赖对方`,
      偏移度: Math.round(温柔比例 * 40),
      驱动因素: `长期被温柔对待（${Math.round(温柔比例 * 100)}%）`,
      生效时间: new Date().toISOString(),
    });
  }

  return 微调列表;
}

export function 治愈创伤(
  创伤: 创伤条目,
  累积: 护理累积记录
): 创伤条目 {
  const 最近序列 = 累积.最近护理序列.slice(-3);
  const 连续温柔 = 最近序列.length >= 3 && 最近序列.every(r => r.质量 === '温柔' || r.质量 === '用心');

  if (连续温柔 && 创伤.治愈条件.includes('温柔')) {
    return { ...创伤, 已治愈: true, 治愈时间: new Date().toISOString() };
  }

  return 创伤;
}

export function 创建初始护理累积(创伤阈值: number = 3): 护理累积记录 {
  return {
    总护理次数: 0,
    质量分布: { '无视': 0, '敷衍': 0, '温柔': 0, '用心': 0 },
    最近护理序列: [],
    创伤阈值,
    连续负面次数: 0,
    最后更新时间: new Date().toISOString(),
  };
}

export function 生成护理摘要(
  累积: 护理累积记录,
  创伤列表: 创伤条目[] = [],
  性格微调: 性格微调条目[] = []
): string {
  const 组件: string[] = [];

  if (累积.总护理次数 > 0) {
    const 主要质量 = Object.entries(累积.质量分布)
      .sort(([, a], [, b]) => b - a)[0];
    组件.push(`护理模式：以「${主要质量[0]}」为主（${Math.round(主要质量[1] / 累积.总护理次数 * 100)}%）`);
  }

  if (累积.连续负面次数 >= 2) {
    组件.push(`⚠️连续${累积.连续负面次数}次低质量护理，接近创伤阈值`);
  }

  const 未治愈创伤 = 创伤列表.filter(t => !t.已治愈);
  if (未治愈创伤.length > 0) {
    组件.push(`创伤：${未治愈创伤.map(t => `${t.类型}（${t.行为表现}）`).join('；')}`);
  }

  if (性格微调.length > 0) {
    组件.push(`性格变化：${性格微调.map(m => m.微调后特质).join('；')}`);
  }

  return 组件.length > 0 ? 组件.join('，') : '';
}
