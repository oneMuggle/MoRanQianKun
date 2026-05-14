import * as textAIService from '../../../../services/ai/text';
import type { GameResponse } from '../../../../types';
import type { 当前可用接口结构 } from '../../../../utils/apiConfig';
import { 获取世界演变接口配置, 获取规划分析接口配置, 获取变量计算接口配置, 接口配置是否可用 } from '../../../../utils/apiConfig';
import { 核心_开局思维链, 获取开局思维链提示词 } from '../../../../prompts/core/cotOpening';
import { 核心_境界体系 } from '../../../../prompts/core/realm';
import { 获取开场初始化任务提示词 } from '../../../../prompts/runtime/opening';
import { 气运初始化任务提示词 } from '../../../../prompts/runtime/qiyun';
import { 构建时代开局场景注入 } from '../../../../prompts/runtime/eraOpeningScene';
import { 构建开局配置提示词 } from '../../../../prompts/runtime/openingConfig';
import { 构建同人运行时提示词包, 校验境界体系提示词完整性 } from '../../../../prompts/runtime/fandom';
import { 数值_世界演化 } from '../../../../prompts/stats/world';
import { 构建字数要求提示词 } from '../../../../prompts/runtime/protocolDirectives';
import { 构建剧情风格助手提示词 } from '../../../../prompts/runtime/storyStyles';
import { 构建真实世界模式提示词 } from '../../../../prompts/runtime/realWorldMode';
import { 构建运行时额外提示词 } from '../../../../prompts/runtime/nsfw';
import { 世界书本体槽位, 构建世界书注入文本 } from '../../../../utils/worldbook';
import { 获取内置提示词槽位内容, 获取剧情风格内置槽位 } from '../../../../utils/builtinPrompts';
import {
    构建COT伪装提示词,
    构建酒馆预设消息链,
    酒馆预设模式可用,
    type 酒馆上下文结构
} from '../../promptRuntime';
import { 提取响应规划文本 } from '../../quality/thinkingContext';
import { 环境时间转标准串 } from '../../time/timeUtils';
import { 获取开局小说拆分注入文本 } from '../../../../services/novel-decomposition/novelDecompositionInjection';
import { 按功能开关过滤提示词内容 } from '../../../../utils/promptFeatureToggles';
import { 规范化游戏设置 } from '../../../../utils/gameSettings';
import * as dbService from '../../../../services/dbService';
import { 设置键 } from '../../../../utils/settingsSchema';
import type { 开场剧情生成依赖, 开场命令基态 } from './types';
import { 构建开局角色建档摘要, 读取提示词内容 } from './utils';

export interface OpeningNarrativeResult {
    aiResult: {
        response: GameResponse;
        rawText: string;
    };
    aiData: GameResponse;
    openingBodyText: string;
    openingVariablePlanText: string;
    openingPlanText: string;
    openingWorldPrompt: string;
    openingWorldEvolutionPrompt: string;
    openingRealmPrompt: string;
    openingRealmPromptRaw: string;
    openingRuntimeFandomBundle: { enabled: boolean; 开局任务补丁?: string; 开局COT补丁?: string; 境界母板补丁?: string; 同人设定摘要?: string };
    openingPromptSnapshot: any[];
    openingGameConfig: any;
    openingRoleSetupText: string;
    openingConfigText: string;
    openingOrderedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    openingAutoRetryEnabled: boolean;
    openingInputTokens: number;
    openingTavernPresetModeEnabled: boolean;
    openingLatestUserInputRole: 'assistant' | 'user';
    openingStreamHeartbeat: ReturnType<typeof setInterval> | null;
    openingDeltaReceived: boolean;
    streamMarker: number;
    openingRequestStartedAt: number;
    commandBaseState: 开场命令基态;
    responseForExecution: GameResponse;
    simulatedOpeningState: 开场命令基态;
}

