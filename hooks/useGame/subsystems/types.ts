// hooks/useGame/subsystems/types.ts
// 定义 useGame() 返回值接口和 slice 模式契约

import type {
    角色数据结构,
    环境信息结构,
    聊天记录结构,
    接口设置结构,
    提示词结构,
    视觉设置结构,
    游戏设置结构,
    记忆系统结构,
    WorldGenConfig,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    OpeningConfig,
    NPC结构,
    场景图片档案,
    场景生图任务记录,
    NPC生图任务记录,
    图片管理设置结构,
    内置提示词条目结构,
    世界书结构,
    世界书预设组结构,
    记忆配置结构,
    详细门派结构,
    节日结构,
    世界数据结构,
    战斗状态结构,
    时代信息结构
} from '../../../types';
import type { DeviceState } from '../../../models/mobileDevice';
import type { 设备刷新任务 } from '../device/deviceRefreshMonitor';
import type { 右下角提示结构 } from '../ui/notificationSystem';
import type { 回合快照结构 } from '../ui/rollbackSnapshot';
import type { 记忆压缩任务结构 } from '../memory/memoryUtils';
import type { 记忆总结阶段类型, NPC记忆总结任务结构 } from '../memory/memorySummaryHandlers';
import type { 变量生成上下文缓存项 } from '../planning/variableGenerationProgress';
import type { 运行时提示词状态 } from '../systemPromptBuilder';

// ==================== 基础状态引用 ====================

export interface GameStateRef {
    角色: 角色数据结构 | undefined;
    环境: 环境信息结构 | undefined;
    社交: NPC结构[];
    世界: 世界数据结构 | undefined;
    战斗: 战斗状态结构 | undefined;
    玩家门派: 详细门派结构 | undefined;
    任务列表: any[];
    约定列表: any[];
    剧情: 剧情系统结构 | undefined;
    剧情规划: 剧情规划结构 | undefined;
    女主剧情规划: 女主剧情规划结构 | undefined;
    同人剧情规划: 同人剧情规划结构 | undefined;
    同人女主剧情规划: 同人女主剧情规划结构 | undefined;
    开局配置: OpeningConfig | undefined;
    校规系统: any;
    催眠系统: any;
    校园系统: any;
    记忆系统: 记忆系统结构 | undefined;
    历史记录: 聊天记录结构[];

    apiConfig: 接口设置结构 | undefined;
    gameConfig: 游戏设置结构 | undefined;
    memoryConfig: 记忆配置结构 | undefined;
    visualConfig: 视觉设置结构 | undefined;
    imageManagerConfig: 图片管理设置结构 | undefined;
    prompts: 提示词结构[];
    festivals: 节日结构[];

    view: string;
    loading: boolean;
    showSettings: boolean;
    showInventory: boolean;
    showEquipment: boolean;
    showBattle: boolean;
    showSocial: boolean;
    showTeam: boolean;
    showKungfu: boolean;
    showWorld: boolean;
    showMap: boolean;
    showSect: boolean;
    showTask: boolean;
    showAgreement: boolean;
    showStory: boolean;
    showHeroinePlan: boolean;
    showMemory: boolean;
    showSaveLoad: boolean;
    activeTab: string;
    currentTheme: string;
    currentEra: string;

    设备状态: DeviceState;

    abortControllerRef: React.MutableRefObject<AbortController | null>;
    variableGenerationAbortControllerRef: React.MutableRefObject<AbortController | null>;
    scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}

