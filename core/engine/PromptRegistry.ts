/**
 * Prompt 动态注册中心
 *
 * 将提示词系统从静态数组改为动态注册机制：
 * - 核心提示词始终加载
 * - 模块通过 register() 动态注册提示词块
 * - 通过 unregister() 卸载模块提示词
 * - build() 时按优先级组装完整提示词
 */

/** 提示词注册项 */
interface PromptEntry {
  /** 来源模块 ID */
  moduleId: string;
  /** 提示词内容（已求值或懒求值函数） */
  block: string | (() => string | Promise<string>);
  /** 优先级（数字越大越靠前） */
  priority: number;
  /** 是否已卸载 */
  disposed: boolean;
}

export class PromptRegistry {
  private static _corePrompts: string[] = [];
  private static _entries: PromptEntry[] = [];
  private static _buildCache: string | null = null;
  private static _dirty = true;

  // ==================== 核心提示词 ====================

  /** 注册核心提示词（启动时调用一次） */
  static registerCore(prompt: string): void {
    this._corePrompts.push(prompt);
    this._dirty = true;
  }

  /** 批量注册核心提示词 */
  static registerCoreMany(prompts: string[]): void {
    this._corePrompts.push(...prompts);
    this._dirty = true;
  }

  /** 获取核心提示词列表 */
  static getCorePrompts(): readonly string[] {
    return [...this._corePrompts];
  }

  // ==================== 动态注册 ====================

  /** 注册模块提示词块 */
  static register(moduleId: string, block: string | (() => string | Promise<string>), priority = 0): void {
    const existing = this._entries.find(
      e => e.moduleId === moduleId && e.priority === priority && !e.disposed
    );
    if (existing) {
      console.warn(`[PromptRegistry] 模块 ${moduleId} 的提示词已注册，跳过`);
      return;
    }

    this._entries.push({ moduleId, block, priority, disposed: false });
    this._dirty = true;
  }

  /** 卸载模块提示词 */
  static unregister(moduleId: string): void {
    let changed = false;
    for (const entry of this._entries) {
      if (entry.moduleId === moduleId && !entry.disposed) {
        entry.disposed = true;
        changed = true;
      }
    }
    if (changed) {
      this._dirty = true;
      this._entries = this._entries.filter(e => !e.disposed);
    }
  }

  /** 获取已注册的模块 ID 列表 */
  static getRegisteredModuleIds(): string[] {
    return [...new Set(this._entries.map(e => e.moduleId))];
  }

  // ==================== 构建 ====================

  /** 组装完整提示词字符串 */
  static async build(): Promise<string> {
    if (!this._dirty && this._buildCache !== null) {
      return this._buildCache;
    }

    const parts = [...this._corePrompts];

    const sortedEntries = [...this._entries]
      .filter(e => !e.disposed)
      .sort((a, b) => b.priority - a.priority);

    for (const entry of sortedEntries) {
      const block = typeof entry.block === 'function'
        ? await entry.block()
        : entry.block;
      if (block) {
        parts.push(block);
      }
    }

    this._buildCache = parts.join('\n\n');
    this._dirty = false;

    return this._buildCache;
  }

  /** 同步构建版本 */
  static buildSync(): string {
    if (!this._dirty && this._buildCache !== null) {
      return this._buildCache;
    }

    const parts = [...this._corePrompts];

    const sortedEntries = [...this._entries]
      .filter(e => !e.disposed && typeof e.block === 'string')
      .sort((a, b) => b.priority - a.priority);

    for (const entry of sortedEntries) {
      const block = entry.block as string;
      if (block) {
        parts.push(block);
      }
    }

    const hasAsyncBlocks = this._entries.some(
      e => !e.disposed && typeof e.block === 'function'
    );
    this._dirty = hasAsyncBlocks;

    this._buildCache = parts.join('\n\n');
    return this._buildCache;
  }

  /** 标记缓存失效 */
  static invalidate(): void {
    this._dirty = true;
    this._buildCache = null;
  }

  /** 重置所有注册（测试用） */
  static reset(): void {
    this._corePrompts = [];
    this._entries = [];
    this._buildCache = null;
    this._dirty = true;
  }

  /** 获取注册摘要（调试用） */
  static getSummary(): Array<{
    moduleId: string;
    priority: number;
    blockLength: number | string;
    isAsync: boolean;
  }> {
    return this._entries
      .filter(e => !e.disposed)
      .map(e => ({
        moduleId: e.moduleId,
        priority: e.priority,
        blockLength: typeof e.block === 'string' ? e.block.length : '(lazy)',
        isAsync: typeof e.block === 'function',
      }));
  }
}
