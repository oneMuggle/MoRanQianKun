/**
 * 遗留弹窗批量注册 — Phase 7: componentFactory 模式
 *
 * 所有组件使用 desktopComponentFactory / mobileComponentFactory 动态 import，
 * 消除静态引用，让 Vite 能够 tree-shake。
 */

import { UIFeatureRegistry } from './registry';
import { desktopTabs, mobileTabs } from '../../components/features/Settings/tabDefinitions';
import { 获取时代主题方案, 全部时代配置 } from '../../models/system';

// 不再静态导入组件！使用 componentFactory 模式。
// 所有组件通过 desktopComponentFactory / mobileComponentFactory 动态加载。

// ============================================================================
// 核心模块
// ============================================================================

// Character
UIFeatureRegistry.register({
  id: 'character',
  name: '角色面板',
  icon: '👤',
  category: 'core',
  priority: 100,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Character/CharacterModal'),
    mobileComponentFactory: () => import('../../components/features/Character/MobileCharacter'),
    visibility: 'always',
    stateKey: 'showCharacter',
    gameViewOnly: true,
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      character: state.角色,
      gameConfig: state.gameConfig,
      apiConfig: state.apiConfig,
      visualConfig: state.visualConfig,
      playerAnchor: (actions as any).getPlayerCharacterAnchor?.() || null,
      onGeneratePlayerImage: (actions as any).generatePlayerImageManually,
      onExtractPlayerAnchor: (actions as any).extractPlayerCharacterAnchor,
      onSavePlayerAnchor: (actions as any).saveCharacterAnchor,
      onDeletePlayerAnchor: (actions as any).deleteCharacterAnchor,
      onSelectPlayerAvatarImage: (actions as any).selectPlayerAvatarImage,
      onClearPlayerAvatarImage: (actions as any).clearPlayerAvatarImage,
      onSelectPlayerPortraitImage: (actions as any).selectPlayerPortraitImage,
      onClearPlayerPortraitImage: (actions as any).clearPlayerPortraitImage,
      onRemovePlayerImageRecord: (actions as any).removePlayerImageRecord,
      onClose: () => {
        (setters as any).setShowCharacter?.(false);
        modalManager.close('character');
      },
    }),
  },
});

// Inventory
UIFeatureRegistry.register({
  id: 'inventory',
  name: '背包',
  icon: '🎒',
  category: 'core',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Inventory/InventoryModal'),
    mobileComponentFactory: () => import('../../components/features/Inventory/MobileInventoryModal'),
    visibility: 'always',
    stateKey: 'showInventory',
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      onClose: () => {
        (setters as any).setShowInventory?.(false);
        modalManager.close('inventory');
      },
    }),
  },
});

// Equipment
UIFeatureRegistry.register({
  id: 'equipment',
  name: '装备',
  icon: '⚔️',
  category: 'core',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Equipment/EquipmentModal'),
    mobileComponentFactory: () => import('../../components/features/Equipment/MobileEquipmentModal'),
    visibility: 'always',
    stateKey: 'showEquipment',
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      onClose: () => {
        (setters as any).setShowEquipment?.(false);
        modalManager.close('equipment');
      },
    }),
  },
});

// Battle
UIFeatureRegistry.register({
  id: 'battle',
  name: '战斗',
  icon: '⚔️',
  category: 'core',
  priority: 95,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Battle/BattleModal'),
    mobileComponentFactory: () => import('../../components/features/Battle/MobileBattleModal'),
    visibility: 'always',
    stateKey: 'showBattle',
    gameViewOnly: true,
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      battle: state.战斗,
      onClose: () => {
        (setters as any).setShowBattle?.(false);
        modalManager.close('battle');
      },
      onAction: () => {},
    }),
  },
});

// Social
UIFeatureRegistry.register({
  id: 'social',
  name: '社交',
  icon: '👥',
  category: 'core',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Social/SocialModal'),
    mobileComponentFactory: () => import('../../components/features/Social/MobileSocial'),
    visibility: 'always',
    stateKey: 'showSocial',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      socialList: state.社交,
      cultivationSystemEnabled: ((state as any).gameConfig?.启用修炼体系) !== false,
      onClose: () => {
        (setters as any).setShowSocial?.(false);
        modalManager.close('social');
      },
      playerName: (state.角色 as any)?.姓名,
      nsfwEnabled: ((state as any).gameConfig?.启用NSFW模式) === true,
      onToggleMajorRole: (actions as any).updateNpcMajorRole,
      onTogglePresence: (actions as any).updateNpcPresence,
      onDeleteNpc: (actions as any).移除NPC,
      欲望系统: (state as any).校园系统?.欲望系统,
      onOpenCampusDesire: () => modalManager.open('campusDesire'),
      关系谱: (state as any).关系谱,
    }),
  },
});

// Team
UIFeatureRegistry.register({
  id: 'team',
  name: '队伍',
  icon: '👥',
  category: 'core',
  priority: 85,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Team/TeamModal'),
    mobileComponentFactory: () => import('../../components/features/Team/MobileTeamModal'),
    visibility: 'always',
    stateKey: 'showTeam',
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      teammates: state.社交,
      onClose: () => {
        (setters as any).setShowTeam?.(false);
        modalManager.close('team');
      },
    }),
  },
});

// Kungfu
UIFeatureRegistry.register({
  id: 'kungfu',
  name: '武功',
  icon: '🥋',
  category: 'core',
  priority: 85,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Kungfu/KungfuModal'),
    mobileComponentFactory: () => import('../../components/features/Kungfu/MobileKungfuModal'),
    visibility: 'config-dependent',
    gameViewOnly: true,
    configKey: '启用修炼体系',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => ({
      skills: (state.角色 as any)?.功法列表,
      onClose: () => {
        (setters as any).setShowKungfu?.(false);
        modalManager.close('kungfu');
      },
    }),
  },
});

// SaveLoad
UIFeatureRegistry.register({
  id: 'saveLoad',
  name: '存档/读档',
  icon: '💾',
  category: 'tools',
  priority: 95,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/SaveLoad/SaveLoadModal'),
    mobileComponentFactory: () => import('../../components/features/SaveLoad/MobileSaveLoadModal'),
    visibility: 'always',
    stateKey: 'showSaveLoad',
    propsFactory: ({ state, actions, modalManager, requestConfirm }) => {
      const payload = modalManager.openModals.get('saveLoad');
      const mode = (payload && typeof payload === 'object' && 'mode' in payload)
        ? (payload as { mode: string }).mode
        : ((state as any).showSaveLoad?.mode ?? 'load');
      return {
        onClose: () => modalManager.close('saveLoad'),
        onLoadGame: (actions as any).handleLoadGame,
        onSaveGame: (actions as any).handleSaveGame,
        mode,
        requestConfirm,
      };
    },
  },
});

