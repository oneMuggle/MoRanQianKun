import { useCallback, useRef, useState } from 'react';
import type {
    NPC结构,
    NPC生图任务记录,
    香闺秘档部位类型,
    生图任务来源类型
} from '../../types';
import type { 当前可用接口结构 } from '../../utils/apiConfig';
import * as dbService from '../../services/dbService';
import { 规范化游戏设置 } from '../../utils/gameSettings';
import { 规范化社交列表 } from './stateTransforms';
import { 规范化接口设置 } from '../../utils/apiConfig';
import { 构建文生图运行时额外提示词 } from '../../prompts/runtime/nsfw';
import { 创建NPC图片状态工作流, 生成NPC生图记录ID } from './image/npcImageStateWorkflow';
import { 创建手动NPC工作流 } from './npc/manualNpcWorkflow';

const 加载图片AI服务 = () => import('../../services/ai/image/runtime');
const 加载NPC生图工作流 = () => import('./image/npcImageWorkflow');
const 加载NPC香闺秘档生图工作流 = () => import('./image/npcSecretImageWorkflow');

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const 获取NPC唯一标识 = (npc: any, index?: number): string => {
    const id = typeof npc?.id === 'string' ? npc.id.trim() : '';
    if (id) return `id:${id}`;
    const name = typeof npc?.姓名 === 'string' ? npc.姓名.trim() : '';
    if (name) return `name:${name}`;
    return `index:${index ?? -1}`;
};

function 规范化社交列表安全(raw?: any[], options?: { 合并同名?: boolean }) {
    const list = Array.isArray(raw) ? raw : [];
    return 规范化社交列表(list, options);
}

// ---------------------------------------------------------------------------
// Dependency interface
// ---------------------------------------------------------------------------

export interface NPCWorkflowDeps {
    // State
    社交: unknown;
    gameConfig: unknown;
    apiConfig: unknown;
    imageManagerConfig: unknown;
    visualConfig: unknown;
    角色: unknown;
    环境: unknown;
    历史记录: unknown;
    通知系统: { 推送右下角提示: (msg: string) => void };

    // Setters
    设置社交: (updater: any) => void;

    // Refs
    NPC生图进行中Ref: React.MutableRefObject<Set<string>>;
    NPC香闺秘档生图进行中Ref: React.MutableRefObject<Set<string>>;
    后台手动生图监控Ref: React.MutableRefObject<Array<{ npcId: string; since: number; npcName: string; 构图: '头像' | '半身' | '立绘' }>>;
    后台私密生图监控Ref: React.MutableRefObject<Array<{ npcId: string; since: number; npcName: string; 部位: 香闺秘档部位类型 }>>;

    // Helpers
    深拷贝: <T>(data: T) => T;
    环境时间转标准串: (env: any) => string;
    提取NPC生图基础数据: (npc: any, opts: { cultivationSystemEnabled: boolean }) => any;
    提取NPC香闺秘档部位生图数据: (npc: any, part: 香闺秘档部位类型, opts: { cultivationSystemEnabled: boolean }) => any;
    按NPC读取角色锚点: (npcId: string) => any;
    获取文生图接口配置: (cfg: any) => any;
    获取生图词组转化器接口配置: (cfg: any) => any;
    获取生图画师串预设: (cfg: any) => any;
    获取当前PNG画风预设摘要: (presetId: string | undefined, mode: 'npc' | 'scene') => any;
    获取词组转化器预设提示词: (cfg: any) => string;
    接口配置是否可用: (cfg: any) => boolean;
    场景模式已开启: (cfg: any) => boolean;

