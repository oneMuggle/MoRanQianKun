/**
 * 模块加载器 — 管理模块的生命周期
 *
 * 功能：
 * - 模块注册与注销
 * - 依赖解析与拓扑排序
 * - 按需加载（动态 import）
 * - 生命周期管理（initialize / dispose）
 * - 模块间事件总线
 */

import type {
  ModuleManifest,
  ModuleContext,
  ModuleLoaderOptions,
  ModuleLoadResult,
  ModuleLifecycleState,
  ModuleRegistrySummary,
  UIFeatureModule,
} from '../types/module';
import { UIFeatureRegistry } from '../module-registry/registry';
import { PromptRegistry } from './PromptRegistry';

/** 模块加载器实例 */
export class ModuleLoader {
  private _modules = new Map<string, ModuleManifest>();
  private _lifecycleStates = new Map<string, ModuleLifecycleState>();
  private _context: ModuleContext | null = null;
  private _eventListeners = new Map<string, Set<(payload: unknown) => void>>();
  private _options: ModuleLoaderOptions;
  private _initialized = new Set<string>();

  constructor(options: ModuleLoaderOptions = {}) {
    this._options = {
      skipMissingDeps: false,
      loadTimeout: 30_000,
      debug: false,
      ...options,
    };
  }

  // ==================== 上下文注入 ====================

  /** 注入运行时上下文（由 App 初始化时调用） */
  setContext(context: ModuleContext): void {
    this._context = context;
  }

  /** 获取当前上下文 */
  getContext(): ModuleContext | null {
    return this._context;
  }

  // ==================== 模块注册 ====================

  /** 注册单个模块（静态注册） */
  register(manifest: ModuleManifest): void {
    if (this._modules.has(manifest.id)) {
      this._log(`模块 ${manifest.id} 已注册，跳过`);
      return;
    }
    this._modules.set(manifest.id, manifest);
    this._lifecycleStates.set(manifest.id, 'pending');
    this._log(`注册模块: ${manifest.id} (${manifest.name} v${manifest.version})`);
  }

  /** 批量注册模块 */
  registerMany(manifests: ModuleManifest[]): void {
    for (const m of manifests) {
      this.register(m);
    }
  }

  /** 注销模块 */
  async unregister(moduleId: string): Promise<void> {
    const manifest = this._modules.get(moduleId);
    if (!manifest) return;

    const dependents = this._getDependents(moduleId);
    for (const depId of dependents) {
      if (this._initialized.has(depId)) {
        await this._disposeModule(depId);
      }
    }

    if (this._initialized.has(moduleId)) {
      await this._disposeModule(moduleId);
    }

    this._modules.delete(moduleId);
    this._lifecycleStates.delete(moduleId);
    this._log(`注销模块: ${moduleId}`);
  }

  // ==================== 模块加载 ====================

  /** 激活模块（加载 + 初始化） */
  async activate(moduleId: string): Promise<ModuleLoadResult> {
    const manifest = this._modules.get(moduleId);
    if (!manifest) {
      return { moduleId, success: false, error: `模块 ${moduleId} 未注册` };
    }

    const state = this._lifecycleStates.get(moduleId);
    if (state === 'active') {
      return { moduleId, success: true };
    }

    if (state === 'loading') {
      return { moduleId, success: false, error: `模块 ${moduleId} 正在加载中` };
    }

    const startTime = Date.now();

    const depsOk = this._checkDependencies(moduleId);
    if (!depsOk) {
      const errorMsg = this._getDependencyErrorMessage(moduleId);
      if (this._options.skipMissingDeps) {
        this._log(`跳过模块 ${moduleId}: ${errorMsg}`);
        return { moduleId, success: false, error: errorMsg };
      }
      return { moduleId, success: false, error: errorMsg };
    }

    if (manifest.dependencies) {
      for (const depId of manifest.dependencies) {
        if (!this._initialized.has(depId)) {
          const depResult = await this.activate(depId);
          if (!depResult.success && !this._options.skipMissingDeps) {
            return {
              moduleId,
              success: false,
              error: `依赖模块 ${depId} 激活失败: ${depResult.error}`,
            };
          }
        }
      }
    }

    this._lifecycleStates.set(moduleId, 'loading');

    try {
      this._registerUiFeatures(manifest);
      await this._registerPromptBlock(manifest);
      this._applyStateExtensions(manifest);

      if (manifest.initialize && this._context) {
        await this._withTimeout(
          manifest.initialize(this._context),
          this._options.loadTimeout,
          `模块 ${moduleId} 初始化超时`
        );
      }

      this._initialized.add(moduleId);
      this._lifecycleStates.set(moduleId, 'active');

      const duration = Date.now() - startTime;
      this._log(`模块 ${moduleId} 激活成功 (${duration}ms)`);

      return { moduleId, success: true, duration };
    } catch (error) {
      this._lifecycleStates.set(moduleId, 'error');
      const message = error instanceof Error ? error.message : String(error);
      this._log(`模块 ${moduleId} 激活失败: ${message}`);
      return { moduleId, success: false, error: message, duration: Date.now() - startTime };
    }
  }

  /** 批量激活模块 */
  async activateMany(moduleIds: string[]): Promise<ModuleLoadResult[]> {
    const sorted = this._topologicalSort(moduleIds);
    const results: ModuleLoadResult[] = [];
    for (const id of sorted) {
      results.push(await this.activate(id));
    }
    return results;
  }

  /** 激活所有已注册的模块 */
  async activateAll(): Promise<ModuleLoadResult[]> {
    return this.activateMany(Array.from(this._modules.keys()));
  }

  // ==================== 事件总线 ====================