// ============================================================================
// 世界与地图
// ============================================================================

// World
UIFeatureRegistry.register({
  id: 'world',
  name: '世界',
  icon: '🌍',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/World/WorldModal'),
    mobileComponentFactory: () => import('../../components/features/World/MobileWorldModal'),
    visibility: 'always',
    stateKey: 'showWorld',
    propsFactory: ({ state, meta, actions, setters, modalManager }) => ({
      world: state.世界,
      worldEvolutionEnabled: (meta as any).worldEvolutionEnabled,
      worldEvolutionUpdating: (meta as any).worldEvolutionUpdating,
      worldEvolutionStatus: (meta as any).worldEvolutionStatus,
      worldEvolutionLastUpdatedAt: (meta as any).worldEvolutionLastUpdatedAt,
      worldEvolutionLastRawText: (meta as any).worldEvolutionLastRawText,
      onForceUpdate: (actions as any).handleForceWorldEvolutionUpdate,
      onClose: () => {
        (setters as any).setShowWorld?.(false);
        modalManager.close('world');
      },
    }),
  },
});

// Map
UIFeatureRegistry.register({
  id: 'map',
  name: '地图',
  icon: '🗺️',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Map/MapModal'),
    mobileComponentFactory: () => import('../../components/features/Map/MobileMapModal'),
    visibility: 'always',
    stateKey: 'showMap',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      world: state.世界,
      env: state.环境,
      character: state.角色,
      onTravel: (actions as any).handleTravel,
      onExplore: (actions as any).handleExplore,
      travelEvents: (actions as any).travelEvents,
      onClose: () => {
        (setters as any).setShowMap?.(false);
        modalManager.close('map');
      },
    }),
  },
});

// Sect
UIFeatureRegistry.register({
  id: 'sect',
  name: '门派',
  icon: '🏯',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Sect/SectModal'),
    mobileComponentFactory: () => import('../../components/features/Sect/MobileSect'),
    visibility: 'always',
    stateKey: 'showSect',
    propsFactory: ({ state, setters, modalManager }) => ({
      sectData: state.玩家门派,
      currentTime: ((state as any).环境?.时间) || '未知时间',
      rpgMode: state.rpgMode,
      character: state.角色,
      onClose: () => {
        (setters as any).setShowSect?.(false);
        modalManager.close('sect');
      },
    }),
  },
});

// Task
UIFeatureRegistry.register({
  id: 'task',
  name: '任务',
  icon: '📋',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Task/TaskModal'),
    mobileComponentFactory: () => import('../../components/features/Task/MobileTask'),
    visibility: 'always',
    stateKey: 'showTask',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      tasks: state.任务列表,
      onDeleteTask: (actions as any).removeTask,
      rpgMode: state.rpgMode,
      character: state.角色,
      onClose: () => {
        (setters as any).setShowTask?.(false);
        modalManager.close('task');
      },
    }),
  },
});

// Agreement
UIFeatureRegistry.register({
  id: 'agreement',
  name: '约定',
  icon: '📝',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Agreement/AgreementModal'),
    mobileComponentFactory: () => import('../../components/features/Agreement/MobileAgreementModal'),
    visibility: 'always',
    stateKey: 'showAgreement',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      agreements: state.约定列表,
      onDeleteAgreement: (actions as any).removeAgreement,
      onClose: () => {
        (setters as any).setShowAgreement?.(false);
        modalManager.close('agreement');
      },
    }),
  },
});

// ============================================================================
// 叙事与记忆
// ============================================================================

// Story
UIFeatureRegistry.register({
  id: 'story',
  name: '剧情',
  icon: '📖',
  category: 'narrative',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Story/StoryModal'),
    mobileComponentFactory: () => import('../../components/features/Story/MobileStory'),
    visibility: 'always',
    stateKey: 'showStory',
    propsFactory: ({ state, setters, modalManager }) => {
      const 当前剧情规划 = (state as any).规划?.当前剧情规划;
      return {
        story: state.剧情,
        storyPlan: 当前剧情规划,
        isFandomMode: ((state as any).规划?.同人剧情规划 != null),
        onClose: () => {
          (setters as any).setShowStory?.(false);
          modalManager.close('story');
        },
      };
    },
  },
});

// HeroinePlan
UIFeatureRegistry.register({
  id: 'heroinePlan',
  name: '女主剧情规划',
  icon: '📋',
  category: 'narrative',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Story/HeroinePlanModal'),
    mobileComponentFactory: () => import('../../components/features/Story/MobileHeroinePlanModal'),
    visibility: 'config-dependent',
    configKey: '启用女主剧情规划',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => {
      const 当前女主剧情规划 = (state as any).规划?.当前女主剧情规划;
      return {
        plan: 当前女主剧情规划,
        isFandomMode: ((state as any).规划?.同人女主剧情规划 != null),
        onClose: () => {
          (setters as any).setShowHeroinePlan?.(false);
          modalManager.close('heroinePlan');
        },
      };
    },
  },
});

// Memory
UIFeatureRegistry.register({
  id: 'memory',
  name: '记忆',
  icon: '🧠',
  category: 'narrative',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Memory/MemoryModal'),
    mobileComponentFactory: () => import('../../components/features/Memory/MobileMemory'),
    visibility: 'always',
    stateKey: 'showMemory',
    propsFactory: ({ state, setters, modalManager }) => ({
      history: state.历史记录,
      memorySystem: state.记忆系统,
      onClose: () => {
        (setters as any).setShowMemory?.(false);
        modalManager.close('memory');
      },
    }),
  },
});

// MemorySummaryFlow
UIFeatureRegistry.register({
  id: 'memorySummaryFlow',
  name: '记忆总结',
  icon: '📝',
  category: 'narrative',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Memory/MemorySummaryFlowModal'),
    mobileComponentFactory: () => import('../../components/features/Memory/MemorySummaryFlowMobileModal'),
    visibility: 'always',
    propsFactory: ({ modalManager }) => ({
      onClose: () => modalManager.close('memorySummaryFlow'),
    }),
  },
});

