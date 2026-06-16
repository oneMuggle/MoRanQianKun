import type {
    世界书导出结构,
    世界书预设组导出结构,
    世界书预设组结构,
    世界书结构,
    世界书条目结构,
    世界书内置分类,
    世界书注入模式,
    世界书作用域,
    世界书类型
} from './types';
import { 内置世界书ID, 世界书本体槽位 } from './types';
import {
    获取世界书条目注入说明,
    规范化世界书列表,
    规范化世界书预设组,
    规范化世界书预设组列表
} from './parser';
import type { 剧情风格类型, NTL后宫档位 } from '../../models/system';
import { 构建AI角色声明提示词 } from '../../prompts/runtime/roleIdentity';
import { 构建真实世界模式提示词 } from '../../prompts/runtime/realWorldMode';
import { 构建变量校准提示词 } from '../../prompts/runtime/variableCalibration';
import { 获取开场初始化任务提示词 } from '../../prompts/runtime/opening';
import { 构建剧情风格助手提示词 } from '../../prompts/runtime/storyStyles';
import { 默认文章优化提示词 } from '../../prompts/runtime/defaults';
import { 核心_文章优化思维链 } from '../../prompts/core/cotPolish';
import { 剧情回忆检索COT提示词, 剧情回忆检索输出格式提示词 } from '../../prompts/runtime/recall';
import { 构建世界演变系统提示词 } from '../../prompts/runtime/worldEvolution';
import { 世界演变COT提示词 } from '../../prompts/runtime/worldEvolutionCot';
import { 变量校准COT提示词 } from '../../prompts/runtime/variableCot';
import { 核心_世界观 } from '../../prompts/core/world';
import { 核心_输出格式 } from '../../prompts/core/format';
import { 核心_思维链 } from '../../prompts/core/cot';
import { 核心_思维链_女主规划版, 核心_思维链_NTL女主规划版 } from '../../prompts/core/cotHeroine';
import { 核心_女主剧情规划, 核心_女主剧情规划_NTL } from '../../prompts/core/heroinePlan';
import { 核心_女主剧情规划_思考, 核心_女主剧情规划_思考_NTL } from '../../prompts/core/heroinePlanCot';
import { 构建变量模型系统提示词, 构建变量模型用户附加规则提示词 } from '../../prompts/runtime/variableModel';
import { 写作_风格 } from '../../prompts/writing/style';
import { 写作_避免极端情绪 } from '../../prompts/writing/emotionGuard';
import { 写作_防止说话 } from '../../prompts/writing/noControl';

// ============ 导入/导出/预设组应用 ============

export const 构建世界书导出数据 = (books: 世界书结构[]): 世界书导出结构 => ({
    version: 3,
    exportedAt: new Date().toISOString(),
    books: 规范化世界书列表(books)
});

export const 解析世界书导入数据 = (payload: unknown): 世界书结构[] => 规范化世界书列表(payload);

export const 构建世界书预设组导出数据 = (groups: 世界书预设组结构[]): 世界书预设组导出结构 => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    groups: 规范化世界书预设组列表(groups)
});

export const 解析世界书预设组导入数据 = (payload: unknown): 世界书预设组结构[] => 规范化世界书预设组列表(payload);

export const 应用世界书预设组到世界书列表 = (
    currentBooks: 世界书结构[],
    presetGroup: 世界书预设组结构
): 世界书结构[] => {
    const normalizedCurrent = 规范化世界书列表(currentBooks);
    const normalizedGroup = 规范化世界书预设组(presetGroup);
    const snapshotMap = new Map(normalizedGroup.书籍快照.map((book) => [book.id, book] as const));

    const merged = normalizedCurrent.map((book) => {
        const snapshot = snapshotMap.get(book.id);
        if (snapshot) {
            return {
                ...snapshot,
                启用: snapshot.启用 !== false,
                更新时间: Date.now()
            };
        }
        if (book.内置) {
            return book;
        }
        return {
            ...book,
            启用: false,
            更新时间: Date.now()
        };
    });

    snapshotMap.forEach((snapshot, id) => {
        if (merged.some((book) => book.id === id)) return;
        merged.push({
            ...snapshot,
            启用: snapshot.启用 !== false,
            更新时间: Date.now()
        });
    });

    return 规范化世界书列表(merged);
};

