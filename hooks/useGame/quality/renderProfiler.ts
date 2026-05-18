/**
 * React 渲染分析器
 * 使用 React Profiler API 追踪组件渲染耗时和次数
 */

export interface ComponentRenderStats {
  id: string;
  renderCount: number;
  totalTime: number;
  averageTime: number;
  maxTime: number;
}

export class RenderProfiler {
  private stats: Map<string, ComponentRenderStats> = new Map();

  onRender = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    const existing = this.stats.get(id) || {
      id,
      renderCount: 0,
      totalTime: 0,
      averageTime: 0,
      maxTime: 0,
    };
    existing.renderCount++;
    existing.totalTime += actualDuration;
    existing.maxTime = Math.max(existing.maxTime, actualDuration);
    existing.averageTime = existing.totalTime / existing.renderCount;
    this.stats.set(id, existing);
  };

  getHotComponents(threshold = 10): ComponentRenderStats[] {
    return Array.from(this.stats.values())
      .filter(s => s.renderCount > threshold)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10);
  }

  reset() {
    this.stats.clear();
  }

  getReport(): ComponentRenderStats[] {
    return Array.from(this.stats.values());
  }
}

export const createRenderProfiler = () => new RenderProfiler();