  /** 发布事件 */
  emitEvent(event: string, payload?: unknown): void {
    const listeners = this._eventListeners.get(event);
    if (!listeners) return;
    for (const fn of listeners) {
      try {
        fn(payload);
      } catch (error) {
        console.error(`[ModuleLoader] 事件 ${event} 监听器错误:`, error);
      }
    }
  }

  /** 订阅事件 */
  onEvent(event: string, callback: (payload: unknown) => void): () => void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }
    this._eventListeners.get(event)!.add(callback);
    return () => {
      this._eventListeners.get(event)?.delete(callback);
    };
  }

  // ==================== 查询 ====================

  /** 获取模块 */
  get(moduleId: string): ModuleManifest | undefined {
    return this._modules.get(moduleId);
  }

  /** 检查模块是否已激活 */
  isActive(moduleId: string): boolean {
    return this._initialized.has(moduleId);
  }

  /** 获取模块生命周期状态 */
  getLifecycleState(moduleId: string): ModuleLifecycleState {
    return this._lifecycleStates.get(moduleId) ?? 'pending';
  }

  /** 获取所有已激活模块 ID */
  getActiveIds(): Set<string> {
    return new Set(this._initialized);
  }

  /** 获取注册表摘要 */
  getSummary(): ModuleRegistrySummary[] {
    return Array.from(this._modules.values()).map(m => ({
      id: m.id,
      name: m.name,
      category: m.category ?? 'unknown',
      hasModal: !!(m.uiFeatures && (Array.isArray(m.uiFeatures) ? m.uiFeatures : m.uiFeatures()).some((f: UIFeatureModule) => f.modal)),
      hasPromptBlock: !!m.promptBlock,
      hasInitialize: !!m.initialize,
      dependencies: m.dependencies ?? [],
      lifecycleState: this._lifecycleStates.get(m.id) ?? 'pending',
      version: m.version,
    }));
  }

  /** 检查配置条件 */
  checkConfigCondition(manifest: ModuleManifest, gameConfig: Record<string, unknown>): boolean {
    if (!manifest.configKey) return true;
    const actualValue = gameConfig[manifest.configKey];
    if (manifest.configValue === undefined) return !!actualValue;
    return actualValue === manifest.configValue;
  }

  // ==================== 内部方法 ====================

  private async _disposeModule(moduleId: string): Promise<void> {
    const manifest = this._modules.get(moduleId);
    if (manifest?.dispose) {
      try {
        await manifest.dispose();
      } catch (error) {
        console.error(`[ModuleLoader] 模块 ${moduleId} dispose 失败:`, error);
      }
    }
    this._initialized.delete(moduleId);
    this._lifecycleStates.set(moduleId, 'disposed');
  }

  private _checkDependencies(moduleId: string): boolean {
    const manifest = this._modules.get(moduleId);
    if (!manifest?.dependencies || manifest.dependencies.length === 0) return true;
    return manifest.dependencies.every(depId => this._modules.has(depId));
  }

  private _getDependencyErrorMessage(moduleId: string): string {
    const manifest = this._modules.get(moduleId);
    if (!manifest?.dependencies) return '';
    const missing = manifest.dependencies.filter(depId => !this._modules.has(depId));
    if (missing.length === 0) return '';
    return `缺少依赖: ${missing.join(', ')}`;
  }

  private _getDependents(moduleId: string): string[] {
    const dependents: string[] = [];
    for (const [id, manifest] of this._modules) {
      if (manifest.dependencies?.includes(moduleId)) {
        dependents.push(id);
      }
    }
    return dependents;
  }

  private _registerUiFeatures(manifest: ModuleManifest): void {
    const features = typeof manifest.uiFeatures === 'function'
      ? manifest.uiFeatures()
      : manifest.uiFeatures;
    if (!features || features.length === 0) return;

    for (const feature of features) {
      UIFeatureRegistry.register(feature);
      this._log(`  注册 UI 功能: ${feature.id}`);
    }
  }

  private async _registerPromptBlock(manifest: ModuleManifest): Promise<void> {
    if (!manifest.promptBlock) return;
    try {
      const block = await manifest.promptBlock();
      PromptRegistry.register(manifest.id, block);
      this._log(`  注册提示词块: ${manifest.id}`);
    } catch (error) {
      this._log(`  提示词块注册失败: ${manifest.id}`, error);
    }
  }

  private _applyStateExtensions(manifest: ModuleManifest): void {
    if (!manifest.stateExtensions) return;
    this._log(`  状态扩展已注册: ${manifest.id}`);
  }

  private _topologicalSort(moduleIds: string[]): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const manifest = this._modules.get(id);
      if (manifest?.dependencies) {
        for (const depId of manifest.dependencies) {
          if (this._modules.has(depId)) {
            visit(depId);
          }
        }
      }

      result.push(id);
    };

    for (const id of moduleIds) {
      visit(id);
    }

    return result;
  }

  private async _withTimeout<T>(promise: Promise<T> | void, timeoutMs: number, errorMsg: string): Promise<void> {
    if (!promise) return;
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(errorMsg)), timeoutMs);
    });
    await Promise.race([promise, timeout]);
    clearTimeout(timer!);
  }

  private _log(message: string, ...args: unknown[]): void {
    if (this._options.debug) {
      console.log(`[ModuleLoader] ${message}`, ...args);
    }
  }
}

// ==================== 单例导出 ====================

let _instance: ModuleLoader | null = null;

/** 获取 ModuleLoader 单例 */
export function getModuleLoader(): ModuleLoader {
  if (!_instance) {
    _instance = new ModuleLoader();
  }
  return _instance;
}

/** 重置单例（测试用） */
export function resetModuleLoader(): void {
  _instance = null;
}
