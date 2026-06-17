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

    const renderBasicPage = () => (
        <div className={页面容器样式}>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className={卡片样式}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-base font-bold text-fuchsia-200">文生图总开关</div>
                        </div>
                        <ToggleSwitch
                            checked={form.功能模型占位.文生图功能启用}
                            onChange={(next) => updatePlaceholder('文生图功能启用', next)}
                            ariaLabel="切换文生图总开关"
                        />
                    </div>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                    <div className="text-base font-bold text-emerald-200">当前后端</div>
                    <div className="mt-2 text-xl font-serif text-white">
                        {当前文生图配置 ? 文生图后端选项.find((item) => item.value === 当前文生图配置.后端类型)?.label : '请在接口设置中配置'}
                    </div>
                </div>
            </div>

        </div>
    );

    const renderProviderPage = () => {
        if (!当前文生图配置) {
            return (
                <div className={页面容器样式}>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-center">
                        <div className="mb-4 text-lg font-bold text-fuchsia-200">暂无文生图配置</div>
                        <div className="mb-6 text-sm text-gray-400">请新建一个配置以开始使用文生图功能</div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <InlineSelect
                                value={newImageGenBackend}
                                options={文生图后端选项}
                                onChange={(value) => setNewImageGenBackend(value as 文生图后端类型)}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                            <GameButton onClick={handleCreateImageGenConfig} variant="primary">
                                新建配置
                            </GameButton>
                        </div>
                    </div>
                </div>
            );
        }

        const 当前配置后端 = 当前文生图配置.后端类型;
        const 当前配置预设路径选项 = 预设路径选项映射[当前配置后端];

        return (
            <div className={页面容器样式}>
                <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/10 p-4">
                    <div className="flex flex-1 items-center gap-2">
                        <span className="text-sm text-fuchsia-200">当前配置：</span>
                        <InlineSelect
                            value={selectedImageGenConfigId || ''}
                            options={文生图配置列表.map((cfg) => ({ value: cfg.id, label: cfg.名称 }))}
                            onChange={(id) => {
                                setSelectedImageGenConfigId(id);
                                setForm((prev) => ({
                                    ...prev,
                                    功能模型占位: {
                                        ...prev.功能模型占位,
                                        当前文生图配置ID: id
                                    }
                                }));
                            }}
                            buttonClassName="bg-black/50 border-gray-600 py-1.5 text-sm min-w-[140px]"
                            placeholder="选择配置"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <InlineSelect
                            value={newImageGenBackend}
                            options={文生图后端选项}
                            onChange={(value) => setNewImageGenBackend(value as 文生图后端类型)}
                            buttonClassName="bg-black/50 border-gray-600 py-1.5 text-sm"
                        />
                        <GameButton onClick={handleCreateImageGenConfig} variant="secondary" className="text-xs px-3 py-1.5">
                            + 新建
                        </GameButton>
                        <button
                            type="button"
                            onClick={handleDeleteImageGenConfig}
                            disabled={文生图配置列表.length <= 1}
                            className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs text-red-200 disabled:opacity-40"
                        >
                            删除
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={标签样式}>配置名称</label>
                    <input
                        type="text"
                        value={当前文生图配置.名称}
                        onChange={(e) => updateImageGenConfig({ 名称: e.target.value })}
                        className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                    />
                </div>

                <div className={卡片样式}>
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                            <label className={标签样式}>后端类型</label>
                            <InlineSelect
                                value={当前配置后端}
                                options={文生图后端选项}
                                onChange={(value) => updateImageGenConfig({ 后端类型: value as 文生图后端类型 })}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/10 px-4 py-3 text-sm text-white">
                            {文生图后端选项.find((item) => item.value === 当前配置后端)?.label}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className={标签样式}>API 地址</label>
                            <input
                                type="text"
                                value={当前文生图配置.API地址}
                                onChange={(e) => updateImageGenConfig({ API地址: e.target.value })}
                                placeholder={当前配置后端 === 'novelai'
                                    ? 'https://image.novelai.net'
                                    : 当前配置后端 === 'sd_webui'
                                        ? '例如：http://127.0.0.1:7860'
                                        : 当前配置后端 === 'comfyui'
                                            ? '例如：http://127.0.0.1:8188'
                                            : 'https://api.openai.com/v1'}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={标签样式}>{当前配置后端 === 'novelai' ? 'Persistent API Token' : 'API Key'}</label>
                            <input
                                type="password"
                                value={当前文生图配置.API密钥}
                                onChange={(e) => updateImageGenConfig({ API密钥: e.target.value })}
                                placeholder={当前配置后端 === 'novelai'
                                    ? '在 NovelAI 账户设置中生成 Persistent API Token'
                                    : 当前配置后端 === 'sd_webui' || 当前配置后端 === 'comfyui'
                                        ? '可留空；默认不会发送 Authorization'
                                        : '留空则回退当前接口配置'}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                            />
                        </div>
                    </div>
                </div>

            <div className={卡片样式}>
                {图片后端需要模型选择(当前配置后端) ? (
                    <>
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="flex-1 space-y-2">
                                <label className={标签样式}>模型名称</label>
                                <InlineSelect
                                    value={当前文生图配置.模型}
                                    onChange={(model) => updateImageGenConfig({ 模型: model })}
                                    options={文生图模型选项.map((model) => ({ value: model, label: model }))}
                                    placeholder="请选择或输入模型名"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    panelClassName="max-w-full"
                                />
                            </div>
                            <GameButton
                                onClick={() => handleFetchModels('文生图模型使用模型', '文生图模型列表')}
                                variant="secondary"
                                className="px-4 py-2 text-xs md:min-w-[96px]"
                                disabled={modelLoading.文生图模型使用模型}
                            >
                                {modelLoading.文生图模型使用模型 ? '...' : '获取列表'}
                            </GameButton>
                        </div>
                        <input
                            type="text"
                            value={当前文生图配置.模型}
                            onChange={(e) => updateImageGenConfig({ 模型: e.target.value })}
                            placeholder="例如：gpt-image-1 / nai-diffusion-4-5-full"
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                        />
                    </>
                ) : (
                    <div className="rounded-xl border border-sky-500/20 bg-sky-950/10 px-4 py-3 text-sm text-sky-100">
                        当前后端直接调用固定生图接口，不需要选择模型名称。
                    </div>
                )}
            </div>

            <div className={卡片样式}>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className={标签样式}>接口路径模式</label>
                        <InlineSelect
                            value={当前文生图配置.接口路径模式}
                            onChange={(value) => updateImageGenConfig({ 接口路径模式: value as 'preset' | 'custom' })}
                            options={接口路径模式选项}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>

                {当前文生图配置.接口路径模式 === 'preset' ? (
                    <div className="space-y-2">
                        <label className={标签样式}>预设路径</label>
                        <InlineSelect
                            value={当前文生图配置.预设接口路径}
                            onChange={(value) => updateImageGenConfig({ 预设接口路径: value as 文生图预设接口路径类型 })}
                            options={当前配置预设路径选项.map((item) => ({ value: item.value, label: item.label }))}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className={标签样式}>自定义接口路径</label>
                        <input
                            type="text"
                            value={当前文生图配置.自定义接口路径}
                            onChange={(e) => updateImageGenConfig({ 自定义接口路径: e.target.value })}
                            placeholder={当前配置后端 === 'novelai'
                                ? '/ai/generate-image'
                                : 当前配置后端 === 'sd_webui'
                                    ? '/sdapi/v1/txt2img'
                                    : 当前配置后端 === 'comfyui'
                                        ? '/prompt'
                                        : '/v1/images/generations'}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                        />
                    </div>
                )}
            </div>

            {当前配置后端 === 'openai' && (
                <div className={卡片样式}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className={标签样式}>图片响应格式</label>
                            <InlineSelect
                                value={当前文生图配置.响应格式}
                                onChange={(value) => updateImageGenConfig({ 响应格式: value as 'url' | 'b64_json' })}
                                options={[
                                    { value: 'url', label: 'URL' },
                                    { value: 'b64_json', label: 'Base64 / b64_json' }
                                ]}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/10 p-3">
                            <div className="text-sm font-bold text-fuchsia-200">OpenAI 兼容图片请求体</div>
                            <ToggleSwitch
                                checked={当前文生图配置.OpenAI自定义格式}
                                onChange={(next) => updateImageGenConfig({ OpenAI自定义格式: next })}
                                ariaLabel="切换 OpenAI 图片请求体"
                            />
                        </div>
                    </div>
                </div>
            )}

            {当前配置后端 === 'novelai' && (
                <div className="rounded-2xl border border-emerald-500/25 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),rgba(1,10,16,0.7)] p-5 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-base font-bold text-emerald-200">NovelAI 自定义参数</div>
                        <ToggleSwitch
                            checked={当前文生图配置.NovelAI启用自定义参数}
                            onChange={(next) => updateImageGenConfig({ NovelAI启用自定义参数: next })}
                            ariaLabel="切换 NovelAI 自定义参数"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-200">采样方法</label>
                            <InlineSelect
                                value={当前文生图配置.NovelAI采样器}
                                onChange={(value) => updateImageGenConfig({ NovelAI采样器: value as any })}
                                options={NovelAI采样器选项}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                disabled={!当前文生图配置.NovelAI启用自定义参数}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-200">噪点表</label>
                            <InlineSelect
                                value={当前文生图配置.NovelAI噪点表}
                                onChange={(value) => updateImageGenConfig({ NovelAI噪点表: value as any })}
                                options={NovelAI噪点表选项}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                disabled={!当前文生图配置.NovelAI启用自定义参数}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-200">步数</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={当前文生图配置.NovelAI步数}
                                onChange={(e) => updateImageGenConfig({ NovelAI步数: Math.max(1, Math.min(50, Number(e.target.value) || 28)) })}
                                disabled={!当前文生图配置.NovelAI启用自定义参数}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-200">负面提示词</label>
                        <textarea
                            value={当前文生图配置.NovelAI负面提示词}
                            onChange={(e) => updateImageGenConfig({ NovelAI负面提示词: e.target.value })}
                            rows={6}
                            disabled={!当前文生图配置.NovelAI启用自定义参数}
                            placeholder="例如：lowres, bad anatomy, text, watermark"
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-emerald-400 resize-y disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>
            )}

            {当前配置后端 === 'comfyui' && (
                <div className={卡片样式}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className={标签样式}>地址来源</label>
                            <InlineSelect
                                value={form.功能模型占位.comfyui地址模式}
                                options={[
                                    { value: 'api', label: '使用上方 API 地址' },
                                    { value: 'cnb', label: '使用 CNB ComfyUI 地址' }
                                ]}
                                onChange={(value) => updatePlaceholder('comfyui地址模式', value as 'api' | 'cnb')}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        {form.功能模型占位.comfyui地址模式 === 'cnb' && (
                            <div className="space-y-2">
                                <label className={标签样式}>CNB ComfyUI 地址</label>
                                <input
                                    type="text"
                                    value={form.功能模型占位.cnbComfyui地址}
                                    onChange={(e) => updatePlaceholder('cnbComfyui地址', e.target.value)}
                                    placeholder="例如: https://mw4lgca3zk-8188.cnb.run"
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">启动 CNB 工作区后填入此地址，将直接覆盖 API 地址用于生图</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={标签样式}>ComfyUI Workflow JSON</label>
                                <button
                                    type="button"
                                    onClick={handleLoadWorkflowFromCNB}
                                    className="rounded-md bg-cyan-600/20 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-600/30 transition-colors"
                                >
                                    从 CNB 加载
                                </button>
                            </div>
                            <textarea
                                value={当前文生图配置.ComfyUI工作流JSON}
                                onChange={(e) => updateImageGenConfig({ ComfyUI工作流JSON: e.target.value })}
                                rows={14}
                                placeholder={'粘贴从 ComfyUI 导出的 API workflow JSON。\n可用占位符：__PROMPT__、__NEGATIVE_PROMPT__、__WIDTH__、__HEIGHT__'}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 font-mono text-white outline-none transition-all focus:border-fuchsia-400 resize-y"
                            />
                        </div>
                    </div>
                    <div className="rounded-xl border border-sky-500/20 bg-sky-950/10 px-4 py-3 text-xs leading-6 text-sky-100">
                        纯原生 ComfyUI 需要 workflow JSON，提交到 <code>/prompt</code> 后再轮询 <code>/history/&#123;prompt_id&#125;</code>。
                        支持占位符：{ComfyUI工作流占位提示}
                    </div>
                </div>
            )}

            {/* CNB 工作流选择对话框 */}
            {workflowDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setWorkflowDialogOpen(false)}>
                    <div
                        className="mx-4 max-h-[80vh] w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-gray-900 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4">
                            <h3 className="text-lg font-bold text-cyan-200">从 CNB 加载工作流</h3>
                            <button
                                type="button"
                                onClick={() => setWorkflowDialogOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="px-6 py-3">
                            {workflowFilter !== 'all' && workflowList.length > 0 ? (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {['all', ...new Set(workflowList.map(w => w.category))].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setWorkflowFilter(cat)}
                                            className={`rounded-full px-3 py-1 text-xs transition-colors ${
                                                workflowFilter === cat
                                                    ? 'bg-cyan-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {cat === 'all' ? '全部' : cat}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                            {workflowLoading ? (
                                <div className="py-8 text-center text-gray-400">加载中...</div>
                            ) : workflowError ? (
                                <div className="py-4 text-center text-red-400">{workflowError}</div>
                            ) : workflowList.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">未找到工作流</div>
                            ) : (
                                <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                                    {(workflowFilter === 'all' ? workflowList : workflowList.filter(w => w.category === workflowFilter)).map((wf) => (
                                        <button
                                            key={wf.path}
                                            type="button"
                                            onClick={() => handleSelectWorkflow(wf.path, wf.name)}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 hover:border-cyan-500/50 hover:bg-gray-800 transition-colors text-left"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-white">{wf.name}</div>
                                                <div className="text-xs text-gray-500">{wf.path}</div>
                                            </div>
                                            <span className="rounded-full bg-cyan-900/50 px-2 py-0.5 text-xs text-cyan-300">{wf.category}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

    const renderTransformerPage = () => (
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

    const renderPresetsPage = () => (
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

            {activePage === 'basic' && renderBasicPage()}
            {activePage === 'provider' && renderProviderPage()}
            {activePage === 'transformer' && renderTransformerPage()}
            {activePage === 'presets' && renderPresetsPage()}
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
