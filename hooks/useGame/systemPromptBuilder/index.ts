// Re-export types
export type {
    运行时提示词状态,
    系统提示词上下文片段,
    系统提示词构建结果,
    系统提示词构建参数
} from './types';

// Re-export core utilities
export {
    包装树状上下文,
    主剧情剥离提示词ID,
    格式化展示上下文,
    序列化展示上下文,
    树状上下文缩进,
    树状上下文为空,
    格式化树状上下文标量,
    读取树状上下文对象摘要,
    追加树状上下文行,
    序列化树状上下文,
    剥离真实模式专项审计
} from './coreBlocks';

// Re-export state blocks
export {
    构建环境状态文本,
    构建角色状态文本,
    构建世界状态文本,
    构建战斗状态文本,
    构建门派状态文本,
    构建任务列表文本,
    构建约定列表文本,
    构建地图建筑状态文本
} from './stateBlocks';

// Re-export social blocks
export { 构建社交上下文 } from './socialBlocks';

// Re-export memory blocks
export {
    构建长期记忆文本,
    构建中期记忆文本,
    构建中长记忆上下文,
    构建短期记忆上下文,
    构建记忆上下文
} from './memoryBlocks';

// Re-export planning blocks
export {
    构建剧情安排,
    构建女主剧情规划文本
} from './planningBlocks';

// Main orchestration function
import type { 系统提示词构建参数, 系统提示词构建结果, 运行时提示词状态 } from './types';
import { 规范化游戏设置 } from '../../../utils/gameSettings';
import { 规范化记忆配置 } from '../memory/memoryUtils';
import { 格式化短期记忆展示文本 } from '../memory/memoryUtils';
import { 构建NPC上下文 } from '../npc/npcContext';
import { normalizeCanonicalGameTime, 环境时间转标准串 } from '../time/timeUtils';
import {
    构建世界书注入文本,
    世界书本体槽位
} from '../../../utils/worldbook';
import { 构建主剧情难度摘要提示词 } from '../../../prompts/runtime/promptOwnership';
import { 获取内置提示词槽位内容 } from '../../../utils/builtinPrompts';
import { 按功能开关过滤提示词内容, 裁剪修炼体系上下文数据, 裁剪里武侠上下文数据, 裁剪里志怪上下文数据 } from '../../../utils/promptFeatureToggles';
import {
    构建运行时提示词池,
    剥离NoControl关联提示词,
    规范化比较文本,
} from '../promptRuntime';
import { 构建AI角色声明提示词 } from '../../../prompts/runtime/roleIdentity';
import { 构建在场NPC_NSWF卡片组 } from '../../../prompts/runtime/nsfwCard';
import {
    构建字数要求提示词,
    构建免责声明输出要求提示词,
    获取输出协议提示词,
    获取行动选项提示词
} from '../../../prompts/runtime/protocolDirectives';
import {
    规范化剧情状态,
    规范化剧情规划状态,
    规范化女主剧情规划状态,
    规范化同人剧情规划状态,
    规范化同人女主剧情规划状态,
    规范化世界状态,
    规范化战斗状态
} from '../storyState';
import { 构建同人运行时提示词包, 应用境界体系区块替换 } from '../../../prompts/runtime/fandom';
import { 计算气运属性修正 } from '../../../data/qiyun';
import { 构建女主剧情规划协议 } from '../../../prompts/core/heroinePlan';
import { 构建女主规划专项提示词 } from '../../../prompts/core/heroinePlanCot';
import { 核心_境界体系 } from '../../../prompts/core/realm';
import { 构建里武侠世界提示词 } from '../../../prompts/runtime/liWuxiaWorld';
import { 构建里志怪世界提示词 } from '../../../prompts/runtime/liZhiguaiWorld';
import { 构建志怪世界提示词 } from '../../../prompts/runtime/zhiguaiWorld';
import { 构建时代主题注入, 构建时代文风注入 } from '../../../prompts/runtime/eraTheme';
import { 获取时代现实提示词ByEraId } from '../../../prompts/core/eraRealism';
import { 构建子纪元里模式注入, 子纪元里模式是否已注入, 构建里模式NPC原型注入, 构建里模式阶段注入 } from '../../../prompts/runtime/eraLiMode';
import type { 世界书作用域 } from '../../../types';
import type { LiModeStage } from '../../../models/eraTheme/types';
import { 构建行动选项运行时指令 } from '../../../prompts/runtime/actionOptionsRuntime';
import { 构建校规注入提示词, 构建催眠注入提示词 } from '../campusPromptInjector';
import { 构建设备通讯摘要 } from '../device/triggerDeviceMessageWorkflow';
import { 构建BDSM论坛叙事约束 } from '../../../prompts/runtime/bdsmForum';
import { 检查到期见面预约, 构建见面注入提示词 } from '../bdsmMeetingTrigger';
import { 主剧情剥离提示词ID } from './coreBlocks';
import { 剥离真实模式专项审计 } from './coreBlocks';
import { 包装树状上下文 } from './coreBlocks';
import { 构建环境状态文本 } from './stateBlocks';
import { 构建角色状态文本 } from './stateBlocks';
import { 构建世界状态文本 } from './stateBlocks';
import { 构建战斗状态文本 } from './stateBlocks';
import { 构建门派状态文本 } from './stateBlocks';
import { 构建任务列表文本 } from './stateBlocks';
import { 构建约定列表文本 } from './stateBlocks';
import { 构建地图建筑状态文本 } from './stateBlocks';
import { 构建剧情安排 } from './planningBlocks';
import { 构建女主剧情规划文本 } from './planningBlocks';

