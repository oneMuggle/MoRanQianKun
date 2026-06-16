import type { 场景图片档案, 内置提示词条目结构, 世界书结构, 世界书预设组结构, 提示词结构, 节日结构 } from './types';

// Image resource - generic shape used across image workflows
export type 图片资源 = Record<string, unknown>;

// ============================================================
// Meta: 只读/派生状态
// ============================================================

export interface UseGameMeta {
    canRerollLatest: boolean;
    canQuickRestart: boolean;
    worldEvolutionEnabled: boolean;
    worldEvolutionUpdating: boolean;
    worldEvolutionStatus: string;
    worldEvolutionLastUpdatedAt: string;
    worldEvolutionLastSummary: string;
    worldEvolutionLastRawText: string;
    memorySummaryOpen: boolean;
    memorySummaryStage: string;
    memorySummaryTask: unknown | null;
    memorySummaryDraft: string;
    memorySummaryError: string;
    npcMemorySummaryOpen: boolean;
    npcMemorySummaryStage: string;
    npcMemorySummaryTask: unknown | null;
    npcMemorySummaryDraft: string;
    npcMemorySummaryError: string;
    npcMemorySummaryQueueLength: number;
    imageGenerationQueue: unknown[];
    sceneImageArchive: 场景图片档案;
    sceneImageQueue: unknown[];
    variableGenerationRunning: boolean;
    openingWorldEvolutionProgress: unknown;
    openingPlanningProgress: unknown;
    openingVariableGenerationProgress: unknown;
    builtinPromptEntries: 内置提示词条目结构[];
    worldbooks: 世界书结构[];
    worldbookPresetGroups: 世界书预设组结构[];
    notifications: Array<{ id: string; message: string; level?: string }>;
    chatScrollSuppressToken: number;
    chatForceScrollToken: number;
    eraInfo: unknown;
    deviceState: Record<string, unknown>;
    deviceRefreshQueue: unknown[];
}

// ============================================================
// Setters: 状态设置函数
// ============================================================

export interface UseGameSetters {
    setShowSettings: (v: boolean) => void;
    setShowInventory: (v: boolean) => void;
    setShowEquipment: (v: boolean) => void;
    setShowBattle: (v: boolean) => void;
    setShowSocial: (v: boolean) => void;
    setShowTeam: (v: boolean) => void;
    setShowKungfu: (v: boolean) => void;
    setShowWorld: (v: boolean) => void;
    setShowMap: (v: boolean) => void;
    setShowSect: (v: boolean) => void;
    setShowTask: (v: boolean) => void;
    setShowAgreement: (v: boolean) => void;
    setShowStory: (v: boolean) => void;
    setShowHeroinePlan: (v: boolean) => void;
    setShowMemory: (v: boolean) => void;
    setShowSaveLoad: (v: boolean) => void;
    setShowRelationship: (v: boolean) => void;
    setActiveTab: (v: string) => void;
    setCurrentTheme: (v: string) => void;
    setCurrentEra: (v: number) => void;
    setApiConfig: (v: unknown) => void;
    setVisualConfig: (v: unknown) => void;
    setImageManagerConfig: (v: unknown) => void;
    setPrompts: (v: 提示词结构) => void;
    set校规系统: (v: unknown) => void;
    set催眠系统: (v: unknown) => void;
    set校园系统: (v: unknown) => void;
    set约定列表: (v: unknown) => void;
    set社交: (v: unknown) => void;
    set设备刷新队列: (v: unknown[]) => void;
}

// ============================================================
// Actions: 用户操作函数
// ============================================================

export interface UseGameActions {
    // Core
    handleSend: (content: string, options?: unknown) => Promise<void>;
    handlePrivateChatSend: (content: string, npcId: string) => Promise<void>;
    handleStop: () => void;
    handleCancelVariableGeneration: () => void;
    handleRegenerate: (index: number) => Promise<void>;
    handlePolishTurn: (index: number) => Promise<void>;
    handleRecoverFromParseErrorRaw: (error: unknown) => Promise<void>;