export async function 执行开场叙事生成阶段(
    contextData: any,
    promptSnapshot: any[],
    useStreaming: boolean,
    apiForOpening: 当前可用接口结构,
    options: {
        命令基态?: 开场命令基态;
        开局额外要求?: string;
        开局配置?: any;
        eraId?: string | null;
    } | undefined,
    deps: 开场剧情生成依赖
): Promise<{
    aiResult: { response: GameResponse; rawText: string };
    aiData: GameResponse;
    openingBodyText: string;
    openingVariablePlanText: string;
    openingPlanText: string;
    openingWorldPrompt: string;
    openingWorldEvolutionPrompt: string;
    openingRealmPrompt: string;
    openingRealmPromptRaw: string;
    openingRuntimeFandomBundle: { enabled: boolean; 开局任务补丁?: string; 开局COT补丁?: string; 境界母板补丁?: string; 同人设定摘要?: string };
    openingPromptSnapshot: any[];
    openingGameConfig: any;
    openingRoleSetupText: string;
    openingConfigText: string;
    openingOrderedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    openingAutoRetryEnabled: boolean;
    openingInputTokens: number;
    openingTavernPresetModeEnabled: boolean;
    openingLatestUserInputRole: 'assistant' | 'user';
    openingStreamHeartbeat: ReturnType<typeof setInterval> | null;
    openingDeltaReceived: boolean;
    streamMarker: number;
    openingRequestStartedAt: number;
    commandBaseState: 开场命令基态;
    responseForExecution: GameResponse;
    simulatedOpeningState: 开场命令基态;
}> {
    let openingStreamHeartbeat: ReturnType<typeof setInterval> | null = null;
    let openingDeltaReceived = false;
    const openingEnv = deps.规范化环境信息(contextData?.环境 || deps.环境);
    let streamMarker = 0;
    const openingRequestStartedAt = Date.now();
    let openingInputTokens = 0;

    const 写入或插入提示词 = (
        promptPool: any[],
        promptId: string,
        fallbackPrompt: any,
        content: string
    ): any[] => {
        const nextPrompt = {
            ...(promptPool.find((item: any) => item.id === promptId) || fallbackPrompt),
            id: promptId,
            内容: content,
            启用: true
        };
        return promptPool.some((item: any) => item.id === promptId)
            ? promptPool.map((item: any) => item.id === promptId ? nextPrompt : item)
            : [...promptPool, nextPrompt];
    };
    const controller = new AbortController();
    deps.abortControllerRef.current = controller;

    const openingMem = { 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] };
    const openingStatePayload = {
        角色: contextData.角色 || deps.角色,
        环境: openingEnv,
        世界: contextData.世界 || deps.世界,
        战斗: contextData.战斗 || deps.战斗,
        玩家门派: contextData.玩家门派 || deps.玩家门派,
        任务列表: contextData.任务列表 || deps.任务列表,
        约定列表: contextData.约定列表 || deps.约定列表,
        剧情: deps.规范化剧情状态(contextData.剧情 || deps.剧情, openingEnv),
        剧情规划: deps.规范化剧情规划状态((contextData as any).剧情规划 ?? deps.剧情规划),
        女主剧情规划: deps.规范化女主剧情规划状态(contextData.女主剧情规划 ?? deps.女主剧情规划),
        同人剧情规划: deps.规范化同人剧情规划状态((contextData as any).同人剧情规划 ?? deps.同人剧情规划),
        同人女主剧情规划: deps.规范化同人女主剧情规划状态((contextData as any).同人女主剧情规划 ?? deps.同人女主剧情规划),
        开局配置: options?.开局配置
    };
    const openingNovelDecompositionPrompt = await 获取开局小说拆分注入文本(
        deps.apiConfig,
        options?.开局配置,
        openingStatePayload.剧情,
        openingStatePayload?.角色?.姓名 || deps.角色?.姓名 || ''
    );

    const openingGameConfig = 规范化游戏设置(deps.gameConfig);
    const 启用修炼体系 = openingGameConfig.启用修炼体系 !== false;
    let openingPromptSnapshot = promptSnapshot.map(p => {
        if (p.id === 'core_cot') {
            return {
                ...核心_开局思维链,
                id: 'core_cot',
                内容: 获取开局思维链提示词(openingGameConfig),
                启用: true
            };
        }
        return p;
    });
    const openingRuntimeGptMode = openingGameConfig.启用GPT模式 === true;
    const openingTavernPresetModeEnabled = 酒馆预设模式可用(openingGameConfig);
    const openingRealmPromptRaw = 启用修炼体系
        ? (openingPromptSnapshot.find((item: any) => item.id === 'core_realm')?.内容 || '').trim()
        : '';
    const 同人已启用 = Boolean(
        options?.开局配置?.同人融合?.enabled
        && typeof options?.开局配置?.同人融合?.作品名 === 'string'
        && options.开局配置.同人融合.作品名.trim()
    );
    let openingRealmPrompt = openingRealmPromptRaw.includes('开局后此处会被完整替换')
        ? ''
        : openingRealmPromptRaw;
    let openingRealmValidation = 启用修炼体系
        ? 校验境界体系提示词完整性(openingRealmPrompt)
        : { ok: true, normalizedText: '', reason: '' };
    if (启用修炼体系 && openingRealmValidation.ok) {
        openingRealmPrompt = openingRealmValidation.normalizedText;
        if (openingRealmPrompt !== openingRealmPromptRaw) {
            openingPromptSnapshot = 写入或插入提示词(
                openingPromptSnapshot,
                核心_境界体系.id,
                核心_境界体系,
                openingRealmPrompt
            );
        }
    }
    if (启用修炼体系 && 同人已启用 && !openingRealmValidation.ok) {
        const generatedOpeningRealmPrompt = await textAIService.generateFandomRealmData(
            {
                openingConfig: options?.开局配置
            },
            apiForOpening,
            undefined,
            '【开局用途】本次生成结果会先用于第0回合开局。请优先保证主角初始境界、开场出场 NPC、门派前辈、潜在敌手与第一幕冲突都能直接按原著体系落位，不要只写抽象高端设定。'
        );
        openingRealmValidation = 校验境界体系提示词完整性(generatedOpeningRealmPrompt);
        if (!openingRealmValidation.ok) {
            throw new Error('同人开局前置失败：境界体系生成结果仍不完整，已阻止继续使用默认体系开局。');
        }
        openingRealmPrompt = openingRealmValidation.normalizedText;
        openingPromptSnapshot = 写入或插入提示词(
            openingPromptSnapshot,
            核心_境界体系.id,
            核心_境界体系,
            openingRealmPrompt
        );
        deps.setPrompts(openingPromptSnapshot);
        await dbService.保存设置(设置键.提示词池, openingPromptSnapshot).catch((error) => {
            console.error('开局前置持久化同人境界体系失败', error);
        });
    }
    const fandomPromptBundle = 构建同人运行时提示词包({
        openingConfig: options?.开局配置,
        realmPrompt: openingRealmPrompt
    });
    const openingTaskPrompt = 按功能开关过滤提示词内容(获取内置提示词槽位内容({
        entries: deps.builtinPromptEntries,
        slotId: openingGameConfig.启用饱腹口渴系统 === false
            ? 世界书本体槽位.开局初始化任务_禁用生存
            : 世界书本体槽位.开局初始化任务_启用生存,
        fallback: 获取开场初始化任务提示词(openingGameConfig, options?.eraId)
    }), openingGameConfig);
    const openingTaskPromptWithFandom = 按功能开关过滤提示词内容([
        openingTaskPrompt,
        fandomPromptBundle.开局任务补丁
    ]
        .filter(Boolean)
        .join('\n\n')
        .trim(), openingGameConfig);
    const filteredOpeningNovelDecompositionPrompt = 按功能开关过滤提示词内容(
        openingNovelDecompositionPrompt,
        openingGameConfig
    );
    const openingNovelDecompositionSystemPrompt = filteredOpeningNovelDecompositionPrompt
        ? `【小说分解章节锚点】\n${filteredOpeningNovelDecompositionPrompt}`
        : '';

    const openingContext = deps.构建系统提示词(
        openingPromptSnapshot,
        openingMem,
        contextData.社交 || [],
        openingStatePayload,
        {
            禁用世界演变分流: true,
            注入剧情推动协议: false,
            注入女主剧情规划协议: false,
            世界书作用域: openingTavernPresetModeEnabled ? ['opening', 'tavern'] : ['opening'],
            世界书附加文本: [
                openingTaskPromptWithFandom,
                openingNovelDecompositionSystemPrompt,
                构建开局配置提示词(options?.开局配置),
                构建时代开局场景注入(options?.eraId, undefined, options?.开局配置?.selectedSceneId),
                typeof options?.开局额外要求 === 'string' ? options.开局额外要求 : ''
            ],
            openingConfig: options?.开局配置,
            强制剧情COT提示词ID: 'core_cot'
        }
    );

    streamMarker = Date.now();
    if (useStreaming) {
        deps.设置历史记录([
            {
                role: 'assistant',
                content: '',
                timestamp: streamMarker,
                gameTime: 环境时间转标准串(openingEnv) || '未知时间'
            }
        ]);
        let pulse = 0;
        openingStreamHeartbeat = setInterval(() => {
            if (openingDeltaReceived) return;
            pulse = (pulse + 1) % 4;
            const dots = '.'.repeat(pulse) || '.';
            deps.设置历史记录((prev: any[]) => prev.map(item => {
                if (
                    item.timestamp === streamMarker &&
                    item.role === 'assistant' &&
                    !item.structuredResponse
                ) {
                    return { ...item, content: `【生成中】开场剧情生成${dots}` };
                }
                return item;
            }));
        }, 420);
    }

    const openingCotPseudoEnabled = openingGameConfig.启用COT伪装注入 !== false;
    const openingLengthRequirementPrompt = openingContext.contextPieces.字数要求提示词
        || 构建字数要求提示词(1000);
    const openingDisclaimerRequirementPrompt = openingContext.contextPieces.免责声明输出提示词 || undefined;
    const openingOutputProtocolPrompt = openingContext.contextPieces.输出协议提示词;
    const openingPerspectivePrompt = openingContext.contextPieces.叙事人称提示词 || '';
    const openingStyleAssistantPrompt = 按功能开关过滤提示词内容(
        获取内置提示词槽位内容({
            entries: deps.builtinPromptEntries,
            slotId: 获取剧情风格内置槽位('opening', openingGameConfig.剧情风格, openingGameConfig?.NTL后宫档位),
            fallback: 构建剧情风格助手提示词(
                openingGameConfig.剧情风格,
                openingGameConfig?.NTL后宫档位,
                openingGameConfig
            )
        }),
        openingGameConfig
    );
    const openingRealWorldModePrompt = openingGameConfig.启用真实世界模式 === true
        ? 获取内置提示词槽位内容({
            entries: deps.builtinPromptEntries,
            slotId: 世界书本体槽位.真实世界模式,
            fallback: 构建真实世界模式提示词(openingGameConfig)
        })
        : '';
    const openingCotPseudoPrompt = openingCotPseudoEnabled
        ? 构建COT伪装提示词(
            openingGameConfig,
            openingContext.contextPieces.AI角色声明
        )
        : '';
    const openingCotPrompt = [
        openingContext.contextPieces.COT提示词,
        fandomPromptBundle.开局COT补丁
    ]
        .filter(Boolean)
        .join('\n\n')
        .trim();
    const openingNormalizedExtraPrompt = !openingTavernPresetModeEnabled
        ? 按功能开关过滤提示词内容(
            构建运行时额外提示词(openingGameConfig.额外提示词 || '', openingGameConfig),
            openingGameConfig
        )
        : '';
    const openingCustomExtraPrompt = typeof options?.开局额外要求 === 'string'
        ? options.开局额外要求.trim()
        : '';
    const openingCombinedExtraPrompt = [
        openingNormalizedExtraPrompt,
        openingCustomExtraPrompt ? `【开局额外要求】\n${openingCustomExtraPrompt}` : ''
    ]
        .filter(Boolean)
        .join('\n\n')
        .trim();
    const openingRoleSetupText = 构建开局角色建档摘要(openingStatePayload?.角色 || deps.角色, {
        cultivationSystemEnabled: 启用修炼体系
    });
    const openingConfigText = 构建开局配置提示词(options?.开局配置);
    const openingLatestUserInputRole: 'assistant' | 'user' = (
        openingTavernPresetModeEnabled
        || openingRuntimeGptMode
    ) ? 'user' : 'assistant';

    const playerSetupContext = [
        '【本次任务】',
        '请基于 world_prompt、下列主角建档信息、当前标签协议与开局额外要求，生成第0回合开场，并输出自然语言、完整详细的 `<变量规划>` 作为本回合初始化结果说明。',
        '不要把下列建档信息视为已经自动注入前端变量或已自动写入当前状态；除非你在 `<变量规划>` 中明确列出需要初始化的内容，否则这些内容都不算已进入本回合初始化结果。',
        '',
        按功能开关过滤提示词内容(fandomPromptBundle.开局任务补丁 || '', openingGameConfig),
        '',
        气运初始化任务提示词.join('\n'),
        '',
        openingRoleSetupText,
        '',
        openingConfigText,
        '',
        '【执行要求】',
        '- 先完成沉浸式第一幕，再把需要落地的可写域整理成完整详细的 `<变量规划>`。',
        '- `<变量规划>` 要把初始化结果详细写清，确保前台初始化信息完整、清楚、可直接承接。',
        '- 第0回合 `<变量规划>` 不是摘要，而是第1回合直接使用的完整前台初始化稿；就算某部分主要承接建档，也要把当前终态、成立依据、新增对象或字段、本回合已发生变化写清。',
        '- `<变量规划>` 一律用自然语言写成说明稿，不要写命令语法或伪 JSON。'
    ].join('\n');
    const openingLatestUserInputAsModel = [
        playerSetupContext,
        '\n以下为最新任务要求：',
        `<用户输入>${openingTaskPrompt}</用户输入>`
    ].join('\n');
    const openingLatestUserInputForTavern = [
        openingLatestUserInputAsModel,
        openingCustomExtraPrompt ? `【开局额外要求】\n${openingCustomExtraPrompt}` : ''
    ]
        .filter(Boolean)
        .join('\n\n')
        .trim();
    const openingCotPromptForTavern = (() => {
        const source = openingCotPrompt || (openingPromptSnapshot.find((p: any) => p.id === 'core_cot')?.内容 || 核心_开局思维链.内容 || '').trim();
        if (!source) return '';
        return source;
    })();
    let openingOrderedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (openingTavernPresetModeEnabled) {
        openingOrderedMessages = 构建酒馆预设消息链({
            config: openingGameConfig,
            context: openingContext,
            chatHistory: [],
            latestUserInput: openingLatestUserInputForTavern,
            playerName: openingStatePayload?.角色?.姓名 || deps.角色?.姓名 || '',
            playerRole: openingStatePayload?.角色 || deps.角色,
            overrideCotPrompt: openingCotPromptForTavern,
            overrideStoryAppendPrompt: openingNovelDecompositionSystemPrompt,
            worldbookExtraTexts: [
                openingPerspectivePrompt
            ]
        });
    } else {
        const pushOpening = (
            role: 'system' | 'user' | 'assistant',
            content?: string,
            _pushOptions?: { openingUserInput?: boolean }
        ) => {
            const trimmed = (content || '').trim();
            if (!trimmed) return;
            const normalizedRole: 'system' | 'user' | 'assistant' = role;
            openingOrderedMessages.push({ role: normalizedRole, content: trimmed });
        };
        pushOpening('system', openingContext.contextPieces.AI角色声明);
        pushOpening('system', openingContext.contextPieces.worldPrompt);
        pushOpening('system', openingContext.contextPieces.同人设定摘要);
        pushOpening('system', openingContext.contextPieces.境界体系提示词);
        pushOpening('system', openingNovelDecompositionSystemPrompt);
        pushOpening('system', openingContext.contextPieces.otherPrompts);
        pushOpening('system', openingContext.contextPieces.难度设置提示词);
        pushOpening('system', openingContext.contextPieces.叙事人称提示词);
        pushOpening('system', openingContext.contextPieces.字数设置提示词);
        pushOpening('system', openingStyleAssistantPrompt);
        pushOpening('system', openingRealWorldModePrompt);
        pushOpening('user', openingCombinedExtraPrompt);
        pushOpening('user', openingDisclaimerRequirementPrompt || '');
        pushOpening('system', openingCotPrompt);
        pushOpening(openingLatestUserInputRole, openingLatestUserInputAsModel);
        if (!openingRuntimeGptMode) {
            pushOpening('user', '开始任务');
        }
        if (openingCotPseudoEnabled) {
            pushOpening('assistant', openingCotPseudoPrompt);
        }
    }

    const openingAutoRetryEnabled = deps.游戏设置启用自动重试(openingGameConfig);
    openingInputTokens = deps.估算消息Token(openingOrderedMessages, apiForOpening?.model);
    const aiResult = await deps.执行带自动重试的生成请求({
        enabled: openingAutoRetryEnabled,
        onRetry: (attempt, maxAttempts, reason) => {
            if (useStreaming) {
                deps.设置历史记录((prev: any[]) => deps.更新流式草稿为自动重试提示(prev, attempt, maxAttempts, reason));
            }
        },
        action: async () => {
            if (useStreaming) {
                openingDeltaReceived = false;
            }
            return textAIService.generateStoryResponse(
                '',
                '',
                '',
                apiForOpening,
                controller.signal,
                useStreaming
                    ? {
                        stream: true,
                        onDelta: (_delta, accumulated) => {
                            openingDeltaReceived = true;
                            deps.设置历史记录((prev: any[]) => prev.map(item => {
                                if (
                                    item.timestamp === streamMarker &&
                                    item.role === 'assistant' &&
                                    !item.structuredResponse
                                ) {
                                    return { ...item, content: accumulated };
                                }
                                return item;
                            }));
                        }
                    }
                    : undefined,
                openingTavernPresetModeEnabled ? '' : openingCombinedExtraPrompt,
                {
                    orderedMessages: openingOrderedMessages,
                    enableCotInjection: openingCotPseudoEnabled,
                    leadingSystemPrompt: openingContext.contextPieces.AI角色声明,
                    styleAssistantPrompt: [openingPerspectivePrompt, openingStyleAssistantPrompt, openingRealWorldModePrompt].filter(Boolean).join('\n\n'),
                    outputProtocolPrompt: openingOutputProtocolPrompt,
                    cotPseudoHistoryPrompt: openingCotPseudoPrompt,
                    lengthRequirementPrompt: openingLengthRequirementPrompt,
                    disclaimerRequirementPrompt: openingDisclaimerRequirementPrompt,
                    validateTagCompleteness: openingGameConfig.启用标签检测完整性 === true,
                    enableTagRepair: openingGameConfig.启用标签修复 !== false,
                    requireActionOptionsTag: openingGameConfig.启用行动选项 !== false
                }
            );
        }
    });
    let aiData = aiResult.response;
    if (openingStreamHeartbeat) clearInterval(openingStreamHeartbeat);

    const commandBaseState = options?.命令基态 || {
        角色: contextData.角色 || deps.角色,
        环境: contextData.环境 || deps.环境,
        社交: contextData.社交 || [],
        世界: contextData.世界 || deps.世界,
        战斗: contextData.战斗 || deps.战斗,
        玩家门派: contextData.玩家门派 || deps.玩家门派,
        任务列表: Array.isArray(contextData.任务列表) ? contextData.任务列表 : deps.任务列表,
        约定列表: Array.isArray(contextData.约定列表) ? contextData.约定列表 : deps.约定列表,
        剧情: deps.规范化剧情状态(contextData.剧情 || deps.剧情, contextData.环境 || deps.环境),
        剧情规划: deps.规范化剧情规划状态((contextData as any).剧情规划 ?? deps.剧情规划),
        女主剧情规划: deps.规范化女主剧情规划状态(contextData.女主剧情规划 ?? deps.女主剧情规划),
        同人剧情规划: deps.规范化同人剧情规划状态((contextData as any).同人剧情规划 ?? deps.同人剧情规划),
        同人女主剧情规划: deps.规范化同人女主剧情规划状态((contextData as any).同人女主剧情规划 ?? deps.同人女主剧情规划)
    };
    const openingBodyText = (aiData.logs || []).map((item: any) => `${item?.sender || '旁白'}：${item?.text || ''}`.trim()).filter(Boolean).join('\n').trim();
    const openingVariablePlanText = typeof aiData?.t_var_plan === 'string' ? aiData.t_var_plan.trim() : '';
    const openingPlanText = 提取响应规划文本(aiData);
    const openingWorldPrompt = 按功能开关过滤提示词内容(
        读取提示词内容(openingPromptSnapshot, 'core_world'),
        openingGameConfig
    );
    const openingRealmPromptNormalized = (() => {
        if (!启用修炼体系) return '';
        const raw = 读取提示词内容(openingPromptSnapshot, 'core_realm');
        return raw.includes('开局后此处会被完整替换') ? '' : raw;
    })();
    const openingWorldEvolutionPrompt = 按功能开关过滤提示词内容(
        读取提示词内容(openingPromptSnapshot, 'stat_world_evo') || ((数值_世界演化.内容 || '').trim()),
        openingGameConfig
    );
    const openingRuntimeFandomBundle = 构建同人运行时提示词包({
        openingConfig: options?.开局配置,
        worldPrompt: openingWorldPrompt,
        realmPrompt: openingRealmPromptNormalized
    });
    let responseForExecution: GameResponse = {
        ...aiData,
        tavern_commands: Array.isArray(aiData?.tavern_commands) ? [...aiData.tavern_commands] : []
    };
    let simulatedOpeningState = deps.processResponseCommands(responseForExecution, commandBaseState, { applyState: false, rawContent: deps.获取原始AI消息(aiResult.rawText) });

    return {
        aiResult,
        aiData,
        openingBodyText,
        openingVariablePlanText,
        openingPlanText,
        openingWorldPrompt,
        openingWorldEvolutionPrompt,
        openingRealmPrompt,
        openingRealmPromptRaw,
        openingRuntimeFandomBundle,
        openingPromptSnapshot,
        openingGameConfig,
        openingRoleSetupText,
        openingConfigText,
        openingOrderedMessages,
        openingAutoRetryEnabled,
        openingInputTokens,
        openingTavernPresetModeEnabled,
        openingLatestUserInputRole,
        openingStreamHeartbeat,
        openingDeltaReceived,
        streamMarker,
        openingRequestStartedAt,
        commandBaseState,
        responseForExecution,
        simulatedOpeningState
    };
}
