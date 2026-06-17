/**
 * ImageGenerationSettings — 状态与 handlers hook
 *
 * 提取自原 ImageGenerationSettings.tsx（v3 路线图 Phase B1 PR2）。
 * 包含：17 个 useState、2 个 useRef、1 个 useEffect、所有 useMemo 派生、所有 handlers。
 * 返回对象供 renderXxxPage 通过闭包访问。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
    接口设置结构,
    功能模型占位配置结构,
    单接口配置结构,
    画师串预设结构,
    词组转化器提示词预设结构,
    PNG画风预设结构,
    文生图接口配置结构
} from '@/types';
import { 规范化接口设置 } from '../../../../utils/apiConfig';
import type { Props, 生图模型字段, 设置分页, 画师串适用页签, 词组预设页签, TestResultModal } from './types';
import {
    初始化模型列表,
    初始化加载状态,
    基础页面选项,
    文生图后端选项,
    预设路径选项映射,
    NovelAI模型建议,
    获取后端设置标签,
    图片后端需要模型选择,
    图片后端需要鉴权,
    创建文生图配置模板,
    创建空画师串预设,
    创建空词组预设,
    导出JSON文件,
    读取JSON文件
} from './helpers';

interface WorkflowItem {
    path: string;
    name: string;
    category: string;
}

interface HookReturn {
    // state
    form: 接口设置结构;
    setForm: React.Dispatch<React.SetStateAction<接口设置结构>>;
    selectedConfigId: string | null;
    setSelectedConfigId: React.Dispatch<React.SetStateAction<string | null>>;
    selectedImageGenConfigId: string | null;
    setSelectedImageGenConfigId: React.Dispatch<React.SetStateAction<string | null>>;
    newImageGenBackend: string;
    setNewImageGenBackend: React.Dispatch<React.SetStateAction<string>>;
    modelOptions: Record<生图模型字段, string[]>;
    setModelOptions: React.Dispatch<React.SetStateAction<Record<生图模型字段, string[]>>>;
    modelLoading: Record<生图模型字段, boolean>;
    setModelLoading: React.Dispatch<React.SetStateAction<Record<生图模型字段, boolean>>>;
    activePage: 设置分页;
    setActivePage: React.Dispatch<React.SetStateAction<设置分页>>;
    artistPresetScope: 画师串适用页签;
    setArtistPresetScope: React.Dispatch<React.SetStateAction<画师串适用页签>>;
    transformerPresetScope: 词组预设页签;
    setTransformerPresetScope: React.Dispatch<React.SetStateAction<词组预设页签>>;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    showSuccess: boolean;
    setShowSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    testingConnection: boolean;
    setTestingConnection: React.Dispatch<React.SetStateAction<boolean>>;
    testResultModal: TestResultModal;
    setTestResultModal: React.Dispatch<React.SetStateAction<TestResultModal>>;
    artistImportRef: React.RefObject<HTMLInputElement | null>;
    transformerImportRef: React.RefObject<HTMLInputElement | null>;
    workflowDialogOpen: boolean;
    setWorkflowDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    workflowList: WorkflowItem[];
    setWorkflowList: React.Dispatch<React.SetStateAction<WorkflowItem[]>>;
    workflowLoading: boolean;
    setWorkflowLoading: React.Dispatch<React.SetStateAction<boolean>>;
    workflowError: string;
    setWorkflowError: React.Dispatch<React.SetStateAction<string>>;
    workflowFilter: string;
    setWorkflowFilter: React.Dispatch<React.SetStateAction<string>>;
    // derived
    activeConfig: 单接口配置结构 | null;
    当前文生图配置: 文生图接口配置结构 | null;
    文生图配置列表: 文生图接口配置结构[];
    主剧情解析模型: string;
    当前后端: string;
    当前场景后端: string;
    当前预设路径选项: Array<{ value: string; label: string }>;
    当前预设路径值集合: Set<string>;
    当前预设路径: string;
    文生图模型选项: string[];
    词组转化器模型选项: string[];
    PNG提炼模型选项: string[];
    场景文生图模型选项: string[];
    可见页面: Array<{ value: 设置分页; label: string }>;
    是否强制启用词组转化器: boolean;
    artistPresets: 画师串预设结构[];
    scopedArtistPresets: 画师串预设结构[];
    currentArtistPresetId: string | undefined;
    pngStylePresets: PNG画风预设结构[];
    currentAutoPngPresetId: string | undefined;
    selectedArtistPreset: 画师串预设结构 | null;
    transformerPresets: 词组转化器提示词预设结构[];
    scopedTransformerPresets: 词组转化器提示词预设结构[];
    currentTransformerPresetId: string | undefined;
    selectedTransformerPreset: 词组转化器提示词预设结构 | null;
    // handlers
    updateImageGenConfig: (patch: Partial<文生图接口配置结构>) => void;
    handleCreateImageGenConfig: () => void;
    handleDeleteImageGenConfig: () => void;
    handleLoadWorkflowFromCNB: () => Promise<void>;
    handleSelectWorkflow: (workflowPath: string, workflowName: string) => Promise<void>;
    updatePlaceholder: <K extends keyof 功能模型占位配置结构>(key: K, value: 功能模型占位配置结构[K]) => void;
    updateArtistPreset: (presetId: string, updater: (preset: 画师串预设结构) => 画师串预设结构) => void;
    updateTransformerPreset: (presetId: string, updater: (preset: 词组转化器提示词预设结构) => 词组转化器提示词预设结构) => void;
    handleAddArtistPreset: () => void;
    handleDeleteArtistPreset: () => void;
    handleAddTransformerPreset: () => void;
    handleDeleteTransformerPreset: () => void;
    handleBackendChange: (value: string) => void;
    handleToggleTransformerIndependent: (checked: boolean) => void;
    handleToggleSceneMode: (checked: boolean) => void;
    handleToggleSceneIndependentImageApi: (checked: boolean) => void;
    更新当前画师串预设ID: (scope: 画师串适用页签, presetId: string) => void;
    更新当前PNG预设ID: (scope: 画师串适用页签, presetId: string) => void;
    更新当前词组预设ID: (scope: 词组预设页签, presetId: string) => void;
    fetchModelsFromCurrentConfig: (key: 生图模型字段) => Promise<string[] | null>;
    handleFetchModels: (key: 生图模型字段, label: string) => Promise<void>;
    handleTestImageConnection: (config: 文生图接口配置结构) => Promise<void>;
    handleExportArtistPresets: () => void;
    handleExportTransformerPresets: () => void;
    handleImportArtistPresets: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleImportTransformerPresets: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleSave: () => void;
}

export function useImageGenSettings({ settings, onSave }: Props): HookReturn {
    const [form, setForm] = useState<接口设置结构>(() => 规范化接口设置(settings));
    const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
    const [selectedImageGenConfigId, setSelectedImageGenConfigId] = useState<string | null>(null);
    const [newImageGenBackend, setNewImageGenBackend] = useState<string>('openai');
    const [modelOptions, setModelOptions] = useState<Record<生图模型字段, string[]>>(初始化模型列表);
    const [modelLoading, setModelLoading] = useState<Record<生图模型字段, boolean>>(初始化加载状态);
    const [activePage, setActivePage] = useState<设置分页>('basic');
    const [artistPresetScope, setArtistPresetScope] = useState<画师串适用页签>('npc');
    const [transformerPresetScope, setTransformerPresetScope] = useState<词组预设页签>('nai');
    const [message, setMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResultModal, setTestResultModal] = useState<TestResultModal>({ open: false, title: '', content: '', ok: false });
    const artistImportRef = useRef<HTMLInputElement | null>(null);
    const transformerImportRef = useRef<HTMLInputElement | null>(null);
    const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
    const [workflowList, setWorkflowList] = useState<WorkflowItem[]>([]);
    const [workflowLoading, setWorkflowLoading] = useState(false);
    const [workflowError, setWorkflowError] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState<string>('all');

    useEffect(() => {
        const normalized = 规范化接口设置(settings);
        setForm(normalized);
        setSelectedConfigId(normalized.activeConfigId || normalized.configs[0]?.id || null);
        const imgConfigs = normalized.功能模型占位.文生图配置列表 || [];
        setSelectedImageGenConfigId(normalized.功能模型占位.当前文生图配置ID || imgConfigs[0]?.id || null);
        setModelOptions(初始化模型列表());
        setModelLoading(初始化加载状态());
        setActivePage('basic');
        setArtistPresetScope('npc');
        setTransformerPresetScope('nai');
    }, [settings]);

    const activeConfig = useMemo<单接口配置结构 | null>(() => {
        if (!form.configs.length) return null;
        return form.configs.find((cfg) => cfg.id === selectedConfigId) || form.configs[0] || null;
    }, [form.configs, selectedConfigId]);

    const 文生图配置列表 = form.功能模型占位.文生图配置列表 || [];
    const 当前文生图配置 = useMemo<文生图接口配置结构 | null>(() => {
        if (!文生图配置列表.length) return null;
        return 文生图配置列表.find((cfg) => cfg.id === selectedImageGenConfigId) || 文生图配置列表[0] || null;
    }, [文生图配置列表, selectedImageGenConfigId]);

    const updateImageGenConfig = (patch: Partial<文生图接口配置结构>) => {
        if (!当前文生图配置) return;
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                文生图配置列表: prev.功能模型占位.文生图配置列表.map((cfg) =>
                    cfg.id === 当前文生图配置.id ? { ...cfg, ...patch, updatedAt: Date.now() } : cfg
                )
            }
        }));
    };

    const handleCreateImageGenConfig = () => {
        const created = 创建文生图配置模板(newImageGenBackend as any);
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                文生图配置列表: [...(prev.功能模型占位.文生图配置列表 || []), created],
                当前文生图配置ID: created.id
            }
        }));
        setSelectedImageGenConfigId(created.id);
        setMessage(`已新增 ${文生图后端选项.find(b => b.value === newImageGenBackend)?.label || newImageGenBackend} 配置，请填写后保存。`);
    };

    const handleDeleteImageGenConfig = () => {
        if (!当前文生图配置) return;
        setForm((prev) => {
            const remaining = (prev.功能模型占位.文生图配置列表 || []).filter((cfg) => cfg.id !== 当前文生图配置.id);
            const fallbackId = remaining[0]?.id || null;
            setSelectedImageGenConfigId(fallbackId);
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    文生图配置列表: remaining,
                    当前文生图配置ID: fallbackId
                }
            };
        });
        setMessage('配置已删除。');
    };

    const handleLoadWorkflowFromCNB = async () => {
        setWorkflowDialogOpen(true);
        setWorkflowLoading(true);
        setWorkflowError('');
        setWorkflowFilter('all');
        try {
            const res = await fetch('/api/comfyui-workflows?action=list');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setWorkflowList(data.workflows || []);
        } catch (err: unknown) {
            setWorkflowError(`加载工作流列表失败: ${err instanceof Error ? err.message : String(err)}`);
            setWorkflowList([]);
        } finally {
            setWorkflowLoading(false);
        }
    };

    const handleSelectWorkflow = async (workflowPath: string, workflowName: string) => {
        setWorkflowLoading(true);
        setWorkflowError('');
        try {
            const res = await fetch(`/api/comfyui-workflows?action=get&file=${encodeURIComponent(workflowPath)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.workflow) {
                updateImageGenConfig({ ComfyUI工作流JSON: JSON.stringify(data.workflow, null, 2) });
                setWorkflowDialogOpen(false);
                setMessage(`已加载工作流: ${workflowName}`);
            } else {
                setWorkflowError('获取工作流失败: 返回为空');
            }
        } catch (err: unknown) {
            setWorkflowError(`加载工作流失败: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setWorkflowLoading(false);
        }
    };

    const 主剧情解析模型 = useMemo(() => {
        return (activeConfig?.model || '').trim() || (form.功能模型占位.主剧情使用模型 || '').trim();
    }, [activeConfig?.model, form.功能模型占位.主剧情使用模型]);

    const 当前后端 = form.功能模型占位.文生图后端类型;
    const 当前场景后端 = form.功能模型占位.场景生图独立接口启用
        ? form.功能模型占位.场景生图后端类型
        : 当前后端;
    const 当前预设路径选项 = 预设路径选项映射[当前后端];
    const 当前预设路径值集合 = new Set(当前预设路径选项.map((item) => item.value));
    const 当前预设路径 = 当前预设路径值集合.has(form.功能模型占位.文生图预设接口路径)
        ? form.功能模型占位.文生图预设接口路径
        : 当前预设路径选项[0]?.value || 'openai_images';
    const 文生图模型选项 = Array.from(new Set(
        (当前后端 === 'novelai' ? NovelAI模型建议 : [])
            .concat(modelOptions.文生图模型使用模型, form.功能模型占位.文生图模型使用模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const 词组转化器模型选项 = Array.from(new Set(
        modelOptions.词组转化器使用模型
            .concat(form.功能模型占位.词组转化器使用模型, 主剧情解析模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const PNG提炼模型选项 = Array.from(new Set(
        modelOptions.PNG提炼使用模型
            .concat(form.功能模型占位.PNG提炼使用模型, 主剧情解析模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const 场景文生图模型选项 = Array.from(new Set(
        (当前场景后端 === 'novelai' ? NovelAI模型建议 : [])
            .concat(modelOptions.场景生图模型使用模型, form.功能模型占位.场景生图模型使用模型, form.功能模型占位.文生图模型使用模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const 可见页面 = useMemo(() => 基础页面选项.map((item) => (
        item.value === 'provider'
            ? { ...item, label: 获取后端设置标签(当前后端) }
            : item
    )), [当前后端]);
    const 是否强制启用词组转化器 = 当前后端 === 'novelai';
    const artistPresets = useMemo(
        () => (Array.isArray(form.功能模型占位.画师串预设列表) ? form.功能模型占位.画师串预设列表 : [])
            .filter((item) => item && typeof item.id === 'string' && !item.id.startsWith('png_artist_')),
        [form.功能模型占位.画师串预设列表]
    );
    const scopedArtistPresets = useMemo(() => artistPresets.filter((item) => item.适用范围 === artistPresetScope || item.适用范围 === 'all'), [artistPresets, artistPresetScope]);
    const currentArtistPresetId = artistPresetScope === 'scene'
        ? form.功能模型占位.当前场景画师串预设ID
        : form.功能模型占位.当前NPC画师串预设ID;
    const pngStylePresets = useMemo<PNG画风预设结构[]>(
        () => Array.isArray(form.功能模型占位.PNG画风预设列表) ? form.功能模型占位.PNG画风预设列表 : [],
        [form.功能模型占位.PNG画风预设列表]
    );
    const currentAutoPngPresetId = artistPresetScope === 'scene'
        ? form.功能模型占位.当前场景PNG画风预设ID
        : form.功能模型占位.当前NPCPNG画风预设ID;
    const selectedArtistPreset = scopedArtistPresets.find((item) => item.id === currentArtistPresetId)
        || scopedArtistPresets[0]
        || null;
    const transformerPresets = useMemo(() => Array.isArray(form.功能模型占位.词组转化器提示词预设列表) ? form.功能模型占位.词组转化器提示词预设列表 : [], [form.功能模型占位.词组转化器提示词预设列表]);
    const scopedTransformerPresets = useMemo(() => transformerPresets.filter((item) => item.类型 === transformerPresetScope), [transformerPresets, transformerPresetScope]);
    const currentTransformerPresetId = transformerPresetScope === 'nai'
        ? form.功能模型占位.当前NAI词组转化器提示词预设ID
        : transformerPresetScope === 'scene'
            ? form.功能模型占位.当前场景词组转化器提示词预设ID
            : form.功能模型占位.当前NPC词组转化器提示词预设ID;
    const selectedTransformerPreset = scopedTransformerPresets.find((item) => item.id === currentTransformerPresetId)
        || scopedTransformerPresets[0]
        || null;

    const updatePlaceholder = <K extends keyof 功能模型占位配置结构>(key: K, value: 功能模型占位配置结构[K]) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                [key]: value
            }
        }));
    };

    const updateArtistPreset = (presetId: string, updater: (preset: 画师串预设结构) => 画师串预设结构) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                画师串预设列表: (prev.功能模型占位.画师串预设列表 || []).map((item) =>
                    item.id === presetId ? updater(item) : item
                )
            }
        }));
    };

    const updateTransformerPreset = (presetId: string, updater: (preset: 词组转化器提示词预设结构) => 词组转化器提示词预设结构) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                词组转化器提示词预设列表: (prev.功能模型占位.词组转化器提示词预设列表 || []).map((item) =>
                    item.id === presetId ? updater(item) : item
                )
            }
        }));
    };

    const handleAddArtistPreset = () => {
        const newPreset = 创建空画师串预设(artistPresetScope);
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                画师串预设列表: [...(prev.功能模型占位.画师串预设列表 || []), newPreset]
            }
        }));
        setMessage(`已新建 ${newPreset.名称}。`);
    };

    const handleDeleteArtistPreset = () => {
        if (!selectedArtistPreset) return;
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                画师串预设列表: (prev.功能模型占位.画师串预设列表 || []).filter((item) => item.id !== selectedArtistPreset.id),
                当前NPC画师串预设ID: prev.功能模型占位.当前NPC画师串预设ID === selectedArtistPreset.id ? undefined : prev.功能模型占位.当前NPC画师串预设ID,
                当前场景画师串预设ID: prev.功能模型占位.当前场景画师串预设ID === selectedArtistPreset.id ? undefined : prev.功能模型占位.当前场景画师串预设ID
            }
        }));
        setMessage(`画师串预设 "${selectedArtistPreset.名称}" 已删除。`);
    };

    const handleAddTransformerPreset = () => {
        const newPreset = 创建空词组预设(transformerPresetScope);
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                词组转化器提示词预设列表: [...(prev.功能模型占位.词组转化器提示词预设列表 || []), newPreset]
            }
        }));
        setMessage(`已新建 ${newPreset.名称}。`);
    };

    const handleDeleteTransformerPreset = () => {
        if (!selectedTransformerPreset) return;
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                词组转化器提示词预设列表: (prev.功能模型占位.词组转化器提示词预设列表 || []).filter((item) => item.id !== selectedTransformerPreset.id),
                当前NAI词组转化器提示词预设ID: prev.功能模型占位.当前NAI词组转化器提示词预设ID === selectedTransformerPreset.id ? undefined : prev.功能模型占位.当前NAI词组转化器提示词预设ID,
                当前NPC词组转化器提示词预设ID: prev.功能模型占位.当前NPC词组转化器提示词预设ID === selectedTransformerPreset.id ? undefined : prev.功能模型占位.当前NPC词组转化器提示词预设ID,
                当前场景词组转化器提示词预设ID: prev.功能模型占位.当前场景词组转化器提示词预设ID === selectedTransformerPreset.id ? undefined : prev.功能模型占位.当前场景词组转化器提示词预设ID
            }
        }));
        setMessage(`词组转化器预设 "${selectedTransformerPreset.名称}" 已删除。`);
    };

    const handleBackendChange = (value: string) => {
        const fallbackPreset = 预设路径选项映射[value as keyof typeof 预设路径选项映射][0]?.value || 'openai_images';
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                文生图后端类型: value as any,
                文生图预设接口路径: fallbackPreset as any,
                NPC生图使用词组转化器: value === 'novelai' ? true : prev.功能模型占位.NPC生图使用词组转化器,
                文生图模型API地址: value === 'novelai' && !prev.功能模型占位.文生图模型API地址.trim()
                    ? 'https://image.novelai.net'
                    : prev.功能模型占位.文生图模型API地址,
                文生图OpenAI自定义格式: value === 'openai' ? prev.功能模型占位.文生图OpenAI自定义格式 : false,
                文生图响应格式: value === 'openai' ? prev.功能模型占位.文生图响应格式 : 'url'
            }
        }));
        if (activePage === 'provider') setActivePage('provider');
    };

    const handleToggleTransformerIndependent = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.词组转化器使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    词组转化器启用独立模型: checked,
                    词组转化器使用模型: checked ? (currentModel || 主剧情解析模型 || '') : ''
                }
            };
        });
    };

    const handleToggleSceneMode = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.词组转化器使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    场景生图启用: checked,
                    词组转化器启用独立模型: checked ? true : prev.功能模型占位.词组转化器启用独立模型,
                    词组转化器使用模型: checked
                        ? (currentModel || 主剧情解析模型 || '')
                        : prev.功能模型占位.词组转化器使用模型
                }
            };
        });
    };

    const handleToggleSceneIndependentImageApi = (checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                场景生图独立接口启用: checked,
                场景生图使用配置ID: checked ? prev.功能模型占位.场景生图使用配置ID : null,
                场景生图后端类型: checked
                    ? prev.功能模型占位.场景生图后端类型
                    : prev.功能模型占位.场景生图后端类型,
                场景生图模型使用模型: checked
                    ? ((prev.功能模型占位.场景生图模型使用模型 || '').trim() || (prev.功能模型占位.文生图模型使用模型 || '').trim())
                    : prev.功能模型占位.场景生图模型使用模型,
                场景生图模型API地址: checked
                    ? ((prev.功能模型占位.场景生图模型API地址 || '').trim() || (prev.功能模型占位.文生图模型API地址 || '').trim())
                    : prev.功能模型占位.场景生图模型API地址,
                场景生图模型API密钥: checked
                    ? ((prev.功能模型占位.场景生图模型API密钥 || '').trim() || (prev.功能模型占位.文生图模型API密钥 || '').trim())
                    : prev.功能模型占位.场景生图模型API密钥
            }
        }));
    };

    const 更新当前画师串预设ID = (scope: 画师串适用页签, presetId: string) => {
        updatePlaceholder(scope === 'scene' ? '当前场景画师串预设ID' : '当前NPC画师串预设ID', presetId);
    };

    const 更新当前PNG预设ID = (scope: 画师串适用页签, presetId: string) => {
        updatePlaceholder(scope === 'scene' ? '当前场景PNG画风预设ID' : '当前NPCPNG画风预设ID', presetId);
    };

    const 更新当前词组预设ID = (scope: 词组预设页签, presetId: string) => {
        if (scope === 'nai') {
            updatePlaceholder('当前NAI词组转化器提示词预设ID', presetId);
            return;
        }
        if (scope === 'scene') {
            updatePlaceholder('当前场景词组转化器提示词预设ID', presetId);
            return;
        }
        updatePlaceholder('当前NPC词组转化器提示词预设ID', presetId);
    };

    const fetchModelsFromCurrentConfig = async (key: 生图模型字段): Promise<string[] | null> => {
        const feature = form.功能模型占位;

        const isProviderTab = key === '文生图模型使用模型' && !feature.场景生图独立接口启用;

        const providerConfig = isProviderTab ? 当前文生图配置 : null;

        const sceneBackend = feature.场景生图独立接口启用 ? feature.场景生图后端类型 : feature.文生图后端类型;
        const targetBackend = key === '文生图模型使用模型'
            ? (isProviderTab && providerConfig ? providerConfig.后端类型 : feature.文生图后端类型)
            : key === '场景生图模型使用模型'
                ? sceneBackend
                : feature.文生图后端类型;
        const customBaseUrl = key === '文生图模型使用模型'
            ? isProviderTab
                ? (providerConfig?.API地址 || '').trim()
                : (feature.文生图模型API地址 || '').trim()
            : key === '场景生图模型使用模型'
                ? ((feature.场景生图独立接口启用 ? feature.场景生图模型API地址 : feature.文生图模型API地址) || '').trim()
                : key === 'PNG提炼使用模型'
                    ? ((feature.PNG提炼启用独立模型 ? feature.PNG提炼API地址 : '') || '').trim()
                    : ((feature.词组转化器启用独立模型 ? feature.词组转化器API地址 : '') || '').trim();
        const customApiKey = key === '文生图模型使用模型'
            ? isProviderTab
                ? (providerConfig?.API密钥 || '').trim()
                : (feature.文生图模型API密钥 || '').trim()
            : key === '场景生图模型使用模型'
                ? ((feature.场景生图独立接口启用 ? feature.场景生图模型API密钥 : feature.文生图模型API密钥) || '').trim()
                : key === 'PNG提炼使用模型'
                    ? ((feature.PNG提炼启用独立模型 ? feature.PNG提炼API密钥 : '') || '').trim()
                    : ((feature.词组转化器启用独立模型 ? feature.词组转化器API密钥 : '') || '').trim();
        const canReuseMainConnection = key !== '场景生图模型使用模型' || !feature.场景生图独立接口启用 || sceneBackend === feature.文生图后端类型;
        const resolvedBaseUrl = customBaseUrl || (canReuseMainConnection ? (activeConfig?.baseUrl || '').trim() : '');
        const resolvedApiKey = customApiKey || (canReuseMainConnection ? (activeConfig?.apiKey || '').trim() : '');
        const targetNeedsModel = key === '词组转化器使用模型' || key === 'PNG提炼使用模型'
            ? true
            : 图片后端需要模型选择(targetBackend);
        const targetNeedsAuth = key === '词组转化器使用模型' || key === 'PNG提炼使用模型'
            ? true
            : 图片后端需要鉴权(targetBackend);

        if (!targetNeedsModel) {
            setMessage(`${文生图后端选项.find((item) => item.value === targetBackend)?.label || '当前后端'}不需要模型选择，也不提供模型列表。`);
            return null;
        }
        if (!resolvedBaseUrl || (targetNeedsAuth && !resolvedApiKey)) {
            setMessage(key === 'PNG提炼使用模型'
                ? '请先填写 PNG 提炼 API 地址与 API Key。'
                : (targetBackend === 'novelai' ? '请先填写 API 地址与 Persistent API Token。' : '请先填写 API 地址与 API Key。'));
            return null;
        }
        try {
            if (targetBackend === 'novelai' && (key === '文生图模型使用模型' || key === '场景生图模型使用模型')) return NovelAI模型建议;
            const base = resolvedBaseUrl.replace(/\/+$/, '');
            const normalized = base.replace(/\/v1$/i, '');
            const candidateUrls = Array.from(new Set([
                `${normalized}/v1/models`,
                `${normalized}/models`,
                `${base}/models`
            ]));
            for (const url of candidateUrls) {
                const res = await fetch(url, {
                    headers: targetNeedsAuth ? { Authorization: `Bearer ${resolvedApiKey}` } : undefined
                });
                if (!res.ok) continue;
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    return data.data.map((m: any) => m?.id).filter(Boolean);
                }
            }
            setMessage(`获取模型列表失败：${resolvedBaseUrl}`);
            return null;
        } catch (e: any) {
            setMessage(`获取模型列表失败：${e.message}`);
            return null;
        }
    };

    const handleFetchModels = async (key: 生图模型字段, label: string) => {
        setModelLoading((prev) => ({ ...prev, [key]: true }));
        setMessage('');
        const result = await fetchModelsFromCurrentConfig(key);
        if (result) {
            setModelOptions((prev) => ({ ...prev, [key]: result }));
            setMessage(`${label}获取成功`);
        }
        setModelLoading((prev) => ({ ...prev, [key]: false }));
    };

    const handleTestImageConnection = async (config: 文生图接口配置结构) => {
        const backendType = config.后端类型;
        const isCnbMode = backendType === 'comfyui' && form.功能模型占位.comfyui地址模式 === 'cnb';
        const resolvedBaseUrl = isCnbMode
            ? (form.功能模型占位.cnbComfyui地址?.trim() || '')
            : (config.API地址?.trim() || '');
        const hasBaseUrl = Boolean(resolvedBaseUrl);
        const needsApiKey = backendType === 'openai' || backendType === 'grok' || backendType === 'novelai';
        const needsModel = backendType === 'openai' || backendType === 'grok' || backendType === 'novelai';
        const needsWorkflow = backendType === 'comfyui';

        const missingChecks: string[] = [];
        if (!hasBaseUrl) missingChecks.push(isCnbMode ? 'CNB ComfyUI 地址' : 'API 地址');
        if (needsApiKey && !config.API密钥?.trim()) missingChecks.push('API 密钥');
        if (needsModel && !config.模型?.trim()) missingChecks.push('模型名称');
        if (needsWorkflow && !config.ComfyUI工作流JSON?.trim()) missingChecks.push('ComfyUI 工作流 JSON');
        if (missingChecks.length > 0) {
            setMessage(`请先填写: ${missingChecks.join('、')}`);
            return;
        }

        setMessage('');
        setTestingConnection(true);
        try {
            const imageAIService = await import('../../../../services/ai/image');
            const result = await imageAIService.testImageConnection({
                id: config.id,
                名称: config.名称,
                供应商: backendType === 'grok' ? 'grok' : 'openai',
                baseUrl: resolvedBaseUrl,
                apiKey: config.API密钥?.trim() || '',
                model: config.模型?.trim() || '',
                图片后端类型: backendType,
                图片接口路径: config.接口路径模式 === 'custom' ? config.自定义接口路径 : undefined,
                图片接口路径模式: config.接口路径模式,
                图片响应格式: config.响应格式,
                图片走OpenAI自定义格式: config.OpenAI自定义格式 === true,
                ComfyUI工作流JSON: config.ComfyUI工作流JSON
            });
            const backendLabel = 文生图后端选项.find((o) => o.value === result.backendType)?.label || result.backendType;
            const addressLabel = isCnbMode ? `CNB 地址: ${form.功能模型占位.cnbComfyui地址}` : `API 地址: ${config.API地址}`;
            const meta = [
                `配置: ${config.名称 || config.id}`,
                `后端: ${backendLabel}`,
                addressLabel,
                '',
                '---',
                '',
                result.detail
            ].join('\n');
            setTestResultModal({
                open: true,
                title: result.ok ? '连接测试成功' : '连接测试失败',
                content: meta,
                ok: result.ok
            });
        } catch (e: any) {
            setTestResultModal({
                open: true,
                title: '连接测试失败',
                content: String(e?.message || '未知错误'),
                ok: false
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const handleExportArtistPresets = () => {
        导出JSON文件('artist-presets.json', {
            version: 1,
            type: 'artist_prompt_presets',
            presets: artistPresets
        });
        setMessage('画师串预设已导出。');
    };

    const handleExportTransformerPresets = () => {
        导出JSON文件('transformer-presets.json', {
            version: 1,
            type: 'transformer_prompt_presets',
            presets: transformerPresets
        });
        setMessage('词组转化器预设已导出。');
    };

    const handleImportArtistPresets = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = await 读取JSON文件(file) as any;
            const presets = Array.isArray(parsed?.presets) ? parsed.presets : [];
            const normalized = 规范化接口设置({
                ...form,
                功能模型占位: {
                    ...form.功能模型占位,
                    画师串预设列表: presets
                }
            });
            setForm(normalized);
            setMessage(`已导入 ${normalized.功能模型占位.画师串预设列表.length} 条画师串预设。`);
        } catch (error: any) {
            setMessage(`导入画师串预设失败：${error?.message || '文件格式错误'}`);
        } finally {
            event.target.value = '';
        }
    };

    const handleImportTransformerPresets = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = await 读取JSON文件(file) as any;
            const presets = Array.isArray(parsed?.presets) ? parsed.presets : [];
            const normalized = 规范化接口设置({
                ...form,
                功能模型占位: {
                    ...form.功能模型占位,
                    词组转化器提示词预设列表: presets
                }
            });
            setForm(normalized);
            setMessage(`已导入 ${normalized.功能模型占位.词组转化器提示词预设列表.length} 条词组转化器预设。`);
        } catch (error: any) {
            setMessage(`导入词组转化器预设失败：${error?.message || '文件格式错误'}`);
        } finally {
            event.target.value = '';
        }
    };

    const handleSave = () => {
        const normalized = 规范化接口设置({
            ...form,
            activeConfigId: selectedConfigId || form.activeConfigId,
            功能模型占位: {
                ...form.功能模型占位,
                词组转化器提示词: '',
                NPC生图使用词组转化器: 当前后端 === 'novelai' ? true : form.功能模型占位.NPC生图使用词组转化器
            }
        });
        onSave(normalized);
        setForm(normalized);
        setSelectedConfigId(normalized.activeConfigId || normalized.configs[0]?.id || null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return {
        // state
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
        // derived
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
        // handlers
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
    };
}