    // Settings persistence
    saveSettings: () => Promise<void>;
    saveVisualSettings: () => Promise<void>;
    saveImageManagerSettings: () => Promise<void>;
    saveGameSettings: () => Promise<void>;
    saveMemorySettings: () => Promise<void>;
    saveBuiltinPromptEntries: () => Promise<void>;
    saveWorldbooks: () => Promise<void>;
    saveWorldbookPresetGroups: () => Promise<void>;
    updatePrompts: (prompts: 提示词结构) => void;
    updateFestivals: (festivals: 节日结构[]) => void;

    // Save/Load
    handleSaveGame: () => Promise<void>;
    handleLoadGame: (saveData: unknown) => Promise<void>;

    // History/Memory
    updateHistoryItem: (index: number, item: unknown) => void;
    updateMemorySystem: (memory: unknown) => void;

    // Memory summary
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
    handleApplyNpcMemorySummary: () => void;

    // NPC CRUD
    createNpcManually: (npc: unknown) => void;
    updateNpcManually: (npcId: string, updates: unknown) => void;
    deleteNpcManually: (npcId: string) => void;
    uploadNpcImageToSlot: (npcId: string, slot: string, image: 图片资源) => void;
    updateNpcMajorRole: (npcId: string, role: string) => void;
    updateNpcPresence: (npcId: string, presence: unknown) => void;
    移除NPC: (npcId: string) => void;

    // Runtime variables
    updateRuntimeVariableSection: (section: unknown) => void;
    applyRuntimeVariableCommand: (command: unknown) => void;
    removeTask: (taskId: string) => void;
    removeAgreement: (agreementId: string) => void;

    // Session
    handleStartNewGameWizard: () => void;
    handleGenerateWorld: (config: unknown) => Promise<void>;
    handleQuickRestart: (config: unknown) => Promise<void>;
    handleReturnToHome: () => void;

    // Player image
    updatePlayerAvatar: (image: 图片资源) => void;
    generatePlayerImageManually: () => Promise<void>;
    selectPlayerAvatarImage: (image: 图片资源) => void;
    clearPlayerAvatarImage: () => void;
    selectPlayerPortraitImage: (image: 图片资源) => void;
    clearPlayerPortraitImage: () => void;
    removePlayerImageRecord: (id: string) => void;

    // NPC image
    generateNpcImageManually: (npcId: string) => Promise<void>;
    generateNpcSecretPartImage: (npcId: string, part: string) => Promise<void>;
    retryNpcImageGeneration: (taskId: string) => Promise<void>;
    selectNpcAvatarImage: (npcId: string, image: 图片资源) => void;
    selectNpcPortraitImage: (npcId: string, image: 图片资源) => void;
    selectNpcBackgroundImage: (npcId: string, image: 图片资源) => void;
    clearNpcAvatarImage: (npcId: string) => void;
    clearNpcPortraitImage: (npcId: string) => void;
    clearNpcBackgroundImage: (npcId: string) => void;
    removeNpcImageRecord: (npcId: string, id: string) => void;
    clearNpcImageHistory: (npcId: string) => void;
    removeNpcImageQueueTask: (taskId: string) => void;
    clearNpcImageQueue: () => void;
    saveNpcImageLocally: (npcId: string, image: 图片资源) => void;

    // Scene image
    generateSceneImageManually: () => Promise<void>;
    applySceneImageWallpaper: (image: 图片资源) => void;
    clearSceneWallpaper: () => void;
    removeSceneImageRecord: (id: string) => void;
    clearSceneImageHistory: () => void;
    removeSceneImageQueueTask: (taskId: string) => void;
    clearSceneImageQueue: () => void;
    saveSceneImageLocally: (image: 图片资源) => void;

