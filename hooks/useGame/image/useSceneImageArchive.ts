import { useCallback, useEffect, useRef, useState } from 'react';
import * as dbService from '../../../services/dbService';
import { 设置键 } from '../../../utils/settingsSchema';
import { 规范化图片管理设置, 默认图片管理设置 } from '../../../utils/imageManagerSettings';
import { 创建场景图片档案工作流, 生成场景生图记录ID, 规范化场景图片档案 } from '../image/sceneImageArchiveWorkflow';
import { 创建场景生图触发工作流 } from '../image/sceneImageTriggerWorkflow';
import { 规范化环境信息, 构建完整地点文本 } from '../core/stateTransforms';
import { 提取NPC生图基础数据 } from '../npcContext';
import { 环境时间转标准串 } from '../time/timeUtils';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 场景图片档案, 场景生图任务记录, 生图任务来源类型 } from '../../../types';

interface SceneImageArchiveDeps {
    gameConfig: unknown;
    通知系统: { 推送右下角提示: (toast: { title: string; message: string; tone?: 'info' | 'success' | 'error' }) => void };
    apiConfig: unknown;
    apiConfigRef: { current: unknown };
    visualConfigRef: { current: unknown };
    visualConfig: unknown;
    imageManagerConfigRef: { current: unknown };
    环境: unknown;
    角色: unknown;
    社交: unknown[];
    历史记录: unknown[];
    深拷贝: <T,>(data: T) => T;
    应用视觉设置到状态: (value: any) => void;
    读取修炼体系开关: () => boolean;
    规范化接口设置: (config: unknown) => any;
    获取当前PNG画风预设摘要: (presetId?: string, type?: string) => any;
    按NPC读取角色锚点: (npcId: string) => any;
    加载图片AI服务: () => Promise<any>;
    加载场景生图工作流: () => Promise<any>;
    构建文生图额外要求: (extra?: string) => string;
    场景模式已开启: () => boolean;
    读取文生图功能配置: () => any;
}

