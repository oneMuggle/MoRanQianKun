import type { DebugPromptTrace, DebugResponseAnalysis, GameResponse } from '../../types';

const PROTOCOL_TAGS = [
    'thinking', '正文', '短期记忆', '命令', '行动选项',
    '动态世界', '剧情规划', '变量规划', 'judge_blocks',
];

/**
 * Detect which protocol tags appear in the raw response text.
 * Uses simple substring matching — heuristic, not exact.
 */
export function tracePromptInjection(
    promptStates: Array<{ promptId: string; status: string }> | undefined,
    rawResponse: string,
): DebugPromptTrace {
    const lower = rawResponse.toLowerCase();

    const traced = (promptStates ?? []).map((ps) => {
        const keywords = extractKeywords(ps.promptId);
        const detected = keywords.length > 0
            && keywords.some((kw) => lower.includes(kw.toLowerCase()));
        return {
            promptId: ps.promptId,
            sentStatus: ps.status !== 'disabled' ? 'sent' as const : 'not_sent' as const,
            detectedInResponse: detected,
            matchKeywords: keywords,
        };
    });

    const protocolTags = PROTOCOL_TAGS.map((tag) => ({
        tag,
        present: rawResponse.includes(`<${tag}>`),
    }));

    return { promptStates: traced, protocolTags };
}

/**
 * Quick analysis of the parsed response structure.
 */
export function analyzeResponse(
    rawResponse: string,
    parsed?: GameResponse,
): DebugResponseAnalysis {
    const tagsPresent: string[] = [];
    const tagsMissing: string[] = [];

    for (const tag of PROTOCOL_TAGS) {
        if (rawResponse.includes(`<${tag}>`)) {
            tagsPresent.push(tag);
        } else {
            tagsMissing.push(tag);
        }
    }

    return {
        rawLength: rawResponse.length,
        logCount: parsed?.logs?.length ?? 0,
        tagsPresent,
        tagsMissing,
        hasActionOptions: !!parsed?.action_options && parsed.action_options.length > 0,
        hasCommands: !!parsed?.tavern_commands && parsed.tavern_commands.length > 0,
        hasVariableCalibration: !!parsed?.variable_calibration_report,
        hasDynamicWorld: !!parsed?.dynamic_world && parsed.dynamic_world.length > 0,
    };
}

/**
 * Extract distinctive keywords from a prompt ID for matching.
 * Uses the prompt ID itself as the primary keyword.
 */
function extractKeywords(promptId: string): string[] {
    if (!promptId) return [];
    return [promptId];
}