    // Presets & anchors
    saveArtistPreset: (name: string, value: string) => void;
    deleteArtistPreset: (name: string) => void;
    saveModelConverterPreset: (name: string, value: string) => void;
    deleteModelConverterPreset: (name: string) => void;
    setModelConverterPresetEnabled: (name: string, enabled: boolean) => void;
    savePromptConverterPreset: (name: string, value: string) => void;
    deletePromptConverterPreset: (name: string) => void;
    saveCharacterAnchor: (anchor: unknown) => void;
    deleteCharacterAnchor: (id: string) => void;
    setCurrentCharacterAnchor: (id: string) => void;
    getCharacterAnchor: (id: string) => unknown;
    getCharacterAnchorByNpcId: (npcId: string) => unknown;
    getPlayerCharacterAnchor: () => unknown;
    extractCharacterAnchor: (data: unknown) => unknown;
    extractPlayerCharacterAnchor: () => unknown;
    importPresets: (data: unknown) => void;
    exportPresets: () => unknown;
    savePngStylePreset: (name: string, value: unknown) => void;
    deletePngStylePreset: (name: string) => void;
    setCurrentPngStylePreset: (name: string) => void;
    parsePngStylePreset: (raw: unknown) => unknown;
    exportPngStylePresets: () => unknown;
    importPngStylePresets: (data: unknown) => void;
    setPersistentWallpaper: (image: 图片资源) => void;
    clearPersistentWallpaper: () => void;

    // Notifications & misc
    dismissNotification: (id: string) => void;
    pushNotification: (notification: { id: string; message: string; level?: string }) => void;
    handleForceWorldEvolutionUpdate: () => void;
    getContextSnapshot: () => Promise<unknown>;
    handleEraChange: (era: number) => void;

    // BDSM
    updateBDSMRelationshipState: (npcId: string, state: unknown) => void;
    addBDSMTask: (npcId: string, task: unknown) => void;
    updateBDSMTaskStatus: (npcId: string, taskId: string, status: unknown) => void;
    updateContractStatus: (npcId: string, status: unknown) => void;
    addBDSMMilestone: (npcId: string, milestone: unknown) => void;
    setDailyInstructions: (npcId: string, instructions: unknown) => void;
    buildMeetingPrompt: (context: unknown) => string;
    parseMeetingResult: (raw: string) => unknown;
    generateTaskSummary: (context: unknown) => Promise<string>;
    reportTaskComplete: (params: unknown) => Promise<void>;
    stageAdvance: (params: unknown) => Promise<void>;
    requestBDSMTaskGeneration: (npcId: string) => Promise<void>;
    requestBDSMDailyInstructions: (npcId: string) => Promise<void>;
    requestBDSMTaskEvaluation: (npcId: string, taskId: string) => Promise<void>;
    requestBDSMContractGeneration: (npcId: string) => Promise<void>;
    requestBDSMStageAdvance: (npcId: string) => Promise<void>;

    // Travel/Trade/Forge
    handleTravel: (destination: string) => Promise<void>;
    handleExplore: (location: string) => Promise<void>;
    travelEvents: unknown[];
    handleBuyItem: (itemId: string, quantity: number) => void;
    handleSellItem: (itemId: string, quantity: number) => void;
    handleForgeItem: (recipeId: string, materials: unknown[]) => void;
    getForgeRecipes: () => unknown[];
    checkForgeMaterials: (recipeId: string) => unknown;
    getForgeSuccessRate: (recipeId: string) => number;

    // Device
    openDevice: () => void;
    closeDevice: () => void;
    openDeviceApp: (appId: string) => void;
    returnDeviceHome: () => void;
    setDeviceState: (state: Record<string, unknown>) => void;

    // Performance config
    performanceConfig: unknown;
}

// ============================================================
// Full return shape of useGame()
// ============================================================

export interface UseGameReturn {
    state: Record<string, unknown>;
    meta: UseGameMeta;
    setters: UseGameSetters;
    actions: UseGameActions;
}
