/**
 * LandingPage 组件测试
 *
 * 2026-06-08 Phase 5 Day 57：T4 关键组件测试
 * - 简单渲染测试
 * - 不依赖 store/router，纯 props 驱动
 * - 目标：覆盖 LandingPage.tsx 主要渲染分支
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../LandingPage';

// GitHubSyncButton 在 jsdom 下 fetch 不可用，简单 stub 避免依赖链
vi.mock('../../features/Auth/GitHubSyncButton', () => ({
    GitHubSyncButton: () => <button data-testid="github-sync">GitHubSync</button>,
}));

describe('LandingPage', () => {
    const noop = () => undefined;
    const defaultProps = {
        onStart: noop,
        onLoad: noop,
        onImageManager: noop,
        onWorldbookManager: noop,
        onNovelDecomposition: noop,
        onNovelWriting: noop,
        onSettings: noop,
        hasSave: false,
    };

    it('渲染主标题与副标题', () => {
        render(<LandingPage {...defaultProps} />);
        // useUIText 兜底文案：主标题"墨染乾坤"，副标题"万象纪元"
        expect(screen.getByText('墨染乾坤')).toBeInTheDocument();
        expect(screen.getByText('万象纪元')).toBeInTheDocument();
    });

    it('渲染所有 7 个菜单按钮', () => {
        render(<LandingPage {...defaultProps} />);
        expect(screen.getByText('踏入江湖')).toBeInTheDocument();
        expect(screen.getByText('重入江湖')).toBeInTheDocument();
        expect(screen.getByText('图片管理')).toBeInTheDocument();
        expect(screen.getByText('世界书管理')).toBeInTheDocument();
        expect(screen.getByText('小说分解')).toBeInTheDocument();
        expect(screen.getByText('小说写作')).toBeInTheDocument();
        expect(screen.getByText('设置')).toBeInTheDocument();
    });

    it('hasSave=false 时"重入江湖"按钮被禁用', () => {
        render(<LandingPage {...defaultProps} hasSave={false} />);
        const loadButton = screen.getByText('重入江湖').closest('button');
        expect(loadButton).toBeDisabled();
    });

    it('hasSave=true 时"重入江湖"按钮可点击', () => {
        render(<LandingPage {...defaultProps} hasSave={true} />);
        const loadButton = screen.getByText('重入江湖').closest('button');
        expect(loadButton).not.toBeDisabled();
    });

    it('点击"踏入江湖"触发 onStart', () => {
        const onStart = vi.fn();
        render(<LandingPage {...defaultProps} onStart={onStart} />);
        fireEvent.click(screen.getByText('踏入江湖'));
        expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('点击"重入江湖"触发 onLoad', () => {
        const onLoad = vi.fn();
        render(<LandingPage {...defaultProps} onLoad={onLoad} hasSave={true} />);
        fireEvent.click(screen.getByText('重入江湖'));
        expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('点击"设置"触发 onSettings', () => {
        const onSettings = vi.fn();
        render(<LandingPage {...defaultProps} onSettings={onSettings} />);
        fireEvent.click(screen.getByText('设置'));
        expect(onSettings).toHaveBeenCalledTimes(1);
    });

    it('点击"图片管理"触发 onImageManager', () => {
        const onImageManager = vi.fn();
        render(<LandingPage {...defaultProps} onImageManager={onImageManager} />);
        fireEvent.click(screen.getByText('图片管理'));
        expect(onImageManager).toHaveBeenCalledTimes(1);
    });

    it('点击"世界书管理"触发 onWorldbookManager', () => {
        const onWorldbookManager = vi.fn();
        render(<LandingPage {...defaultProps} onWorldbookManager={onWorldbookManager} />);
        fireEvent.click(screen.getByText('世界书管理'));
        expect(onWorldbookManager).toHaveBeenCalledTimes(1);
    });

    it('点击"小说分解"触发 onNovelDecomposition', () => {
        const onNovelDecomposition = vi.fn();
        render(<LandingPage {...defaultProps} onNovelDecomposition={onNovelDecomposition} />);
        fireEvent.click(screen.getByText('小说分解'));
        expect(onNovelDecomposition).toHaveBeenCalledTimes(1);
    });

    it('点击"小说写作"触发 onNovelWriting', () => {
        const onNovelWriting = vi.fn();
        render(<LandingPage {...defaultProps} onNovelWriting={onNovelWriting} />);
        fireEvent.click(screen.getByText('小说写作'));
        expect(onNovelWriting).toHaveBeenCalledTimes(1);
    });

    it('渲染 GitHub 云同步按钮', () => {
        render(<LandingPage {...defaultProps} />);
        expect(screen.getByTestId('github-sync')).toBeInTheDocument();
    });

    it('点击全屏按钮不抛错', () => {
        render(<LandingPage {...defaultProps} />);
        // jsdom 不支持 fullscreen API；函数会降级到 noop
        expect(() =>
            fireEvent.click(screen.getByTitle('全屏'))
        ).not.toThrow();
    });

    it('点击主标题不抛错（触发 requestBrowserFullscreen）', () => {
        render(<LandingPage {...defaultProps} />);
        // 标题 h1 不可被文字精确定位（多语言），改用 getByText
        const heading = screen.getByText('墨染乾坤');
        expect(() => fireEvent.click(heading)).not.toThrow();
    });

    it('document.fullscreenElement 存在时点击全屏按钮走退出分支（不抛错）', () => {
        render(<LandingPage {...defaultProps} />);
        // 模拟已在全屏状态 — 触发退出分支
        const originalDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenElement');
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            get: () => document.body,
        });
        // document.exitFullscreen 在 jsdom 未定义；用 defineProperty 注入桩
        const originalExit = (document as any).exitFullscreen;
        (document as any).exitFullscreen = vi.fn();
        try {
            expect(() => fireEvent.click(screen.getByTitle('全屏'))).not.toThrow();
        } finally {
            delete (document as any).exitFullscreen;
            if (originalExit) (document as any).exitFullscreen = originalExit;
            if (originalDescriptor) {
                Object.defineProperty(document, 'fullscreenElement', originalDescriptor);
            } else {
                delete (document as any).fullscreenElement;
            }
        }
    });
});
