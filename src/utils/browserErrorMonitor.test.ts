/**
 * BrowserErrorMonitor — 浏览器全局错误监控测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-borrow-plan.md B1
 * 目标：捕获 window error + unhandledrejection + 资源加载错误
 * 设计：30 条 FIFO 队列 + 暴露 window.__MRQK_ERROR_LOG__ 供 DevTools 调试
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    bindBrowserErrorMonitor,
    getBrowserErrorLog,
    clearBrowserErrorLog,
} from './browserErrorMonitor';

describe('BrowserErrorMonitor — 基础行为', () => {
    beforeEach(() => {
        clearBrowserErrorLog();
    });
    afterEach(() => {
        clearBrowserErrorLog();
    });

    it('bindBrowserErrorMonitor 是幂等函数（多次调用只挂一次）', () => {
        bindBrowserErrorMonitor();
        bindBrowserErrorMonitor();
        bindBrowserErrorMonitor();
        window.dispatchEvent(new ErrorEvent('error', { message: 'x' }));
        expect(getBrowserErrorLog().length).toBe(1);
    });

    it('暴露 window.__MRQK_ERROR_LOG__', () => {
        bindBrowserErrorMonitor();
        const w = window as unknown as { __MRQK_ERROR_LOG__?: unknown[] };
        expect(w.__MRQK_ERROR_LOG__).toBeDefined();
        expect(Array.isArray(w.__MRQK_ERROR_LOG__)).toBe(true);
    });
});

describe('BrowserErrorMonitor — window error 捕获', () => {
    beforeEach(() => clearBrowserErrorLog());
    afterEach(() => clearBrowserErrorLog());

    it('捕获 JS error 事件', () => {
        bindBrowserErrorMonitor();
        window.dispatchEvent(new ErrorEvent('error', { message: 'Something broke', filename: 'app.js' }));
        const log = getBrowserErrorLog();
        expect(log.length).toBe(1);
        expect(log[0].type).toBe('window_error');
        expect(log[0].message).toContain('Something broke');
    });

    it('捕获带堆栈的 error', () => {
        bindBrowserErrorMonitor();
        const err = new Error('with-stack');
        window.dispatchEvent(new ErrorEvent('error', { error: err, message: 'with-stack' }));
        const log = getBrowserErrorLog();
        expect(log[0].stack).toContain('with-stack');
    });
});

describe('BrowserErrorMonitor — unhandledrejection 捕获', () => {
    beforeEach(() => clearBrowserErrorLog());
    afterEach(() => clearBrowserErrorLog());

    it('捕获未处理的 Promise rejection', () => {
        bindBrowserErrorMonitor();
        const event = new Event('unhandledrejection') as Event & { reason?: unknown };
        event.reason = new Error('promise-fail');
        window.dispatchEvent(event);
        const log = getBrowserErrorLog();
        expect(log.length).toBe(1);
        expect(log[0].type).toBe('unhandledrejection');
        expect(log[0].message).toContain('promise-fail');
    });
});

describe('BrowserErrorMonitor — FIFO 30 队列', () => {
    beforeEach(() => clearBrowserErrorLog());
    afterEach(() => clearBrowserErrorLog());

    it('超出 30 条后保留最新的 30 条', () => {
        bindBrowserErrorMonitor();
        for (let i = 0; i < 35; i++) {
            window.dispatchEvent(new ErrorEvent('error', { message: `err-${i}` }));
        }
        const log = getBrowserErrorLog();
        expect(log.length).toBe(30);
        expect(log[29].message).toContain('err-34');
        expect(log[0].message).toContain('err-5');
    });
});

describe('BrowserErrorMonitor — clear', () => {
    it('clearBrowserErrorLog 清空日志', () => {
        bindBrowserErrorMonitor();
        window.dispatchEvent(new ErrorEvent('error', { message: 'x' }));
        expect(getBrowserErrorLog().length).toBe(1);
        clearBrowserErrorLog();
        expect(getBrowserErrorLog().length).toBe(0);
    });
});