// NpcMemorySummaryFlow
UIFeatureRegistry.register({
  id: 'npcMemorySummaryFlow',
  name: 'NPC记忆总结',
  icon: '📝',
  category: 'narrative',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Memory/NpcMemorySummaryFlowModal'),
    mobileComponentFactory: () => import('../../components/features/Memory/NpcMemorySummaryFlowMobileModal'),
    visibility: 'always',
    propsFactory: ({ modalManager }) => ({
      onClose: () => modalManager.close('npcMemorySummaryFlow'),
    }),
  },
});

// ============================================================================
// 工具与设置
// ============================================================================

// Settings
UIFeatureRegistry.register({
  id: 'settings',
  name: '设置',
  icon: '⚙️',
  category: 'settings',
  priority: 100,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Settings/SettingsPanel'),
    visibility: 'always',
    stateKey: 'showSettings',
    propsFactory: ({ state, meta, setters, actions, modalManager, isMobile, requestConfirm, extraProps }) => {
      return {
        navMode: isMobile ? 'pills' : 'sidebar',
        tabs: isMobile ? mobileTabs : desktopTabs,
        activeTab: (state as any).activeTab,
        onTabChange: (setters as any).setActiveTab,
        onClose: () => {
          (setters as any).setShowSettings?.(false);
          modalManager.close('settings');
        },
        apiConfig: state.apiConfig,
        visualConfig: state.visualConfig,
        gameConfig: state.gameConfig,
        memoryConfig: state.memoryConfig,
        performanceConfig: (state as any).performanceConfig,
        prompts: state.prompts,
        festivals: state.festivals,
        currentTheme: state.currentTheme,
        currentEra: state.currentEra,
        eraInfo: (meta as any).eraInfo,
        eraTheme: state.currentEra ? 获取时代主题方案(state.currentEra as string) : undefined,
        availableEras: 全部时代配置,
        onEraChange: (actions as any).handleEraChange,
        history: state.历史记录,
        memorySystem: state.记忆系统,
        socialList: state.社交,
        runtimeState: extraProps?.runtimeStateSections,
        currentStory: state.剧情,
        openingConfig: state.开局配置,
        contextSnapshot: extraProps?.contextSnapshot,
        onSaveApi: (actions as any).saveSettings,
        onSaveVisual: (actions as any).saveVisualSettings,
        onSaveGame: (actions as any).saveGameSettings,
        onSaveMemory: (actions as any).saveMemorySettings,
        onSavePerformance: (actions as any).savePerformanceSettings,
        onCreateNpc: (actions as any).createNpcManually,
        onSaveNpc: (actions as any).updateNpcManually,
        onDeleteNpc: (actions as any).deleteNpcManually,
        onStartNpcMemorySummary: (actions as any).handleQueueManualNpcMemorySummary,
        onUploadNpcImage: (actions as any).uploadNpcImageToSlot,
        onReplaceVariableSection: (actions as any).updateRuntimeVariableSection,
        onApplyVariableCommand: (actions as any).applyRuntimeVariableCommand,
        onUpdatePrompts: (actions as any).updatePrompts,
        onUpdateFestivals: (actions as any).updateFestivals,
        onThemeChange: (setters as any).setCurrentTheme,
        requestConfirm,
        onReturnToHome: (actions as any).handleReturnToHome,
        isHome: state.view === 'home',
      };
    },
  },
});

// ImageManager
UIFeatureRegistry.register({
  id: 'imageManager',
  name: '图片管理',
  icon: '🖼️',
  category: 'tools',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Social/ImageManagerModal'),
    mobileComponentFactory: () => import('../../components/features/Social/mobile/MobileImageManagerModal'),
    visibility: 'always',
    stateKey: 'showImageManager',
    propsFactory: ({ state, meta, actions, setters, modalManager }) => ({
      socialList: state.社交,
      cultivationSystemEnabled: ((state as any).gameConfig?.启用修炼体系) !== false,
      queue: (meta as any).imageGenerationQueue || [],
      sceneArchive: (meta as any).sceneImageArchive || {},
      sceneQueue: (meta as any).sceneImageQueue || [],
      apiConfig: state.apiConfig,
      imageManagerConfig: state.imageManagerConfig,
      currentPersistentWallpaper: ((state as any).visualConfig?.常驻壁纸) || '',
      onSaveApiConfig: (actions as any).saveSettings,
      onSaveImageManagerConfig: (actions as any).saveImageManagerSettings,
      onGenerateImage: (actions as any).generateNpcImageManually,
      onGenerateSecretPartImage: (actions as any).generateNpcSecretPartImage,
      onRetryImage: (actions as any).retryNpcImageGeneration,
      onGenerateSceneImage: (actions as any).generateSceneImageManually,
      onSelectAvatarImage: (actions as any).selectNpcAvatarImage,
      onSelectPortraitImage: (actions as any).selectNpcPortraitImage,
      onSelectBackgroundImage: (actions as any).selectNpcBackgroundImage,
      onClearAvatarImage: (actions as any).clearNpcAvatarImage,
      onClearPortraitImage: (actions as any).clearNpcPortraitImage,
      onClearBackgroundImage: (actions as any).clearNpcBackgroundImage,
      onDeleteImageRecord: (actions as any).removeNpcImageRecord,
      onClearImageHistory: (actions as any).clearNpcImageHistory,
      onDeleteQueueTask: (actions as any).removeNpcImageQueueTask,
      onClearQueue: (actions as any).clearNpcImageQueue,
      onSaveImageLocally: (actions as any).saveNpcImageLocally,
      onApplySceneWallpaper: (actions as any).applySceneImageWallpaper,
      onClearSceneWallpaper: (actions as any).clearSceneWallpaper,
      onDeleteSceneImage: (actions as any).removeSceneImageRecord,
      onClearSceneHistory: (actions as any).clearSceneImageHistory,
      onDeleteSceneQueueTask: (actions as any).removeSceneImageQueueTask,
      onClearSceneQueue: (actions as any).clearSceneImageQueue,
      onSaveSceneImageLocally: (actions as any).saveSceneImageLocally,
      onSetPersistentWallpaper: (actions as any).setPersistentWallpaper,
      onClearPersistentWallpaper: (actions as any).clearPersistentWallpaper,
      onSavePngStylePreset: (actions as any).savePngStylePreset,
      onDeletePngStylePreset: (actions as any).deletePngStylePreset,
      onSetCurrentPngStylePreset: (actions as any).setCurrentPngStylePreset,
      onParsePngStylePreset: (actions as any).parsePngStylePreset,
      onExportPngStylePresets: (actions as any).exportPngStylePresets,
      onImportPngStylePresets: (actions as any).importPngStylePresets,
      onSaveCharacterAnchor: (actions as any).saveCharacterAnchor,
      onDeleteCharacterAnchor: (actions as any).deleteCharacterAnchor,
      onExtractCharacterAnchor: (actions as any).extractCharacterAnchor,
      onClose: () => {        modalManager.close('imageManager');
      },
      onSaveArtistPreset: (actions as any).saveArtistPreset,
      onDeleteArtistPreset: (actions as any).deleteArtistPreset,
      onSaveModelConverterPreset: (actions as any).saveModelConverterPreset,
      onDeleteModelConverterPreset: (actions as any).deleteModelConverterPreset,
      onSetModelConverterPresetEnabled: (actions as any).setModelConverterPresetEnabled,
      onSavePromptConverterPreset: (actions as any).savePromptConverterPreset,
      onDeletePromptConverterPreset: (actions as any).deletePromptConverterPreset,
      onImportPresets: (actions as any).importPresets,
      onExportPresets: (actions as any).exportPresets,
    }),
  },
});

