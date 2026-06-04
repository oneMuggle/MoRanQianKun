/**
 * photographyNSFWIntegration.ts
 * 将写真约拍 NSFW 引擎与主剧情发送工作流桥接
 *
 * 在主剧情 AI 响应处理后，解析 <写真系统状态> 标签并应用状态变更。
 */

import type {
  写真NSFW设置,
  写真系统扩展,
  模特核心状态,
  拍摄项目状态,
  泄露事件状态,
} from '../../../models/photographyNSFW';

// ==================== 解析校验常量 ====================

/** 模特档案中已知的合法字段名 —— 用于拒绝将字段名误认为模特 ID */
const VALID_MODEL_FIELDS = [
  '姓名', '类型', '职业状态', '保护意识',
  '信任度', '安全感', '自我认同', '羞耻度',
  '拍摄总次数', '正规拍摄次数', '擦边拍摄次数', '越界拍摄次数',
  '当前底线', '底线历史',
  '被偷拍次数', '被泄露次数', '投诉次数',
  '累计收入', '单次报价',
  '拍摄经历',
  'id', '项目ID',
] as const;

/** 摄影师档案中已知的合法字段名 */
const VALID_PHOTOGRAPHER_FIELDS = [
  '姓名', '类型', '动机', '信誉',
  '技术水平', '沟通能力',
  '越界倾向', '偷拍倾向', '传播倾向',
  '口碑评分', '投诉累计',
  '拍摄总次数', '回头客数量', '作品发布数量',
  '擅长写真类型', '擅长拍摄风格',
  'id', '项目ID',
] as const;

/**
 * 校验一个对象是否是合法的模特档案更新值
 * 必须至少包含一个已知字段，且不能是纯扁平值
 */
const isValidModelUpdate = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  // 至少包含一个已知字段
  return keys.some(k => VALID_MODEL_FIELDS.includes(k as typeof VALID_MODEL_FIELDS[number]));
};

/**
 * 校验一个键是否是常见的字段名（而非合法的实体 ID）
 * 如果 LLM 把 "姓名"、"安全感" 等作为 key，说明输出格式错误
 */
const isLikelyFieldName = (key: string): boolean => {
  return VALID_MODEL_FIELDS.includes(key as typeof VALID_MODEL_FIELDS[number])
    || VALID_PHOTOGRAPHER_FIELDS.includes(key as typeof VALID_PHOTOGRAPHER_FIELDS[number])
    || ['模特id', '模特ID', 'ID', 'id', '项目ID', '摄影师Id', '模特Id'].includes(key);
};

/**
 * 解析写真系统状态更新标签
 * 格式: <写真系统状态>{"更新档案":{"NPC_ID":{...}}}</写真系统状态>
 */
export const 解析写真系统状态更新 = (
  rawText: string
): {
  更新模特档案?: Record<string, Partial<模特核心状态>>;
  更新摄影师档案?: Record<string, any>;
  更新拍摄项目?: Partial<拍摄项目状态>[];
  新泄露事件?: 泄露事件状态[];
} | null => {
  const match = rawText.match(/<写真系统状态>([\s\S]*?)<\/写真系统状态>/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);

    // 兼容两种字段名：LLM可能输出"更新拍摄项目"（数组）或"更新项目状态"（对象/平铺对象）
    const raw项目更新 = (parsed as any).更新拍摄项目 || (parsed as any).更新项目状态;
    let 标准化项目更新: Partial<拍摄项目状态>[] | undefined;
    if (raw项目更新) {
      if (Array.isArray(raw项目更新)) {
        标准化项目更新 = raw项目更新;
      } else if (typeof raw项目更新 === 'object') {
        // 判断是平铺对象（含"项目ID"字段）还是嵌套对象（{"ID":{数据}}）
        if (raw项目更新.项目ID || raw项目更新.id) {
          // 平铺对象：直接作为单个项目更新
          标准化项目更新 = [raw项目更新];
        } else {
          // 嵌套对象：{"项目ID": {数据}}
          标准化项目更新 = Object.entries(raw项目更新).map(([id, data]: [string, any]) => ({
            id,
            项目ID: id,
            ...data,
          }));
        }
      }
    }

    // 过滤模特档案：拒绝 key 为字段名的无效 entry
    const raw模特档案 = parsed.更新模特档案;
    const 过滤后模特档案 = raw模特档案
      ? Object.fromEntries(Object.entries(raw模特档案).filter(([k, v]) => !isLikelyFieldName(k) && isValidModelUpdate(v)))
      : undefined;

    // 过滤摄影师档案：拒绝 key 为字段名的无效 entry
    const raw摄影师档案 = parsed.更新摄影师档案;
    const 过滤后摄影师档案 = raw摄影师档案
      ? Object.fromEntries(Object.entries(raw摄影师档案).filter(([k]) => !isLikelyFieldName(k)))
      : undefined;

    return {
      更新模特档案: 过滤后模特档案,
      更新摄影师档案: 过滤后摄影师档案,
      更新拍摄项目: 标准化项目更新,
      新泄露事件: parsed.新泄露事件,
    } as {
      更新模特档案?: Record<string, Partial<模特核心状态>>;
      更新摄影师档案?: Record<string, any>;
      更新拍摄项目?: Partial<拍摄项目状态>[];
      新泄露事件?: 泄露事件状态[];
    };
  } catch {
    return null;
  }
};

