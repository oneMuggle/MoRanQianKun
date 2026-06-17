/**
 * ImageGenerationSettings — 预设管理页 panel
 *
 * v3 路线图 Phase B1 PR3：从主文件抽出 renderPresetsPage。
 */

import React from 'react';
import InlineSelect from '../../../../ui/InlineSelect';
import type { useImageGenSettings } from '../useImageGenSettings';
import type { 画师串适用页签, 词组预设页签 } from '../types';
import { 页面容器样式, 卡片样式, 标签样式 } from '../helpers';

type HookReturn = ReturnType<typeof useImageGenSettings>;

interface PresetsPageProps {
    artistPresetScope: HookReturn['artistPresetScope'];
    setArtistPresetScope: HookReturn['setArtistPresetScope'];
    transformerPresetScope: HookReturn['transformerPresetScope'];
    setTransformerPresetScope: HookReturn['setTransformerPresetScope'];
    selectedArtistPreset: HookReturn['selectedArtistPreset'];
    selectedTransformerPreset: HookReturn['selectedTransformerPreset'];
    currentArtistPresetId: HookReturn['currentArtistPresetId'];
    currentAutoPngPresetId: HookReturn['currentAutoPngPresetId'];
    currentTransformerPresetId: HookReturn['currentTransformerPresetId'];
    scopedArtistPresets: HookReturn['scopedArtistPresets'];
    scopedTransformerPresets: HookReturn['scopedTransformerPresets'];
    pngStylePresets: HookReturn['pngStylePresets'];
    artistImportRef: HookReturn['artistImportRef'];
    transformerImportRef: HookReturn['transformerImportRef'];
    handleAddArtistPreset: HookReturn['handleAddArtistPreset'];
    handleDeleteArtistPreset: HookReturn['handleDeleteArtistPreset'];
    handleExportArtistPresets: HookReturn['handleExportArtistPresets'];
    handleImportArtistPresets: HookReturn['handleImportArtistPresets'];
    handleAddTransformerPreset: HookReturn['handleAddTransformerPreset'];
    handleDeleteTransformerPreset: HookReturn['handleDeleteTransformerPreset'];
    handleExportTransformerPresets: HookReturn['handleExportTransformerPresets'];
    handleImportTransformerPresets: HookReturn['handleImportTransformerPresets'];
    更新当前画师串预设ID: HookReturn['更新当前画师串预设ID'];
    更新当前PNG预设ID: HookReturn['更新当前PNG预设ID'];
    更新当前词组预设ID: HookReturn['更新当前词组预设ID'];
    updateArtistPreset: HookReturn['updateArtistPreset'];
    updateTransformerPreset: HookReturn['updateTransformerPreset'];
}