export const 构建系统提示词 = ({
    promptPool,
    memoryData,
    socialData,
    statePayload,
    gameConfig,
    memoryConfig,
    fallbackPlayerName,
    builtinPromptEntries,
    worldbooks,
    worldEvolutionEnabled,
    deviceMessages,
    options
}: 系统提示词构建参数): 系统提示词构建结果 => {
    const perspectivePromptIds = [
        'write_perspective_first',
        'write_perspective_second',
        'write_perspective_third'
    ];
    const normalizedGameConfig = 规范化游戏设置(gameConfig);
    const 启用修炼体系 = normalizedGameConfig.启用修炼体系 !== false;
    const activeWorldbookScopes: 世界书作用域[] = Array.isArray(options?.世界书作用域) && options.世界书作用域.length > 0
        ? options.世界书作用域 as 世界书作用域[]
        : [normalizedGameConfig.启用酒馆预设模式 === true ? 'tavern' : 'main'] as 世界书作用域[];
    const openingConfig = options?.openingConfig
        || statePayload?.开局配置
        || statePayload?.openingConfig;
    const worldbookInjection = 构建世界书注入文本({
        books: Array.isArray(worldbooks) ? worldbooks : [],
        scopes: activeWorldbookScopes,
        environment: statePayload?.环境,
        social: socialData,
        world: statePayload?.世界,
        extraTexts: options?.世界书附加文本
    });
    const { promptPool: effectivePromptPool, selectedCotPromptIds } = 构建运行时提示词池(
        promptPool,
        normalizedGameConfig,
        {
            启用世界演变分流: options?.禁用世界演变分流 === true ? false : worldEvolutionEnabled,
            openingConfig,
            强制剧情COT提示词ID: options?.强制剧情COT提示词ID
        }
    );
    const selectedPerspectiveIdMap: Record<string, string> = {
        第一人称: 'write_perspective_first',
        第二人称: 'write_perspective_second',
        第三人称: 'write_perspective_third'
    };
    const selectedPerspectiveId = selectedPerspectiveIdMap[normalizedGameConfig.叙事人称] || 'write_perspective_second';
    const selectedPerspectivePrompt = effectivePromptPool.find(p => p.id === selectedPerspectiveId);
    const fallbackPerspectivePrompt = effectivePromptPool.find(p => perspectivePromptIds.includes(p.id) && p.启用);

    const playerName = statePayload?.角色?.姓名 || fallbackPlayerName || '未命名';
    const 渲染提示词文本 = (content: string) => {
        const rendered = (content || '').replace(/\$\{playerName\}/g, playerName);
        return normalizedGameConfig.启用防止说话 === false
            ? 剥离NoControl关联提示词(rendered)
            : rendered;
    };
    const 按当前设置过滤提示词 = (content: string): string => 按功能开关过滤提示词内容(content, normalizedGameConfig);
    const 读取主剧情内置槽位覆盖 = (promptId: string, fallbackContent: string): string => {
        switch (promptId) {
            case 'core_world':
                return fallbackContent;
            case 'core_format':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情输出协议,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'core_heroine_plan':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情女主规划_常规,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'core_heroine_plan_ntl':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情女主规划_NTL,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'core_heroine_plan_cot':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情女主规划思考_常规,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'core_heroine_plan_cot_ntl':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情女主规划思考_NTL,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'core_cot':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情COT_常规,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'core_cot_heroine_variant':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情COT_女主规划,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'core_cot_heroine_ntl_variant':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.主剧情COT_NTL女主规划,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'write_style':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.写作文风,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'write_emotion_guard':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.写作避免极端情绪,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            case 'write_no_control':
                return 获取内置提示词槽位内容({
                    entries: builtinPromptEntries,
                    slotId: 世界书本体槽位.写作NoControl,
                    fallback: fallbackContent,
                    variables: { playerName }
                });
            default:
                return fallbackContent;
        }
    };
    const ai角色声明 = 获取内置提示词槽位内容({
        entries: builtinPromptEntries,
        slotId: 世界书本体槽位.主剧情AI角色声明,
        fallback: 构建AI角色声明提示词(playerName),
        variables: { playerName }
    });
    const 应用写作设置 = (promptId: string, content: string) => {
        if (promptId !== 'write_req') return content;
        const lengthRule = `<字数>本次<正文>标签内内容必须达到${normalizedGameConfig.字数要求}字以上。</字数>`;
        if (/<字数>[\s\S]*?<\/字数>/m.test(content)) {
            return content.replace(/<字数>[\s\S]*?<\/字数>/m, lengthRule);
        }
        if (/- 单条旁白建议.*$/m.test(content)) {
            return content.replace(/- 单条旁白建议.*$/m, lengthRule);
        }
        return `${content.trim()}\n${lengthRule}`;
    };

    const enabledPrompts = effectivePromptPool.filter(p => p.启用);
    const worldPromptSource = enabledPrompts.find(p => p.id === 'core_world');
    const realmPromptSource = enabledPrompts.find(p => p.id === 'core_realm');
    const worldPrompt = 按当前设置过滤提示词([
        渲染提示词文本(worldPromptSource?.内容 || ''),
        worldbookInjection.worldLoreText
    ]
        .filter(Boolean)
        .join('\n\n'));
    const realmPromptRaw = 启用修炼体系
        ? 渲染提示词文本(realmPromptSource?.内容 || '')
        : '';
    const realmPrompt = !启用修炼体系 || realmPromptRaw.includes('开局后此处会被完整替换')
        ? ''
        : realmPromptRaw;
    const fandomPromptBundle = 构建同人运行时提示词包({
        openingConfig,
        worldPrompt,
        realmPrompt
    });
    const 应用境界区块替换 = (content: string): string => (
        启用修炼体系 && fandomPromptBundle.enabled
            ? 应用境界体系区块替换(content, fandomPromptBundle)
            : content
    );
    const writeReqPrompt = enabledPrompts.find(p => p.id === 'write_req');
    const writeReqContent = writeReqPrompt
        ? 按当前设置过滤提示词(应用写作设置(writeReqPrompt.id, 渲染提示词文本(writeReqPrompt.内容)))
        : '';
    const 读取运行时提示词内容 = (promptId: string): string => {
        if (主剧情剥离提示词ID.has(promptId)) return '';
        const sourcePrompt = effectivePromptPool.find((item) => item.id === promptId)
            || promptPool.find((item) => item.id === promptId);
        if (!sourcePrompt?.内容) return '';
        return 按当前设置过滤提示词(应用境界区块替换(应用写作设置(
            promptId,
            渲染提示词文本(读取主剧情内置槽位覆盖(promptId, sourcePrompt.内容))
        )));
    };
    const 开局剧情推动协议内容 = options?.注入剧情推动协议 === true
        ? 读取运行时提示词内容('core_story')
        : '';
    const 读取运行时女主协议内容 = (params: { ntl: boolean; thinking: boolean }): { id: string; content: string } => {
        const id = params.thinking
            ? (params.ntl ? 'core_heroine_plan_cot_ntl' : 'core_heroine_plan_cot')
            : (params.ntl ? 'core_heroine_plan_ntl' : 'core_heroine_plan');
        if (主剧情剥离提示词ID.has(id)) {
            return { id, content: '' };
        }
        if (!fandomPromptBundle.enabled) {
            return {
                id,
                content: 读取运行时提示词内容(id)
            };
        }
        const runtimeContent = params.thinking
            ? 构建女主规划专项提示词({ ntl: params.ntl, fandom: true })
            : 构建女主剧情规划协议({ ntl: params.ntl, fandom: true });
        return {
            id,
            content: 应用写作设置(id, 渲染提示词文本(runtimeContent))
        };
    };
    const 开局女主协议提示词 = (() => {
        if (options?.注入女主剧情规划协议 !== true || normalizedGameConfig.启用女主剧情规划 !== true) {
            return [] as Array<{ id: string; content: string }>;
        }
        const ntlEnabled = normalizedGameConfig.剧情风格 === 'NTL后宫';
        return [
            读取运行时女主协议内容({ ntl: ntlEnabled, thinking: false }),
            读取运行时女主协议内容({ ntl: ntlEnabled, thinking: true })
        ]
            .filter((item) => item.content.trim().length > 0);
    })();
    const difficultyPromptSummary = 按当前设置过滤提示词(
        构建主剧情难度摘要提示词(promptPool)
    );
    const cotPromptEntries = enabledPrompts
        .filter(p => selectedCotPromptIds.includes(p.id))
        .map(p => ({ id: p.id, content: 应用境界区块替换(应用写作设置(p.id, 渲染提示词文本(读取主剧情内置槽位覆盖(p.id, p.内容)))) }));
    const formatPromptEntries = enabledPrompts
        .filter(p => p.id === 'core_format')
        .map(p => ({ id: p.id, content: 应用境界区块替换(应用写作设置(p.id, 渲染提示词文本(读取主剧情内置槽位覆盖(p.id, p.内容)))) }));
    const otherPromptEntries = enabledPrompts
        .filter(p => p.id !== 'core_world'
            && p.id !== 'core_realm'
            && p.id !== 'core_action_options'
            && p.id !== 'core_format'
            && p.id !== 'core_story'
            && p.id !== 'core_heroine_plan'
            && p.id !== 'core_heroine_plan_ntl'
            && p.id !== 'core_heroine_plan_cot'
            && p.id !== 'core_heroine_plan_cot_ntl'
            && !perspectivePromptIds.includes(p.id)
            && p.id !== 'write_req'
            && !selectedCotPromptIds.includes(p.id)
            && p.类型 !== '难度设定')
        .map(p => ({ id: p.id, content: 应用境界区块替换(应用写作设置(p.id, 渲染提示词文本(读取主剧情内置槽位覆盖(p.id, p.内容)))) }));
    const actionOptionsPromptContent = options?.禁用行动选项提示词
        ? ''
        : 按当前设置过滤提示词(渲染提示词文本(
            获取行动选项提示词(effectivePromptPool, normalizedGameConfig.启用行动选项)
        ));
    const actionOptionsRuntimeDirectives = normalizedGameConfig.启用行动选项
        ? 构建行动选项运行时指令(normalizedGameConfig)
        : '';
    const activePerspectivePromptId = selectedPerspectivePrompt?.id || fallbackPerspectivePrompt?.id || '';
    const activePerspectiveContent = 应用写作设置(
        activePerspectivePromptId,
        渲染提示词文本(selectedPerspectivePrompt?.内容 || fallbackPerspectivePrompt?.内容 || '')
    );
    const difficultyPrompts = difficultyPromptSummary.trim();
    const fandomSummaryPrompt = 按当前设置过滤提示词(fandomPromptBundle.同人设定摘要 || '');
    const realmTemplatePrompt = 启用修炼体系
        ? 按当前设置过滤提示词(渲染提示词文本(核心_境界体系.内容))
        : '';
    const 设备通讯摘要 = deviceMessages && deviceMessages.length > 0
        ? 构建设备通讯摘要({ messages: deviceMessages })
        : '';
    const otherPrompts = [
        ...otherPromptEntries.map(item => item.content),
        开局剧情推动协议内容,
        ...开局女主协议提示词.map(item => item.content),
        actionOptionsPromptContent,
        actionOptionsRuntimeDirectives,
        按当前设置过滤提示词(worldbookInjection.systemRuleText),
        构建时代主题注入(options?.eraId),
        构建时代文风注入(options?.eraId),
        获取时代现实提示词ByEraId(options?.eraId),
        构建子纪元里模式注入(options?.eraId, normalizedGameConfig.启用子纪元里模式?.[options?.eraId ?? ''] ?? true, normalizedGameConfig.子纪元里模式强度?.[options?.eraId ?? '']),
        (() => {
            const liModeEnabled = normalizedGameConfig.启用子纪元里模式?.[options?.eraId ?? ''] !== false;
            const stage = normalizedGameConfig.子纪元里模式阶段?.[options?.eraId ?? ''] ?? '羞耻' as LiModeStage;
            return 构建里模式阶段注入(options?.eraId, stage, liModeEnabled);
        })(),
        构建里模式NPC原型注入(options?.eraId, normalizedGameConfig.启用子纪元里模式?.[options?.eraId ?? ''] ?? true),
        // 里武侠：子纪元 liMode 已注入则跳过 legacy 版本（内容重复）
        !子纪元里模式是否已注入(options?.eraId, normalizedGameConfig.启用子纪元里模式)
        && normalizedGameConfig.启用里武侠模式 === true ? 构建里武侠世界提示词() : null,
        // 里志怪：子纪元 liMode 已注入则跳过 legacy 版本（内容重复）
        !子纪元里模式是否已注入(options?.eraId, normalizedGameConfig.启用子纪元里模式)
        && normalizedGameConfig.启用里志怪模式 === true ? 构建里志怪世界提示词() : null,
        // 表志怪：古代体系选择为志怪/双修时注入，里志怪已开启则跳过（避免重复）
        (normalizedGameConfig.古代体系选择 === '志怪' || normalizedGameConfig.古代体系选择 === '双修')
            && normalizedGameConfig.启用里志怪模式 !== true
            ? 构建志怪世界提示词() : null,
        // 校园系统：校规与催眠注入
        (() => {
            const 校规系统 = statePayload?.校规系统;
            if (!校规系统?.校规列表?.length) return null;
            return 构建校规注入提示词({ 校规列表: 校规系统.校规列表 });
        })(),
        (() => {
            const 催眠系统 = statePayload?.催眠系统;
            if (!催眠系统?.催眠记录列表?.length) return null;
            return 构建催眠注入提示词({ 催眠记录列表: 催眠系统.催眠记录列表 });
        })(),
        // 校园系统：BDSM 论坛活跃帖子注入
        (() => {
            const 校园系统 = statePayload?.校园系统;
            const posts = 校园系统?.BDSM帖子列表;
            if (!posts?.length) return null;
            const 寻主召奴未联系 = posts.filter(p =>
                p.寻主召奴信息 && !p.寻主召奴信息.是否已联系
            ).length;
            return 构建BDSM论坛叙事约束({
                活跃帖子数: Math.min(posts.length, 5),
                内容强度: 校园系统.BDSM内容强度 || '轻度',
                寻主召奴未联系帖数: 寻主召奴未联系,
            });
        })(),
        // 校园系统：BDSM 关系管线 — 活跃任务与关系状态注入
        (() => {
            const 校园系统 = statePayload?.校园系统;
            const 欲望系统 = 校园系统?.欲望系统;
            if (!欲望系统?.NPC欲望档案) return null;

            const 关系文本: string[] = [];
            for (const [npcId, 档案] of Object.entries(欲望系统.NPC欲望档案)) {
                const bdsm = (档案 as any).BDSM关系;
                if (!bdsm || bdsm.阶段 === '初识' && !bdsm.任务历史?.length) continue;

                const npc = socialData?.find((s: any) => s.id === npcId);
                const npcName = npc?.姓名 || npcId;

                关系文本.push(`【${npcName}】BDSM 关系阶段: ${bdsm.阶段}, 服从度: ${bdsm.服从度}/100`);

                const 活跃任务 = (bdsm.任务历史 || [])
                    .filter((t: any) => t.状态 === '进行中' || t.状态 === '待接受')
                    .slice(0, 3);
                if (活跃任务.length > 0) {
                    关系文本.push('  活跃任务:');
                    活跃任务.forEach((t: any) => {
                        关系文本.push(`  - [${t.状态}] ${t.标题}: ${t.描述?.slice(0, 40)}`);
                    });
                }

                const 未完成指令 = (bdsm.日常指令 || []).filter((d: any) => !d.是否完成);
                if (未完成指令.length > 0) {
                    关系文本.push(`  未完成指令: ${未完成指令.map((d: any) => d.content).join('；')}`);
                }

                const 契约 = (bdsm.契约记录 || []).find((c: any) => c.状态 !== '已解除');
                if (契约) {
                    关系文本.push(`  契约: ${契约.类型} (${契约.条款列表?.join('、') || '无具体条款'})`);
                }
            }

            if (关系文本.length === 0) return null;
            return `## BDSM 关系管线\n\n${关系文本.join('\n')}`;
        })(),
        // 校园纪元 v2.0：NPC 关系状态注入
        (() => {
            const 社交列表 = statePayload?.社交;
            if (!社交列表?.length) return null;

            const 关系文本: string[] = [];
            for (const npc of 社交列表) {
                const 关系数据 = (npc as any).关系数据;
                if (!关系数据 || 关系数据.关系类型 === '陌生' && 关系数据.互动次数 === 0) continue;

                const 摘要 = `【${npc.姓名}】${关系数据.关系类型} · ${关系数据.关系状态} ` +
                    `好感${关系数据.好感度} 亲密${关系数据.亲密度} 信任${关系数据.信任度} 感情${关系数据.感情值}`;

                关系文本.push(摘要);

                // 解锁场景提示
                if (关系数据.解锁场景?.length > 0) {
                    关系文本.push(`  已解锁场景: ${关系数据.解锁场景.join('、')}`);
                }

                // 近期关系事件
                const 最近事件 = 关系数据.关键事件?.slice(-2);
                if (最近事件?.length > 0) {
                    关系文本.push(`  最近: ${最近事件.map((e: any) => e.标题).join('、')}`);
                }
            }

            if (关系文本.length === 0) return null;
            return `## NPC 关系状态\n\n${关系文本.join('\n')}`;
        })(),
        // 校园系统：BDSM 见面预约触发
        (() => {
            const 校园系统 = statePayload?.校园系统;
            const 预约列表 = 校园系统?.见面预约列表;
            const 当前回合 = (statePayload?.历史记录 as unknown[] | undefined)?.length ?? 0;
            const 到期预约 = 检查到期见面预约(预约列表, 当前回合);
            if (到期预约.length === 0) return null;
            // 只取最早到期的一个，避免 prompt 过长
            const 首个到期 = 到期预约[0];
            return 构建见面注入提示词(首个到期);
        })(),
        设备通讯摘要 || null
    ]
        .filter(Boolean)
        .join('\n\n');
    const cotPromptRaw = cotPromptEntries.map(item => item.content).filter(Boolean).join('\n\n');
    const cotPromptAfterRealMode = normalizedGameConfig.启用真实世界模式 === true
        ? cotPromptRaw
        : 剥离真实模式专项审计(cotPromptRaw);
    const cotPrompt = cotPromptAfterRealMode.trim();
    const formatPrompt = formatPromptEntries.map(item => item.content).filter(Boolean).join('\n\n');
    const outputProtocolPromptRaw = [
        formatPrompt || 渲染提示词文本(获取输出协议提示词(effectivePromptPool)),
        worldbookInjection.commandRuleText,
        worldbookInjection.outputRuleText
    ]
        .filter(Boolean)
        .join('\n\n');
    const outputProtocolPrompt = (() => {
        const normalizedProtocol = 规范化比较文本(outputProtocolPromptRaw);
        if (!normalizedProtocol) return '';
        const normalizedOtherPrompts = 规范化比较文本(otherPrompts);
        if (!normalizedOtherPrompts) return outputProtocolPromptRaw.trim();
        return normalizedOtherPrompts.includes(normalizedProtocol)
            ? ''
            : outputProtocolPromptRaw.trim();
    })();
    const lengthRequirementPrompt = 构建字数要求提示词(normalizedGameConfig.字数要求);
    const disclaimerRequirementPrompt = normalizedGameConfig.启用免责声明输出
        ? 构建免责声明输出要求提示词()
        : '';
    const 实际发送提示词ID = new Set<string>();
    const 标记提示词发送 = (id: string, content: string) => {
        if (!id) return;
        if (!(content || '').trim()) return;
        实际发送提示词ID.add(id);
    };
    if (worldPromptSource) {
        标记提示词发送(worldPromptSource.id, worldPrompt);
    }
    if (realmPromptSource) {
        标记提示词发送(realmPromptSource.id, realmTemplatePrompt);
    }
    if (writeReqPrompt) {
        标记提示词发送(writeReqPrompt.id, writeReqContent);
    }
    cotPromptEntries.forEach(item => 标记提示词发送(item.id, item.content));
    otherPromptEntries.forEach(item => 标记提示词发送(item.id, item.content));
    标记提示词发送('core_story', 开局剧情推动协议内容);
    开局女主协议提示词.forEach(item => 标记提示词发送(item.id, item.content));
    标记提示词发送('core_action_options', actionOptionsPromptContent);
    标记提示词发送(activePerspectivePromptId, activePerspectiveContent);
    const 原始提示词索引 = new Map(promptPool.map(p => [p.id, p] as const));
    const runtimePromptStates: Record<string, 运行时提示词状态> = {};
    effectivePromptPool.forEach((runtimePrompt) => {
        const rawPrompt = 原始提示词索引.get(runtimePrompt.id);
        const 当前启用 = 实际发送提示词ID.has(runtimePrompt.id);
        const 原始启用 = rawPrompt?.启用 === true;
        runtimePromptStates[runtimePrompt.id] = {
            当前启用,
            原始启用,
            受运行时接管: rawPrompt ? 当前启用 !== 原始启用 : true,
            运行时注入: !rawPrompt
        };
    });
    promptPool.forEach((rawPrompt) => {
        if (runtimePromptStates[rawPrompt.id]) return;
        const 原始启用 = rawPrompt.启用 === true;
        const 当前启用 = 实际发送提示词ID.has(rawPrompt.id);
        runtimePromptStates[rawPrompt.id] = {
            当前启用,
            原始启用,
            受运行时接管: 当前启用 !== 原始启用,
            运行时注入: false
        };
    });
    实际发送提示词ID.forEach((id) => {
        if (runtimePromptStates[id]) return;
        runtimePromptStates[id] = {
            当前启用: true,
            原始启用: false,
            受运行时接管: true,
            运行时注入: true
        };
    });

    const npcContext = 构建NPC上下文(socialData || [], memoryConfig, {
        worldPrompt,
        realmPrompt,
        openingConfig,
        cultivationSystemEnabled: 启用修炼体系,
        eraId: options?.eraId,
        启用子纪元里模式: normalizedGameConfig.启用子纪元里模式,
        子纪元里模式阶段: normalizedGameConfig.子纪元里模式阶段
    });
    const contextMapAndBuilding = 构建地图建筑状态文本(statePayload);
    const promptHeader = [
        worldPrompt.trim(),
        contextMapAndBuilding,
        npcContext.离场数据块,
        fandomSummaryPrompt,
        realmTemplatePrompt,
        otherPrompts.trim()
    ].filter(Boolean).join('\n\n');

    const longMemory = options?.禁用中期长期记忆
        ? ''
        : `【长期记忆】\n${memoryData.长期记忆.join('\n') || '暂无'}`;
    const midMemory = options?.禁用中期长期记忆
        ? ''
        : `【中期记忆】\n${memoryData.中期记忆.join('\n') || '暂无'}`;
    const contextMemory = options?.禁用中期长期记忆 ? '' : `${longMemory}\n${midMemory}`;
    const contextNPCData = npcContext.在场数据块;
    const nsfwCardBlock = normalizedGameConfig.启用NSFW模式
        ? 构建在场NPC_NSWF卡片组(
            socialData || [],
            openingConfig?.nsfw场景类型 ?? '无',
            { 时代配置ID: options?.eraId }
        )
        : '';
    const contextStoryPlan = 构建剧情安排(statePayload);
    const contextHeroinePlan = normalizedGameConfig.启用女主剧情规划
        ? 构建女主剧情规划文本(statePayload)
        : '';
    const contextWorldState = 构建世界状态文本(statePayload, gameConfig);
    const contextEnvironmentState = 构建环境状态文本(statePayload);
    const contextRoleState = 构建角色状态文本(statePayload, gameConfig);
    const contextBattleState = 构建战斗状态文本(statePayload);
    const contextSectState = 构建门派状态文本(statePayload, gameConfig);
    const contextTaskState = 构建任务列表文本(statePayload, gameConfig);
    const contextAgreementState = 构建约定列表文本(statePayload);
    const normalizedMemoryConfig = 规范化记忆配置(memoryConfig);
    const shortMemoryInjectLimit = Math.max(1, Number(normalizedMemoryConfig.短期记忆阈值) || 30);
    const shortMemoryEntries = options?.禁用短期记忆
        ? []
        : memoryData.短期记忆
            .slice(-shortMemoryInjectLimit)
            .map((item) => 格式化短期记忆展示文本(item))
            .filter(Boolean);
    const shortMemoryContext = options?.禁用短期记忆
        ? ''
        : shortMemoryEntries.length > 0
            ? `【短期记忆】\n${shortMemoryEntries.join('\n')}`
            : '';

    return {
        systemPrompt: [
            promptHeader,
            difficultyPrompts,
            activePerspectiveContent,
            writeReqContent,
            contextMemory,
            contextStoryPlan,
            contextNPCData,
            nsfwCardBlock,
            contextHeroinePlan,
            contextWorldState,
            contextEnvironmentState,
            contextRoleState,
            contextBattleState,
            contextSectState,
            contextTaskState,
            contextAgreementState,
            cotPrompt
        ].filter(Boolean).join('\n\n'),
        shortMemoryContext,
        runtimePromptStates,
        contextPieces: {
            AI角色声明: ai角色声明,
            worldPrompt: worldPrompt.trim(),
            地图建筑状态: contextMapAndBuilding,
            同人设定摘要: fandomSummaryPrompt,
            境界体系提示词: realmTemplatePrompt,
            otherPrompts: otherPrompts.trim(),
            难度设置提示词: difficultyPrompts.trim(),
            叙事人称提示词: activePerspectiveContent.trim(),
            字数设置提示词: writeReqContent.trim(),
            COT提示词: cotPrompt.trim(),
            格式提示词: formatPrompt.trim(),
            输出协议提示词: outputProtocolPrompt,
            字数要求提示词: lengthRequirementPrompt,
            免责声明输出提示词: disclaimerRequirementPrompt,
            离场NPC档案: npcContext.离场数据块,
            长期记忆: longMemory,
            中期记忆: midMemory,
            在场NPC档案: contextNPCData,
            剧情安排: contextStoryPlan,
            女主剧情规划状态: contextHeroinePlan,
            世界状态: contextWorldState,
            环境状态: contextEnvironmentState,
            角色状态: contextRoleState,
            战斗状态: contextBattleState,
            门派状态: contextSectState,
            任务状态: contextTaskState,
            约定状态: contextAgreementState,
            NSFW角色卡片: nsfwCardBlock
        }
    };
};
