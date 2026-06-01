/**
 * 模块系统核心类型定义
 *
 * 定义 ModuleManifest、ModuleContext、ModuleLoaderOptions 等类型，
 * 作为骨架与插件模块之间的契约。
 */

import * as React from 'react';

// ==================== 基础模块接口 ====================

/** 模块分类 */
export type ModuleCategory = 'core' | 'nsfw' | 'settings' | 'tools' | 'narrative' | 'entertainment' | 'era' | 'business';

/** 模块可见性控制 */
export type ModuleVisibility = 'always' | 'era-dependent' | 'config-dependent' | 'hidden';

/** 模块生命周期状态 */
export type ModuleLifecycleState = 'pending' | 'loading' | 'active' | 'disposed' | 'error';

/**
 * 模块上下文 — 模块 initialize() 接收的运行环境
 */
export interface ModuleContext {
  /** 获取游戏状态 */
  getState: () => Record<string, unknown>;
  /** 获取游戏元数据 */
  getMeta: () => Record<string, unknown>;
  /** 设置状态值 */
  set: (key: string, value: unknown) => void;
  /** 调用游戏动作 */
  action: (name: string, ...args: unknown[]) => unknown;
  /** 弹窗管理器 */
  modalManager: ModalManagerAPI;
  /** 订阅状态变化 */
  subscribe: (callback: (state: Record<string, unknown>) => void) => () => void;
  /** 发布模块事件 */
  emitEvent: (event: string, payload?: unknown) => void;
  /** 订阅模块事件 */
  onEvent: (event: string, callback: (payload: unknown) => void) => () => void;
  /** 是否为移动端 */
  isMobile: () => boolean;
}

/**
 * 模块清单 — 每个可插拔模块的完整定义
 */
export interface ModuleManifest {
  /** 唯一标识，如 'era-ancient'、'nsfw-campus'、'biz-property' */
  id: string;
  /** 显示名称 */
  name: string;
  /** 语义化版本号 */
  version: string;
  /** 依赖的其他模块 ID 列表 */
  dependencies?: string[];
  /** 模块分类 */
  category?: ModuleCategory;
  /** 描述 */
  description?: string;

  // === UI 功能注册 ===
  /** 注册 UI 功能模块（弹窗、面板等） */
  uiFeatures?: UIFeatureModule[] | (() => UIFeatureModule[]);

  // === 提示词注册 ===
  /** 注册提示词块（支持懒求值） */
  promptBlock?: () => string | Promise<string>;

  // === 状态扩展 ===
  /** 扩展游戏状态结构 */
  stateExtensions?: (state: GameState) => void;

  // === 生命周期 ===
  /** 模块激活时调用 */
  initialize?: (context: ModuleContext) => void | Promise<void>;
  /** 模块卸载时调用 */
  dispose?: () => void | Promise<void>;

  // === 元数据 ===
  /** 所属时代 ID（时代模块） */
  eraId?: string;
  /** 依赖的 gameConfig 键 */
  configKey?: string;
  /** 依赖的 gameConfig 值 */
  configValue?: unknown;
}

/**
 * 模块加载器选项
 */
export interface ModuleLoaderOptions {
  /** 是否在依赖未满足时自动跳过（默认 false = 抛出错误） */
  skipMissingDeps?: boolean;
  /** 模块加载超时（毫秒，默认 30000） */
  loadTimeout?: number;
  /** 是否打印调试日志 */
  debug?: boolean;
}

// ==================== UI 模块接口（从 moduleRegistry/types.ts 迁移） ====================

/** ModalManager 接口 */
export interface ModalManagerAPI {
  open: (moduleId: string, payload?: unknown) => void;
  close: (moduleId: string) => void;
  replace: (closeId: string, openId: string, payload?: unknown) => void;
  closeAll: () => void;
  toggle: (moduleId: string) => void;
  isOpen: (moduleId: string) => boolean;
  /** 当前打开的弹窗 Map */
  openModals: Map<string, unknown>;
}

/** 弹窗 Props 构造上下文 */
export interface ModalPropsContext {
  state: Record<string, unknown>;
  meta: Record<string, unknown>;
  setters: Record<string, (value: unknown) => void>;
  actions: Record<string, (...args: unknown[]) => unknown>;
  modalManager: ModalManagerAPI;
  isMobile: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestConfirm?: (options: any) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraProps?: Record<string, any>;
}

/** 弹窗渲染配置 */
export interface ModalConfig {
  /** 懒加载的弹窗组件（桌面版） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  desktopComponent: React.LazyExoticComponent<React.ComponentType<any>>;
  /** 懒加载的弹窗组件（移动版） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mobileComponent?: React.LazyExoticComponent<React.ComponentType<any>>;
  /** 可见性控制 */
  visibility: ModuleVisibility;
  /** 依赖的 gameConfig 键 */
  configKey?: string;
  /** 依赖的 gameConfig 值 */
  configValue?: unknown;
  /** 是否仅在 game view 中渲染 */
  gameViewOnly?: boolean;
  /** 对应 state 中的布尔键名 */
  stateKey?: string;
  /** Props 工厂函数 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propsFactory: (ctx: ModalPropsContext) => Record<string, any>;
}

/** UI 功能模块完整定义 */
export interface UIFeatureModule {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 图标 */
  icon: string;
  /** 模块分类 */
  category: ModuleCategory;
  /** 所属时代 ID */
  eraId?: string;
  /** 依赖的其他模块 ID */
  dependencies: string[];
  /** 关联的 StoryModule ID */
  storyModuleId?: string;
  /** 渲染优先级 */
  priority: number;
  /** 描述 */
  description?: string;
  /** 弹窗配置 */
  modal?: ModalConfig;
  /** 版本号 */
  version: string;
}

/** 游戏状态类型（简化引用） */
export interface GameState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** 模块加载结果 */
export interface ModuleLoadResult {
  moduleId: string;
  success: boolean;
  error?: string;
  duration?: number;
}

/** 模块注册表摘要 */
export interface ModuleRegistrySummary {
  id: string;
  name: string;
  category: string;
  hasModal: boolean;
  hasPromptBlock: boolean;
  hasInitialize: boolean;
  dependencies: string[];
  lifecycleState: ModuleLifecycleState;
  version: string;
}