// Worldbook Manager
UIFeatureRegistry.register({
  id: 'worldbookManager',
  name: '世界书',
  icon: '📚',
  category: 'tools',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Worldbook/WorldbookManagerModal'),
    mobileComponentFactory: () => import('../../components/features/Worldbook/MobileWorldbookManagerModal'),
    visibility: 'always',
    propsFactory: ({ meta, actions, modalManager, requestConfirm }) => ({
      builtinPromptEntries: meta.builtinPromptEntries,
      worldbooks: meta.worldbooks,
      worldbookPresetGroups: meta.worldbookPresetGroups,
      onSaveBuiltinPromptEntries: actions.saveBuiltinPromptEntries,
      onSaveWorldbooks: actions.saveWorldbooks,
      onSaveWorldbookPresetGroups: actions.saveWorldbookPresetGroups,
      onClose: () => modalManager.close('worldbookManager'),
      requestConfirm,
    }),
  },
});

// Novel Decomposition Workbench
UIFeatureRegistry.register({
  id: 'novelDecompositionWorkbench',
  name: '小说拆解工作台',
  icon: '📖',
  category: 'tools',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/NovelDecomposition/NovelDecompositionWorkbenchModal'),
    mobileComponentFactory: () => import('../../components/features/NovelDecomposition/MobileNovelDecompositionWorkbenchModal'),
    visibility: 'always',
    stateKey: 'showNovelDecompositionWorkbench',
    propsFactory: ({ state, actions, modalManager, requestConfirm }) => ({
      open: true,
      settings: state.apiConfig,
      onSave: actions.saveSettings,
      onClose: () => modalManager.close('novelDecompositionWorkbench'),
      requestConfirm,
      onNotify: actions.pushNotification,
    }),
  },
});

// Novel Writing Workbench
UIFeatureRegistry.register({
  id: 'novelWritingWorkbench',
  name: '小说写作工作台',
  icon: '✍️',
  category: 'tools',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/NovelWriting/NovelWritingWorkbenchModal'),
    mobileComponentFactory: () => import('../../components/features/NovelWriting/MobileNovelWritingWorkbenchModal'),
    visibility: 'always',
    propsFactory: ({ actions, modalManager }) => ({
      open: true,
      onClose: () => modalManager.close('novelWritingWorkbench'),
      onNotify: actions.pushNotification,
    }),
  },
});

// ============================================================================
// 娱乐
// ============================================================================

// CG Gallery
UIFeatureRegistry.register({
  id: 'cgGallery',
  name: 'CG 画廊',
  icon: '🎨',
  category: 'entertainment',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Galgame/CGGalleryModal'),
    mobileComponentFactory: () => import('../../components/features/Galgame/MobileCGGalleryModal'),
    visibility: 'always',
    stateKey: 'showCGGallery',
    propsFactory: ({ setters, modalManager }) => ({
      onClose: () => {
        setters.setShowCGGallery?.(false);
        modalManager.close('cgGallery');
      },
    }),
  },
});

// Relation Graph
UIFeatureRegistry.register({
  id: 'relationGraph',
  name: '关系图谱',
  icon: '🔗',
  category: 'entertainment',
  priority: 70,
  version: '1.0.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Galgame/RelationGraphView'),
    visibility: 'always',
    stateKey: 'showRelationGraph',
    propsFactory: ({ state, modalManager }) => ({
      npcRelations: (state as any).avgState?.npcRelations ?? [],
      playerName: (state.角色 as any)?.姓名 ?? '主角',
      onNpcSelect: (npcId: string) => {
        if (npcId) {
          modalManager.open('social', { selectedNpcId: npcId });
        }
      },
    }),
  },
});

// Music
UIFeatureRegistry.register({
  id: 'music',
  name: '音乐',
  icon: '🎵',
  category: 'entertainment',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Music/mobile/MobileMusicPlayer'),
    visibility: 'always',
    stateKey: 'showMobileMusic',
    propsFactory: ({ setters, modalManager }) => ({
      onClose: () => {        modalManager.close('music');
      },
    }),
  },
});

// ============================================================================
// 探索
// ============================================================================

// Map Explorer
UIFeatureRegistry.register({
  id: 'mapExplorer',
  name: '地图探索',
  icon: '🗺️',
  category: 'core',
  priority: 85,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Exploration/MapExplorerModal'),
    mobileComponentFactory: () => import('../../components/features/Exploration/MobileMapExplorerModal'),
    visibility: 'always',
    stateKey: 'showMapExplorer',
    propsFactory: ({ state, actions, modalManager }) => {
      const bridge = (actions as any).explorationBridge;
      return {
        onClose: () => {
          (state as any).setShowMapExplorer?.(false);
          modalManager.close('mapExplorer');
        },
        onMove: async (nodeId: string) => {
          if (bridge?.moveTo) await bridge.moveTo(nodeId);
        },
        onExplore: () => { bridge?.explore?.(); },
        onRest: () => { bridge?.rest?.(); },
      };
    },
  },
});

// ============================================================================
// NSFW 模块
// ============================================================================

