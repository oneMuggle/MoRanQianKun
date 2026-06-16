/**
 * VideoPlayer — 视频内嵌播放组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U9
 * 目标：通用 HTML5 video 包装，支持 controls + 全屏 + 错误处理
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer — 基础渲染', () => {
    it('渲染 HTML5 video 元素', () => {
        const { container } = render(<VideoPlayer src="test.mp4" />);
        const video = container.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', 'test.mp4');
    });

    it('支持 poster（封面图）', () => {
        const { container } = render(
            <VideoPlayer src="test.mp4" poster="cover.jpg" />
        );
        const video = container.querySelector('video');
        expect(video).toHaveAttribute('poster', 'cover.jpg');
    });

    it('默认显示原生 controls', () => {
        const { container } = render(<VideoPlayer src="test.mp4" />);
        const video = container.querySelector('video');
        expect(video).toHaveAttribute('controls');
    });

    it('controls=false 时不显示原生 controls', () => {
        const { container } = render(
            <VideoPlayer src="test.mp4" controls={false} />
        );
        const video = container.querySelector('video');
        expect(video).not.toHaveAttribute('controls');
    });
});

describe('VideoPlayer — 错误处理', () => {
    it('视频加载失败时显示错误提示', () => {
        const { container } = render(<VideoPlayer src="nonexistent.mp4" />);
        const video = container.querySelector('video')!;
        fireEvent.error(video);
        expect(screen.getByTestId('video-error')).toBeInTheDocument();
    });
});

describe('VideoPlayer — 可定制性', () => {
    it('支持自定义 className', () => {
        const { container } = render(
            <VideoPlayer src="test.mp4" className="my-video" />
        );
        const wrapper = container.querySelector('.my-video');
        expect(wrapper).toBeInTheDocument();
    });

    it('支持设置 maxWidth', () => {
        const { container } = render(
            <VideoPlayer src="test.mp4" maxWidth={800} />
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.style.maxWidth).toBe('800px');
    });
});
