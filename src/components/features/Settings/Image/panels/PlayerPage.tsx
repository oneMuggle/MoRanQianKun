/**
 * ImageGenerationSettings — 主角页 panel
 *
 * v3 路线图 Phase B1 PR4b：从主文件抽出 renderPlayerPage + usePlayerPageData hook。
 */

import React, { useMemo } from 'react';
import GameButton from '../../../../ui/GameButton';
import ToggleSwitch from '../../../../ui/ToggleSwitch';
import InlineSelect from '../../../../ui/InlineSelect';
import type { useImageGenSettings } from '../useImageGenSettings';
import type { PNG画风预设结构, 接口设置结构 } from '@/types';
import { NovelAI模型建议, 文生图后端选项, 页面容器样式, 卡片样式 } from '../helpers';

type HookReturn = ReturnType<typeof useImageGenSettings>;

// 自定义 Hook：提取主角页的 useMemo 计算逻辑
const usePlayerPageData = (form: 接口设置结构, updatePlaceholder: (key: string, value: unknown) => void) => {
    const playerArtistPresets = useMemo(
        () => (Array.isArray(form.功能模型占位.画师串预设列表) ? form.功能模型占位.画师串预设列表 : [])
            .filter((item) => item && typeof item.id === 'string' && !item.id.startsWith('png_artist_')),
        [form.功能模型占位.画师串预设列表]
    );
    const scopedPlayerArtistPresets = useMemo(() => playerArtistPresets.filter((item) => (item.适用范围 as string) === 'player' || (item.适用范围 as string) === 'all'), [playerArtistPresets]);
    const currentPlayerArtistPresetId = form.功能模型占位.主角画师串预设ID;
    const selectedPlayerArtistPreset = scopedPlayerArtistPresets.find((item) => item.id === currentPlayerArtistPresetId)
        || scopedPlayerArtistPresets[0]
        || null;

    const pngPlayerStylePresets = useMemo<PNG画风预设结构[]>(
        () => Array.isArray(form.功能模型占位.PNG画风预设列表) ? form.功能模型占位.PNG画风预设列表 : [],
        [form.功能模型占位.PNG画风预设列表]
    );
    const currentPlayerPngPresetId = form.功能模型占位.主角PNG画风预设ID;
    const selectedPlayerPngPreset = pngPlayerStylePresets.find((item) => item.id === currentPlayerPngPresetId)
        || pngPlayerStylePresets[0]
        || null;

    const transformerPlayerPresets = useMemo(() => Array.isArray(form.功能模型占位.词组转化器提示词预设列表) ? form.功能模型占位.词组转化器提示词预设列表 : [], [form.功能模型占位.词组转化器提示词预设列表]);
    const scopedPlayerTransformerPresets = useMemo(() => transformerPlayerPresets.filter((item) => (item.类型 as string) === 'player' || (item.类型 as string) === 'npc'), [transformerPlayerPresets]);
    const currentPlayerTransformerPresetId = form.功能模型占位.主角词组转化器预设ID;
    const selectedPlayerTransformerPreset = scopedPlayerTransformerPresets.find((item) => item.id === currentPlayerTransformerPresetId)
        || scopedPlayerTransformerPresets[0]
        || null;

    return {
        playerArtistPresets,
        scopedPlayerArtistPresets,
        currentPlayerArtistPresetId,
        selectedPlayerArtistPreset,
        pngPlayerStylePresets,
        currentPlayerPngPresetId,
        selectedPlayerPngPreset,
        transformerPlayerPresets,
        scopedPlayerTransformerPresets,
        currentPlayerTransformerPresetId,
        selectedPlayerTransformerPreset,
    };
};