/**
 * 移除写真系统状态标签
 */
export const 移除写真系统状态标签 = (rawText: string): string => {
  return rawText.replace(/<写真系统状态>[\s\S]*?<\/写真系统状态>/g, '').trim();
};

/**
 * 处理 AI 响应中的写真系统状态更新
 * 1. 解析 <写真系统状态> 标签
 * 2. 调用回调应用状态变更
 * 3. 返回清理后的纯文本（不含状态标签）
 */
export const 处理写真系统状态更新 = (
  rawAiText: string,
  callback: (result: NonNullable<ReturnType<typeof 解析写真系统状态更新>>) => void
): string => {
  const 解析结果 = 解析写真系统状态更新(rawAiText);
  if (解析结果) {
    callback(解析结果);
  }
  return 移除写真系统状态标签(rawAiText);
};

/**
 * 应用写真系统状态更新到游戏状态
 * 支持懒初始化：如果写真系统尚未创建但有状态更新，会自动创建初始系统
 */
export const 应用写真系统状态更新 = (
  current写真系统: any,
  更新: NonNullable<ReturnType<typeof 解析写真系统状态更新>>
): any => {
  // 懒初始化：如果写真系统不存在但有更新，创建初始系统
  const 基础系统 = current写真系统 || {
    模特档案: {},
    摄影师档案: {},
    进行中的拍摄项目: [],
    历史拍摄记录: [],
    泄露事件列表: [],
  };

  const 新系统 = { ...基础系统 };

  // 应用模特档案更新（不存在的自动创建）
  if (更新.更新模特档案) {
    const 新模特档案 = { ...(新系统.模特档案 || {}) };
    for (const [id, 档案] of Object.entries(更新.更新模特档案)) {
      // 校验：拒绝将字段名（如"姓名"、"安全感"）误认为模特 ID
      if (isLikelyFieldName(id)) {
        continue;
      }
      // 校验：值必须是合法的对象
      if (!isValidModelUpdate(档案)) {
        continue;
      }
      if (新模特档案[id]) {
        新模特档案[id] = { ...新模特档案[id], ...档案 };
      } else {
        // 新模特：创建完整最小档案，补充 Dashboard 所需的所有字段
        const 基础模特 = {
          id,
          姓名: id,
          类型: '素人模特' as const,
          职业状态: '新人' as const,
          保护意识: '适度保护' as const,
          信任度: 50,
          安全感: 60,
          自我认同: 50,
          羞耻度: 50,
          拍摄总次数: 0,
          正规拍摄次数: 0,
          擦边拍摄次数: 0,
          越界拍摄次数: 0,
          当前底线: 'G级' as const,
          底线历史: [],
          被偷拍次数: 0,
          被泄露次数: 0,
          投诉次数: 0,
          累计收入: 0,
          单次报价: 0,
          拍摄经历: [] as any[],
        };
        新模特档案[id] = { ...基础模特, ...档案 };
      }
    }
    新系统.模特档案 = 新模特档案;
  }

  // 应用摄影师档案更新（不存在的自动创建）
  if (更新.更新摄影师档案) {
    const 新摄影师档案 = { ...(新系统.摄影师档案 || {}) };
    for (const [id, 档案] of Object.entries(更新.更新摄影师档案)) {
      // 校验：拒绝将字段名误认为摄影师 ID
      if (isLikelyFieldName(id)) {
        continue;
      }
      if (新摄影师档案[id]) {
        新摄影师档案[id] = { ...新摄影师档案[id], ...档案 };
      } else {
        // 新摄影师：创建完整最小档案
        const 基础摄影师 = {
          id,
          姓名: id,
          类型: '独立摄影师' as const,
          动机: '纯艺术' as const,
          信誉: '普通摄影师' as const,
          技术水平: 50,
          沟通能力: 50,
          越界倾向: 30,
          偷拍倾向: 10,
          传播倾向: 10,
          口碑评分: 50,
          投诉累计: 0,
          拍摄总次数: 0,
          回头客数量: 0,
          作品发布数量: 0,
          擅长写真类型: [] as any[],
          擅长拍摄风格: [] as any[],
        };
        新摄影师档案[id] = { ...基础摄影师, ...档案 };
      }
    }
    新系统.摄影师档案 = 新摄影师档案;
  }

  // 应用拍摄项目状态更新（不存在的自动创建）
  if (更新.更新拍摄项目) {
    const 当前项目 = 新系统.进行中的拍摄项目 || [];
    const 新项目列表 = [...当前项目];

    for (const raw更新 of 更新.更新拍摄项目 as any[]) {
      // ==================== 严格 ID 匹配 ====================
      // 优先使用 id，次选 项目ID（兼容平铺对象格式）
      const 项目ID = raw更新.id || raw更新.项目ID;
      let 已有索引 = -1;

      if (项目ID) {
        // 按 id 精确匹配现有项目
        已有索引 = 新项目列表.findIndex((p: any) => p.id === 项目ID);
      }

      // ==================== 名称回退（旧数据一次性兼容） ====================
      // 仅在无 ID 时尝试按项目名称精确匹配，匹配成功后自动回填 id
      if (已有索引 < 0 && !项目ID && raw更新.项目名称) {
        已有索引 = 新项目列表.findIndex(
          (p: any) => p.项目名称 === raw更新.项目名称
        );
      }

      // ==================== 名称相似度回退匹配（新增） ====================
      // 当 ID 和名称精确匹配都失败时，通过人员组合 + 名称相似度识别同一项目
      // 解决 LLM 修改项目名称但未输出 ID 导致的重复创建问题
      if (已有索引 < 0) {
        const 模特Id = raw更新.模特Id;
        const 摄影师Id = raw更新.摄影师Id || raw更新.摄影师ID;

        if (模特Id && 摄影师Id && raw更新.项目名称) {
          已有索引 = 新项目列表.findIndex((p: any) => {
            // 模特和摄影师都必须匹配
            const 人员匹配 = p.模特Id === 模特Id &&
                              (p.摄影师Id === 摄影师Id || p.摄影师ID === 摄影师Id);
            if (!人员匹配) return false;

            // 名称相似度：互相包含即认为相似
            const 旧名称 = p.项目名称 || '';
            const 新名称 = raw更新.项目名称 || '';
            if (!旧名称 || !新名称) return false;

            return 旧名称.includes(新名称) || 新名称.includes(旧名称);
          });

          if (已有索引 >= 0) {
            console.log('[写真系统] 通过人员+名称相似度匹配到项目:', {
              模特Id,
              摄影师Id,
              旧名称: 新项目列表[已有索引].项目名称,
              新名称: raw更新.项目名称,
            });
          }
        }
      }

      if (已有索引 >= 0) {
        const 现有 = 新项目列表[已有索引];
        // 如果是名称回退匹配到的旧数据（无 id），自动生成并回填 id
        const 补写ID = !现有.id
          ? `shoot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          : null;
        新项目列表[已有索引] = {
          ...现有,
          ...raw更新,
          id: 补写ID || 现有.id || 项目ID,
        };
        // 名称回退匹配成功后，同步更新 项目ID 字段
        if (补写ID) {
          新项目列表[已有索引].项目ID = 补写ID;
        }
      } else {
        // ==================== 新建项目 ====================
        // 必须有项目名称才能创建新项目，否则跳过并视为无效更新
        if (!raw更新.项目名称 && !项目ID) {
          continue;
        }
        // 生成唯一 ID：时间戳 + 4位随机字符，防止同一毫秒内多次调用冲突
        const 最终ID = 项目ID || `shoot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        // 推断模特 ID：优先从 raw更新 中取，其次从更新档案中推断
        const 推断模特Id = raw更新.模特Id
          || Object.keys(更新.更新模特档案 || {})[0]
          || (raw更新.模特姓名 ? raw更新.模特姓名 : 'unknown');
        // 推断摄影师 ID：优先使用 raw更新 中的，其次尝试 'player'
        const 推断摄影师Id = raw更新.摄影师Id || raw更新.摄影师ID || 'player';

        const 基础项目 = {
          id: 最终ID,
          项目ID: 最终ID,
          项目名称: raw更新.项目名称 || `${raw更新.约定写真类型 || '写真'}拍摄项目`,
          模特Id: 推断模特Id,
          摄影师Id: 推断摄影师Id,
          约定写真类型: '商业写真' as const,
          约定场所: '影棚' as const,
          约定风格: '清新自然' as const,
          约定尺度: 'G级' as const,
          约定服装: '日常便装' as const,
          约定交付时间: 0,
          实际场所: '影棚' as const,
          实际尺度: 'G级' as const,
          实际服装: '日常便装' as const,
          当前回合: 1,
          最大回合: 10,
          拍摄阶段: '未开始' as const,
          阶段明细: [],
          尺度变更历史: [],
          越界行为记录: [],
          泄露风险评分: 0,
          交付状态: '待交付' as const,
          交付方式: null,
          后期处理方式: '纯自然' as const,
          违规记录: [],
        };
        新项目列表.push({ ...基础项目, ...raw更新 });
      }
    }

    新系统.进行中的拍摄项目 = 新项目列表;
  }

  // 应用新泄露事件
  if (更新.新泄露事件) {
    新系统.泄露事件列表 = [...(新系统.泄露事件列表 || []), ...更新.新泄露事件];
  }

  return 新系统;
};

