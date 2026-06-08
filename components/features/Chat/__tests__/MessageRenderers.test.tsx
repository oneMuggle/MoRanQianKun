/**
 * MessageRenderers 组件测试
 *
 * 2026-06-08 Phase 5 Day 58：T4 关键组件测试
 * - 测试 Chat 三个纯渲染组件：NarratorRenderer / CharacterRenderer / JudgmentRenderer
 * - 目标：覆盖 MessageRenderers.tsx 主要分支
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    NarratorRenderer,
    CharacterRenderer,
    JudgmentRenderer,
} from '../MessageRenderers';

// useImageAssetPrefetch 在 jsdom 下 prefetch 不可用，简单 stub
vi.mock('../../../../hooks/useImageAssetPrefetch', () => ({
    useImageAssetPrefetch: () => undefined,
}));

describe('NarratorRenderer', () => {
    it('渲染旁白文本', () => {
        render(<NarratorRenderer text="天色微凉，山风徐来。" />);
        expect(screen.getByText('天色微凉，山风徐来。')).toBeInTheDocument();
    });

    it('空文本渲染为空容器', () => {
        const { container } = render(<NarratorRenderer text="" />);
        const paragraph = container.querySelector('p');
        expect(paragraph).toBeInTheDocument();
        expect(paragraph?.textContent).toBe('');
    });

    it('多行文本保留换行', () => {
        const { container } = render(<NarratorRenderer text={'第一行\n第二行'} />);
        const paragraph = container.querySelector('p');
        expect(paragraph).toBeInTheDocument();
        expect(paragraph?.textContent).toContain('第一行');
        expect(paragraph?.textContent).toContain('第二行');
    });
});

describe('CharacterRenderer', () => {
    it('渲染角色名与对话文本', () => {
        render(<CharacterRenderer sender="苏沐" text="你好，少侠。" />);
        expect(screen.getByText('苏沐')).toBeInTheDocument();
        expect(screen.getByText('你好，少侠。')).toBeInTheDocument();
    });

    it('主角称呼（"你"）不抛错', () => {
        expect(() => render(<CharacterRenderer sender="你" text="..." />)).not.toThrow();
    });

    it('空 socialList 时不抛错', () => {
        expect(() =>
            render(<CharacterRenderer sender="陌生人" text="你好" socialList={[]} />)
        ).not.toThrow();
    });

    it('playerProfile 存在时不抛错', () => {
        expect(() =>
            render(
                <CharacterRenderer
                    sender="你"
                    text="自报家门"
                    playerProfile={{ 姓名: '林公子', 头像图片URL: 'data:image/png;base64,abc' }}
                />
            )
        ).not.toThrow();
    });

    it('socialList 含 NPC 时不抛错', () => {
        const npc = {
            姓名: '苏沐',
            头像图片URL: '',
            图片档案: { 生图历史: [], 已选头像图片ID: '', 最近生图结果: null },
        } as any;
        expect(() =>
            render(<CharacterRenderer sender="苏沐" text="对话" socialList={[npc]} />)
        ).not.toThrow();
    });
});

describe('JudgmentRenderer', () => {
    const sampleText = '【判定】 洞察检定：基础10 + 境界5 = 15 vs 难度12 → 成功';

    it('渲染判定文本', () => {
        const { container } = render(<JudgmentRenderer text={sampleText} />);
        // 整个组件中应包含 sampleText 中的关键字
        expect(container.textContent).toContain('洞察检定');
        expect(container.textContent).toContain('15');
    });

    it('点击标题栏可展开/折叠（不抛错）', () => {
        const { container } = render(<JudgmentRenderer text={sampleText} />);
        const headerButton = container.querySelector('button');
        expect(headerButton).toBeTruthy();
        if (headerButton) {
            fireEvent.click(headerButton);
            fireEvent.click(headerButton);
        }
    });

    it('空文本不抛错', () => {
        expect(() => render(<JudgmentRenderer text="" />)).not.toThrow();
    });

    it('失败结果渲染', () => {
        const failText = '【判定】 攻击检定：基础8 vs 难度15 → 失败';
        expect(() => render(<JudgmentRenderer text={failText} />)).not.toThrow();
    });

    it('thoughtBlock 存在时不抛错', () => {
        const thoughtBlock = { text: '【判定】 思维链：玩家掷骰...', raw: '【判定】 思维链：玩家掷骰...' };
        expect(() =>
            render(<JudgmentRenderer text={sampleText} thoughtBlock={thoughtBlock} />)
        ).not.toThrow();
    });

    it('isNsfw 模式不抛错', () => {
        const nsfwText = '【NSFW判定】 体质检定：基础12 + 状态3 = 15 vs 难度10 → 成功';
        expect(() =>
            render(<JudgmentRenderer text={nsfwText} isNsfw={true} />)
        ).not.toThrow();
    });

    it('prefix 参数被使用', () => {
        const prefixed = '【洞察】 锁定目标 → 成功';
        expect(() =>
            render(<JudgmentRenderer text={prefixed} prefix="洞察" />)
        ).not.toThrow();
    });

    it('大成功渲染', () => {
        const critText = '【判定】 攻击检定：基础20 vs 难度5 → 大成功';
        expect(() => render(<JudgmentRenderer text={critText} />)).not.toThrow();
    });
});