    // Auto-save
    performAutoSave: (...args: any[]) => void;
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface NPCWorkflowReturn {
    // NPC image state workflow
    更新NPC最近生图结果: (npcKey: string, updater: (npc: any) => any) => void;
    写入NPC图片历史记录: (npcKey: string, record: any, options?: { 同步最近结果?: boolean }) => void;
    更新NPC香闺秘档部位结果: (npcKey: string, part: 香闺秘档部位类型, updater: (current: any) => any) => void;
    获取生图阶段中文: (stage?: NPC生图任务记录['进度阶段']) => string;
    创建NPC生图任务: (params: {
        npc: any; npcKey: string; source: any; modelName: string;
        构图: '头像' | '半身' | '立绘' | '部位特写'; 部位?: 香闺秘档部位类型;
        画风?: any; 画师串?: string; 额外要求?: string; 尺寸?: string;
    }) => NPC生图任务记录;
    追加NPC生图任务: (task: NPC生图任务记录) => void;
    更新NPC生图任务: (taskId: string, updater: (task: NPC生图任务记录) => NPC生图任务记录) => void;
    删除NPC生图任务: (taskId: string) => void;
    清空NPC生图任务队列: (mode?: 'all' | 'completed') => void;
    删除NPC图片记录: (npcId: string, imageId: string) => void;
    清空NPC图片历史: (npcId?: string) => void;
    选择NPC头像图片: (npcId: string, imageId: string) => void;
    清除NPC头像图片: (npcId: string) => void;
    选择NPC立绘图片: (npcId: string, imageId: string) => void;
    清除NPC立绘图片: (npcId: string) => void;
    选择NPC背景图片: (npcId: string, imageId: string) => void;
    清除NPC背景图片: (npcId: string) => void;
    保存NPC图片本地副本: (npcId: string, imageId: string) => Promise<void>;

    // Manual NPC CRUD
    createNpcManually: (seed?: Partial<NPC结构>) => NPC结构;
    updateNpcManually: (npcId: string, nextNpc: NPC结构) => void;
    deleteNpcManually: (npcId: string) => void;
    uploadNpcImageToSlot: (npcId: string, slot: '头像' | '立绘' | '背景' | 香闺秘档部位类型, payload: { dataUrl: string; fileName?: string }) => Promise<string | null>;
    updateNpcMajorRole: (npcId: string, isMajor: boolean) => void;
    updateNpcPresence: (npcId: string, isPresent: boolean) => void;
    removeNpc: (npcId: string) => void;

    // Config & trigger functions
    读取文生图功能配置: () => {
        总开关: boolean; NPC开关: boolean; 使用词组转化器: boolean;
        性别筛选: string; 重要性筛选: string; NPC画风: string;
        场景画风: string; 场景构图要求: string; 场景横竖屏: string; 场景尺寸: string;
    };
    NPC符合自动生图条件: (npc: any) => boolean;
    提取新增NPC列表: (beforeList: any[], afterList: any[]) => any[];
    读取修炼体系开关: () => boolean;
    构建文生图额外要求: (extra?: string) => string;
    触发新增NPC自动生图: (newNpcList: any[]) => void;

    // Direct generation
    执行单个NPC生图: (npc: any, options?: {
        force?: boolean; source?: 生图任务来源类型;
        构图?: '头像' | '半身' | '立绘'; 画风?: 当前可用接口结构['画风'];
        画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string;
        额外要求?: string; 尺寸?: string;
        复用提示词?: { 生图词组: string; 最终正向提示词: string; 最终负向提示词: string };
    }) => Promise<void>;
    执行NPC香闺秘档部位生图: (npc: any, part: 香闺秘档部位类型, options?: {
        画风?: 当前可用接口结构['画风']; 画师串?: string; 画师串预设ID?: string;
        PNG画风预设ID?: string; 额外要求?: string; 尺寸?: string;
    }) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNPCWorkflow(deps: NPCWorkflowDeps): NPCWorkflowReturn {
    const [NPC生图任务队列, setNPC生图任务队列] = useState<NPC生图任务记录[]>([]);

    const {
        社交, gameConfig, apiConfig,
        设置社交, 通知系统,
        NPC生图进行中Ref, NPC香闺秘档生图进行中Ref,
        后台手动生图监控Ref, 后台私密生图监控Ref,
        深拷贝, 环境时间转标准串,
        提取NPC生图基础数据, 提取NPC香闺秘档部位生图数据,
        按NPC读取角色锚点,
        获取文生图接口配置, 获取生图词组转化器接口配置,
        获取生图画师串预设, 获取当前PNG画风预设摘要,
        获取词组转化器预设提示词, 接口配置是否可用,
        场景模式已开启,
        历史记录,
        performAutoSave
    } = deps;

    // --- Config functions ---

    const 读取文生图功能配置 = useCallback(() => {
        const feature = 规范化接口设置(apiConfig as any).功能模型占位;
        const 当前后端 = feature?.文生图后端类型 === 'novelai' ? 'novelai' : 'other';
        const 场景横竖屏 = feature?.自动场景生图横竖屏 === '竖屏' ? '竖屏' : '横屏';
        const 场景尺寸 = typeof feature?.自动场景生图分辨率 === 'string' && feature.自动场景生图分辨率.trim()
            ? feature.自动场景生图分辨率.trim()
            : (场景横竖屏 === '竖屏' ? '576x1024' : '1024x576');
        return {
            总开关: Boolean(feature?.文生图功能启用),
            NPC开关: Boolean(feature?.NPC生图启用),
            使用词组转化器: 当前后端 === 'novelai' ? true : feature?.NPC生图使用词组转化器 !== false,
            性别筛选: feature?.NPC生图性别筛选 === '男' || feature?.NPC生图性别筛选 === '女' || feature?.NPC生图性别筛选 === '全部'
                ? feature.NPC生图性别筛选
                : '全部',
            重要性筛选: feature?.NPC生图重要性筛选 === '仅重要' || feature?.NPC生图重要性筛选 === '全部'
                ? feature.NPC生图重要性筛选
                : '全部',
            NPC画风: feature?.自动NPC生图画风 === '二次元' || feature?.自动NPC生图画风 === '写实' || feature?.自动NPC生图画风 === '国风'
                ? feature.自动NPC生图画风
                : '通用',
            场景画风: feature?.自动场景生图画风 === '二次元' || feature?.自动场景生图画风 === '写实' || feature?.自动场景生图画风 === '国风'
                ? feature.自动场景生图画风
                : '通用',
            场景构图要求: feature?.自动场景生图构图要求 === '故事快照' ? '故事快照' : '纯场景',
            场景横竖屏,
            场景尺寸
        } as const;
    }, [apiConfig]);

    const NPC符合自动生图条件 = useCallback((npc: any): boolean => {
        const config = 读取文生图功能配置();
        if (!config.总开关 || !config.NPC开关) return false;
        if (config.性别筛选 !== '全部') {
            const gender = typeof npc?.性别 === 'string' ? npc.性别.trim() : '';
            if (gender !== config.性别筛选) return false;
        }
        if (config.重要性筛选 === '仅重要' && npc?.是否主要角色 !== true) {
            return false;
        }
        return true;
    }, [读取文生图功能配置]);

    const 提取新增NPC列表 = useCallback((beforeList: any[], afterList: any[]): any[] => {
        const beforeIdentitySet = new Set(
            (Array.isArray(beforeList) ? beforeList : []).map((npc) => {
                const id = typeof npc?.id === 'string' ? npc.id.trim() : '';
                const name = typeof npc?.姓名 === 'string' ? npc.姓名.trim() : '';
                return `${id}::${name}`;
            })
        );
        return (Array.isArray(afterList) ? afterList : []).filter((npc, index) => {
            const id = typeof npc?.id === 'string' ? npc.id.trim() : '';
            const name = typeof npc?.姓名 === 'string' ? npc.姓名.trim() : '';
            const identity = `${id}::${name}`;
            if (id || name) {
                return !beforeIdentitySet.has(identity);
            }
            return !Array.isArray(beforeList) || index >= beforeList.length;
        });
    }, []);

    const 读取修炼体系开关 = useCallback((): boolean => (gameConfig as any)?.启用修炼体系 !== false, [gameConfig]);

    const 构建文生图额外要求 = useCallback((extra?: string): string => {
        const runtimeGameConfig = 规范化游戏设置(gameConfig);
        const runtimeImageExtraPrompt = 构建文生图运行时额外提示词(runtimeGameConfig.额外提示词 || '', runtimeGameConfig);
        return [(extra || '').trim(), runtimeImageExtraPrompt].filter(Boolean).join('\n\n').trim();
    }, [gameConfig]);

    // --- NPC Image State Workflow ---

    const npcImageStateWorkflow = 创建NPC图片状态工作流({
        设置社交,
        规范化社交列表: 规范化社交列表安全,
        执行社交自动存档: (socialSnapshot) => {
            void performAutoSave({ social: socialSnapshot, history: 历史记录, force: true });
        },
        获取社交列表: () => 社交 as any[],
        获取NPC唯一标识,
        设置NPC生图任务队列: setNPC生图任务队列,
        加载图片AI服务
    });

    // --- Manual NPC Workflow ---

    const manualNpcWorkflow = 创建手动NPC工作流({
        获取环境: () => (deps as any).环境,
        环境时间转标准串,
        规范化社交列表: 规范化社交列表安全,
        设置社交,
        执行社交自动存档: (socialSnapshot) => {
            void performAutoSave({ social: socialSnapshot, history: 历史记录, force: true });
        },
        保存图片资源: dbService.保存图片资源
    });

    // --- Direct generation ---

    const 执行单个NPC生图 = useCallback(async (npc: any, options?: {
        force?: boolean; source?: 生图任务来源类型;
        构图?: '头像' | '半身' | '立绘'; 画风?: 当前可用接口结构['画风'];
        画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string;
        额外要求?: string; 尺寸?: string;
        复用提示词?: { 生图词组: string; 最终正向提示词: string; 最终负向提示词: string };
    }) => {
        const { 执行NPC生图工作流 } = await 加载NPC生图工作流();
        return 执行NPC生图工作流(npc, {
            ...options,
            额外要求: 构建文生图额外要求(options?.额外要求)
        }, {
            apiConfig: apiConfig as any,
            获取NPC唯一标识,
            获取文生图接口配置,
            获取生图词组转化器接口配置,
            获取生图画师串预设,
            获取当前PNG画风预设: (presetId?: string) => 获取当前PNG画风预设摘要(presetId, 'npc'),
            获取NPC角色锚点: (npcId: string) => {
                const anchor = 按NPC读取角色锚点(npcId);
                if (!anchor || anchor.生成时默认附加 !== true) return null;
                return anchor;
            },
            获取词组转化器预设提示词,
            接口配置是否可用,
            读取文生图功能配置,
            NPC符合自动生图条件,
            NPC生图进行中集合: NPC生图进行中Ref.current,
            提取NPC生图基础数据: (targetNpc: any) => 提取NPC生图基础数据(targetNpc, {
                cultivationSystemEnabled: 读取修炼体系开关()
            }),
            创建NPC生图任务: npcImageStateWorkflow.创建NPC生图任务,
            生成NPC生图记录ID,
            追加NPC生图任务: npcImageStateWorkflow.追加NPC生图任务,
            更新NPC生图任务: npcImageStateWorkflow.更新NPC生图任务,
            更新NPC最近生图结果: npcImageStateWorkflow.更新NPC最近生图结果
        });
    }, [apiConfig, 构建文生图额外要求, 按NPC读取角色锚点, 获取词组转化器预设提示词, 接口配置是否可用, 读取文生图功能配置, NPC符合自动生图条件, NPC生图进行中Ref, 提取NPC生图基础数据, 读取修炼体系开关, npcImageStateWorkflow]);

    const 执行NPC香闺秘档部位生图 = useCallback(async (
        npc: any,
        part: 香闺秘档部位类型,
        options?: { 画风?: 当前可用接口结构['画风']; 画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string; 额外要求?: string; 尺寸?: string }
    ) => {
        const { 执行NPC香闺秘档部位生图工作流 } = await 加载NPC香闺秘档生图工作流();
        return 执行NPC香闺秘档部位生图工作流(npc, part, {
            ...options,
            额外要求: 构建文生图额外要求(options?.额外要求)
        }, {
            apiConfig: apiConfig as any,
            获取NPC唯一标识,
            获取文生图接口配置,
            获取生图词组转化器接口配置,
            获取生图画师串预设,
            获取当前PNG画风预设: (presetId?: string) => 获取当前PNG画风预设摘要(presetId, 'npc'),
            获取NPC角色锚点: 按NPC读取角色锚点,
            获取词组转化器预设提示词,
            接口配置是否可用,
            读取文生图功能配置,
            NPC私密部位生图进行中集合: NPC香闺秘档生图进行中Ref.current,
            提取NPC香闺秘档部位生图数据: (targetNpc: any, targetPart: 香闺秘档部位类型) => 提取NPC香闺秘档部位生图数据(targetNpc, targetPart, {
                cultivationSystemEnabled: 读取修炼体系开关()
            }),
            创建NPC生图任务: npcImageStateWorkflow.创建NPC生图任务,
            生成NPC生图记录ID,
            追加NPC生图任务: npcImageStateWorkflow.追加NPC生图任务,
            更新NPC生图任务: npcImageStateWorkflow.更新NPC生图任务,
            写入NPC图片历史记录: npcImageStateWorkflow.写入NPC图片历史记录,
            更新NPC香闺秘档部位结果: npcImageStateWorkflow.更新NPC香闺秘档部位结果
        });
    }, [apiConfig, 构建文生图额外要求, 按NPC读取角色锚点, 获取词组转化器预设提示词, 接口配置是否可用, 读取文生图功能配置, NPC香闺秘档生图进行中Ref, 提取NPC香闺秘档部位生图数据, 读取修炼体系开关, npcImageStateWorkflow]);

    // --- Trigger auto generation ---

    const 触发新增NPC自动生图 = useCallback((newNpcList: any[]) => {
        const npcList = Array.isArray(newNpcList) ? newNpcList : [];
        if (npcList.length === 0) return;
        npcList.forEach((npc) => {
            void 执行单个NPC生图(npc).catch(() => undefined);
        });
    }, [执行单个NPC生图]);

    return {
        // NPC image state workflow
        更新NPC最近生图结果: npcImageStateWorkflow.更新NPC最近生图结果,
        写入NPC图片历史记录: npcImageStateWorkflow.写入NPC图片历史记录,
        更新NPC香闺秘档部位结果: npcImageStateWorkflow.更新NPC香闺秘档部位结果,
        获取生图阶段中文: npcImageStateWorkflow.获取生图阶段中文,
        创建NPC生图任务: npcImageStateWorkflow.创建NPC生图任务,
        追加NPC生图任务: npcImageStateWorkflow.追加NPC生图任务,
        更新NPC生图任务: npcImageStateWorkflow.更新NPC生图任务,
        删除NPC生图任务: npcImageStateWorkflow.删除NPC生图任务,
        清空NPC生图任务队列: npcImageStateWorkflow.清空NPC生图任务队列,
        删除NPC图片记录: npcImageStateWorkflow.删除NPC图片记录,
        清空NPC图片历史: npcImageStateWorkflow.清空NPC图片历史,
        选择NPC头像图片: npcImageStateWorkflow.选择NPC头像图片,
        清除NPC头像图片: npcImageStateWorkflow.清除NPC头像图片,
        选择NPC立绘图片: npcImageStateWorkflow.选择NPC立绘图片,
        清除NPC立绘图片: npcImageStateWorkflow.清除NPC立绘图片,
        选择NPC背景图片: npcImageStateWorkflow.选择NPC背景图片,
        清除NPC背景图片: npcImageStateWorkflow.清除NPC背景图片,
        保存NPC图片本地副本: npcImageStateWorkflow.保存NPC图片本地副本,

        // Manual NPC CRUD
        createNpcManually: manualNpcWorkflow.createNpcManually,
        updateNpcManually: manualNpcWorkflow.updateNpcManually,
        deleteNpcManually: manualNpcWorkflow.deleteNpcManually,
        uploadNpcImageToSlot: manualNpcWorkflow.uploadNpcImageToSlot,
        updateNpcMajorRole: manualNpcWorkflow.updateNpcMajorRole,
        updateNpcPresence: manualNpcWorkflow.updateNpcPresence,
        removeNpc: manualNpcWorkflow.removeNpc,

        // Config & triggers
        读取文生图功能配置,
        NPC符合自动生图条件,
        提取新增NPC列表,
        读取修炼体系开关,
        构建文生图额外要求,
        触发新增NPC自动生图,

        // Direct generation
        执行单个NPC生图,
        执行NPC香闺秘档部位生图
    };
}