/**
 * 构建写真约拍 NSFW 运行时参数（供主剧情请求使用）
 */
export const 构建写真NSFW参数 = (state: {
  写真系统?: 写真系统扩展;
  gameConfig?: {
    写真NSFW设置?: 写真NSFW设置;
  };
  角色?: {
    出身背景?: {
      名称?: string;
    };
    姓名?: string;
  };
  时代配置ID?: string;
  社交列表?: Array<{ id: string; 姓名: string; [key: string]: any }>;
}): {
  活跃拍摄项目?: 拍摄项目状态;
  模特数量?: number;
  摄影师数量?: number;
  泄露事件数量?: number;
  内容强度?: '微暗' | '暧昧' | '露骨';
  主要玩法层?: '经营管理' | '人际关系' | '灰色地带';
  NPC姓名映射?: Record<string, string>;
  摄影师姓名映射?: Record<string, string>;
  启用道德选择?: boolean;
  启用尺度递进?: boolean;
  启用越界识别?: boolean;
  启用安全词系统?: boolean;
  启用照片交付?: boolean;
  启用泄露事件?: boolean;
  泄露事件频率?: '低' | '中' | '高';
} | undefined => {
  // 检查时代配置 - 必须是 contemporary_ 开头的现代纪元
  const 时代ID = state.时代配置ID || '';
  if (!时代ID.startsWith('contemporary_')) {
    return undefined;
  }

  // 检查子系统开关
  const nsfw设置 = state.gameConfig?.写真NSFW设置;
  if (!nsfw设置?.启用写真NSFW系统) {
    return undefined;
  }

  // 写真系统可能为空（新游戏尚未创建约拍项目），但仍需返回基本设置参数
  // 让 LLM 知道写真系统已激活，可以在剧情中触发约拍场景
  const 写真系统 = state.写真系统;

  // 获取活跃拍摄项目
  const 进行中项目 = 写真系统?.进行中的拍摄项目;
  const 活跃项目 = 进行中项目 && 进行中项目.length > 0
    ? 进行中项目[进行中项目.length - 1]
    : undefined;

  // 统计数量（系统为空时均为 0）
  const 模特数量 = 写真系统?.模特档案 ? Object.keys(写真系统.模特档案).length : 0;
  const 摄影师数量 = 写真系统?.摄影师档案 ? Object.keys(写真系统.摄影师档案).length : 0;
  const 泄露事件数量 = 写真系统?.泄露事件列表?.length || 0;

  // 构建 NPC ID -> 姓名的映射，供 LLM 在输出状态时使用真实姓名
  const NPC姓名映射: Record<string, string> = {};
  if (state.社交列表) {
    state.社交列表.forEach(npc => {
      NPC姓名映射[npc.id] = npc.姓名 || npc.id;
    });
  }

  // 玩家角色如果是摄影师背景，用角色名作为摄影师姓名
  const 摄影师姓名映射: Record<string, string> = {};
  if (state.角色?.姓名) {
    摄影师姓名映射['player'] = state.角色.姓名;
  }

  return {
    活跃拍摄项目: 活跃项目,
    模特数量,
    摄影师数量,
    泄露事件数量,
    NPC姓名映射,
    摄影师姓名映射,
    内容强度: nsfw设置.NSFW内容强度,
    主要玩法层: nsfw设置.主要玩法层,
    启用道德选择: nsfw设置.启用道德选择,
    启用尺度递进: nsfw设置.启用尺度递进,
    启用越界识别: nsfw设置.启用越界识别,
    启用安全词系统: nsfw设置.启用安全词系统,
    启用照片交付: nsfw设置.启用照片交付,
    启用泄露事件: nsfw设置.启用泄露事件,
    泄露事件频率: nsfw设置.泄露事件频率,
  };
};
