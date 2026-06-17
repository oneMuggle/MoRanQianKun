import type {
    世界书导出结构,
    世界书预设组导出结构,
    世界书预设组结构,
    世界书结构,
    世界书条目结构,
    世界书条目形态,
    世界书内置分类,
    世界书注入模式,
    世界书作用域,
    世界书类型
} from '@/models/worldbook';
import type { 聊天记录结构 } from '@/types';

// ============ 存储键 / 版本常量 ============

export const 世界书存储键 = 'extra_worldbooks';
export const 世界书预设组存储键 = 'worldbook_preset_groups';
export const 世界书导出版本 = 3;
export const 世界书预设组导出版本 = 1;
export const 内置世界书ID = 'builtin_worldbook_prompt_console';

// ============ 选项常量 ============

export const 世界书类型选项: Array<{ value: 世界书类型; label: string; description: string }> = [
    { value: 'world_lore', label: '世界观补充', description: '追加到世界观母本后，用于补充势力、地理、历史与设定。' },
    { value: 'system_rule', label: '系统规则', description: '并入系统规则区，用于补充叙事、判定与行为约束。' },
    { value: 'command_rule', label: '命令规则', description: '并入命令协议区，用于补充命令写法和变量更新要求。' },
    { value: 'output_rule', label: '输出规则', description: '并入输出协议区，用于补充标签、格式和正文输出要求。' }
];

export const 世界书作用域选项: Array<{ value: 世界书作用域; label: string }> = [
    { value: 'main', label: '主剧情' },
    { value: 'opening', label: '开局生成' },
    { value: 'world_evolution', label: '世界演变' },
    { value: 'variable_calibration', label: '变量生成' },
    { value: 'story_plan', label: '剧情规划' },
    { value: 'heroine_plan', label: '女主规划' },
    { value: 'tavern', label: '酒馆模式' },
    { value: 'all', label: '全部流程' }
];

export const 世界书作用域说明: Record<世界书作用域, string> = {
    main: '主剧情请求阶段',
    opening: '开局生成阶段',
    world_evolution: '世界演变独立 API',
    variable_calibration: '变量生成独立 API',
    story_plan: '剧情规划独立 API',
    heroine_plan: '女主规划独立 API',
    tavern: '酒馆预设组包阶段',
    recall: '剧情回忆检索 API',
    all: '全部流程'
};

export const 世界书条目形态选项: Array<{ value: 世界书条目形态; label: string; description: string }> = [
    { value: 'normal', label: '普通条目', description: '常规附加条目，按条目类型与作用域注入。' },
    { value: 'timeline_outline', label: '时间线大纲条目', description: '常驻时间线纲要，默认覆盖主剧情与独立 API。' },
    { value: 'time_injection', label: '时间注入条目', description: '按游戏时间区间命中注入，可选起始和结束时间。' }
];

export const 世界书注入模式选项: Array<{ value: 世界书注入模式; label: string; description: string }> = [
    { value: 'always', label: '始终注入', description: '只要命中作用域，就始终注入。' },
    { value: 'match_any', label: '关键词命中', description: '仅当关键词命中当前上下文时注入。' }
];

// ============ 默认值与映射 ============

export const 默认作用域: 世界书作用域[] = ['main'];
export const 默认类型: 世界书类型 = 'world_lore';
export const 默认注入模式: 世界书注入模式 = 'always';
export const 默认条目形态: 世界书条目形态 = 'normal';
export const 全部流程作用域: 世界书作用域[] = [
    'main',
    'opening',
    'world_evolution',
    'variable_calibration',
    'story_plan',
    'heroine_plan',
    'tavern'
];

export const 世界书预算映射: Record<世界书作用域, number> = {
    main: 6000,
    opening: 7000,
    world_evolution: 4000,
    variable_calibration: 5000,
    story_plan: 5000,
    heroine_plan: 5000,
    recall: 0,
    tavern: 6000,
    all: 7000
};

export const 类型标签映射: Record<世界书类型, string> = {
    world_lore: '世界观附加',
    system_rule: '系统规则附加',
    command_rule: '命令规则附加',
    output_rule: '输出规则附加'
};

export const 条目形态标签映射: Record<世界书条目形态, string> = {
    normal: '普通条目',
    timeline_outline: '时间线大纲条目',
    time_injection: '时间注入条目'
};

// ============ 本体槽位 ============

export const 世界书本体槽位 = {
    主剧情AI角色声明: 'builtin_slot_main_ai_role',
    主剧情世界观: 'builtin_slot_main_world_prompt',
    主剧情输出协议: 'builtin_slot_main_output_protocol',
    写作文风: 'builtin_slot_writing_style',
    写作避免极端情绪: 'builtin_slot_writing_emotion_guard',
    写作NoControl: 'builtin_slot_writing_no_control',
    主剧情COT_常规: 'builtin_slot_main_cot_default',
    主剧情COT_女主规划: 'builtin_slot_main_cot_heroine',
    主剧情COT_NTL女主规划: 'builtin_slot_main_cot_heroine_ntl',
    主剧情女主规划_常规: 'builtin_slot_main_heroine_plan',
    主剧情女主规划_NTL: 'builtin_slot_main_heroine_plan_ntl',
    主剧情女主规划思考_常规: 'builtin_slot_main_heroine_plan_cot',
    主剧情女主规划思考_NTL: 'builtin_slot_main_heroine_plan_cot_ntl',
    真实世界模式: 'builtin_slot_real_world_mode',
    主剧情变量校准_常规: 'builtin_slot_main_variable_calibration_normal',
    主剧情变量校准_世界演变: 'builtin_slot_main_variable_calibration_world_evolution',
    变量模型系统_常规: 'builtin_slot_variable_model_system_normal',
    变量模型系统_世界演变已更新: 'builtin_slot_variable_model_system_world_updated',
    变量模型用户_常规: 'builtin_slot_variable_model_user_normal',
    变量模型用户_世界演变已更新: 'builtin_slot_variable_model_user_world_updated',
    变量模型COT: 'builtin_slot_variable_model_cot',
    开局初始化任务_启用生存: 'builtin_slot_opening_init_task_survival_on',
    开局初始化任务_禁用生存: 'builtin_slot_opening_init_task_survival_off'
} as const;

export const 内置世界书分类顺序: 世界书内置分类[] = ['常驻', '开局', '主剧情', '变量生成', '文章优化', '回忆', '世界演变'];

// ============ 本地类型 ============

export type 世界书本体槽位值 = typeof 世界书本体槽位[keyof typeof 世界书本体槽位];

export const 是本体槽位 = (slotId: unknown): boolean => typeof slotId === 'string' && slotId.startsWith('builtin_slot_');

// 匹配参数（matcher 需要用到，定义在此以共享）
export type 世界书命中参数 = {
    books: 世界书结构[];
    scopes: 世界书作用域[];
    environment?: any;
    social?: any[];
    history?: 聊天记录结构[];
    world?: any;
    extraTexts?: string[];
    maxChars?: number;
};

// 类型再导出（保持 barrel 语义一致）
export type {
    世界书结构,
    世界书条目结构,
    世界书预设组结构,
    世界书导出结构,
    世界书预设组导出结构
};