export const PlayerPage: React.FC<HookReturn> = (state) => {
    const {
        form, setForm, updatePlaceholder,
        modelLoading, modelOptions,
        handleFetchModels
    } = state;

    const handleTogglePlayerMode = (checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                主角生图启用: checked
            }
        }));
    };

    const 当前主角后端 = form.功能模型占位.主角生图独立接口启用
        ? form.功能模型占位.主角生图后端类型
        : form.功能模型占位.文生图后端类型;
    const 主角文生图模型选项 = Array.from(new Set(
        (当前主角后端 === 'novelai' ? NovelAI模型建议 : [])
            .concat(modelOptions.主角生图模型使用模型, form.功能模型占位.主角生图模型使用模型, form.功能模型占位.文生图模型使用模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));

    // 使用从 Hook 获取的数据
    const {
        scopedPlayerArtistPresets,
        currentPlayerArtistPresetId,
        selectedPlayerArtistPreset,
        pngPlayerStylePresets,
        currentPlayerPngPresetId,
        selectedPlayerPngPreset,
        scopedPlayerTransformerPresets,
        currentPlayerTransformerPresetId,
        selectedPlayerTransformerPreset,
    } = usePlayerPageData(form, updatePlaceholder);

    const 更新当前主角画师串预设ID = (presetId: string) => {
        updatePlaceholder('主角画师串预设ID', presetId);
    };

    const 更新当前主角PNG预设ID = (presetId: string) => {
        updatePlaceholder('主角PNG画风预设ID', presetId);
    };

    const 更新当前主角词组预设ID = (presetId: string) => {
        updatePlaceholder('主角词组转化器预设ID', presetId);
    };

    return (
        <div className={页面容器样式}>
            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
                    <div>
                        <div className="text-base font-bold text-amber-200">主角生图独立配置</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.主角生图启用}
                        onChange={handleTogglePlayerMode}
                        ariaLabel="切换主角生图独立配置"
                    />
                </div>
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-amber-200">主角独立接口</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.主角生图独立接口启用}
                        onChange={(next) => {
                            setForm((prev) => ({
                                ...prev,
                                功能模型占位: {
                                    ...prev.功能模型占位,
                                    主角生图独立接口启用: next,
                                    主角生图后端类型: next
                                        ? prev.功能模型占位.主角生图后端类型
                                        : prev.功能模型占位.主角生图后端类型,
                                    主角生图模型API地址: next
                                        ? ((prev.功能模型占位.主角生图模型API地址 || '').trim() || (prev.功能模型占位.文生图模型API地址 || '').trim())
                                        : prev.功能模型占位.主角生图模型API地址,
                                    主角生图模型API密钥: next
                                        ? ((prev.功能模型占位.主角生图模型API密钥 || '').trim() || (prev.功能模型占位.文生图模型API密钥 || '').trim())
                                        : prev.功能模型占位.主角生图模型API密钥,
                                    主角生图模型使用模型: next
                                        ? ((prev.功能模型占位.主角生图模型使用模型 || '').trim() || (prev.功能模型占位.文生图模型使用模型 || '').trim())
                                        : prev.功能模型占位.主角生图模型使用模型
                                }
                            }));
                        }}
                        ariaLabel="切换主角独立接口"
                    />
                </div>

                {form.功能模型占位.主角生图独立接口启用 && (
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-amber-200">后端类型</label>
                                <InlineSelect
                                    value={当前主角后端}
                                    options={文生图后端选项}
                                    onChange={(value) => updatePlaceholder('主角生图后端类型', value as any)}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-amber-200">API 地址</label>
                                <input
                                    type="text"
                                    value={form.功能模型占位.主角生图模型API地址}
                                    onChange={(e) => updatePlaceholder('主角生图模型API地址', e.target.value)}
                                    placeholder="留空则沿用主接口"
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-amber-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-bold text-amber-200">模型</label>
                                <InlineSelect
                                    value={form.功能模型占位.主角生图模型使用模型}
                                    options={主角文生图模型选项.map((model) => ({ value: model, label: model }))}
                                    onChange={(model) => updatePlaceholder('主角生图模型使用模型', model)}
                                    placeholder="请选择或输入模型"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    panelClassName="max-w-full"
                                />
                            </div>
                            <GameButton
                                onClick={() => handleFetchModels('主角生图模型使用模型', '主角生图模型列表')}
                                variant="secondary"
                                className="px-4 py-2 text-xs md:min-w-[96px]"
                                disabled={modelLoading.主角生图模型使用模型}
                            >
                                {modelLoading.主角生图模型使用模型 ? '...' : '获取列表'}
                            </GameButton>
                        </div>
                        <input
                            type="text"
                            value={form.功能模型占位.主角生图模型使用模型}
                            onChange={(e) => updatePlaceholder('主角生图模型使用模型', e.target.value)}
                            placeholder="例如：nai-diffusion-4-5-full"
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-amber-400"
                        />
                    </div>
                )}
            </div>

            <div className={卡片样式}>
                <div className="text-base font-bold text-amber-200 mb-4">画师串预设</div>
                <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-amber-200">当前使用预设</label>
                        <InlineSelect
                            value={currentPlayerArtistPresetId}
                            options={scopedPlayerArtistPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                            onChange={(value) => 更新当前主角画师串预设ID(value)}
                            placeholder="请选择预设"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>
            </div>

            <div className={卡片样式}>
                <div className="text-base font-bold text-amber-200 mb-4">PNG 画风预设</div>
                <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-amber-200">当前使用预设</label>
                        <InlineSelect
                            value={currentPlayerPngPresetId}
                            options={pngPlayerStylePresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                            onChange={(value) => 更新当前主角PNG预设ID(value)}
                            placeholder="不启用"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>
            </div>

            <div className={卡片样式}>
                <div className="text-base font-bold text-amber-200 mb-4">词组转化器预设</div>
                <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-amber-200">当前使用预设</label>
                        <InlineSelect
                            value={currentPlayerTransformerPresetId}
                            options={scopedPlayerTransformerPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                            onChange={(value) => 更新当前主角词组预设ID(value)}
                            placeholder="请选择预设"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerPage;
