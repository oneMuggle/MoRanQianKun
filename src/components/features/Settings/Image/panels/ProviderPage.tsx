/**
 * ImageGenerationSettings — 接口设置页 panel
 *
 * v3 路线图 Phase B1 PR4a：从主文件抽出 renderProviderPage。
 */

import React from 'react';
import GameButton from '../../../../ui/GameButton';
import ToggleSwitch from '../../../../ui/ToggleSwitch';
import InlineSelect from '../../../../ui/InlineSelect';
import type { useImageGenSettings } from '../useImageGenSettings';
import type { 文生图后端类型, 文生图预设接口路径类型 } from '@/types';
import {
    文生图后端选项,
    接口路径模式选项,
    预设路径选项映射,
    NovelAI采样器选项,
    NovelAI噪点表选项,
    图片后端需要模型选择,
    ComfyUI工作流占位提示,
    页面容器样式,
    卡片样式,
    标签样式
} from '../helpers';

type HookReturn = ReturnType<typeof useImageGenSettings>;

export const ProviderPage: React.FC<HookReturn> = (state) => {
    const {
        form, setForm,
        newImageGenBackend, setNewImageGenBackend,
        modelLoading,
        selectedImageGenConfigId, setSelectedImageGenConfigId,
        当前文生图配置, 文生图配置列表,
        文生图模型选项,
        workflowDialogOpen, setWorkflowDialogOpen,
        workflowList, workflowLoading, workflowError, workflowFilter, setWorkflowFilter,
        updateImageGenConfig, updatePlaceholder,
        handleCreateImageGenConfig, handleDeleteImageGenConfig,
        handleLoadWorkflowFromCNB, handleSelectWorkflow, handleFetchModels
    } = state;

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

export default ProviderPage;