// CampusDesire
UIFeatureRegistry.register({
  id: 'campusDesire',
  name: '校园欲望',
  icon: '🎭',
  category: 'nsfw',
  priority: 80,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: ['campusNSFW'],
  storyModuleId: 'campusNSFW',
  modal: {
    desktopComponentFactory: () => import('../../components/features/CampusDesireDashboard'),
    mobileComponentFactory: () => import('../../components/features/MobileCampusDesireApp'),
    visibility: 'config-dependent',
    configKey: '启用校园NSFW深化系统',
    configValue: true,
    propsFactory: ({ state, setters, actions, modalManager }) => {
      const 校园系统 = (state as any).校园系统 || {};
      const 欲望系统 = 校园系统.欲望系统 || {};
      const NPC欲望档案 = 欲望系统.NPC欲望档案 ?? {};
      const 社交 = (state as any).社交 || [];
      const NPC姓名映射 = Object.fromEntries(
        Object.keys(NPC欲望档案).map(id => {
          const npc = 社交.find((n: any) => n.id === id);
          return [id, npc?.姓名 ?? id];
        })
      );
      return {
        NPC欲望档案,
        后果列表: 欲望系统.后果列表 ?? [],
        里程碑数: Object.fromEntries(
          Object.entries(NPC欲望档案).map(([id]: [string, unknown]) => {
            const milestones = (欲望系统.里程碑列表 ?? []).filter(
              (m: any) => m.NPC姓名 === id || id.includes(m.NPC姓名)
            );
            return [id, milestones.length];
          })
        ),
        NPC姓名映射,
        onClose: () => {          modalManager.close('campusDesire');
        },
        onOpenBDSMRelationship: (npcId: string, npcName: string) => modalManager.open('bdsmRelationship', { npcId, npcName }),
        onOpenBDSMContract: (npcId: string, npcName: string) => modalManager.open('bdsmContract', { npcId, npcName }),
        onOpenBDSMSafety: (npcId: string, npcName: string) => modalManager.open('bdsmSafety', { npcId, npcName }),
        onGenerateTasks: (npcId: string, npcName: string) => { void (actions as any).requestBDSMTaskGeneration(npcId, npcName); },
        onGenerateDailyInstructions: (npcId: string, npcName: string) => { void (actions as any).requestBDSMDailyInstructions(npcId, npcName); },
        onCheckStageAdvance: (npcId: string, npcName: string) => { void (actions as any).requestBDSMStageAdvance(npcId, npcName); },
      };
    },
  },
});

// Photography
UIFeatureRegistry.register({
  id: 'photography',
  name: '写真',
  icon: '📷',
  category: 'nsfw',
  priority: 75,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/PhotographyDashboard'),
    mobileComponentFactory: () => import('../../components/features/MobilePhotographyDashboard'),
    visibility: 'config-dependent',
    configKey: '启用写真NSFW系统',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => {
      const 写真系统 = (state as any).写真系统 || {};
      return {
        模特档案: 写真系统.模特档案 ?? {},
        摄影师档案: 写真系统.摄影师档案 ?? {},
        进行中的拍摄项目: 写真系统.进行中的拍摄项目 ?? [],
        历史拍摄记录: 写真系统.历史拍摄记录 ?? [],
        泄露事件列表: 写真系统.泄露事件列表 ?? [],
        关系网络: 写真系统.关系网络 ?? {},
        摄影师声望: 写真系统.摄影师声望 ?? {},
        模特声望: 写真系统.模特声望 ?? {},
        摄影集索引: 写真系统.摄影集索引 ?? {},
        onClose: () => {          modalManager.close('photography');
        },
      };
    },
  },
});

// UrbanDriver
UIFeatureRegistry.register({
  id: 'urbanDriver',
  name: '网约车',
  icon: '🚗',
  category: 'nsfw',
  priority: 75,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/UrbanDriverDashboard'),
    mobileComponentFactory: () => import('../../components/features/MobileUrbanDriverApp'),
    visibility: 'config-dependent',
    configKey: '启用都市网约车NSFW系统',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => ({
      都市网约车系统: (state as any).都市网约车系统,
      onClose: () => {        modalManager.close('urbanDriver');
      },
    }),
  },
});

// ExposureDashboard
UIFeatureRegistry.register({
  id: 'exposureDashboard',
  name: '露出',
  icon: '👁',
  category: 'nsfw',
  priority: 75,
  version: '1.0.0',
  eraId: 'contemporary',
  dependencies: ['exposureNSFW'],
  storyModuleId: 'exposureNSFW',
  modal: {
    desktopComponentFactory: () => import('../../components/features/ExposureDashboard'),
    mobileComponentFactory: () => import('../../components/features/MobileExposureDashboard'),
    visibility: 'config-dependent',
    configKey: '启用露出系统',
    configValue: true,
    propsFactory: ({ state, modalManager }) => {
      const 校园系统 = (state as any).校园系统 || {};
      const Exposure系统 = 校园系统.Exposure系统 || {};
      const 露出档案 = Exposure系统.露出档案 ?? {};
      const 社交 = (state as any).社交 || [];
      const 旁观者记录 = Exposure系统.旁观者记录 ?? [];
      const 档案 = Object.fromEntries(
        Object.entries(露出档案).map(([id, data]: [string, any]) => [
          id,
          {
            npcId: id,
            npcName: 社交.find((n: any) => n.id === id)?.姓名 ?? id,
            露出状态: data.露出状态,
            紧张度状态: data.紧张度状态,
            网络流言: data.网络流言,
          },
        ])
      );
      return {
        露出档案: 档案,
        旁观者记录,
        onClose: () => modalManager.close('exposureDashboard'),
      };
    },
  },
});

// NsfwCenter
UIFeatureRegistry.register({
  id: 'nsfwCenter',
  name: 'NSFW 控制台',
  icon: '🔞',
  category: 'nsfw',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/NSFWCenter/NsfwControlCenter'),
    visibility: 'config-dependent',
    configKey: '启用NSFW模式',
    configValue: true,
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      gameConfig: state.gameConfig,
      onSaveGame: (config: unknown) => (actions as any).saveGameSettings(config),
      onClose: () => {        modalManager.close('nsfwCenter');
      },
      nsfw资源状态: state.nsfw资源状态,
      nsfw库存: state.nsfw库存,
      on资源变化: (新状态: unknown) => (setters as any).设置NSFW资源状态(新状态),
      on库存变化: (新库存: unknown) => (setters as any).设置NSFW库存(新库存),
      onOpenDashboard: (moduleId: string) => {
        const dashboardMap: Record<string, string> = {
          campusNSFW: 'campusDesire',
          photographyNSFW: 'photography',
          urbanDriverNSFW: 'urbanDriver',
          exposureNSFW: 'exposureDashboard',
          boardGameNSFW: 'boardGameDashboard',
          bdsmNSFW: 'campusDesire',
        };
        const target = dashboardMap[moduleId];
        if (!target) return;
        window.dispatchEvent(new CustomEvent('modal:close', { detail: { id: 'nsfwCenter' } }));
        window.dispatchEvent(new CustomEvent('modal:open', { detail: { id: target } }));
      },
    }),
  },
});