// ============ 内置预设条目 / 世界书 ============

const 创建内置预设条目 = (params: {
    id: string;
    标题: string;
    类型: 世界书类型;
    作用域: 世界书作用域[];
    内置槽位?: string;
    内置分类?: 世界书内置分类;
    内容?: string;
    注入模式?: 世界书注入模式;
    优先级?: number;
}): 世界书条目结构 => {
    const now = 1;
    const base = {
        id: params.id,
        标题: params.标题,
        内容: params.内容 || '',
        条目形态: 'normal',
        类型: params.类型,
        作用域: params.作用域,
        内置槽位: params.内置槽位 || params.id,
        内置分类: params.内置分类,
        注入说明: '',
        注入模式: params.注入模式 || 'always',
        时间线开始时间: '',
        时间线结束时间: '',
        关键词: [],
        优先级: params.优先级 ?? 80,
        启用: true,
        内置: true,
        创建时间: now,
        更新时间: now
    } as 世界书条目结构;
    return {
        ...base,
        注入说明: 获取世界书条目注入说明(base)
    };
};

export const 创建内置预设世界书 = (): 世界书结构 => {
    const buildStyleEntries = (): 世界书条目结构[] => ([
        { style: '一般' as 剧情风格类型, title: '一般' },
        { style: '修炼' as 剧情风格类型, title: '修炼' },
        { style: '后宫' as 剧情风格类型, title: '后宫' },
        { style: '修罗场' as 剧情风格类型, title: '修罗场' },
        { style: '纯爱' as 剧情风格类型, title: '纯爱' }
    ]).map((item) => 创建内置预设条目({
        id: `builtin_slot_style_${item.style === '一般' ? 'general' : item.style === '修炼' ? 'cultivation' : item.style === '后宫' ? 'harem' : item.style === '修罗场' ? 'shura' : 'pure_love'}`,
        内置槽位: `builtin_slot_style_${item.style === '一般' ? 'general' : item.style === '修炼' ? 'cultivation' : item.style === '后宫' ? 'harem' : item.style === '修罗场' ? 'shura' : 'pure_love'}`,
        标题: `叙事风格 · ${item.title}`,
        内置分类: '常驻',
        类型: 'system_rule',
        作用域: ['main', 'opening'],
        内容: 构建剧情风格助手提示词(item.style)
    })).concat([
        创建内置预设条目({
            id: 'builtin_slot_style_ntl_no_incest',
            内置槽位: 'builtin_slot_style_ntl_no_incest',
            标题: '叙事风格 · NTL后宫（禁止乱伦）',
            内置分类: '常驻',
            类型: 'system_rule',
            作用域: ['main', 'opening'],
            内容: 构建剧情风格助手提示词('NTL后宫', '禁止乱伦')
        }),
        创建内置预设条目({
            id: 'builtin_slot_style_ntl_fake_incest',
            内置槽位: 'builtin_slot_style_ntl_fake_incest',
            标题: '叙事风格 · NTL后宫（假乱伦）',
            内置分类: '常驻',
            类型: 'system_rule',
            作用域: ['main', 'opening'],
            内容: 构建剧情风格助手提示词('NTL后宫', '假乱伦')
        }),
        创建内置预设条目({
            id: 'builtin_slot_style_ntl_unlimited',
            内置槽位: 'builtin_slot_style_ntl_unlimited',
            标题: '叙事风格 · NTL后宫（无限制）',
            内置分类: '常驻',
            类型: 'system_rule',
            作用域: ['main', 'opening'],
            内容: 构建剧情风格助手提示词('NTL后宫', '无限制')
        })
    ]);

    return {
        id: 内置世界书ID,
        标题: '内置预设世界书',
        描述: '用于承载系统内置本体提示词。你可以直接在这里修改主剧情、开局生成等流程里按设置切换的本体提示词；附加规则请新建独立世界书维护。',
        常驻大纲: '',
        启用: true,
        内置: true,
        条目: [
            创建内置预设条目({
                id: 世界书本体槽位.主剧情AI角色声明,
                内置槽位: 世界书本体槽位.主剧情AI角色声明,
                标题: '主剧情 · AI角色声明本体',
                内置分类: '常驻',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 构建AI角色声明提示词('${playerName}')
            }),
            创建内置预设条目({
                id: 世界书本体槽位.写作文风,
                内置槽位: 世界书本体槽位.写作文风,
                标题: '常驻 · 文风',
                内置分类: '常驻',
                类型: 'system_rule',
                作用域: ['main', 'opening'],
                内容: 写作_风格.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.写作避免极端情绪,
                内置槽位: 世界书本体槽位.写作避免极端情绪,
                标题: '常驻 · 避免极端情绪',
                内置分类: '常驻',
                类型: 'system_rule',
                作用域: ['main', 'opening'],
                内容: 写作_避免极端情绪.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.写作NoControl,
                内置槽位: 世界书本体槽位.写作NoControl,
                标题: '常驻 · NoControl（跟随设置）',
                内置分类: '常驻',
                类型: 'system_rule',
                作用域: ['main', 'opening'],
                内容: 写作_防止说话.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情世界观,
                内置槽位: 世界书本体槽位.主剧情世界观,
                标题: '主剧情 · 世界观本体',
                内置分类: '主剧情',
                类型: 'world_lore',
                作用域: ['main'],
                内容: 核心_世界观.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情输出协议,
                内置槽位: 世界书本体槽位.主剧情输出协议,
                标题: '主剧情 · 输出协议本体',
                内置分类: '主剧情',
                类型: 'output_rule',
                作用域: ['main'],
                内容: 核心_输出格式.内容
            }),
            ...buildStyleEntries(),
            创建内置预设条目({
                id: 世界书本体槽位.真实世界模式,
                内置槽位: 世界书本体槽位.真实世界模式,
                标题: '真实世界模式',
                内置分类: '常驻',
                类型: 'system_rule',
                作用域: ['main', 'opening'],
                内容: 构建真实世界模式提示词()
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情COT_常规,
                内置槽位: 世界书本体槽位.主剧情COT_常规,
                标题: '主剧情 · 思维链（常规）',
                内置分类: '主剧情',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_思维链.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情COT_女主规划,
                内置槽位: 世界书本体槽位.主剧情COT_女主规划,
                标题: '主剧情 · 思维链（女主规划）',
                内置分类: '主剧情',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_思维链_女主规划版.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情COT_NTL女主规划,
                内置槽位: 世界书本体槽位.主剧情COT_NTL女主规划,
                标题: '主剧情 · 思维链（NTL女主规划）',
                内置分类: '主剧情',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_思维链_NTL女主规划版.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情女主规划_常规,
                内置槽位: 世界书本体槽位.主剧情女主规划_常规,
                标题: '主剧情 · 女主剧情规划协议',
                内置分类: '主剧情',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_女主剧情规划.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情女主规划_NTL,
                内置槽位: 世界书本体槽位.主剧情女主规划_NTL,
                标题: '主剧情 · 女主剧情规划协议（NTL）',
                内置分类: '主剧情',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_女主剧情规划_NTL.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情女主规划思考_常规,
                内置槽位: 世界书本体槽位.主剧情女主规划思考_常规,
                标题: '主剧情 · 女主剧情规划思考协议',
                内置分类: '主剧情',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_女主剧情规划_思考.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情女主规划思考_NTL,
                内置槽位: 世界书本体槽位.主剧情女主规划思考_NTL,
                标题: '主剧情 · 女主剧情规划思考协议（NTL）',
                内置分类: '主剧情',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_女主剧情规划_思考_NTL.内容
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情变量校准_常规,
                内置槽位: 世界书本体槽位.主剧情变量校准_常规,
                标题: '主剧情注入 · 变量生成协议（常规）',
                内置分类: '变量生成',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 构建变量校准提示词({ worldEvolutionEnabled: false })
            }),
            创建内置预设条目({
                id: 世界书本体槽位.主剧情变量校准_世界演变,
                内置槽位: 世界书本体槽位.主剧情变量校准_世界演变,
                标题: '主剧情注入 · 变量生成协议（世界演变分流）',
                内置分类: '变量生成',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 构建变量校准提示词({ worldEvolutionEnabled: true })
            }),
            创建内置预设条目({
                id: 世界书本体槽位.变量模型系统_常规,
                内置槽位: 世界书本体槽位.变量模型系统_常规,
                标题: '独立变量生成API · 系统补充（常规）',
                内置分类: '变量生成',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 构建变量模型系统提示词({ worldEvolutionEnabled: false, worldEvolutionUpdated: false, survivalNeedsEnabled: true })
            }),
            创建内置预设条目({
                id: 世界书本体槽位.变量模型系统_世界演变已更新,
                内置槽位: 世界书本体槽位.变量模型系统_世界演变已更新,
                标题: '独立变量生成API · 系统补充（世界演变已更新）',
                内置分类: '变量生成',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 构建变量模型系统提示词({ worldEvolutionEnabled: true, worldEvolutionUpdated: true, survivalNeedsEnabled: true })
            }),
            创建内置预设条目({
                id: 世界书本体槽位.变量模型用户_常规,
                内置槽位: 世界书本体槽位.变量模型用户_常规,
                标题: '独立变量生成API · 附加规则（常规）',
                内置分类: '变量生成',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 构建变量模型用户附加规则提示词()
            }),
            创建内置预设条目({
                id: 世界书本体槽位.变量模型用户_世界演变已更新,
                内置槽位: 世界书本体槽位.变量模型用户_世界演变已更新,
                标题: '独立变量生成API · 附加规则（世界演变已更新）',
                内置分类: '变量生成',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 构建变量模型用户附加规则提示词()
            }),
            创建内置预设条目({
                id: 世界书本体槽位.变量模型COT,
                内置槽位: 世界书本体槽位.变量模型COT,
                标题: '独立变量生成API · COT',
                内置分类: '变量生成',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 变量校准COT提示词
            }),
            创建内置预设条目({
                id: 世界书本体槽位.开局初始化任务_启用生存,
                内置槽位: 世界书本体槽位.开局初始化任务_启用生存,
                标题: '开局生成 · 初始化任务本体（启用生存）',
                内置分类: '开局',
                类型: 'system_rule',
                作用域: ['opening'],
                内容: 获取开场初始化任务提示词({ 启用饱腹口渴系统: true })
            }),
            创建内置预设条目({
                id: 世界书本体槽位.开局初始化任务_禁用生存,
                内置槽位: 世界书本体槽位.开局初始化任务_禁用生存,
                标题: '开局生成 · 初始化任务本体（禁用生存）',
                内置分类: '开局',
                类型: 'system_rule',
                作用域: ['opening'],
                内容: 获取开场初始化任务提示词({ 启用饱腹口渴系统: false })
            }),
            创建内置预设条目({
                id: 'builtin_body_polish_prompt',
                内置槽位: 'builtin_body_polish_prompt',
                标题: '文章优化 · 默认提示词',
                内置分类: '文章优化',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 默认文章优化提示词
            }),
            创建内置预设条目({
                id: 'builtin_body_polish_cot',
                内置槽位: 'builtin_body_polish_cot',
                标题: '文章优化 · COT',
                内置分类: '文章优化',
                类型: 'system_rule',
                作用域: ['main'],
                内容: 核心_文章优化思维链.内容
            }),
            创建内置预设条目({
                id: 'builtin_recall_system_prompt',
                内置槽位: 'builtin_recall_system_prompt',
                标题: '回忆 · 检索系统提示词',
                内置分类: '回忆',
                类型: 'system_rule',
                作用域: ['recall'],
                内容: `${剧情回忆检索COT提示词}\n\n${剧情回忆检索输出格式提示词}`
            }),
            创建内置预设条目({
                id: 'builtin_world_evolution_system_prompt',
                内置槽位: 'builtin_world_evolution_system_prompt',
                标题: '世界演变 · 系统提示词',
                内置分类: '世界演变',
                类型: 'system_rule',
                作用域: ['world_evolution'],
                内容: 构建世界演变系统提示词()
            }),
            创建内置预设条目({
                id: 'builtin_world_evolution_cot',
                内置槽位: 'builtin_world_evolution_cot',
                标题: '世界演变 · COT',
                内置分类: '世界演变',
                类型: 'system_rule',
                作用域: ['world_evolution'],
                内容: 世界演变COT提示词
            }),
        ],
        创建时间: 1,
        更新时间: 1
    };
};
