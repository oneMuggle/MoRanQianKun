/**
 * ImageGenerationSettings — 自动任务页 panel
 *
 * v3 路线图 Phase B1 PR4b：从主文件抽出 renderAutomationPage。
 */

import React from 'react';
import ToggleSwitch from '../../../../ui/ToggleSwitch';
import InlineSelect from '../../../../ui/InlineSelect';
import type { useImageGenSettings } from '../useImageGenSettings';
import type { 功能模型占位配置结构 } from '@/types';
import { 自动场景横屏尺寸选项, 自动场景竖屏尺寸选项 } from '../../../../../utils/imageSizeOptions';
import { 页面容器样式, 卡片样式 } from '../helpers';

type HookReturn = ReturnType<typeof useImageGenSettings>;

export const AutomationPage: React.FC<HookReturn> = (state) => {
    const {
        form, updatePlaceholder,
        handleToggleSceneMode, handleToggleSceneIndependentImageApi,
        文生图配置列表
    } = state;

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

export default AutomationPage;