// BarNSFW
UIFeatureRegistry.register({
  id: 'barNSFW',
  name: '酒吧面板',
  icon: '🍸',
  category: 'nsfw',
  priority: 80,
  version: '1.0.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/BarNSFW/BarPanel'),
    mobileComponentFactory: () => import('../../components/features/BarNSFW/MobileBarPanel'),
    visibility: 'config-dependent',
    configKey: '酒吧NSFW设置',
    configValue: true,
    propsFactory: ({ state, actions, modalManager, isMobile }) => {
      const barNSFWSettings = (state as any).gameConfig?.酒吧NSFW设置 ?? {
        启用: true,
        内容强度: '暧昧' as const,
        启用醉酒系统: true,
        启用危机事件: true,
        启用陪酒服务: false,
        尺度上限: '点到为止' as const,
      };
      const barState = (state as any).barNSFWState ?? null;
      return {
        barState,
        settings: barNSFWSettings,
        onAction: (actionType: string, payload?: Record<string, unknown>) => {
          (actions as any).barNSFWAction?.(actionType, payload);
        },
        onLeave: () => {
          (actions as any).barNSFWLeave?.();
        },
        onClose: () => {
          modalManager.close('barNSFW');
        },
      };
    },
  },
});

// BoardGameDashboard
UIFeatureRegistry.register({
  id: 'boardGameDashboard',
  name: '桌游面板',
  icon: '🎲',
  category: 'entertainment',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/BoardGame/BoardGameDashboard'),
    mobileComponentFactory: () => import('../../components/features/BoardGame/MobileBoardGameDashboard'),
    visibility: 'always',
    stateKey: 'showBoardGameDashboard',
    propsFactory: ({ state, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      return {
        桌游状态: 欲望系统.桌游状态 ?? null,
        onClose: () => {
          (setters as any).setShowBoardGameDashboard?.(false);
          modalManager.close('boardGameDashboard');
        },
        onStartGame: (type: string) => {
          modalManager.close('boardGameDashboard');
          modalManager.open('boardGame', { type });
        },
      };
    },
  },
});

// BoardGame
UIFeatureRegistry.register({
  id: 'boardGame',
  name: '桌游',
  icon: '🎲',
  category: 'entertainment',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/BoardGame/BoardGameModal'),
    mobileComponentFactory: () => import('../../components/features/BoardGame/MobileBoardGameModal'),
    visibility: 'always',
    stateKey: 'showBoardGame',
    propsFactory: ({ state, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      return {
        多人局: 欲望系统.多人局 ?? null,
        桌游类型: 欲望系统.桌游状态?.桌游类型 ?? null,
        桌游状态: 欲望系统.桌游状态 ?? null,
        onClose: () => {
          (setters as any).setShowBoardGameModal?.(false);
          modalManager.close('boardGame');
        },
      };
    },
  },
});

// BDSMRelationship
UIFeatureRegistry.register({
  id: 'bdsmRelationship',
  name: 'BDSM 关系',
  icon: '🔗',
  category: 'nsfw',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/BDSMRelationshipModal'),
    visibility: 'always',
    propsFactory: ({ state, actions, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      const payload = modalManager.openModals?.get?.('bdsmRelationship') as { npcId: string; npcName: string } | null;
      if (!payload) return { onClose: () => modalManager.close('bdsmRelationship') };
      const 档案 = 欲望系统.NPC欲望档案?.[payload.npcId];
      return {
        关系状态: 档案?.BDSM关系,
        欲望档案: 档案,
        npcName: payload.npcName,
        日常指令: 档案?.BDSM关系?.日常指令 ?? [],
        onClose: () => {
          (setters as any).setShowBDSMRelationship?.(null);
          modalManager.close('bdsmRelationship');
        },
        onAcceptTask: (taskId: string) => (actions as any).updateBDSMTaskStatus(payload.npcId, taskId, '进行中'),
        onReportComplete: (taskId: string, desc: string) => { void (actions as any).requestBDSMTaskEvaluation(payload.npcId, taskId, desc || '已完成任务'); },
        onAbandonTask: (taskId: string) => (actions as any).updateBDSMTaskStatus(payload.npcId, taskId, '已放弃'),
        onGoToContract: () => {
          modalManager.close('bdsmRelationship');
          modalManager.open('bdsmContract', payload);
        },
        onEditSafety: () => {
          modalManager.close('bdsmRelationship');
          modalManager.open('bdsmSafety', payload);
        },
      };
    },
  },
});

// BDSMContract
UIFeatureRegistry.register({
  id: 'bdsmContract',
  name: 'BDSM 契约',
  icon: '📜',
  category: 'nsfw',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/BDSMContractModal'),
    visibility: 'always',
    propsFactory: ({ state, actions, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      const payload = modalManager.openModals?.get?.('bdsmContract') as { npcId: string; npcName: string } | null;
      if (!payload) return { onClose: () => modalManager.close('bdsmContract') };
      const 档案 = 欲望系统.NPC欲望档案?.[payload.npcId];
      return {
        关系状态: 档案?.BDSM关系,
        onClose: () => {
          (setters as any).setShowBDSMContract?.(null);
          modalManager.close('bdsmContract');
        },
        onNegotiateContract: () => { void (actions as any).requestBDSMContractGeneration(payload.npcId, '书面契约'); },
        onDissolveContract: () => {
          if (档案?.BDSM关系?.契约记录?.length > 0) {
            const 最后契约 = 档案.BDSM关系.契约记录[档案.BDSM关系.契约记录.length - 1];
            (actions as any).updateContractStatus(payload.npcId, { ...最后契约, 状态: '已解除' });
          }
          modalManager.close('bdsmContract');
        },
      };
    },
  },
});

