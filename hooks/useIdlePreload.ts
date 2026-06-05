// hooks/useIdlePreload.ts
// 4.3 视图 idle preload 钩子 — 在浏览器空闲时预拉下一视图的 chunk

import { useEffect } from 'react';

type IdleWindow = Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (id: number) => void;
};

/**
 * 在浏览器空闲时预加载组件 chunk
 *
 * 用于「下一视图」零等待跳转：当前 view 渲染稳定后，调度 idle preload
 * 把下一视图的 chunk（含其内部静态依赖）拉到 HTTP 缓存；用户真正点击
 * 跳转时无需再下载，体感即时切换。
 *
 * 设计要点：
 * - 仅在浏览器空闲帧触发，不抢占关键渲染
 * - `requestIdleCallback` 不可用时回落 `setTimeout(delayMs)`，避免在低端机或
 *   非 Chromium 内核（Safari）上拖慢主流程
 * - `enabled = false` 时不调度，可按 `state.view` 条件控制
 * - 卸载或 enabled 变更时取消未触发的回调，避免 view 切换后空跑
 * - preload 函数 reject 静默吞掉：下次用户点击时 React.lazy 仍会重试
 *
 * @param preload 预加载函数（通常是 LazyComponent.preload 引用）
 * @param enabled 是否启用调度
 * @param delayMs setTimeout 兜底延迟（默认 1500 ms）
 */
export function useIdlePreload(
    preload: (() => Promise<unknown>) | undefined,
    enabled: boolean,
    delayMs: number = 1500,
): void {
    useEffect(() => {
        if (!enabled || typeof preload !== 'function') return;
        if (typeof window === 'undefined') return;

        let cancelled = false;
        const idleWindow = window as IdleWindow;
        let idleId: number | null = null;
        let timerId: number | null = null;

        const trigger = (): void => {
            if (cancelled) return;
            void preload().catch(() => undefined);
        };

        if (typeof idleWindow.requestIdleCallback === 'function') {
            idleId = idleWindow.requestIdleCallback(trigger, { timeout: delayMs });
        } else {
            timerId = window.setTimeout(trigger, delayMs);
        }

        return () => {
            cancelled = true;
            if (idleId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
                idleWindow.cancelIdleCallback(idleId);
                idleId = null;
            }
            if (timerId !== null) {
                window.clearTimeout(timerId);
                timerId = null;
            }
        };
    }, [preload, enabled, delayMs]);
}