export function useSceneImageArchive(deps: SceneImageArchiveDeps) {
    const 场景生图自动应用任务Ref = useRef('');
    const 场景图片档案Ref = useRef<场景图片档案>({});
    const [场景图片档案, set场景图片档案] = useState<场景图片档案>({});
    const [场景生图任务队列, set场景生图任务队列] = useState<场景生图任务记录[]>([]);
    const 后台场景生图监控Ref = useRef<Array<{ since: number; 摘要: string }>>([]);
    const 已提示后台场景生图任务Ref = useRef<Set<string>>(new Set());

    const 获取场景图历史上限 = useCallback((): number => (
        规范化图片管理设置(deps.imageManagerConfigRef.current || (deps as any).imageManagerConfig || 默认图片管理设置).场景图历史上限
    ), [deps.imageManagerConfigRef]);

    const 应用场景图片档案到状态 = (value: 场景图片档案 | null | undefined) => {
        const normalized = 规范化场景图片档案(value || {});
        场景图片档案Ref.current = normalized;
        set场景图片档案(normalized);
        void dbService.保存设置(设置键.场景图片档案, normalized);
    };

    const {
        加载场景图片档案,
        写入场景图片档案,
        应用场景图片为壁纸,
        清除场景壁纸,
        设置常驻壁纸,
        清除常驻壁纸,
        应用常驻壁纸为背景,
        删除场景图片记录,
        清空场景图片历史,
        保存场景图片本地副本
    } = 创建场景图片档案工作流({
        获取场景图历史上限,
        读取场景图片档案设置: () => dbService.读取设置(设置键.场景图片档案),
        保存场景图片档案设置: (archive) => dbService.保存设置(设置键.场景图片档案, archive),
        同步场景图片档案: (archive) => {
            场景图片档案Ref.current = archive;
            set场景图片档案(archive);
        },
        获取当前场景图片档案: () => 场景图片档案Ref.current || {},
        清理未引用图片资源: dbService.清理未引用图片资源,
        获取当前视觉设置: () => (deps.visualConfigRef.current || deps.visualConfig) as any,
        应用视觉设置到状态: deps.应用视觉设置到状态,
        深拷贝: deps.深拷贝,
        加载图片AI服务: deps.加载图片AI服务
    });

    const 创建场景生图任务 = (params: {
        source: 生图任务来源类型;
        modelName: string;
        画风?: 当前可用接口结构['画风'];
        画师串?: string;
        来源回合?: number;
        摘要?: string;
    }): 场景生图任务记录 => ({
        id: `scene_image_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        目标类型: 'scene',
        来源: params.source,
        状态: 'queued',
        创建时间: Date.now(),
        使用模型: params.modelName,
        构图: '场景',
        画风: params.画风,
        画师串: params.画师串,
        进度阶段: 'queued',
        进度文本: '任务已入队，等待生成场景壁纸。',
        来源回合: params.来源回合,
        摘要: params.摘要,
        已应用为壁纸: false
    });

    const 追加场景生图任务 = (task: 场景生图任务记录) => {
        set场景生图任务队列(prev => [task, ...(Array.isArray(prev) ? prev : [])].slice(0, 100));
    };

    const 更新场景生图任务 = (taskId: string, updater: (task: 场景生图任务记录) => 场景生图任务记录) => {
        set场景生图任务队列(prev => (Array.isArray(prev) ? prev : []).map((task) => (
            task.id === taskId ? updater(task) : task
        )));
    };

    const 删除场景生图任务 = (taskId: string) => {
        if (!taskId) return;
        set场景生图任务队列(prev => (Array.isArray(prev) ? prev : []).filter((task) => task?.id !== taskId));
    };

    const 清空场景生图任务队列 = (mode: 'all' | 'completed' = 'all') => {
        set场景生图任务队列(prev => {
            const baseList = Array.isArray(prev) ? prev : [];
            if (mode === 'all') return [];
            return baseList.filter((task) => task?.状态 === 'queued' || task?.状态 === 'running');
        });
    };

    const {
        触发场景自动生图,
        生成场景壁纸
    } = 创建场景生图触发工作流({
        获取环境: () => deps.环境,
        获取角色: () => deps.角色,
        获取社交列表: () => deps.社交,
        获取历史记录: () => deps.历史记录,
        获取接口配置: () => deps.apiConfig,
        规范化环境信息,
        深拷贝: deps.深拷贝,
        环境时间转标准串,
        构建完整地点文本,
        修炼体系已启用: deps.读取修炼体系开关,
        提取NPC生图基础数据: (npc) => 提取NPC生图基础数据(npc, {
            cultivationSystemEnabled: deps.读取修炼体系开关()
        }),
        读取文生图功能配置: deps.读取文生图功能配置,
        场景模式已开启: deps.场景模式已开启,
        构建文生图额外要求: deps.构建文生图额外要求,
        加载场景生图工作流: deps.加载场景生图工作流,
        获取场景文生图接口配置: (...args: any[]) => {
            const { 获取场景文生图接口配置 } = require('../../utils/apiConfig');
            return 获取场景文生图接口配置(...args);
        },
        获取生图词组转化器接口配置: (...args: any[]) => {
            const { 获取生图词组转化器接口配置 } = require('../../utils/apiConfig');
            return 获取生图词组转化器接口配置(...args);
        },
        获取生图画师串预设: (...args: any[]) => {
            const { 获取生图画师串预设 } = require('../../utils/apiConfig');
            return 获取生图画师串预设(...args);
        },
        获取当前PNG画风预设: (presetId?: string) => deps.获取当前PNG画风预设摘要(presetId, 'scene'),
        获取场景角色锚点: (npcId: string) => deps.按NPC读取角色锚点(npcId),
        获取词组转化器预设提示词: (...args: any[]) => {
            const { 获取词组转化器预设提示词 } = require('../../utils/apiConfig');
            return 获取词组转化器预设提示词(...args);
        },
        接口配置是否可用: (...args: any[]) => {
            const { 接口配置是否可用 } = require('../../utils/apiConfig');
            return 接口配置是否可用(...args);
        },
        创建场景生图任务,
        生成场景生图记录ID,
        追加场景生图任务,
        更新场景生图任务,
        更新场景图片档案: 写入场景图片档案,
        应用场景图片为壁纸,
        获取当前自动应用任务ID: () => 场景生图自动应用任务Ref.current,
        设置当前自动应用任务ID: (requestId) => {
            场景生图自动应用任务Ref.current = requestId;
        },
        记录后台场景监控: (item) => {
            后台场景生图监控Ref.current.push(item);
        },
        推送右下角提示: deps.通知系统.推送右下角提示
    });

    // Load scene image archive on mount
    useEffect(() => {
        void 加载场景图片档案();
    }, []);

    return {
        // Refs
        场景生图自动应用任务Ref,
        场景图片档案Ref,
        后台场景生图监控Ref,
        已提示后台场景生图任务Ref,

        // State
        场景图片档案,
        场景生图任务队列,

        // Core functions
        获取场景图历史上限,
        应用场景图片档案到状态,
        加载场景图片档案,
        写入场景图片档案,
        创建场景生图任务,
        追加场景生图任务,
        更新场景生图任务,
        删除场景生图任务,
        清空场景生图任务队列,

        // Trigger workflow
        触发场景自动生图,
        生成场景壁纸,

        // Archive operations
        应用场景图片为壁纸,
        清除场景壁纸,
        设置常驻壁纸,
        清除常驻壁纸,
        应用常驻壁纸为背景,
        删除场景图片记录,
        清空场景图片历史,
        保存场景图片本地副本
    };
}