export interface GameSetters {
    set角色: React.Dispatch<React.SetStateAction<角色数据结构 | undefined>>;
    set环境: React.Dispatch<React.SetStateAction<环境信息结构 | undefined>>;
    set社交: React.Dispatch<React.SetStateAction<NPC结构[]>>;
    set世界: React.Dispatch<React.SetStateAction<世界数据结构 | undefined>>;
    set战斗: React.Dispatch<React.SetStateAction<战斗状态结构 | undefined>>;
    set玩家门派: React.Dispatch<React.SetStateAction<详细门派结构 | undefined>>;
    set任务列表: React.Dispatch<React.SetStateAction<any[]>>;
    set约定列表: React.Dispatch<React.SetStateAction<any[]>>;
    set剧情: React.Dispatch<React.SetStateAction<剧情系统结构 | undefined>>;
    set剧情规划: React.Dispatch<React.SetStateAction<剧情规划结构 | undefined>>;
    set女主剧情规划: React.Dispatch<React.SetStateAction<女主剧情规划结构 | undefined>>;
    set同人剧情规划: React.Dispatch<React.SetStateAction<同人剧情规划结构 | undefined>>;
    set同人女主剧情规划: React.Dispatch<React.SetStateAction<同人女主剧情规划结构 | undefined>>;
    set校规系统: React.Dispatch<React.SetStateAction<any>>;
    set催眠系统: React.Dispatch<React.SetStateAction<any>>;
    set校园系统: React.Dispatch<React.SetStateAction<any>>;
    set记忆系统: React.Dispatch<React.SetStateAction<记忆系统结构 | undefined>>;
    set历史记录: React.Dispatch<React.SetStateAction<聊天记录结构[]>>;
    setApiConfig: React.Dispatch<React.SetStateAction<接口设置结构 | undefined>>;
    setVisualConfig: React.Dispatch<React.SetStateAction<视觉设置结构 | undefined>>;
    setImageManagerConfig: React.Dispatch<React.SetStateAction<图片管理设置结构 | undefined>>;
    setGameConfig: React.Dispatch<React.SetStateAction<游戏设置结构 | undefined>>;
    setMemoryConfig: React.Dispatch<React.SetStateAction<记忆配置结构 | undefined>>;
    setPrompts: React.Dispatch<React.SetStateAction<提示词结构[]>>;
    setFestivals: React.Dispatch<React.SetStateAction<节日结构[]>>;
    setCurrentTheme: React.Dispatch<React.SetStateAction<string>>;
    setCurrentEra: React.Dispatch<React.SetStateAction<string>>;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setShowInventory: React.Dispatch<React.SetStateAction<boolean>>;
    setShowEquipment: React.Dispatch<React.SetStateAction<boolean>>;
    setShowBattle: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSocial: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTeam: React.Dispatch<React.SetStateAction<boolean>>;
    setShowKungfu: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWorld: React.Dispatch<React.SetStateAction<boolean>>;
    setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSect: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTask: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAgreement: React.Dispatch<React.SetStateAction<boolean>>;
    setShowStory: React.Dispatch<React.SetStateAction<boolean>>;
    setShowHeroinePlan: React.Dispatch<React.SetStateAction<boolean>>;
    setShowMemory: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSaveLoad: React.Dispatch<React.SetStateAction<boolean>>;
    setView: React.Dispatch<React.SetStateAction<string>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setHasSave: React.Dispatch<React.SetStateAction<boolean>>;
    set设备状态: React.Dispatch<React.SetStateAction<DeviceState>>;
    set设备刷新队列: React.Dispatch<React.SetStateAction<设备刷新任务[]>>;
}

export interface GameActions {
    handleSend: (content: string, isStreaming?: boolean, options?: any) => Promise<any>;
    handlePrivateChatSend: (npcId: string, npcName: string, content: string) => Promise<{ npcReply: string }>;
    handleStop: () => void;
    handleCancelVariableGeneration: () => void;
    handleRegenerate: () => Promise<void>;
    handlePolishTurn: () => Promise<any>;
    handleRecoverFromParseErrorRaw: () => Promise<void>;

    saveSettings: () => Promise<void>;
    saveVisualSettings: () => Promise<void>;
    saveImageManagerSettings: () => Promise<void>;
    saveGameSettings: () => Promise<void>;
    saveMemorySettings: () => Promise<void>;
    saveBuiltinPromptEntries: () => Promise<void>;
    saveWorldbooks: () => Promise<void>;
    saveWorldbookPresetGroups: () => Promise<void>;
    updatePrompts: () => void;
    updateFestivals: () => void;

