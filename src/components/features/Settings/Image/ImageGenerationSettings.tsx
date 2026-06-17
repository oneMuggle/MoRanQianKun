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

    const renderAutomationPage = () => {
        const sceneOrientation = form.功能模型占位.自动场景生图横竖屏 === '竖屏' ? '竖屏' : '横屏';
        const sceneResolutionVerticalOptions = 自动场景竖屏尺寸选项;
        const sceneResolutionHorizontalOptions = 自动场景横屏尺寸选项;
        const sceneResolutionOptions = sceneOrientation === '竖屏'
            ? sceneResolutionVerticalOptions
            : sceneResolutionHorizontalOptions;
        const currentSceneResolution = (form.功能模型占位.自动场景生图分辨率 || '').trim();
        const safeSceneResolution = currentSceneResolution || (sceneOrientation === '竖屏' ? '576x1024' : '1024x576');
        const resolvedSceneResolutionOptions = safeSceneResolution && !sceneResolutionOptions.some((item) => item.value === safeSceneResolution)
            ? [{ value: safeSceneResolution, label: `${safeSceneResolution} (当前)` }, ...sceneResolutionOptions]
            : sceneResolutionOptions;
        const handleSceneOrientationChange = (value: string) => {
            const nextOrientation = value === '竖屏' ? '竖屏' : '横屏';
            updatePlaceholder('自动场景生图横竖屏', nextOrientation);
            const nextOptions = nextOrientation === '竖屏'
                ? sceneResolutionVerticalOptions
                : sceneResolutionHorizontalOptions;
            if (!nextOptions.some((item) => item.value === currentSceneResolution)) {
                updatePlaceholder('自动场景生图分辨率', nextOptions[0]?.value || '');
            }
        };

        return (
            <div className={页面容器样式}>
                <div className={卡片样式}>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-950/10 p-4">
                        <div>
                            <div className="text-base font-bold text-sky-200">场景生图模式</div>
                        </div>
                        <ToggleSwitch
                            checked={form.功能模型占位.场景生图启用}
                            onChange={handleToggleSceneMode}
                            ariaLabel="切换场景生图模式"
                        />
                    </div>

                    <div className="rounded-xl border border-sky-900/30 bg-black/20 p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-base font-bold text-sky-200">场景独立生图接口</div>
                            </div>
                            <ToggleSwitch
                                checked={form.功能模型占位.场景生图独立接口启用}
                                onChange={handleToggleSceneIndependentImageApi}
                                ariaLabel="切换场景独立生图接口"
                            />
                        </div>

                        {form.功能模型占位.场景生图独立接口启用 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-sky-200">选择配置</label>
                                    <InlineSelect
                                        value={form.功能模型占位.场景生图使用配置ID || ''}
                                        options={文生图配置列表.map((cfg) => ({ value: cfg.id, label: cfg.名称 }))}
                                        onChange={(id) => {
                                            if (!id) {
                                                updatePlaceholder('场景生图使用配置ID', null);
                                                return;
                                            }
                                            const selected = 文生图配置列表.find((cfg) => cfg.id === id);
                                            if (selected) {
                                                updatePlaceholder('场景生图使用配置ID', id);
                                                updatePlaceholder('场景生图后端类型', selected.后端类型);
                                                updatePlaceholder('场景生图模型API地址', selected.API地址);
                                                updatePlaceholder('场景生图模型API密钥', selected.API密钥);
                                                updatePlaceholder('场景生图模型使用模型', selected.模型);
                                                updatePlaceholder('场景ComfyUI工作流JSON', selected.ComfyUI工作流JSON);
                                            }
                                        }}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                        placeholder="选择配置"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-sky-200">场景地址来源</label>
                            <InlineSelect
                                value={form.功能模型占位.场景comfyui地址模式}
                                options={[
                                    { value: 'api', label: '使用上方 API 地址' },
                                    { value: 'cnb', label: '使用 CNB ComfyUI 场景地址' }
                                ]}
                                onChange={(value) => updatePlaceholder('场景comfyui地址模式', value as 'api' | 'cnb')}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        {form.功能模型占位.场景comfyui地址模式 === 'cnb' && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">CNB ComfyUI 场景地址</label>
                                <input
                                    type="text"
                                    value={form.功能模型占位.cnbComfyui场景地址}
                                    onChange={(e) => updatePlaceholder('cnbComfyui场景地址', e.target.value)}
                                    placeholder="留空则复用上方地址"
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">场景生图可使用独立 CNB 地址，留空则复用上方地址</p>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">场景默认画风</label>
                                <InlineSelect
                                    value={form.功能模型占位.自动场景生图画风}
                                    options={[
                                        { value: '通用', label: '通用' },
                                        { value: '二次元', label: '二次元' },
                                        { value: '国风', label: '国风' },
                                        { value: '写实', label: '写实' }
                                    ]}
                                    onChange={(value) => updatePlaceholder('自动场景生图画风', value as 功能模型占位配置结构['自动场景生图画风'])}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">场景构图要求</label>
                                <InlineSelect
                                    value={form.功能模型占位.自动场景生图构图要求 || '纯场景'}
                                    options={[
                                        { value: '纯场景', label: '纯场景' },
                                        { value: '故事快照', label: '故事快照' }
                                    ]}
                                    onChange={(value) => updatePlaceholder('自动场景生图构图要求', value as 功能模型占位配置结构['自动场景生图构图要求'])}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">场景画面方向</label>
                                <InlineSelect
                                    value={sceneOrientation}
                                    options={[
                                        { value: '横屏', label: '横屏' },
                                        { value: '竖屏', label: '竖屏' }
                                    ]}
                                    onChange={handleSceneOrientationChange}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-sky-200">场景分辨率</label>
                            <InlineSelect
                                value={safeSceneResolution}
                                options={resolvedSceneResolutionOptions}
                                onChange={(value) => updatePlaceholder('自动场景生图分辨率', value)}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-sky-200">自定义分辨率</label>
                        <input
                            type="text"
                            value={safeSceneResolution}
                            onChange={(e) => updatePlaceholder('自动场景生图分辨率', e.target.value)}
                            placeholder="例如：1280x720"
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-sky-400"
                        />
                        <div className="text-xs text-sky-200/70">格式：宽x高（如 1280x720）</div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-amber-200">NPC 自动生图</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.NPC生图启用}
                        onChange={(next) => updatePlaceholder('NPC生图启用', next)}
                        ariaLabel="切换 NPC 生图"
                    />
                </div>
<div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">性别筛选</label>
                            <InlineSelect
                                value={form.功能模型占位.NPC生图性别筛选}
                                options={[
                                    { value: '全部', label: '全部' },
                                    { value: '男', label: '男' },
                                    { value: '女', label: '女' }
                                ]}
                                onChange={(value) => updatePlaceholder('NPC生图性别筛选', value as 功能模型占位配置结构['NPC生图性别筛选'])}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">重要性筛选</label>
                            <InlineSelect
                                value={form.功能模型占位.NPC生图重要性筛选}
                                options={[
                                    { value: '全部', label: '全部 NPC' },
                                    { value: '仅重要', label: '只生成重要 NPC' }
                                ]}
                                onChange={(value) => updatePlaceholder('NPC生图重要性筛选', value as 功能模型占位配置结构['NPC生图重要性筛选'])}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">NPC 默认画风</label>
                            <InlineSelect
                                value={form.功能模型占位.自动NPC生图画风}
                                options={[
                                    { value: '通用', label: '通用' },
                                    { value: '二次元', label: '二次元' },
                                    { value: '国风', label: '国风' },
                                    { value: '写实', label: '写实' }
                                ]}
                                onChange={(value) => updatePlaceholder('自动NPC生图画风', value as 功能模型占位配置结构['自动NPC生图画风'])}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 自定义 Hook：提取 renderPlayerPage 中的 useMemo 计算逻辑
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

    // 在组件顶层调用 Hook
    const playerPageData = usePlayerPageData(form, updatePlaceholder);

    const renderPlayerPage = () => {
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
        } = playerPageData;

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
            {activePage === 'automation' && renderAutomationPage()}
            {activePage === 'player' && renderPlayerPage?.()}
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
