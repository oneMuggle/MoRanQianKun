/**
 * 上下文快照协调器
 * 从 useGame.ts 提取的 buildContextSnapshot 函数，含缓存逻辑
 */

interface BuildContextSnapshotDeps {
    apiConfig: any;
    gameConfig: any;
    memoryConfig: any;
    prompts: any;
    内置提示词列表: any[];
    世界书列表: any[];
    记忆系统: any;
    历史记录: any[];
    社交: any[];
    角色: any;
    环境: any;
    世界: any;
    战斗: any;
    玩家门派: any;
    任务列表: any[];
    约定列表: any[];
    剧情: any;
    剧情规划: any;
    女主剧情规划?: any;
    同人剧情规划?: any;
    同人女主剧情规划?: any;
    开局配置: any;
    校规系统: any;
    催眠系统: any;
    校园系统: any;
    currentEra: string | null;
    上下文快照缓存Ref: { current: { value: any; refs: unknown[] } | null };
    构建系统提示词: (...args: any[]) => any;
    规范化环境信息: (...args: any[]) => any;
    规范化剧情状态: (...args: any[]) => any;
    规范化剧情规划状态: (...args: any[]) => any;
    规范化女主剧情规划状态: (...args: any[]) => any;
    规范化同人剧情规划状态: (...args: any[]) => any;
    规范化同人女主剧情规划状态: (...args: any[]) => any;
    按回合窗口裁剪历史: (...args: any[]) => any;
}

export type 上下文段 = {
    id: string;
    title: string;
    category: string;
    order: number;
    content: string;
    uploadTokens: number;
};

export type 上下文快照 = {
    sections: 上下文段[];
    fullText: string;
    uploadTokens: number;
    runtimePromptStates: Record<string, any>;
};

export function 创建上下文快照工作流(deps: BuildContextSnapshotDeps) {
    const buildContextSnapshot = async (): Promise<上下文快照> => {
        const currentRefs = [
            deps.apiConfig,
            deps.gameConfig,
            deps.memoryConfig,
            deps.prompts,
            deps.内置提示词列表,
            deps.世界书列表,
            deps.记忆系统,
            deps.历史记录,
            deps.社交,
            deps.角色,
            deps.环境,
            deps.世界,
            deps.战斗,
            deps.玩家门派,
            deps.任务列表,
            deps.约定列表,
            deps.剧情,
            deps.剧情规划,
            deps.女主剧情规划,
            deps.同人剧情规划,
            deps.同人女主剧情规划,
            deps.开局配置,
        ];
        const cached = deps.上下文快照缓存Ref.current;
        if (
            cached
            && cached.refs.length === currentRefs.length
            && cached.refs.every((item, index) => item === currentRefs[index])
        ) {
            return cached.value;
        }

        const { 构建上下文快照数据 } = await import('./contextSnapshot');
        const nextSnapshot = await 构建上下文快照数据({
            apiConfig: deps.apiConfig,
            gameConfig: deps.gameConfig,
            memoryConfig: deps.memoryConfig,
            prompts: deps.prompts,
            内置提示词列表: deps.内置提示词列表,
            世界书列表: deps.世界书列表,
            记忆系统: deps.记忆系统,
            历史记录: deps.历史记录,
            社交: deps.社交,
            角色: deps.角色,
            环境: deps.环境,
            世界: deps.世界,
            战斗: deps.战斗,
            玩家门派: deps.玩家门派,
            任务列表: deps.任务列表,
            约定列表: deps.约定列表,
            剧情: deps.剧情,
            剧情规划: deps.剧情规划,
            女主剧情规划: deps.女主剧情规划,
            同人剧情规划: deps.同人剧情规划,
            同人女主剧情规划: deps.同人女主剧情规划,
            开局配置: deps.开局配置,
            校规系统: deps.校规系统,
            催眠系统: deps.催眠系统,
            校园系统: deps.校园系统,
            时代配置ID: deps.currentEra,
            规范化环境信息: deps.规范化环境信息,
            规范化剧情状态: deps.规范化剧情状态,
            规范化剧情规划状态: deps.规范化剧情规划状态,
            规范化女主剧情规划状态: deps.规范化女主剧情规划状态,
            规范化同人剧情规划状态: deps.规范化同人剧情规划状态,
            规范化同人女主剧情规划状态: deps.规范化同人女主剧情规划状态,
            按回合窗口裁剪历史: deps.按回合窗口裁剪历史,
            构建系统提示词: deps.构建系统提示词,
        });
        deps.上下文快照缓存Ref.current = {
            value: nextSnapshot,
            refs: currentRefs,
        };
        return nextSnapshot;
    };

    return { buildContextSnapshot };
}
