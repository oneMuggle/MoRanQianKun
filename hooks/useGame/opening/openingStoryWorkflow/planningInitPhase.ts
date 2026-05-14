import * as textAIService from '../../../../services/ai/text';
import type { GameResponse } from '../../../../types';
import { 获取规划分析接口配置, 接口配置是否可用 } from '../../../../utils/apiConfig';
import {
    构建开局规划初始化审计重点,
    构建开局规划初始化正文上下文,
    开局规划初始化附加提示词
} from '../../../../prompts/runtime/openingPlanningInit';
import { 按功能开关过滤提示词内容, 裁剪修炼体系上下文数据 } from '../../../../utils/promptFeatureToggles';
import { 构建世界书注入文本 } from '../../../../utils/worldbook';
import { 获取激活小说拆分注入文本 } from '../../../../services/novel-decomposition/novelDecompositionInjection';
import { 环境时间转标准串 } from '../../time/timeUtils';
import type { 开场剧情生成依赖, 开场命令基态 } from './types';
import { 构建带索引命令文本, 过滤规划补丁命令 } from './utils';

export interface PlanningInitPhaseResult {
    planningStageResult: any;
    responseForExecution: GameResponse;
    simulatedOpeningState: 开场命令基态;
}

export async function 执行开局规划初始化阶段(
    responseForExecution: GameResponse,
    simulatedOpeningState: 开场命令基态,
    commandBaseState: 开场命令基态,
    openingBodyText: string,
    openingPlanText: string,
    openingRuntimeFandomBundle: { enabled: boolean },
    openingGameConfig: any,
    options: { 开局配置?: any },
    deps: 开场剧情生成依赖,
    aiResult: { rawText: string },
    执行可重试开局阶段: <T,>(params: {
        stageLabel: string;
        run: () => Promise<T>;
        beforeAttempt?: (attempt: number) => void;
        onAutoRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
        onError?: (errorText: string) => void;
        onSkip?: (errorText: string) => void;
        getErrorText?: (error: any) => string;
    }) => Promise<{ completed: boolean; result?: T }>
): Promise<PlanningInitPhaseResult> {
    let localResponseForExecution = responseForExecution;
    let localSimulatedOpeningState = simulatedOpeningState;

    const openingPlanningApi = 获取规划分析接口配置(deps.apiConfig);
    if (接口配置是否可用(openingPlanningApi)) {
        const planningStage = await 执行可重试开局阶段({
            stageLabel: '开局规划分析',
            beforeAttempt: (attempt) => {
                deps.设置开局规划进度({
                    phase: 'start',
                    text: attempt > 1
                        ? `正在重新初始化剧情与规划...（第 ${attempt} 次手动重试）`
                        : '正在初始化剧情与规划...'
                });
            },
            onAutoRetry: (attempt, maxAttempts, reason) => {
                deps.设置开局规划进度({
                    phase: 'start',
                    text: `开局规划请求失败，正在自动重试（${attempt}/${maxAttempts}）${reason ? `：${reason}` : ''}`
                });
            },
            run: async () => {
                const heroineEnabled = openingGameConfig.启用女主剧情规划 === true;
                const fandomEnabled = openingRuntimeFandomBundle.enabled;
                const activeStoryPlan = fandomEnabled
                    ? deps.规范化同人剧情规划状态(localSimulatedOpeningState.同人剧情规划)
                    : deps.规范化剧情规划状态(localSimulatedOpeningState.剧情规划);
                const activeHeroinePlan = heroineEnabled
                    ? (
                        fandomEnabled
                            ? deps.规范化同人女主剧情规划状态(localSimulatedOpeningState.同人女主剧情规划)
                            : deps.规范化女主剧情规划状态(localSimulatedOpeningState.女主剧情规划)
                    )
                    : undefined;
                const activeStoryPlanTargets = fandomEnabled
                    ? ['同人剧情规划', 'gameState.同人剧情规划']
                    : ['剧情规划', 'gameState.剧情规划'];
                const activeHeroinePlanTargets = fandomEnabled
                    ? ['同人女主剧情规划', 'gameState.同人女主剧情规划']
                    : ['女主剧情规划', 'gameState.女主剧情规划'];
                const planningRecentBodiesText = 构建开局规划初始化正文上下文({
                    openingBodyText,
                    openingPlanText,
                    currentGameTime: 环境时间转标准串(localSimulatedOpeningState.环境) || '未知时间'
                });
                const planningAuditFocusText = 构建开局规划初始化审计重点({
                    fandomEnabled: openingRuntimeFandomBundle.enabled,
                    heroineEnabled
                });
                const planningWorldbookExtra = 按功能开关过滤提示词内容(构建世界书注入文本({
                    books: deps.worldbooks,
                    scopes: heroineEnabled ? ['story_plan', 'heroine_plan'] : ['story_plan'],
                    environment: localSimulatedOpeningState.环境,
                    social: localSimulatedOpeningState.社交,
                    world: localSimulatedOpeningState.世界,
                    history: [],
                    extraTexts: [openingBodyText, openingPlanText]
                }).combinedText, openingGameConfig);
                const planningNovelDecompositionPrompt = await 获取激活小说拆分注入文本(
                    deps.apiConfig,
                    'planning',
                    options?.开局配置,
                    localSimulatedOpeningState.剧情,
                    localSimulatedOpeningState.角色?.姓名 || deps.角色?.姓名 || ''
                );
                const planningExtraPrompt = [
                    开局规划初始化附加提示词,
                    planningWorldbookExtra,
                    按功能开关过滤提示词内容(planningNovelDecompositionPrompt, openingGameConfig),
                    按功能开关过滤提示词内容(openingRuntimeFandomBundle.enabled ? (openingRuntimeFandomBundle as any).同人设定摘要 : '', openingGameConfig),
                    openingGameConfig.启用修炼体系 !== false ? (openingRuntimeFandomBundle as any).境界母板补丁 : ''
                ]
                    .filter(Boolean)
                    .join('\n\n');
                const planningResult = await textAIService.generatePlanningAnalysis({
                    playerName: (localSimulatedOpeningState.角色?.姓名 || deps.角色?.姓名 || '').trim() || '未命名',
                    currentStoryJson: JSON.stringify(裁剪修炼体系上下文数据({
                        剧情: localSimulatedOpeningState.剧情 || {},
                        [fandomEnabled ? '同人剧情规划' : '剧情规划']: activeStoryPlan || {}
                    }, openingGameConfig), null, 2),
                    currentHeroinePlanJson: JSON.stringify(裁剪修炼体系上下文数据(
                        heroineEnabled
                            ? { [fandomEnabled ? '同人女主剧情规划' : '女主剧情规划']: activeHeroinePlan || {} }
                            : {},
                        openingGameConfig
                    ), null, 2),
                    worldJson: JSON.stringify(裁剪修炼体系上下文数据(localSimulatedOpeningState.世界 || {}, openingGameConfig), null, 2),
                    socialJson: JSON.stringify(裁剪修炼体系上下文数据(localSimulatedOpeningState.社交 || [], openingGameConfig), null, 2),
                    envJson: JSON.stringify(裁剪修炼体系上下文数据(localSimulatedOpeningState.环境 || {}, openingGameConfig), null, 2),
                    recentBodiesText: planningRecentBodiesText,
                    currentPlanText: openingPlanText,
                    auditFocusText: planningAuditFocusText,
                    heroineEnabled,
                    ntlEnabled: openingGameConfig.剧情风格 === 'NTL后宫',
                    fandomEnabled,
                    extraPrompt: planningExtraPrompt,
                    gptMode: openingGameConfig.独立APIGPT模式?.规划分析 === true
                }, openingPlanningApi, deps.abortControllerRef.current?.signal!);
                const planningCommands = [
                    ...过滤规划补丁命令(planningResult.commands, ['剧情', 'gameState.剧情']),
                    ...过滤规划补丁命令(planningResult.commands, activeStoryPlanTargets),
                    ...(heroineEnabled
                        ? 过滤规划补丁命令(planningResult.commands, activeHeroinePlanTargets)
                        : [])
                ];
                return {
                    planningResult,
                    planningCommands
                };
            },
            onError: (errorText) => {
                deps.设置开局规划进度({
                    phase: 'error',
                    text: `${errorText || '剧情规划初始化失败'}\n等待选择：重试当前阶段，或跳过继续。`
                });
            },
            onSkip: (errorText) => {
                deps.设置开局规划进度({
                    phase: 'skipped',
                    text: `剧情规划初始化失败，已按用户选择跳过。${errorText ? `\n${errorText}` : ''}`
                });
            },
            getErrorText: (error: any) => error?.message || '剧情规划初始化失败'
        });
        const planningStageResult = planningStage.result;
        if (planningStage.completed && planningStageResult) {
            const { planningResult, planningCommands } = planningStageResult;
            deps.设置开局规划进度({
                phase: planningResult.shouldUpdate && planningCommands.length > 0 ? 'done' : 'skipped',
                text: planningResult.shouldUpdate && planningCommands.length > 0
                    ? '剧情规划初始化完成。'
                    : '剧情规划初始化未产生更新。',
                rawText: typeof planningResult?.rawText === 'string' ? planningResult.rawText : '',
                commandTexts: 构建带索引命令文本(planningCommands)
            });
            if (planningResult.shouldUpdate && planningCommands.length > 0) {
                localResponseForExecution = {
                    ...localResponseForExecution,
                    tavern_commands: [
                        ...(Array.isArray(localResponseForExecution.tavern_commands) ? localResponseForExecution.tavern_commands : []),
                        ...planningCommands
                    ]
                };
                localSimulatedOpeningState = deps.processResponseCommands(localResponseForExecution, commandBaseState, { applyState: false, rawContent: deps.获取原始AI消息(aiResult.rawText) });
            }
        }
    } else {
        deps.设置开局规划进度({
            phase: 'skipped',
            text: '规划分析独立链路未启用，已跳过。'
        });
    }

    const planningStageResult = planningStage.result;

    return {
        planningStageResult,
        responseForExecution: localResponseForExecution,
        simulatedOpeningState: localSimulatedOpeningState
    };
}