    handleSaveGame: () => Promise<void>;
    handleLoadGame: (saveData: any) => Promise<void>;

    updateHistoryItem: (index: number, item: any) => void;
    updateMemorySystem: (memory: any) => void;

    createNpcManually: (npc: any) => void;
    updateNpcManually: (npcId: string, data: any) => void;
    deleteNpcManually: (npcId: string) => void;
    uploadNpcImageToSlot: (npcId: string, slot: string, imageData: any) => void;
    updateNpcMajorRole: (npcId: string, isMajor: boolean) => void;
    updateNpcPresence: (npcId: string, data: any) => void;
    removeNpc: (npcId: string) => void;
    removeTask: (taskId: string) => void;
    removeAgreement: (agreementId: string) => void;

    generateNpcImageManually: (npc: any) => void;
    generateNpcSecretPartImage: (npc: any, part: string) => void;
    retryNpcImageGeneration: (taskId: string) => void;
    updatePlayerAvatar: (imageData: any) => void;
    generatePlayerImageManually: () => void;
    selectPlayerAvatarImage: (imageUrl: string) => void;
    clearPlayerAvatarImage: () => void;
    selectPlayerPortraitImage: (imageUrl: string) => void;
    clearPlayerPortraitImage: () => void;
    removePlayerImageRecord: (recordId: string) => void;
    generateSceneImageManually: () => void;
    selectNpcAvatarImage: (npcId: string, imageUrl: string) => void;
    selectNpcPortraitImage: (npcId: string, imageUrl: string) => void;
    selectNpcBackgroundImage: (npcId: string, imageUrl: string) => void;
    clearNpcAvatarImage: (npcId: string) => void;
    clearNpcPortraitImage: (npcId: string) => void;
    clearNpcBackgroundImage: (npcId: string) => void;
    removeNpcImageRecord: (npcId: string, recordId: string) => void;
    clearNpcImageHistory: (npcId: string) => void;
    removeNpcImageQueueTask: (taskId: string) => void;
    clearNpcImageQueue: () => void;
    saveNpcImageLocally: (npcId: string, imageUrl: string) => void;
    applySceneImageWallpaper: (imageUrl: string) => void;
    clearSceneWallpaper: () => void;
    removeSceneImageRecord: (recordId: string) => void;
    clearSceneImageHistory: () => void;
    removeSceneImageQueueTask: (taskId: string) => void;
    clearSceneImageQueue: () => void;
    saveSceneImageLocally: (imageUrl: string) => void;

    updateRuntimeVariableSection: (section: string, data: any) => void;
    applyRuntimeVariableCommand: (command: any) => void;

    handleStartNewGameWizard: (data: any) => void;
    handleGenerateWorld: (options?: any) => Promise<void>;
    handleQuickRestart: () => void;
    handleReturnToHome: () => void;

    dismissNotification: (toastId: string) => void;

    handleForceWorldEvolutionUpdate: () => Promise<void>;

    getContextSnapshot: () => Promise<any>;

    handleStartMemorySummary: () => void;
    handleCancelMemorySummary: () => void;
    handleBackToMemorySummaryRemind: () => void;
    handleUpdateMemorySummaryDraft: (draft: string) => void;
    handleStartManualMemorySummary: () => void;
    handleApplyMemorySummary: () => void;

    handleStartNpcMemorySummary: () => void;
    handleCancelNpcMemorySummary: () => void;
    handleBackToNpcMemorySummaryRemind: () => void;
    handleUpdateNpcMemorySummaryDraft: (draft: string) => void;
    handleQueueManualNpcMemorySummary: (npcId: string) => void;
    handleApplyNpcMemorySummary: (npcId: string) => void;

