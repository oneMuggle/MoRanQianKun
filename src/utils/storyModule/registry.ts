// 故事模块注册表 — 集中管理所有已注册模块

import type { StoryModule } from './types';
import { getEraPath } from '../../models/eraTheme/assembly';

export class 故事模块注册表 {
  private static _模块映射 = new Map<string, StoryModule<any, any>>();

  /** 注册模块（应用启动时调用一次） */
  static 注册模块(module: StoryModule<any, any>): void {
    if (this._模块映射.has(module.id)) {
      console.warn(`[故事模块] 模块 ${module.id} 已被注册，将覆盖`);
    }
    this._模块映射.set(module.id, module);
  }

  /** 获取单个模块 */
  static 获取模块(id: string): StoryModule<any, any> | undefined {
    return this._模块映射.get(id);
  }

  /** 检查模块是否匹配指定纪元（支持精确匹配 + 层级匹配 + parentEraIds 精确列表） */
  private static 模块匹配纪元(m: StoryModule<any, any>, eraId: string): boolean {
    // 1. 精确匹配
    if (m.eraId === eraId) return true;

    // 2. parentEraIds 显式列表匹配
    if (m.parentEraIds && m.parentEraIds.includes(eraId)) return true;

    // 3. 层级匹配：当前纪元的路径中包含模块的 eraId
    const path = getEraPath(eraId);
    return path.some(n => n.id === m.eraId);
  }

  /** 获取指定时代的所有模块（按优先级降序排序，精确匹配优先于层级匹配） */
  static 获取时代模块(eraId: string): StoryModule<any, any>[] {
    return Array.from(this._模块映射.values())
      .filter(m => this.模块匹配纪元(m, eraId))
      .sort((a, b) => {
        const aExact = a.eraId === eraId || (a.parentEraIds?.includes(eraId) ?? false);
        const bExact = b.eraId === eraId || (b.parentEraIds?.includes(eraId) ?? false);
        if (aExact !== bExact) return bExact ? 1 : -1;
        return b.priority - a.priority;
      });
  }

  /** 获取当前活跃模块（基于 gameConfig 的主开关） */
  static 获取活跃模块(
    eraId: string,
    gameConfig: Record<string, unknown>
  ): StoryModule<any, any>[] {
    return this.获取时代模块(eraId).filter(module => {
      const masterValue = gameConfig[module.masterToggleKey];
      if (masterValue === undefined) {
        return true;
      }
      return masterValue === true;
    });
  }

  /** 检查模块依赖是否满足 */
  static 依赖是否满足(moduleId: string, activeModuleIds: Set<string>): boolean {
    const module = this.获取模块(moduleId);
    if (!module) return false;
    return module.dependencies.every(dep => activeModuleIds.has(dep));
  }

  /** 获取所有已注册模块的 ID 列表 */
  static 获取所有模块ID(): string[] {
    return Array.from(this._模块映射.keys());
  }

  /** 获取模块注册摘要（用于管理界面/调试） */
  static 获取模块摘要(): Array<{
    id: string;
    name: string;
    eraId: string;
    version: string;
    category: string;
    priority: number;
    dependencies: string[];
  }> {
    return Array.from(this._模块映射.values()).map(m => ({
      id: m.id,
      name: m.name,
      eraId: m.eraId,
      version: m.version,
      category: m.category,
      priority: m.priority,
      dependencies: m.dependencies,
    }));
  }
}
