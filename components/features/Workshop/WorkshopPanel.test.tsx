/**
 * WorkshopPanel — 工坊投稿面板组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U17
 * 目标：工坊投稿流（标题/描述/类型/标签）+ 提交回调
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkshopPanel, type WorkshopSubmission } from './WorkshopPanel';

const baseProps = {
    onSubmit: vi.fn(),
    submitting: false,
};

describe('WorkshopPanel — 基础渲染', () => {
    it('渲染所有表单字段', () => {
        render(<WorkshopPanel {...baseProps} />);
        expect(screen.getByTestId('workshop-title')).toBeInTheDocument();
        expect(screen.getByTestId('workshop-description')).toBeInTheDocument();
        expect(screen.getByTestId('workshop-type')).toBeInTheDocument();
        expect(screen.getByTestId('workshop-tags')).toBeInTheDocument();
        expect(screen.getByTestId('workshop-version')).toBeInTheDocument();
    });

    it('显示标题和提交按钮', () => {
        render(<WorkshopPanel {...baseProps} />);
        expect(screen.getByText('工坊投稿')).toBeInTheDocument();
        expect(screen.getByTestId('workshop-submit')).toBeInTheDocument();
    });
});

describe('WorkshopPanel — 表单输入', () => {
    it('更新标题字段', () => {
        render(<WorkshopPanel {...baseProps} />);
        const titleInput = screen.getByTestId('workshop-title') as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: '我的预设' } });
        expect(titleInput.value).toBe('我的预设');
    });

    it('更新描述字段', () => {
        render(<WorkshopPanel {...baseProps} />);
        const descInput = screen.getByTestId('workshop-description') as HTMLTextAreaElement;
        fireEvent.change(descInput, { target: { value: '这是描述' } });
        expect(descInput.value).toBe('这是描述');
    });

    it('更新标签字段（逗号分隔）', () => {
        render(<WorkshopPanel {...baseProps} />);
        const tagsInput = screen.getByTestId('workshop-tags') as HTMLInputElement;
        fireEvent.change(tagsInput, { target: { value: '江湖,古风,玄幻' } });
        expect(tagsInput.value).toBe('江湖,古风,玄幻');
    });
});

describe('WorkshopPanel — 提交验证', () => {
    it('空标题不触发 onSubmit', () => {
        const onSubmit = vi.fn();
        render(<WorkshopPanel {...baseProps} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByTestId('workshop-submit'));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('完整填写后提交触发 onSubmit', () => {
        const onSubmit = vi.fn();
        render(<WorkshopPanel {...baseProps} onSubmit={onSubmit} />);
        fireEvent.change(screen.getByTestId('workshop-title'), { target: { value: '标题' } });
        fireEvent.change(screen.getByTestId('workshop-description'), { target: { value: '描述' } });
        fireEvent.click(screen.getByTestId('workshop-submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        const arg = onSubmit.mock.calls[0][0] as WorkshopSubmission;
        expect(arg.标题).toBe('标题');
        expect(arg.描述).toBe('描述');
    });

    it('submitting=true 时按钮禁用', () => {
        render(<WorkshopPanel {...baseProps} submitting={true} />);
        const submitBtn = screen.getByTestId('workshop-submit') as HTMLButtonElement;
        expect(submitBtn).toBeDisabled();
    });

    it('onSubmit 接收 tags 数组（按逗号 split）', () => {
        const onSubmit = vi.fn();
        render(<WorkshopPanel {...baseProps} onSubmit={onSubmit} />);
        fireEvent.change(screen.getByTestId('workshop-title'), { target: { value: 't' } });
        fireEvent.change(screen.getByTestId('workshop-description'), { target: { value: 'd' } });
        fireEvent.change(screen.getByTestId('workshop-tags'), { target: { value: 'a, b , c' } });
        fireEvent.click(screen.getByTestId('workshop-submit'));
        const arg = onSubmit.mock.calls[0][0] as WorkshopSubmission;
        expect(arg.标签).toEqual(['a', 'b', 'c']);
    });
});

describe('WorkshopPanel — 可定制性', () => {
    it('支持自定义 className', () => {
        const { container } = render(
            <WorkshopPanel {...baseProps} className="my-workshop" />
        );
        const panel = container.querySelector('.my-workshop');
        expect(panel).toBeInTheDocument();
    });

    it('支持 initialValues', () => {
        render(
            <WorkshopPanel
                {...baseProps}
                initialValues={{
                    标题: '预设标题',
                    描述: '预设描述',
                    类型: 'era-pack',
                    标签: ['preset', 'tag'],
                    版本: '1.0.0',
                }}
            />
        );
        expect((screen.getByTestId('workshop-title') as HTMLInputElement).value).toBe('预设标题');
        expect((screen.getByTestId('workshop-type') as HTMLSelectElement).value).toBe('era-pack');
    });
});
