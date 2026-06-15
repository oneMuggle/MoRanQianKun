/**
 * WorkshopPanel — 工坊投稿面板组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U17
 * 目标：工坊投稿流（标题/描述/类型/标签/版本）+ 提交回调
 */
import React, { useState } from 'react';

export type WorkshopType = 'era-pack' | 'race-pack' | 'worldbook' | 'preset' | 'map-pack' | 'scenario';

export const 全部工坊类型: WorkshopType[] = [
    'era-pack', 'race-pack', 'worldbook', 'preset', 'map-pack', 'scenario',
];

export const 工坊类型标签: Record<WorkshopType, string> = {
    'era-pack': '时代包',
    'race-pack': '种族包',
    'worldbook': '世界书',
    'preset': '预设',
    'map-pack': '地图包',
    'scenario': '剧本',
};

export type WorkshopSubmission = {
    标题: string;
    描述: string;
    类型: WorkshopType;
    标签: string[];
    版本: string;
};

export type WorkshopPanelProps = {
    /** 提交回调 */
    onSubmit: (submission: WorkshopSubmission) => void;
    /** 提交中状态（按钮禁用） */
    submitting?: boolean;
    /** 初始值（编辑模式） */
    initialValues?: Partial<WorkshopSubmission>;
    /** 自定义 className */
    className?: string;
};

const 默认初始值: WorkshopSubmission = {
    标题: '',
    描述: '',
    类型: 'preset',
    标签: [],
    版本: '1.0.0',
};

export const WorkshopPanel: React.FC<WorkshopPanelProps> = ({
    onSubmit,
    submitting = false,
    initialValues,
    className = '',
}) => {
    const [form, setForm] = useState<WorkshopSubmission>({
        ...默认初始值,
        ...initialValues,
    });

    const 标签字符串 = form.标签.join(',');

    const update = <K extends keyof WorkshopSubmission>(key: K, value: WorkshopSubmission[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const updateTags = (raw: string) => {
        const tags = raw
            .split(/[,,]/)
            .map((t) => t.trim())
            .filter(Boolean);
        update('标签', tags);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.标题.trim()) return;
        onSubmit(form);
    };

    return (
        <form
            onSubmit={handleSubmit}
            data-testid="workshop-panel"
            className={`space-y-4 rounded-2xl border border-wuxia-gold/20 bg-black/40 p-6 ${className}`}
        >
            <h2 className="text-2xl font-serif font-bold text-wuxia-gold tracking-wider">工坊投稿</h2>
            <p className="text-xs text-gray-400">把你的创作分享给其他用户。填写后点击提交即可生成投稿请求。</p>

            <div className="space-y-1.5">
                <label className="text-sm text-wuxia-cyan font-bold">标题</label>
                <input
                    type="text"
                    data-testid="workshop-title"
                    value={form.标题}
                    onChange={(e) => update('标题', e.target.value)}
                    placeholder="给你的作品起个名字"
                    className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-2.5 text-white outline-none rounded-md transition-all text-sm"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm text-wuxia-cyan font-bold">描述</label>
                <textarea
                    data-testid="workshop-description"
                    value={form.描述}
                    onChange={(e) => update('描述', e.target.value)}
                    placeholder="介绍这个作品的内容、用法、注意事项..."
                    rows={4}
                    className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-2.5 text-white outline-none rounded-md transition-all text-sm resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm text-wuxia-cyan font-bold">类型</label>
                    <select
                        data-testid="workshop-type"
                        value={form.类型}
                        onChange={(e) => update('类型', e.target.value as WorkshopType)}
                        className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-2.5 text-white outline-none rounded-md transition-all text-sm"
                    >
                        {全部工坊类型.map((t) => (
                            <option key={t} value={t}>{工坊类型标签[t]}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm text-wuxia-cyan font-bold">版本</label>
                    <input
                        type="text"
                        data-testid="workshop-version"
                        value={form.版本}
                        onChange={(e) => update('版本', e.target.value)}
                        placeholder="1.0.0"
                        className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-2.5 text-white outline-none rounded-md transition-all text-sm font-mono"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm text-wuxia-cyan font-bold">标签</label>
                <input
                    type="text"
                    data-testid="workshop-tags"
                    value={标签字符串}
                    onChange={(e) => updateTags(e.target.value)}
                    placeholder="用逗号分隔，例如：江湖,古风,玄幻"
                    className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-2.5 text-white outline-none rounded-md transition-all text-sm"
                />
                <div className="text-[10px] text-gray-500">共 {form.标签.length} 个标签</div>
            </div>

            <div className="pt-2 flex justify-end">
                <button
                    type="submit"
                    data-testid="workshop-submit"
                    disabled={submitting || !form.标题.trim()}
                    className="px-6 py-2.5 rounded-lg bg-wuxia-gold/15 border border-wuxia-gold/40 text-wuxia-gold hover:bg-wuxia-gold/25 hover:border-wuxia-gold/60 transition-all text-sm tracking-wider font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? '提交中...' : '提交投稿'}
                </button>
            </div>
        </form>
    );
};

export default WorkshopPanel;
