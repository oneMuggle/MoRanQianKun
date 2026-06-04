import { useRef, useState } from 'react';
import type {
    GameResponse,
    OpeningConfig,
    WorldGenConfig,
    角色数据结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    提示词结构
} from '../../../types';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import { 创建存读档工作流 } from '../saveLoad/saveLoadWorkflow';
import { 创建会话生命周期工作流 } from '../session/sessionLifecycleWorkflow';

type 最近开局配置结构 = {
    worldConfig: WorldGenConfig;
    charData: 角色数据结构;
    openingConfig?: OpeningConfig;
    openingStreaming: boolean;
    openingExtraPrompt: string;
};

type 快速重开模式 = 'world_only' | 'opening_only' | 'all';

type 开局独立阶段进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped' | 'cancelled';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

type 世界生成选项 = {
    清空前端变量?: boolean;
};

type 回合快照结构 = {
    玩家输入: string;
    游戏时间: string;
    回档前状态: {
        角色: any;
        环境: any;
        社交: any[];
        世界: any;
        战斗: any;
        玩家门派: any;
        任务列表: any[];
        约定列表: any[];
        剧情: any;
        剧情规划?: any;
        女主剧情规划?: any;
        同人剧情规划?: any;
        同人女主剧情规划?: any;
        记忆系统: any;
    };
    回档前持久态: {
        视觉设置: any;
        场景图片档案: any;
    };
    回档前历史: any[];
};

