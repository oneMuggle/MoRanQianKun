// hooks/useGame/subsystems/useBDSMSlice.ts
// BDSM 关系管理 slice — Zustand 就绪 { state, actions } 模式

import { useCallback } from 'react';
import type { BDSM调教任务, BDSM任务状态, BDSM评价等级, 契约记录, BDSM日常指令 } from '../../../models/campusNSFW';
import { 生成调教任务, 生成日常指令, 评价任务完成, 生成契约条款, 判定关系阶段推进 } from '../bdsmTaskWorkflow';
import { 触发任务生成, 触发日常指令刷新 } from '../bdsmTaskTrigger';

export interface BDSMSliceActions {
    更新BDSM关系状态: (npcId: string, updater: (state: any) => any) => void;
    添加BDSM任务: (npcId: string, 任务: Omit<BDSM调教任务, 'id' | '状态' | '发布时间'>) => BDSM调教任务;
    更新BDSM任务状态: (npcId: string, 任务ID: string, 新状态: BDSM任务状态, 评价?: BDSM评价等级) => void;
    更新契约状态: (npcId: string, 新契约: 契约记录) => void;
    添加BDSM里程碑: (npcId: string, 类型: string, 描述: string) => void;
    设置日常指令: (npcId: string, 指令: BDSM日常指令[]) => void;
    请求生成BDSM任务: (npcId: string, npcName: string) => Promise<{ success: boolean; 任务数: number; error?: string }>;
    请求生成BDSM日常指令: (npcId: string, npcName: string) => Promise<{ success: boolean; 指令数: number; error?: string }>;
    请求评价BDSM任务: (npcId: string, 任务ID: string, 执行情况: string) => Promise<{ success: boolean; 评价: string; 服从度变化: number; error?: string }>;
    请求生成BDSM契约: (npcId: string, 契约类型: '口头约定' | '书面契约' | '信物交换') => Promise<{ success: boolean; error?: string }>;
    请求判定BDSM阶段推进: (npcId: string, npcName: string) => Promise<{ advanced: boolean; 新阶段?: string; 理由?: string }>;
}

type BDSMSliceContext = {
    校园系统: any;
    apiConfig: any;
    获取主剧情接口配置: (cfg: any) => any;
    set校园系统: React.Dispatch<React.SetStateAction<any>>;
};