export const PresetsPage: React.FC<PresetsPageProps> = ({
    artistPresetScope, setArtistPresetScope,
    transformerPresetScope, setTransformerPresetScope,
    selectedArtistPreset, selectedTransformerPreset,
    currentArtistPresetId, currentAutoPngPresetId, currentTransformerPresetId,
    scopedArtistPresets, scopedTransformerPresets, pngStylePresets,
    artistImportRef, transformerImportRef,
    handleAddArtistPreset, handleDeleteArtistPreset, handleExportArtistPresets, handleImportArtistPresets,
    handleAddTransformerPreset, handleDeleteTransformerPreset, handleExportTransformerPresets, handleImportTransformerPresets,
    更新当前画师串预设ID, 更新当前PNG预设ID, 更新当前词组预设ID,
    updateArtistPreset, updateTransformerPreset
}) => (
    <div className={页面容器样式}>
        <div className={卡片样式}>
            <div className="flex items-center justify-between gap-3">
                <div className="text-base font-bold text-fuchsia-200">画师串预设</div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleAddArtistPreset} className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/20 px-3 py-2 text-xs text-fuchsia-100">新增</button>
                    <button type="button" onClick={handleDeleteArtistPreset} disabled={!selectedArtistPreset} className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-200 disabled:opacity-40">删除</button>
                    <button type="button" onClick={handleExportArtistPresets} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导出</button>
                    <button type="button" onClick={() => artistImportRef.current?.click()} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导入</button>
                    <input ref={artistImportRef} type="file" accept="application/json" onChange={handleImportArtistPresets} className="hidden" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <div className="space-y-2">
                    <label className={标签样式}>适用范围</label>
                    <InlineSelect
                        value={artistPresetScope}
                        options={[
                            { value: 'npc', label: 'NPC角色' },
                            { value: 'scene', label: '场景' },
                            { value: 'player', label: '主角' }
                        ]}
                        onChange={(value) => setArtistPresetScope(value as 画师串适用页签)}
                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                    />
                </div>
                <div className="space-y-2">
                    <label className={标签样式}>当前使用预设</label>
                    <InlineSelect
                        value={currentArtistPresetId}
                        options={scopedArtistPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                        onChange={(value) => 更新当前画师串预设ID(artistPresetScope, value)}
                        placeholder="请选择预设"
                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <div className="space-y-2">
                    <label className={标签样式}>默认PNG预设</label>
                    <InlineSelect
                        value={currentAutoPngPresetId}
                        options={pngStylePresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                        onChange={(value) => 更新当前PNG预设ID(artistPresetScope, value)}
                        placeholder="不启用"
                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                    />
                </div>
            </div>

            {selectedArtistPreset ? (
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label className={标签样式}>预设名称</label>
                        <input
                            type="text"
                            value={selectedArtistPreset.名称}
                            onChange={(e) => updateArtistPreset(selectedArtistPreset.id, (preset) => ({ ...preset, 名称: e.target.value, updatedAt: Date.now() }))}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={标签样式}>正面提示词</label>
                        <textarea
                            value={selectedArtistPreset.正面提示词}
                            onChange={(e) => updateArtistPreset(selectedArtistPreset.id, (preset) => ({ ...preset, 正面提示词: e.target.value, updatedAt: Date.now() }))}
                            rows={5}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400 resize-y"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={标签样式}>负面提示词</label>
                        <textarea
                            value={selectedArtistPreset.负面提示词}
                            onChange={(e) => updateArtistPreset(selectedArtistPreset.id, (preset) => ({ ...preset, 负面提示词: e.target.value, updatedAt: Date.now() }))}
                            rows={4}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400 resize-y"
                        />
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-400">当前范围还没有预设。</div>
            )}
        </div>

        <div className={卡片样式}>
            <div className="flex items-center justify-between gap-3">
                <div className="text-base font-bold text-cyan-200">词组转化器提示词预设</div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleAddTransformerPreset} className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-100">新增</button>
                    <button type="button" onClick={handleDeleteTransformerPreset} disabled={!selectedTransformerPreset} className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-200 disabled:opacity-40">删除</button>
                    <button type="button" onClick={handleExportTransformerPresets} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导出</button>
                    <button type="button" onClick={() => transformerImportRef.current?.click()} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导入</button>
                    <input ref={transformerImportRef} type="file" accept="application/json" onChange={handleImportTransformerPresets} className="hidden" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-2">
                    <label className={标签样式}>适用类型</label>
                    <InlineSelect
                        value={transformerPresetScope}
                        options={[
                            { value: 'nai', label: 'NAI模式专属' },
                            { value: 'npc', label: 'NPC角色生成' },
                            { value: 'scene', label: '场景专属' },
                            { value: 'player', label: '主角专属' }
                        ]}
                        onChange={(value) => setTransformerPresetScope(value as 词组预设页签)}
                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                    />
                </div>
                <div className="space-y-2">
                    <label className={标签样式}>当前使用预设</label>
                    <InlineSelect
                        value={currentTransformerPresetId}
                        options={scopedTransformerPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                        onChange={(value) => 更新当前词组预设ID(transformerPresetScope, value)}
                        placeholder="请选择预设"
                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                    />
                </div>
            </div>

            {selectedTransformerPreset ? (
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label className={标签样式}>预设名称</label>
                        <input
                            type="text"
                            value={selectedTransformerPreset.名称}
                            onChange={(e) => updateTransformerPreset(selectedTransformerPreset.id, (preset) => ({ ...preset, 名称: e.target.value, updatedAt: Date.now() }))}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={标签样式}>提示词内容</label>
                        <textarea
                            value={selectedTransformerPreset.提示词}
                            onChange={(e) => updateTransformerPreset(selectedTransformerPreset.id, (preset) => ({ ...preset, 提示词: e.target.value, updatedAt: Date.now() }))}
                            rows={10}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400 resize-y min-h-[220px]"
                        />
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-400">当前类型还没有预设。</div>
            )}
        </div>
    </div>
);

export default PresetsPage;
