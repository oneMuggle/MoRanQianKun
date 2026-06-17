import React, { useMemo } from 'react';
import type {
    接口设置结构,
    功能模型占位配置结构,
    PNG画风预设结构,
    文生图后端类型,
    文生图预设接口路径类型
} from '@/types';
import GameButton from '../../../ui/GameButton';
import ToggleSwitch from '../../../ui/ToggleSwitch';
import InlineSelect from '../../../ui/InlineSelect';
import { 自动场景横屏尺寸选项, 自动场景竖屏尺寸选项 } from '../../../../utils/imageSizeOptions';
import type { Props } from './types';
import type { 画师串适用页签, 词组预设页签 } from './types';
import {
    文生图后端选项,
    接口路径模式选项,
    预设路径选项映射,
    NovelAI模型建议,
    NovelAI采样器选项,
    NovelAI噪点表选项,
    图片后端需要模型选择,
    ComfyUI工作流占位提示,
    页面容器样式,
    卡片样式,
    标签样式
} from './helpers';
import { useImageGenSettings } from './useImageGenSettings';
import BasicPage from './panels/BasicPage';
import PresetsPage from './panels/PresetsPage';
import ProviderPage from './panels/ProviderPage';
import TransformerPage from './panels/TransformerPage';
import AutomationPage from './panels/AutomationPage';
import PlayerPage from './panels/PlayerPage';