export function useBDSMSlice(ctx: BDSMSliceContext): { actions: BDSMSliceActions } {
    const 更新BDSM关系状态 = useCallback((npcId: string, updater: (state: any) => any) => {
        ctx.set校园系统(prev => {
            if (!prev?.欲望系统?.NPC欲望档案?.[npcId]?.BDSM关系) return prev;
            const 档案 = prev.欲望系统.NPC欲望档案[npcId];
            return {
                ...prev,
                欲望系统: {
                    ...prev.欲望系统,
                    NPC欲望档案: { ...prev.欲望系统.NPC欲望档案, [npcId]: { ...档案, BDSM关系: updater(档案.BDSM关系) } },
                },
            };
        });
    }, [ctx.set校园系统]);

    const 添加BDSM任务 = useCallback((npcId: string, 任务: Omit<BDSM调教任务, 'id' | '状态' | '发布时间'>): BDSM调教任务 => {
        const 新任务: BDSM调教任务 = { ...任务, id: `bdsm_task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, 状态: '待接受' as const, 发布时间: new Date().toISOString() };
        更新BDSM关系状态(npcId, prev => ({ ...prev, 任务历史: [...prev.任务历史, 新任务] }));
        return 新任务;
    }, [更新BDSM关系状态]);

    const 更新BDSM任务状态 = useCallback((npcId: string, 任务ID: string, 新状态: BDSM任务状态, 评价?: BDSM评价等级) => {
        更新BDSM关系状态(npcId, prev => ({ ...prev, 任务历史: prev.任务历史.map(t => t.id === 任务ID ? { ...t, 状态: 新状态, 评价, 完成时间: 新状态 === '已完成' ? new Date().toISOString() : t.完成时间 } : t) }));
    }, [更新BDSM关系状态]);

    const 更新契约状态 = useCallback((npcId: string, 新契约: 契约记录) => {
        更新BDSM关系状态(npcId, prev => ({ ...prev, 契约记录: [...prev.契约记录, 新契约] }));
    }, [更新BDSM关系状态]);

    const 添加BDSM里程碑 = useCallback((npcId: string, 类型: string, 描述: string) => {
        更新BDSM关系状态(npcId, prev => ({ ...prev, 里程碑: [...prev.里程碑, { 类型, 时间: new Date().toISOString(), 描述 }] }));
    }, [更新BDSM关系状态]);

    const 设置日常指令 = useCallback((npcId: string, 指令: BDSM日常指令[]) => {
        更新BDSM关系状态(npcId, prev => ({ ...prev, 日常指令: 指令 }));
    }, [更新BDSM关系状态]);

    const 请求生成BDSM任务 = useCallback(async (npcId: string, npcName: string) => {
        const 档案 = ctx.校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, 任务数: 0, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;
        const 活跃任务 = (关系.任务历史 || []).filter((t: any) => t.状态 === '待接受' || t.状态 === '进行中');
        const 触发结果 = 触发任务生成({ 活跃任务, 关系状态: 关系, npcName });
        if (!触发结果.需要生成) return { success: false, 任务数: 0, error: '当前任务充足，无需生成' };
        const 主剧情Api = ctx.获取主剧情接口配置(ctx.apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) return { success: false, 任务数: 0, error: 'AI 未配置' };
        try {
            const 新任务 = await 生成调教任务({ 契约类型: 关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].类型 : '口头约定', 契约状态: 关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].状态 : '口头约定', 服从度: 关系.服从度, 权力倾向: 关系.权力天平 > 0 ? '支配' : '服从', 关系阶段: 关系.阶段, 已解锁场景: [], 历史任务数量: 关系.任务历史.length, NPC性格特征: npcName }, 主剧情Api);
            if (新任务.length === 0) return { success: false, 任务数: 0, error: 'AI 未返回有效任务' };
            for (const 任务 of 新任务) { 添加BDSM任务(npcId, 任务 as any); }
            return { success: true, 任务数: 新任务.length };
        } catch (err) { return { success: false, 任务数: 0, error: String(err) }; }
    }, [ctx.校园系统, ctx.apiConfig, ctx.获取主剧情接口配置, 添加BDSM任务]);

    const 请求生成BDSM日常指令 = useCallback(async (npcId: string, npcName: string) => {
        const 档案 = ctx.校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, 指令数: 0, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;
        const 现有指令 = 关系.日常指令 || [];
        const 触发结果 = 触发日常指令刷新({ 日常指令: 现有指令, 关系状态: 关系, npcName });
        if (!触发结果.需要刷新) return { success: false, 指令数: 0, error: '指令无需刷新' };
        const 主剧情Api = ctx.获取主剧情接口配置(ctx.apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) return { success: false, 指令数: 0, error: 'AI 未配置' };
        try {
            const 新指令 = await 生成日常指令({ 服从度: 关系.服从度, 契约状态: 关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].状态 : '口头约定', 关系阶段: 关系.阶段, 已发布指令数: 现有指令.length, NPC性格特征: npcName }, 主剧情Api);
            if (新指令.length === 0) return { success: false, 指令数: 0, error: 'AI 未返回有效指令' };
            设置日常指令(npcId, 新指令);
            return { success: true, 指令数: 新指令.length };
        } catch (err) { return { success: false, 指令数: 0, error: String(err) }; }
    }, [ctx.校园系统, ctx.apiConfig, ctx.获取主剧情接口配置, 设置日常指令]);

    const 请求评价BDSM任务 = useCallback(async (npcId: string, 任务ID: string, 执行情况: string) => {
        const 档案 = ctx.校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, 评价: '', 服从度变化: 0, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;
        const 任务 = (关系.任务历史 || []).find((t: any) => t.id === 任务ID);
        if (!任务) return { success: false, 评价: '', 服从度变化: 0, error: '未找到任务' };
        const 主剧情Api = ctx.获取主剧情接口配置(ctx.apiConfig);
        try {
            const 评价结果 = await 评价任务完成({ 类型: 任务.类型, 难度: 任务.难度, 描述: 任务.描述 }, 执行情况, 关系.服从度, undefined, 主剧情Api);
            更新BDSM任务状态(npcId, 任务ID, '已完成', 评价结果.评价);
            更新BDSM关系状态(npcId, prev => ({ ...prev, 服从度: Math.max(0, Math.min(100, (prev.服从度 || 50) + 评价结果.服从度变化)) }));
            return { success: true, 评价: 评价结果.反馈, 服从度变化: 评价结果.服从度变化 };
        } catch (err) { return { success: false, 评价: '', 服从度变化: 0, error: String(err) }; }
    }, [ctx.校园系统, ctx.apiConfig, ctx.获取主剧情接口配置, 更新BDSM任务状态, 更新BDSM关系状态]);

    const 请求生成BDSM契约 = useCallback(async (npcId: string, 契约类型: '口头约定' | '书面契约' | '信物交换') => {
        const 档案 = ctx.校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;
        const 主剧情Api = ctx.获取主剧情接口配置(ctx.apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) return { success: false, error: 'AI 未配置' };
        try {
            const 契约结果 = await 生成契约条款(契约类型, 关系.阶段, 关系.服从度, 关系.权力天平 > 0 ? '支配' : '服从', 关系.底线列表, 主剧情Api);
            const 新契约: 契约记录 = { id: `bdsm_contract_${Date.now()}`, 类型: 契约类型, 状态: (契约类型 === '口头约定' ? '口头约定' : '书面契约') as '口头约定' | '书面契约', 条款列表: 契约结果.条款, 缔结时间: new Date().toISOString(), 违约次数: 0 };
            更新契约状态(npcId, 新契约);
            添加BDSM里程碑(npcId, '契约', `达成${契约类型}：${契约结果.条款.slice(0, 2).join('、')}`);
            return { success: true };
        } catch (err) { return { success: false, error: String(err) }; }
    }, [ctx.校园系统, ctx.apiConfig, ctx.获取主剧情接口配置, 更新契约状态, 添加BDSM里程碑]);

    const 请求判定BDSM阶段推进 = useCallback(async (npcId: string, npcName: string) => {
        const 档案 = ctx.校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { advanced: false };
        const 关系 = 档案.BDSM关系;
        const 主剧情Api = ctx.获取主剧情接口配置(ctx.apiConfig);
        const 已完成任务数 = (关系.任务历史 || []).filter((t: any) => t.状态 === '已完成').length;
        const 完美服从数 = (关系.任务历史 || []).filter((t: any) => t.评价 === '完美服从').length;
        const 违约次数 = (关系.契约记录 || []).reduce((sum: number, c: any) => sum + (c.违约次数 || 0), 0);
        try {
            const 结果 = await 判定关系阶段推进(关系.阶段, 关系.服从度, 已完成任务数, 完美服从数, 违约次数, 关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].类型 : '口头约定', '', 主剧情Api);
            if (结果.是否推进 && 结果.下一阶段) {
                更新BDSM关系状态(npcId, prev => ({ ...prev, 阶段: 结果.下一阶段 as any }));
                添加BDSM里程碑(npcId, '阶段推进', `${关系.阶段}→${结果.下一阶段}：${结果.理由}`);
                return { advanced: true, 新阶段: 结果.下一阶段, 理由: 结果.理由 };
            }
            return { advanced: false, 理由: 结果.理由 };
        } catch (err) { return { advanced: false }; }
    }, [ctx.校园系统, ctx.apiConfig, ctx.获取主剧情接口配置, 更新BDSM关系状态, 添加BDSM里程碑]);

    return { actions: { 更新BDSM关系状态, 添加BDSM任务, 更新BDSM任务状态, 更新契约状态, 添加BDSM里程碑, 设置日常指令, 请求生成BDSM任务, 请求生成BDSM日常指令, 请求评价BDSM任务, 请求生成BDSM契约, 请求判定BDSM阶段推进 } };
}