// BDSMSafety
UIFeatureRegistry.register({
  id: 'bdsmSafety',
  name: 'BDSM 安全',
  icon: '🛡️',
  category: 'nsfw',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/BDSMSafetyModal'),
    visibility: 'always',
    propsFactory: ({ state, setters, modalManager }) => {
      const 校园系统 = (state as any).校园系统 || {};
      const 欲望系统 = 校园系统.欲望系统 || {};
      const 校园状态 = 校园系统;
      const payload = modalManager.openModals?.get?.('bdsmSafety') as { npcId: string; npcName: string } | null;
      if (!payload) return { onClose: () => modalManager.close('bdsmSafety') };
      const 档案 = 欲望系统.NPC欲望档案?.[payload.npcId];
      return {
        关系状态: 档案?.BDSM关系,
        npcName: payload.npcName,
        onClose: () => {
          (setters as any).setShowBDSMSafety?.(null);
          modalManager.close('bdsmSafety');
        },
        onSave: (安全词: string, 底线: string[]) => {
          const NPC欲望档案 = 欲望系统.NPC欲望档案 || {};
          const 当前档案 = NPC欲望档案[payload.npcId];
          if (当前档案?.BDSM关系) {
            NPC欲望档案[payload.npcId] = {
              ...当前档案,
              BDSM关系: { ...当前档案.BDSM关系, 安全词, 底线列表: 底线 },
            };
            (setters as any).set校园系统?.({ ...校园状态, 欲望系统: { ...欲望系统, NPC欲望档案 } });
          }
          modalManager.close('bdsmSafety');
        },
      };
    },
  },
});

// ============================================================================
// 设备
// ============================================================================

// MobileDevice
UIFeatureRegistry.register({
  id: 'mobileDevice',
  name: '手机',
  icon: '📱',
  category: 'core',
  priority: 95,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/MobileDevice/MobileDeviceModal'),
    visibility: 'always',
    stateKey: 'showMobileDevice',
    gameViewOnly: true,
    propsFactory: ({ state, meta, setters, actions, modalManager }) => {
      const deviceState = (meta as any).deviceState;
      if (!deviceState?.isOpen) return null;

      return {
        eraId: (state.currentEra as string) || 'contemporary_urban',
        deviceState,
        onAppClick: (actions as any).openDeviceApp,
        onReturnHome: (actions as any).returnDeviceHome,
        onClose: () => {
          (actions as any).closeDevice?.();
          modalManager.close('mobileDevice');
        },
        gameContext: {
          角色: (state.角色 as any) || null,
          社交: (state.社交 as any[]) || [],
          世界: (state.世界 as any) || null,
          剧情: (state.剧情 as any) || null,
          历史记录: (state.历史记录 as any[]) || [],
          校规系统: (state as any).校规系统,
          催眠系统: (state as any).催眠系统,
          校园系统: (state as any).校园系统,
        },
        onRulesChange: (updater: any) => {
          const prev = (state as any).校规系统 || { 校规列表: [], 影响日志: [] };
          (setters as any).set校规系统?.(updater(prev));
        },
        onHypnosisChange: (updater: any) => {
          const prev = (state as any).催眠系统 || { 催眠记录列表: [], app等级: { 当前等级: 1, 已使用次数: 0, 升级阈值: 5, 解锁能力: [] }, 累计使用次数: 0 };
          (setters as any).set催眠系统?.(updater(prev));
        },
        onRefresh: (board: string) => {
          const activeApp = deviceState.activeApp;
          if (!activeApp) return;
          const hasPending = (meta as any).deviceRefreshQueue?.some(
            (t: any) => t.status === 'pending' || t.status === 'processing'
          );
          if (hasPending) return;
          const refreshApp = board === 'bdsn' ? 'bdsn' : activeApp;
          (setters as any).set设备刷新队列?.((prev: any[]) => [...prev, {
            id: `refresh-${Date.now()}`,
            app: refreshApp,
            status: 'pending' as const,
            创建时间: Date.now(),
          }]);
        },
        onSendMessage: (npcId: string, npcName: string, content: string) => {
          return (actions as any).handlePrivateChatSend?.(npcId, npcName, content).then((result: any) => {
            if (result.npcReply) {
              const prev = (state as any).校园系统;
              const 私聊列表 = prev?.私聊会话列表 || [];
              const 更新后列表 = 私聊列表.map((s: any) => {
                if (s.id === npcId) {
                  const newMsg = {
                    id: `msg-${Date.now()}`,
                    发送者: npcName,
                    内容: result.npcReply,
                    时间: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                    是否已读: false,
                  };
                  return { ...s, 消息列表: [...(s.消息列表 || []), newMsg], 最后消息: result.npcReply };
                }
                return s;
              });
              (setters as any).set校园系统?.({ ...prev, 私聊会话列表: 更新后列表 });
            }
            return result;
          });
        },
        onUnlockNPC: (newNpc: any) => {
          const prev = (state.社交 as any[]) || [];
          const exists = prev.some((npc: any) => npc.id === newNpc.id || npc.姓名 === newNpc.姓名);
          if (!exists) {
            (setters as any).set社交?.([...prev, newNpc]);
          }
        },
        onBDSM帖子更新: (帖子ID: string, updater: any) => {
          const campusSystem = (state as any).校园系统 || { BDSM帖子列表: [] };
          const updatedPosts = (campusSystem.BDSM帖子列表 || []).map((post: any) =>
            post.id === 帖子ID ? updater(post) : post
          );
          (setters as any).set校园系统?.({ ...campusSystem, BDSM帖子列表: updatedPosts });
        },
        onBDSM任务操作: (npcId: string, 操作: string, 任务ID: string, 执行描述: string) => {
          if (操作 === '接受') {
            (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '进行中');
          } else if (操作 === '报告完成') {
            (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '已完成');
            (actions as any).addBDSMMilestone?.(npcId, '任务完成', `完成调教任务：${执行描述 || 任务ID}`);
          } else if (操作 === '放弃') {
            (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '已放弃');
          }
        },
        onBDSM保存安全设置: (npcId: string, 安全词: string, 底线: string[]) => {
          const campusSystem = (state as any).校园系统 || {};
          const 欲望系统 = campusSystem.欲望系统 || {};
          const NPC欲望档案 = 欲望系统.NPC欲望档案 || {};
          const 档案 = NPC欲望档案[npcId];
          if (档案?.BDSM关系) {
            NPC欲望档案[npcId] = {
              ...档案,
              BDSM关系: {
                ...档案.BDSM关系,
                安全词,
                底线列表: 底线,
              },
            };
            (setters as any).set校园系统?.({
              ...campusSystem,
              欲望系统: { ...欲望系统, NPC欲望档案 },
            });
          }
        },
        onCreateChatSession: (npcId: string, npcName: string, 关系标签: string, 初始消息: string) => {
          const prev = (state as any).校园系统;
          const 私聊列表 = prev?.私聊会话列表 || [];
          const exists = 私聊列表.some((s: any) => s.id === npcId);
          if (!exists) {
            const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            const 新会话 = {
              id: npcId,
              对方姓名: npcName,
              最后消息: 初始消息,
              最后时间: now,
              未读数: 1,
              消息列表: [{
                id: `init-${Date.now()}`,
                发送者: npcName,
                内容: 初始消息,
                时间: now,
                是否已读: false,
              }],
              关系类型: 关系标签,
            };
            const 欲望系统 = prev?.欲望系统 || {};
            const NPC欲望档案 = 欲望系统.NPC欲望档案 || {};
            if (!NPC欲望档案[npcId]) {
              NPC欲望档案[npcId] = {
                姓名: npcName,
                _npcName: npcName,
                BDSM关系: {
                  阶段: '初识',
                  服从度: 50,
                  权力天平: 0,
                  契约记录: [],
                  任务历史: [],
                  日常指令: [],
                  里程碑: [],
                  安全词: '月光',
                  底线列表: [],
                },
              };
              欲望系统.NPC欲望档案 = NPC欲望档案;
            }
            (setters as any).set校园系统?.({ ...prev, 私聊会话列表: [...私聊列表, 新会话], 欲望系统 });
          }
        },
        onConfirmNegotiation: (npcId: string, npcName: string, 协商结果: { 见面回合偏移: number; 见面地点: string; 安全词: string; 玩家底线: string[] }) => {
          const prev = (state as any).校园系统;
          const 预约列表 = prev?.见面预约列表 || [];
          const 当前回合 = ((state.历史记录 as any[])?.length ?? 0);
          const 新预约 = {
            npcId,
            npcName,
            见面回合偏移: 协商结果.见面回合偏移,
            见面地点: 协商结果.见面地点,
            安全词: 协商结果.安全词,
            玩家底线: 协商结果.玩家底线,
            状态: '已协商' as const,
            创建回合: 当前回合,
          };
          (setters as any).set校园系统?.({ ...prev, 见面预约列表: [...预约列表, 新预约] });

          const 现有约定 = (state.约定列表 as any[]) || [];
          const 新约定 = {
            对象: npcName,
            性质: '承诺' as const,
            标题: `${协商结果.见面地点}之约`,
            誓言内容: `与${npcName}相约于${协商结果.见面地点}，回合后相见。安全词：${协商结果.安全词}`,
            约定地点: 协商结果.见面地点,
            约定时间: `${当前回合 + 协商结果.见面回合偏移}回合后`,
            有效时段: 协商结果.见面回合偏移,
            当前状态: '等待中' as const,
            履行后果: `与${npcName}的见面达成，将开启一段特殊的亲密关系`,
            违约后果: `辜负了${npcName}的信任，关系将受到严重影响`,
            背景故事: `校园BDSM见面预约 | 安全词: ${协商结果.安全词}${协商结果.玩家底线.length > 0 ? ' | 玩家底线: ' + 协商结果.玩家底线.join('、') : ''}`,
          };
          (setters as any).set约定列表?.([...现有约定, 新约定]);
        },
        apiConfig: state.apiConfig as any,
        installedApps: (state as any).设备已安装App,
        nsfwEnabled: (state as any).gameConfig?.启用NSFW模式,
        maxNsfwLevel: (state as any).gameConfig?.最大NSFWLevel ?? 0,
        onInstallApp: (appId: string) => (actions as any).安装App?.(appId),
        onUninstallApp: (appId: string) => (actions as any).卸载App?.(appId),
      };
    },
  },
});

