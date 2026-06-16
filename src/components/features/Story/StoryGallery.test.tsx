/**
 * StoryGallery — 故事图片画廊网格组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U8
 * 目标：故事生成图片的网格画廊 + 点击放大
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoryGallery, type StoryImage } from './StoryGallery';

const images: StoryImage[] = [
    { id: 'i1', url: 'data:image/png;base64,a1', title: '青云初遇', createdAt: '2026-06-15T10:00:00Z' },
    { id: 'i2', url: 'data:image/png;base64,a2', title: '夜雨论剑', createdAt: '2026-06-15T11:00:00Z' },
    { id: 'i3', url: 'data:image/png;base64,a3', title: '雪岭独行' },
];

describe('StoryGallery — 基础渲染', () => {
    it('渲染所有图片', () => {
        render(<StoryGallery images={images} />);
        const items = screen.getAllByRole('img');
        expect(items).toHaveLength(3);
    });

    it('显示图片标题（如果提供）', () => {
        render(<StoryGallery images={images} />);
        expect(screen.getByText('青云初遇')).toBeInTheDocument();
        expect(screen.getByText('夜雨论剑')).toBeInTheDocument();
    });

    it('图片 src 正确设置', () => {
        render(<StoryGallery images={images} />);
        const imgs = screen.getAllByRole('img');
        expect(imgs[0]).toHaveAttribute('src', 'data:image/png;base64,a1');
        expect(imgs[1]).toHaveAttribute('src', 'data:image/png;base64,a2');
    });
});

describe('StoryGallery — 空态', () => {
    it('空数组显示占位提示', () => {
        render(<StoryGallery images={[]} />);
        expect(screen.getByTestId('story-gallery-empty')).toBeInTheDocument();
    });
});

describe('StoryGallery — 点击放大', () => {
    it('点击图片触发 onSelect 回调', () => {
        const onSelect = vi.fn();
        render(<StoryGallery images={images} onSelect={onSelect} />);
        const imgs = screen.getAllByRole('img');
        fireEvent.click(imgs[1]);
        expect(onSelect).toHaveBeenCalledWith(images[1]);
    });
});

describe('StoryGallery — 键盘可访问性', () => {
    it('每张图片都被 button 包裹（可键盘聚焦）', () => {
        render(<StoryGallery images={images} />);
        const imgs = screen.getAllByRole('img');
        imgs.forEach((img) => {
            const button = img.closest('button');
            expect(button).toBeInTheDocument();
        });
    });
});