const ImageGenerationSettings: React.FC<Props> = ({ settings, onSave }) => {
    const state = useImageGenSettings({ settings, onSave });
    const {
        form, setForm,
        selectedConfigId, setSelectedConfigId,
        selectedImageGenConfigId, setSelectedImageGenConfigId,
        newImageGenBackend, setNewImageGenBackend,
        modelOptions, setModelOptions,
        modelLoading, setModelLoading,
        activePage, setActivePage,
        artistPresetScope, setArtistPresetScope,
        transformerPresetScope, setTransformerPresetScope,
        message, setMessage,
        showSuccess, setShowSuccess,
        testingConnection, setTestingConnection,
        testResultModal, setTestResultModal,
        artistImportRef, transformerImportRef,
        workflowDialogOpen, setWorkflowDialogOpen,
        workflowList, setWorkflowList,
        workflowLoading, setWorkflowLoading,
        workflowError, setWorkflowError,
        workflowFilter, setWorkflowFilter,
        activeConfig,
        当前文生图配置, 文生图配置列表,
        主剧情解析模型,
        当前后端, 当前场景后端,
        当前预设路径选项, 当前预设路径值集合, 当前预设路径,
        文生图模型选项, 词组转化器模型选项, PNG提炼模型选项, 场景文生图模型选项,
        可见页面, 是否强制启用词组转化器,
        artistPresets, scopedArtistPresets, currentArtistPresetId,
        pngStylePresets, currentAutoPngPresetId, selectedArtistPreset,
        transformerPresets, scopedTransformerPresets, currentTransformerPresetId, selectedTransformerPreset,
        updateImageGenConfig,
        handleCreateImageGenConfig, handleDeleteImageGenConfig,
        handleLoadWorkflowFromCNB, handleSelectWorkflow,
        updatePlaceholder,
        updateArtistPreset, updateTransformerPreset,
        handleAddArtistPreset, handleDeleteArtistPreset,
        handleAddTransformerPreset, handleDeleteTransformerPreset,
        handleBackendChange,
        handleToggleTransformerIndependent, handleToggleSceneMode, handleToggleSceneIndependentImageApi,
        更新当前画师串预设ID, 更新当前PNG预设ID, 更新当前词组预设ID,
        fetchModelsFromCurrentConfig, handleFetchModels,
        handleTestImageConnection,
        handleExportArtistPresets, handleExportTransformerPresets,
        handleImportArtistPresets, handleImportTransformerPresets,
        handleSave
    } = state;

    return (
        <div className="space-y-6 text-sm animate-fadeIn">
            <div className="rounded-2xl border border-fuchsia-500/30 bg-[radial-gradient(circle_at_top_left,_rgba(217,70,239,0.18),_transparent_42%),linear-gradient(180deg,rgba(16,16,24,0.96),rgba(5,5,10,0.96))] p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h3 className="text-2xl font-bold font-serif text-fuchsia-200">文生图设置</h3>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                        <div className="text-sm text-gray-400">当前后端</div>
                        <div className="mt-1 text-base text-white">
                            {当前文生图配置 ? 文生图后端选项.find((item) => item.value === 当前文生图配置.后端类型)?.label : '请配置'}
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                    {可见页面.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setActivePage(item.value)}
                            className={`rounded-xl border px-4 py-3 text-left transition-all ${activePage === item.value
                                ? 'border-fuchsia-400 bg-fuchsia-500/15 text-white shadow-[0_0_0_1px_rgba(217,70,239,0.25)]'
                                : 'border-white/10 bg-black/20 text-gray-300 hover:border-fuchsia-500/40 hover:text-white'
                                }`}
                        >
                            <div className="text-sm font-semibold">{item.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {activePage === 'basic' && (
                <BasicPage
                    form={form}
                    updatePlaceholder={updatePlaceholder}
                    当前文生图配置={当前文生图配置}
                />
            )}
            {activePage === 'provider' && <ProviderPage {...state} />}
            {activePage === 'transformer' && <TransformerPage {...state} />}
            {activePage === 'presets' && (
                <PresetsPage
                    artistPresetScope={artistPresetScope}
                    setArtistPresetScope={setArtistPresetScope}
                    transformerPresetScope={transformerPresetScope}
                    setTransformerPresetScope={setTransformerPresetScope}
                    selectedArtistPreset={selectedArtistPreset}
                    selectedTransformerPreset={selectedTransformerPreset}
                    currentArtistPresetId={currentArtistPresetId}
                    currentAutoPngPresetId={currentAutoPngPresetId}
                    currentTransformerPresetId={currentTransformerPresetId}
                    scopedArtistPresets={scopedArtistPresets}
                    scopedTransformerPresets={scopedTransformerPresets}
                    pngStylePresets={pngStylePresets}
                    artistImportRef={artistImportRef}
                    transformerImportRef={transformerImportRef}
                    handleAddArtistPreset={handleAddArtistPreset}
                    handleDeleteArtistPreset={handleDeleteArtistPreset}
                    handleExportArtistPresets={handleExportArtistPresets}
                    handleImportArtistPresets={handleImportArtistPresets}
                    handleAddTransformerPreset={handleAddTransformerPreset}
                    handleDeleteTransformerPreset={handleDeleteTransformerPreset}
                    handleExportTransformerPresets={handleExportTransformerPresets}
                    handleImportTransformerPresets={handleImportTransformerPresets}
                    更新当前画师串预设ID={更新当前画师串预设ID}
                    更新当前PNG预设ID={更新当前PNG预设ID}
                    更新当前词组预设ID={更新当前词组预设ID}
                    updateArtistPreset={updateArtistPreset}
                    updateTransformerPreset={updateTransformerPreset}
                />
            )}
            {activePage === 'automation' && <AutomationPage {...state} />}
            {activePage === 'player' && <PlayerPage {...state} />}
            {activePage === 'retry' && (
                <div className={页面容器样式}>
                    <div className={卡片样式}>
                        <div className="text-base font-bold text-fuchsia-200 mb-4">重试次数设置</div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-fuchsia-200">提示词生成重试次数</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={form.功能模型占位.提示词生成重试次数 ?? 1}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(5, Number(e.target.value) || 1));
                                        updatePlaceholder('提示词生成重试次数', value);
                                    }}
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">提示词生成失败时的重试次数 (0-5，默认1)</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-fuchsia-200">图片生成重试次数</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={form.功能模型占位.图片生成重试次数 ?? 1}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(5, Number(e.target.value) || 1));
                                        updatePlaceholder('图片生成重试次数', value);
                                    }}
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">图片生成失败时的重试次数 (0-5，默认1)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {message && <p className="animate-pulse text-xs text-wuxia-cyan">{message}</p>}

            <div className="flex gap-3">
                <GameButton
                    onClick={() => handleTestImageConnection(当前文生图配置)}
                    variant="secondary"
                    className="flex-1"
                    disabled={testingConnection}
                >
                    {testingConnection ? '测试中...' : '测试连接'}
                </GameButton>
                <GameButton onClick={handleSave} variant="primary" className="flex-[2]">
                    {showSuccess ? '✔ 文生图配置已保存' : '保存文生图配置'}
                </GameButton>
            </div>

            {testResultModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="mx-4 w-full max-w-lg rounded-xl border border-fuchsia-500/30 bg-gray-900 p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className={`text-lg font-bold font-serif ${testResultModal.ok ? 'text-green-400' : 'text-red-400'}`}>
                                {testResultModal.title || '连接测试结果'}
                            </h4>
                            <button
                                onClick={() => setTestResultModal((prev) => ({ ...prev, open: false }))}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="whitespace-pre-wrap rounded-lg bg-black/40 p-4 text-xs text-gray-200 font-mono max-h-80 overflow-y-auto">
                            {testResultModal.content}
                        </div>
                        <div className="mt-4">
                            <GameButton
                                onClick={() => setTestResultModal((prev) => ({ ...prev, open: false }))}
                                variant={testResultModal.ok ? 'primary' : 'secondary'}
                                className="w-full"
                            >
                                关闭
                            </GameButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGenerationSettings;