// ============================================================================
// New Game (由 App.tsx 直接渲染)
// ============================================================================

UIFeatureRegistry.register({
  id: 'newGameWizard',
  name: '新游戏向导',
  icon: '🎮',
  category: 'core',
  priority: 100,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/NewGame/NewGameWizard'),
    mobileComponentFactory: () => import('../../components/features/NewGame/mobile/MobileNewGameWizard'),
    visibility: 'hidden',
    propsFactory: () => ({}),
  },
});

// ============================================================================
// RPG 模式集成
// ============================================================================

// RPG Battle
UIFeatureRegistry.register({
  id: 'rpgBattle',
  name: 'RPG 战斗',
  icon: '⚔️',
  category: 'core',
  priority: 95,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Battle/RpgBattleIntegration').then(m => ({ default: m.RpgBattleIntegration })),
    visibility: 'always',
    gameViewOnly: true,
    propsFactory: ({ state, modalManager }) => ({
      character: state.角色,
      battle: state.战斗,
      onClose: () => modalManager.close('rpgBattle'),
    }),
  },
});

// RPG Equipment
UIFeatureRegistry.register({
  id: 'rpgEquipment',
  name: 'RPG 装备',
  icon: '🛡️',
  category: 'core',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Equipment/RpgEquipmentIntegration').then(m => ({ default: m.RpgEquipmentIntegration })),
    visibility: 'always',
    propsFactory: ({ state, modalManager }) => ({
      character: state.角色,
      onClose: () => modalManager.close('rpgEquipment'),
    }),
  },
});

// RPG Kungfu
UIFeatureRegistry.register({
  id: 'rpgKungfu',
  name: 'RPG 功法',
  icon: '📜',
  category: 'core',
  priority: 85,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Kungfu/RpgKungfuIntegration').then(m => ({ default: m.RpgKungfuIntegration })),
    visibility: 'always',
    gameViewOnly: true,
    propsFactory: ({ state, modalManager }) => ({
      character: state.角色,
      onClose: () => modalManager.close('rpgKungfu'),
    }),
  },
});

// RPG Task
UIFeatureRegistry.register({
  id: 'rpgTask',
  name: 'RPG 任务',
  icon: '📋',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponentFactory: () => import('../../components/features/Task/RpgTaskIntegration').then(m => ({ default: m.RpgTaskIntegration })),
    visibility: 'always',
    propsFactory: ({ state, actions, modalManager }) => ({
      tasks: state.任务列表,
      onClose: () => modalManager.close('rpgTask'),
    }),
  },
});