    saveArtistPreset: (preset: any) => void;
    deleteArtistPreset: (id: string) => void;
    saveModelConverterPreset: (preset: any) => void;
    deleteModelConverterPreset: (id: string) => void;
    setModelConverterPresetEnabled: (id: string, enabled: boolean) => void;
    savePromptConverterPreset: (preset: any) => void;
    deletePromptConverterPreset: (id: string) => void;

    saveCharacterAnchor: (anchor: any) => void;

    deleteImageManagerPreset: (id: string) => void;
    saveImageManagerPreset: (preset: any) => void;
    导出所有预设: () => string;
    导入所有预设: (json: string) => void;

    handleTravel: (目标地图: any, 目标建筑: any) => void;
    handleExplore: (目标建筑: any) => void;
    handleBuyItem: (物品: any, 卖家NPC: any) => any;
    handleSellItem: (物品ID: string) => any;

    打开设备: () => void;
    设备关闭: () => void;
    设备打开应用: (app: string) => void;
    设备返回主页: () => void;

    旅行事件列表: any[];

    更新BDSM关系状态: (npcId: string, updater: (state: any) => any) => void;
    添加BDSM任务: (npcId: string, 任务: any) => any;
    更新BDSM任务状态: (npcId: string, 任务ID: string, 新状态: string, 评价?: string) => void;
    更新契约状态: (npcId: string, 新契约: any) => void;
    添加BDSM里程碑: (npcId: string, 类型: string, 描述: string) => void;
    设置日常指令: (npcId: string, 指令: any[]) => void;
    请求生成BDSM任务: (npcId: string, npcName: string) => Promise<any>;
    请求生成BDSM日常指令: (npcId: string, npcName: string) => Promise<any>;
    请求评价BDSM任务: (npcId: string, 任务ID: string, 执行情况: string) => Promise<any>;
    请求生成BDSM契约: (npcId: string, 契约类型: string) => Promise<any>;
    请求判定BDSM阶段推进: (npcId: string, npcName: string) => Promise<any>;

    handleCampusForumPost: (data: any) => void;
    handleCampusRumorSpread: (data: any) => void;
    handleAcademicStudy: (data: any) => void;
    handleScheduleUpdate: (data: any) => void;
    handleClubActivity: (data: any) => void;
}

export interface GameMeta {
    canRerollLatest: boolean;
    canQuickRestart: boolean;
    worldEvolutionEnabled: boolean;
    worldEvolutionUpdating: boolean;
    worldEvolutionStatus: string;
    worldEvolutionLastUpdatedAt: string | null;
    worldEvolutionLastSummary: string[];
    worldEvolutionLastRawText: string;
    memorySummaryOpen: boolean;
    memorySummaryStage: 记忆总结阶段类型;
    memorySummaryTask: 记忆压缩任务结构 | null;
    memorySummaryDraft: string;
    memorySummaryError: string;
    npcMemorySummaryOpen: boolean;
    npcMemorySummaryStage: 记忆总结阶段类型;
    npcMemorySummaryTask: NPC记忆总结任务结构 | null;
    npcMemorySummaryDraft: string;
    npcMemorySummaryError: string;
    npcMemorySummaryQueueLength: number;
    imageGenerationQueue: NPC生图任务记录[];
    sceneImageArchive: 场景图片档案;
    sceneImageQueue: 场景生图任务记录[];
    variableGenerationRunning: boolean;
    openingWorldEvolutionProgress: any;
    openingPlanningProgress: any;
    openingVariableGenerationProgress: any;
    builtinPromptEntries: 内置提示词条目结构[];
    worldbooks: 世界书结构[];
    worldbookPresetGroups: 世界书预设组结构[];
    notifications: 右下角提示结构[];
    chatScrollSuppressToken: number;
    chatForceScrollToken: number;
    eraInfo: 时代信息结构 | undefined;
    deviceState: DeviceState;
    deviceRefreshQueue: 设备刷新任务[];
}

export interface UseGameReturn {
    state: GameStateRef;
    meta: GameMeta;
    setters: GameSetters;
    actions: GameActions;
}
