/**
 * ImageGenerationSettings — 转化器页 panel
 *
 * v3 路线图 Phase B1 PR4a：从主文件抽出 renderTransformerPage。
 */

import React from 'react';
import GameButton from '../../../../ui/GameButton';
import ToggleSwitch from '../../../../ui/ToggleSwitch';
import InlineSelect from '../../../../ui/InlineSelect';
import type { useImageGenSettings } from '../useImageGenSettings';
import { 页面容器样式, 卡片样式 } from '../helpers';

type HookReturn = ReturnType<typeof useImageGenSettings>;

export const TransformerPage: React.FC<HookReturn> = (state) => {
    const {
        form, updatePlaceholder,
        handleToggleTransformerIndependent, handleFetchModels, modelLoading,
        是否强制启用词组转化器, 主剧情解析模型, 词组转化器模型选项, PNG提炼模型选项
    } = state;

    return (
        <div className={页面容器样式}>
            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-cyan-200">NPC 生图使用词组转化器</div>
                    </div>
                    <ToggleSwitch
                        checked={是否强制启用词组转化器 ? true : form.功能模型占位.NPC生图使用词组转化器}
                        onChange={(next) => updatePlaceholder('NPC生图使用词组转化器', next)}
                        disabled={是否强制启用词组转化器}
                        ariaLabel="切换 NPC 生图词组转化器"
                    />
                </div>
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-cyan-200">香闺秘档特写强制裸体语义</div>
                        <div className="mt-1 text-xs leading-6 text-cyan-100/70">关闭后不再额外强塞 `nude, naked, unclothed`，仅按原始描述、词组转化器和画师串生成。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.香闺秘档特写强制裸体语义}
                        onChange={(next) => updatePlaceholder('香闺秘档特写强制裸体语义', next)}
                        ariaLabel="切换香闺秘档特写强制裸体语义"
                    />
                </div>
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-cyan-200">独立转化器模型</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.词组转化器启用独立模型}
                        onChange={handleToggleTransformerIndependent}
                        ariaLabel="切换词组转化器独立模型"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-cyan-200">转化器接口地址</label>
                        <input
                            type="text"
                            value={form.功能模型占位.词组转化器API地址}
                            onChange={(e) => updatePlaceholder('词组转化器API地址', e.target.value)}
                            placeholder="留空则沿用主剧情接口"
                            disabled={!form.功能模型占位.词组转化器启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-cyan-200">转化器 API Key</label>
                        <input
                            type="password"
                            value={form.功能模型占位.词组转化器API密钥}
                            onChange={(e) => updatePlaceholder('词组转化器API密钥', e.target.value)}
                            placeholder="留空则沿用主剧情 API Key"
                            disabled={!form.功能模型占位.词组转化器启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-cyan-200">词组转化器模型</label>
                        <InlineSelect
                            value={form.功能模型占位.词组转化器启用独立模型 ? form.功能模型占位.词组转化器使用模型 : 主剧情解析模型}
                            options={词组转化器模型选项.map((model) => ({ value: model, label: model }))}
                            onChange={(model) => updatePlaceholder('词组转化器使用模型', model)}
                            disabled={!form.功能模型占位.词组转化器启用独立模型}
                            placeholder={form.功能模型占位.词组转化器启用独立模型 ? '请选择或输入模型' : `跟随主剧情模型：${主剧情解析模型 || '未设置'}`}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            panelClassName="max-w-full"
                        />
                    </div>
                    <GameButton
                        onClick={() => handleFetchModels('词组转化器使用模型', '词组转化器模型列表')}
                        variant="secondary"
                        className="px-4 py-2 text-xs md:min-w-[96px]"
                        disabled={modelLoading.词组转化器使用模型}
                    >
                        {modelLoading.词组转化器使用模型 ? '...' : '获取列表'}
                    </GameButton>
                </div>

                {form.功能模型占位.词组转化器启用独立模型 && (
                    <input
                        type="text"
                        value={form.功能模型占位.词组转化器使用模型}
                        onChange={(e) => updatePlaceholder('词组转化器使用模型', e.target.value)}
                        placeholder="例如：gpt-4o-mini / gemini-2.5-flash"
                        className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400"
                    />
                )}
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-violet-200">PNG 画风提炼独立模型</div>
                        <div className="mt-1 text-xs leading-6 text-violet-100/70">用于 PNG 元数据提炼画风，不影响生图模型。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.PNG提炼启用独立模型}
                        onChange={(next) => updatePlaceholder('PNG提炼启用独立模型', next)}
                        ariaLabel="切换 PNG 提炼独立模型"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-violet-200">PNG 提炼接口地址</label>
                        <input
                            type="text"
                            value={form.功能模型占位.PNG提炼API地址}
                            onChange={(e) => updatePlaceholder('PNG提炼API地址', e.target.value)}
                            placeholder="例如：https://api.openai.com/v1"
                            disabled={!form.功能模型占位.PNG提炼启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-violet-200">PNG 提炼 API Key</label>
                        <input
                            type="password"
                            value={form.功能模型占位.PNG提炼API密钥}
                            onChange={(e) => updatePlaceholder('PNG提炼API密钥', e.target.value)}
                            placeholder="留空则沿用主剧情 API Key"
                            disabled={!form.功能模型占位.PNG提炼启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-violet-200">PNG 提炼模型</label>
                        <InlineSelect
                            value={form.功能模型占位.PNG提炼使用模型}
                            options={PNG提炼模型选项.map((model) => ({ value: model, label: model }))}
                            onChange={(model) => updatePlaceholder('PNG提炼使用模型', model)}
                            disabled={!form.功能模型占位.PNG提炼启用独立模型}
                            placeholder="请选择或输入模型"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            panelClassName="max-w-full"
                        />
                    </div>
                    <GameButton
                        onClick={() => handleFetchModels('PNG提炼使用模型', 'PNG提炼模型列表')}
                        variant="secondary"
                        className="px-4 py-2 text-xs md:min-w-[96px]"
                        disabled={!form.功能模型占位.PNG提炼启用独立模型 || modelLoading.PNG提炼使用模型}
                    >
                        {modelLoading.PNG提炼使用模型 ? '...' : '获取列表'}
                    </GameButton>
                </div>
                <input
                    type="text"
                    value={form.功能模型占位.PNG提炼使用模型}
                    onChange={(e) => updatePlaceholder('PNG提炼使用模型', e.target.value)}
                    placeholder="例如：gpt-4o-mini / gemini-2.5-flash"
                    disabled={!form.功能模型占位.PNG提炼启用独立模型}
                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
        </div>
    );
};

export default TransformerPage;