export const useOpeningAndSession = (deps: {
    apiConfig: any;
    gameConfig: any;
    memoryConfig: any;
    view: 'home' | 'game' | 'new_game';
    prompts: 提示词结构[];
    历史记录: any[];
    记忆系统: any;
    社交: any[];
    环境: any;
    角色: any;
    世界: any;
    战斗: any;
    玩家门派: any;
    任务列表: any[];
    约定列表: any[];
    剧情: any;
    剧情规划: 剧情规划结构;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;
    开局配置?: OpeningConfig;
    内置提示词列表: any[];
    世界书列表: any[];
    loading: boolean;
    游戏初始时间: string;
    currentEra: string | null;
    abortControllerRef: { current: AbortController | null };
    ensurePromptsLoaded: () => Promise<提示词结构[]>;
    setView: (value: 'home' | 'game' | 'new_game') => void;
    setPrompts: (value: 提示词结构[]) => void;
    setLoading: (value: boolean) => void;
    setShowSettings: (value: boolean) => void;
    setHasSave: (value: boolean) => void;
    setShowSaveLoad: (value: boolean) => void;
    setGameConfig: (value: any) => void;
    setMemoryConfig: (value: any) => void;
    设置历史记录: (value: any) => void;
    设置角色: (value: any) => void;
    设置环境: (value: any) => void;
    设置游戏初始时间: (value: string) => void;
    设置社交: (value: any[]) => void;
    设置世界: (value: any) => void;
    设置战斗: (value: any) => void;
    设置玩家门派: (value: any) => void;
    设置任务列表: (value: any[]) => void;
    设置约定列表: (value: any[]) => void;
    设置剧情: (value: any) => void;
    设置剧情规划: (value: any) => void;
    设置女主剧情规划: (value: any) => void;
    设置同人剧情规划: (value: any) => void;
    设置同人女主剧情规划: (value: any) => void;
    设置开局配置: (value: OpeningConfig | undefined) => void;
    设置时代信息: (value: any) => void;
    设置视觉设置: (value: any) => void;
    设置场景图片档案: (value: any) => void;
    设置角色锚点列表: (value: any[]) => void;
    设置当前角色锚点ID: (value: string) => void;
    设置校规系统: (value: any) => void;
    设置催眠系统: (value: any) => void;
    设置校园系统: (value: any) => void;
    设置写真系统: (value: any) => void;
    设置都市网约车系统: (value: any) => void;
    应用并同步记忆系统: (memory: any, options?: { 静默总结提示?: boolean }) => void;
    清空变量生成上下文缓存: () => void;
    创建开场基础状态: (charData: 角色数据结构, worldConfig: WorldGenConfig) => any;
    构建前端清空开场状态: (openingBase: any) => any;
    创建开场命令基态: (角色?: any) => any;
    创建开场空白环境: () => any;
    创建开场空白世界: () => any;
    创建开场空白战斗: () => any;
    创建空门派状态: () => any;
    创建开场空白剧情: () => any;
    创建空剧情规划: () => any;
    创建空记忆系统: () => any;
    应用开场基态: (openingBase: any) => void;
    追加系统消息: (content: string, options?: { position?: 'tail' | 'after_last_turn' }) => void;
    替换流式草稿为失败提示: (history: any[], errorMessage: string) => any[];
    记录变量生成上下文: (params: { playerInput: string; response: any }) => void;
    深拷贝: <T>(value: T) => T;
    构建完整地点文本: (env: any) => string;
    规范化环境信息: (envLike?: any) => any;
    规范化世界状态: (raw?: any) => any;
    规范化战斗状态: (raw?: any) => any;
    规范化剧情状态: (raw?: any, envLike?: any) => any;
    规范化剧情规划状态: (raw?: any) => any;
    规范化女主剧情规划状态: (raw?: any) => any;
    规范化同人剧情规划状态: (raw?: any) => any;
    规范化同人女主剧情规划状态: (raw?: any) => any;
    规范化记忆系统: (raw?: any) => any;
    规范化可选开局配置: (raw?: any) => any;
    规范化记忆配置: (raw?: any) => any;
    规范化游戏设置: (raw?: any) => any;
    规范化视觉设置: (raw?: any) => any;
    规范化场景图片档案: (raw?: any) => any;
    规范化角色物品容器映射: (raw?: any) => any;
    规范化社交列表: (raw?: any[], options?: { 合并同名?: boolean }) => any[];
    获取当前提示词池: () => 提示词结构[];
    获取当前视觉设置快照: () => any;
    获取当前场景图片档案快照: () => any;
    获取角色锚点列表: () => any[];
    获取当前角色锚点ID: () => string;
    获取当前时代信息: () => any;
    清空重Roll快照: () => void;
    推入重Roll快照: (snapshot: 回合快照结构) => void;
    重置自动存档状态: () => void;
    校规系统: any;
    催眠系统: any;
    校园系统: any;
    写真系统: any;
    都市网约车系统: any;
    提示词池: 提示词结构[];
}) => {
    const [可重Roll计数, set可重Roll计数] = useState(0);
    const [最近开局配置, 设置最近开局配置] = useState<最近开局配置结构 | null>(null);
    const [开局变量生成进度, set开局变量生成进度] = useState<开局独立阶段进度 | null>(null);
    const [开局世界演变进度, set开局世界演变进度] = useState<开局独立阶段进度 | null>(null);
    const [开局规划进度, set开局规划进度] = useState<开局独立阶段进度 | null>(null);
    const performAutoSaveRef = useRef<((...args: any[]) => void) | null>(null);

    const 存档格式版本 = 3;
    const 自动存档最小间隔毫秒 = 30000;
    const 重置读档瞬态状态 = () => {
        deps.清空变量生成上下文缓存();
    };

    const {
        handleSaveGame,
        performAutoSave,
        handleLoadGame
    } = 创建存读档工作流({
        存档格式版本,
        自动存档最小间隔毫秒,
        深拷贝: deps.深拷贝,
        历史记录: deps.历史记录,
        角色: deps.角色,
        环境: deps.环境,
        社交: deps.社交,
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
        记忆系统: deps.记忆系统,
        openingConfig: deps.开局配置,
        提示词池: deps.提示词池,
        游戏初始时间: deps.游戏初始时间,
        gameConfig: deps.gameConfig,
        memoryConfig: deps.memoryConfig,
        获取当前视觉设置快照: deps.获取当前视觉设置快照,
        获取当前场景图片档案快照: deps.获取当前场景图片档案快照,
        获取角色锚点列表: deps.获取角色锚点列表,
        获取当前角色锚点ID: deps.获取当前角色锚点ID,
        获取当前时代信息: deps.获取当前时代信息,
        校规系统: deps.校规系统,
        催眠系统: deps.催眠系统,
        校园系统: deps.校园系统,
        写真系统: deps.写真系统,
        都市网约车系统: deps.都市网约车系统,
        构建完整地点文本: deps.构建完整地点文本,
        规范化环境信息: deps.规范化环境信息,
        规范化世界状态: deps.规范化世界状态,
        规范化战斗状态: deps.规范化战斗状态,
        规范化剧情状态: deps.规范化剧情状态,
        规范化剧情规划状态: deps.规范化剧情规划状态,
        规范化女主剧情规划状态: deps.规范化女主剧情规划状态,
        规范化同人剧情规划状态: deps.规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: deps.规范化同人女主剧情规划状态,
        规范化记忆系统: deps.规范化记忆系统,
        规范化可选开局配置: deps.规范化可选开局配置,
        规范化记忆配置: deps.规范化记忆配置,
        规范化游戏设置: deps.规范化游戏设置,
        规范化视觉设置: deps.规范化视觉设置,
        规范化场景图片档案: deps.规范化场景图片档案,
        规范化角色物品容器映射: deps.规范化角色物品容器映射,
        规范化社交列表: deps.规范化社交列表,
        获取当前提示词池: deps.获取当前提示词池,
        创建开场空白环境: deps.创建开场空白环境,
        创建开场空白世界: deps.创建开场空白世界,
        创建开场空白战斗: deps.创建开场空白战斗,
        创建空门派状态: deps.创建空门派状态,
        创建开场空白剧情: deps.创建开场空白剧情,
        应用并同步记忆系统: deps.应用并同步记忆系统,
        setHasSave: deps.setHasSave,
        setGameConfig: deps.setGameConfig,
        setMemoryConfig: deps.setMemoryConfig,
        设置视觉设置: deps.设置视觉设置,
        设置场景图片档案: deps.设置场景图片档案,
        设置游戏初始时间: deps.设置游戏初始时间,
        设置角色锚点列表: deps.设置角色锚点列表,
        设置当前角色锚点ID: deps.设置当前角色锚点ID,
        设置时代信息: deps.设置时代信息,
        设置校规系统: deps.设置校规系统,
        设置催眠系统: deps.设置催眠系统,
        设置校园系统: deps.设置校园系统,
        设置写真系统: deps.设置写真系统,
        设置都市网约车系统: deps.设置都市网约车系统,
        setView: deps.setView,
        setShowSaveLoad: deps.setShowSaveLoad,
        设置最近开局配置,
        设置角色: deps.设置角色,
        设置环境: deps.设置环境,
        设置社交: deps.设置社交,
        设置世界: deps.设置世界,
        设置战斗: deps.设置战斗,
        设置玩家门派: deps.设置玩家门派,
        设置任务列表: deps.设置任务列表,
        设置约定列表: deps.设置约定列表,
        设置剧情: deps.设置剧情,
        设置剧情规划: deps.设置剧情规划,
        设置女主剧情规划: deps.设置女主剧情规划,
        设置同人剧情规划: deps.设置同人剧情规划,
        设置同人女主剧情规划: deps.设置同人女主剧情规划,
        设置开局配置: deps.设置开局配置,
        设置提示词池: deps.setPrompts,
        设置历史记录: deps.设置历史记录,
        清空重Roll快照: deps.清空重Roll快照,
        重置自动存档状态: deps.重置自动存档状态,
        最近自动存档时间戳Ref: useRef<number>(0),
        最近自动存档签名Ref: useRef<string>(''),
        读档前重置瞬态状态: 重置读档瞬态状态,
        读档后重置上下文: deps.清空变量生成上下文缓存,
        读档后定位到最新回合: () => {}
    });

    // 填充前向引用
    performAutoSaveRef.current = performAutoSave;

    const {
        handleStartNewGameWizard,
        generateOpeningStory,
        handleGenerateWorld,
        handleReturnToHome,
        handleQuickRestart
    } = 创建会话生命周期工作流({
        apiConfig: deps.apiConfig,
        gameConfig: deps.gameConfig,
        memoryConfig: deps.memoryConfig,
        view: deps.view,
        prompts: deps.prompts,
        历史记录: deps.历史记录,
        记忆系统: deps.记忆系统,
        社交: deps.社交,
        环境: deps.环境,
        角色: deps.角色,
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
        内置提示词列表: deps.内置提示词列表,
        世界书列表: deps.世界书列表,
        loading: deps.loading,
        最近开局配置,
        abortControllerRef: deps.abortControllerRef,
        ensurePromptsLoaded: deps.ensurePromptsLoaded,
        setView: deps.setView,
        setPrompts: deps.setPrompts,
        setLoading: deps.setLoading,
        setShowSettings: deps.setShowSettings,
        设置历史记录: deps.设置历史记录,
        设置最近开局配置,
        清空重Roll快照: deps.清空重Roll快照,
        推入重Roll快照: deps.推入重Roll快照,
        重置自动存档状态: deps.重置自动存档状态,
        设置角色: deps.设置角色,
        设置环境: deps.设置环境,
        设置游戏初始时间: deps.设置游戏初始时间,
        设置社交: deps.设置社交,
        设置世界: deps.设置世界,
        设置战斗: deps.设置战斗,
        设置玩家门派: deps.设置玩家门派,
        设置任务列表: deps.设置任务列表,
        设置约定列表: deps.设置约定列表,
        设置剧情: deps.设置剧情,
        设置剧情规划: deps.设置剧情规划,
        设置女主剧情规划: deps.设置女主剧情规划,
        设置同人剧情规划: deps.设置同人剧情规划,
        设置同人女主剧情规划: deps.设置同人女主剧情规划,
        设置开局配置: deps.设置开局配置,
        设置时代信息: deps.设置时代信息,
        currentEra: deps.currentEra,
        setGameConfig: deps.setGameConfig,
        设置开局变量生成进度: set开局变量生成进度,
        设置开局世界演变进度: set开局世界演变进度,
        设置开局规划进度: set开局规划进度,
        setWorldEvents: () => {},
        应用并同步记忆系统: deps.应用并同步记忆系统,
        清空变量生成上下文缓存: deps.清空变量生成上下文缓存,
        创建开场基础状态: deps.创建开场基础状态,
        构建前端清空开场状态: deps.构建前端清空开场状态,
        创建开场命令基态: deps.创建开场命令基态,
        创建开场空白环境: deps.创建开场空白环境,
        创建开场空白世界: deps.创建开场空白世界,
        创建开场空白战斗: deps.创建开场空白战斗,
        创建空门派状态: deps.创建空门派状态,
        创建开场空白剧情: deps.创建开场空白剧情,
        创建空剧情规划: deps.创建空剧情规划,
        创建空记忆系统: deps.创建空记忆系统,
        应用开场基态: deps.应用开场基态,
        追加系统消息: deps.追加系统消息,
        替换流式草稿为失败提示: deps.替换流式草稿为失败提示,
        记录变量生成上下文: deps.记录变量生成上下文,
        深拷贝: deps.深拷贝,
        performAutoSave,
        构建系统提示词: (...args: any[]) => args,
        processResponseCommands: (response: GameResponse, baseState?: any, options?: { applyState?: boolean }) => ({}),
        规范化环境信息: deps.规范化环境信息,
        规范化剧情状态: deps.规范化剧情状态,
        规范化剧情规划状态: deps.规范化剧情规划状态,
        规范化女主剧情规划状态: deps.规范化女主剧情规划状态,
        规范化同人剧情规划状态: deps.规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: deps.规范化同人女主剧情规划状态,
        规范化角色物品容器映射: deps.规范化角色物品容器映射,
        规范化社交列表: deps.规范化社交列表,
        规范化世界状态: deps.规范化世界状态,
        规范化战斗状态: deps.规范化战斗状态,
        规范化门派状态: deps.规范化世界状态,
        游戏设置启用自动重试: () => false,
        执行带自动重试的生成请求: async <T>(params: {
            enabled: boolean;
            action: () => Promise<T>;
            onRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
        }) => params.action(),
        更新流式草稿为自动重试提示: (history: any[], attempt: number, maxAttempts: number, reason: string) => history,
        提取解析失败原始信息: (error: any) => String(error),
        获取原始AI消息: (rawText: string) => rawText,
        估算消息Token: (messages: Array<{ role?: string; content?: string; name?: string }>, model?: string) => 0,
        估算AI输出Token: (rawText: string, model?: string) => 0,
        计算回复耗时秒: (startedAt: number, endedAt?: number) => 0,
        触发新增NPC自动生图: () => {},
        触发场景自动生图: () => Promise.resolve(),
        提取新增NPC列表: (beforeList: any[], afterList: any[]) => afterList,
        获取当前视觉设置快照: deps.获取当前视觉设置快照,
        获取当前场景图片档案快照: deps.获取当前场景图片档案快照
    });

    return {
        可重Roll计数,
        set可重Roll计数,
        最近开局配置,
        设置最近开局配置,
        开局变量生成进度,
        开局世界演变进度,
        开局规划进度,
        performAutoSaveRef,
        handleSaveGame,
        performAutoSave,
        handleLoadGame,
        handleStartNewGameWizard,
        generateOpeningStory,
        handleGenerateWorld,
        handleReturnToHome,
        handleQuickRestart
    };
};
