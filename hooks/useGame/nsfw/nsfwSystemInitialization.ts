/**
 * NSFW 系统初始化
 * 从 useGame.ts 提取的 5 个 NSFW 系统初始化 useEffect 区块
 */
import { useEffect } from 'react';
import { 从NPC创建欲望档案 } from '../campusNSFWEngine';
import { 创建乘客欲望档案 } from '../urbanDriverNSFWEngine';
import { 计算露出倾向 } from '../../../models/npcNSFWEnhancement';
import type { NPC结构 } from '../../../types';

interface NSFW系统初始化依赖 {
    gameConfig: any;
    校园系统: any;
    都市网约车系统: any;
    写真系统: any;
    角色: any;
    社交: NPC结构[];
    设置校园系统: (updater: (prev: any) => any) => void;
    设置都市网约车系统: (updater: (prev: any) => any) => void;
    设置写真系统: (value: any) => void;
}

export function useNSFW系统初始化(deps: NSFW系统初始化依赖) {
    const {
        gameConfig, 校园系统, 都市网约车系统, 写真系统,
        角色, 社交,
        设置校园系统, 设置都市网约车系统, 设置写真系统,
    } = deps;

    // 校园 NSFW 欲望系统初始化：当主开关打开且尚未初始化时，为所有主要角色 NPC 创建默认欲望档案
    useEffect(() => {
        const nsfwEnabled = gameConfig?.校园NSFW设置?.启用校园NSFW深化系统;
        const 欲望系统已存在 = 校园系统?.欲望系统;
        const 游戏已开始 = 角色?.姓名;
        const 有主要角色 = 社交?.some((n: NPC结构) => n.是否主要角色);

        if (nsfwEnabled && !欲望系统已存在 && 游戏已开始 && 有主要角色) {
            const NPC欲望档案: Record<string, any> = {};
            社交.forEach((npc: NPC结构) => {
                if (npc.是否主要角色) {
                    NPC欲望档案[npc.id] = 从NPC创建欲望档案(npc);
                }
            });

            if (Object.keys(NPC欲望档案).length > 0) {
                设置校园系统(prev => ({
                    ...prev,
                    欲望系统: {
                        NPC欲望档案,
                        里程碑列表: [],
                        后果列表: [],
                        已解锁地点: [],
                        露出场景解锁: [],
                        旁观者记录: [],
                        活动专属回忆: [],
                        SM场景池: [],
                        契约列表: [],
                        指令队列: [],
                    }
                }));
            }
        }
    }, [gameConfig?.校园NSFW设置?.启用校园NSFW深化系统, 校园系统?.欲望系统, 角色?.姓名, 社交, 设置校园系统]);

    // BDSM 独立系统初始化
    useEffect(() => {
        const nsfwEnabled = gameConfig?.BDSMNSFW设置?.启用BDSM独立系统;
        const BDSM系统已存在 = 校园系统?.BDSM系统;
        const 游戏已开始 = 角色?.姓名;
        const 有主要角色 = 社交?.some((n: NPC结构) => n.是否主要角色);

        if (nsfwEnabled && !BDSM系统已存在 && 游戏已开始 && 有主要角色) {
            const 关系档案: Record<string, any> = {};
            社交.forEach((npc: NPC结构) => {
                if (npc.是否主要角色) {
                    关系档案[npc.id] = {
                        阶段: '初识', 服从度: 0, 权力天平: 0,
                        契约记录: [], 任务历史: [], 日常指令: [],
                        里程碑: [], 安全词: '月光', 底线列表: [], 照片把柄: [],
                    };
                }
            });

            if (Object.keys(关系档案).length > 0) {
                设置校园系统(prev => ({
                    ...prev,
                    BDSM系统: {
                        关系档案,
                        SM场景池: [],
                        契约列表: [],
                        指令队列: [],
                        论坛帖子: [],
                        论坛影响记录: {},
                        关系网络: null,
                    }
                }));
            }
        }
    }, [gameConfig?.BDSMNSFW设置?.启用BDSM独立系统, 校园系统?.BDSM系统, 角色?.姓名, 社交, 设置校园系统]);

    // 露出 NSFW 独立系统初始化
    useEffect(() => {
        const nsfwEnabled = gameConfig?.ExposureNSFW设置?.启用露出系统;
        const Exposure系统已存在 = 校园系统?.Exposure系统;
        const 游戏已开始 = 角色?.姓名;
        const 有主要角色 = 社交?.some((n: NPC结构) => n.是否主要角色);

        if (nsfwEnabled && !Exposure系统已存在 && 游戏已开始 && 有主要角色) {
            const 露出档案: Record<string, any> = {};
            社交.forEach((npc: NPC结构) => {
                if (npc.是否主要角色) {
                    // 基于人格计算初始露出等级
                    const 个性系数 = 计算露出倾向(npc);
                    let 初始等级 = 0;
                    if (个性系数.冒险倾向 >= 70) 初始等级 = 1;
                    if (个性系数.冒险倾向 >= 85 && 个性系数.刺激渴望 >= 50) 初始等级 = 2;

                    露出档案[npc.id] = {
                        露出状态: { 当前等级: 初始等级, 等级进度: 0, 最后一次露出尝试: new Date().toISOString(), 成功露出次数: 0, 暴露失败次数: 0, 最大紧张度记录: 0, 个性系数 },
                        紧张度状态: { 当前值: 0, 周围人数: 0, 互动强度系数: 1.0, 周围人状态: '专注事务', NPC公开行为: '无' },
                        网络流言: { 当前等级: 0, 传播渠道: [], 有无证据: false, 最新传播时间: new Date().toISOString(), 辟谣状态: '未辟谣' },
                    };
                }
            });

            if (Object.keys(露出档案).length > 0) {
                设置校园系统(prev => ({
                    ...prev,
                    Exposure系统: {
                        露出档案,
                        旁观者记录: [],
                        活动专属回忆: [],
                    }
                }));
            }
        }
    }, [gameConfig?.ExposureNSFW设置?.启用露出系统, 校园系统?.Exposure系统, 角色?.姓名, 社交, 设置校园系统]);

    // 新增主要角色 NPC 时自动补全欲望档案
    useEffect(() => {
        const nsfwEnabled = gameConfig?.校园NSFW设置?.启用校园NSFW深化系统;
        const 欲望系统 = 校园系统?.欲望系统;
        if (!nsfwEnabled || !欲望系统) return;

        const 缺失档案的主要角色 = 社交.filter((npc: NPC结构) =>
            npc.是否主要角色 && !欲望系统.NPC欲望档案?.[npc.id]
        );
        if (缺失档案的主要角色.length === 0) return;

        const 新档案: Record<string, any> = {};
        缺失档案的主要角色.forEach(npc => {
            新档案[npc.id] = 从NPC创建欲望档案(npc);
        });

        设置校园系统(prev => ({
            ...prev,
            欲望系统: {
                ...欲望系统,
                NPC欲望档案: { ...欲望系统.NPC欲望档案, ...新档案 }
            }
        }));
    }, [社交, gameConfig?.校园NSFW设置?.启用校园NSFW深化系统, 校园系统?.欲望系统?.NPC欲望档案, 设置校园系统]);

    // 都市网约车 NSFW 乘客档案初始化
    useEffect(() => {
        const nsfw设置 = gameConfig?.都市网约车NSFW设置;
        const 行程系统 = (都市网约车系统 as any)?.行程系统;
        const 游戏已开始 = 角色?.姓名;
        const 是司机背景 = 角色?.出身背景?.名称 &&
            ['网约车司机', '网约车夜司机', '代驾司机', '网约车队长'].includes(角色.出身背景.名称);

        if (nsfw设置?.启用都市网约车NSFW系统 && 行程系统 && 游戏已开始 && 是司机背景) {
            const 已有档案 = 行程系统.乘客欲望档案 || {};
            if (Object.keys(已有档案).length === 0 && 社交?.length > 0) {
                const 新档案: Record<string, any> = {};
                社交.forEach((npc: NPC结构) => {
                    if (npc.是否主要角色) {
                        // 检测NPC是否与夜生活/酒吧相关
                        const 出身 = (npc as any).出身背景?.名称 || '';
                        const 状态 = (npc as any).状态 || '';
                        const 当前地点 = (npc as any).当前地点 || '';
                        const 是夜生活相关 = 出身.includes('调酒') || 出身.includes('酒吧') ||
                            状态.includes('醉') || 状态.includes('微醺') ||
                            当前地点.includes('酒吧');
                        const 初始醉酒状态 = 是夜生活相关 ? {
                            等级: '微醺' as const,
                            行为大胆度: 25,
                            记忆模糊度: 15,
                            判断力下降: true,
                        } : undefined;
                        新档案[npc.id] = 创建乘客欲望档案({ 初始醉酒状态 });
                    }
                });
                if (Object.keys(新档案).length > 0) {
                    设置都市网约车系统(prev => ({
                        ...prev,
                        行程系统: { ...行程系统, 乘客欲望档案: { ...已有档案, ...新档案 } }
                    }));
                }
            }
        }
    }, [gameConfig?.都市网约车NSFW设置?.启用都市网约车NSFW系统, 都市网约车系统, 角色?.姓名, 角色?.出身背景?.名称, 社交, 设置都市网约车系统]);

    // 新增主要角色 NPC 时自动补全都市网约车乘客档案
    useEffect(() => {
        const nsfw设置 = gameConfig?.都市网约车NSFW设置;
        const 行程系统 = (都市网约车系统 as any)?.行程系统;
        if (!nsfw设置?.启用都市网约车NSFW系统 || !行程系统) return;

        const 乘客档案 = 行程系统.乘客欲望档案 || {};
        const 缺失档案的角色 = 社交.filter((npc: NPC结构) => !乘客档案[npc.id]);
        if (缺失档案的角色.length === 0) return;

        const 新档案: Record<string, any> = {};
        缺失档案的角色.forEach(npc => {
            const 出身 = (npc as any).出身背景?.名称 || '';
            const 状态 = (npc as any).状态 || '';
            const 当前地点 = (npc as any).当前地点 || '';
            const 是夜生活相关 = 出身.includes('调酒') || 出身.includes('酒吧') ||
                状态.includes('醉') || 状态.includes('微醺') ||
                当前地点.includes('酒吧');
            const 初始醉酒状态 = 是夜生活相关 ? {
                等级: '微醺' as const,
                行为大胆度: 25,
                记忆模糊度: 15,
                判断力下降: true,
            } : undefined;
            新档案[npc.id] = 创建乘客欲望档案({ 初始醉酒状态 });
        });

        设置都市网约车系统(prev => {
            const 当前行程 = (prev as any)?.行程系统 || 行程系统;
            return {
                ...prev,
                行程系统: { ...当前行程, 乘客欲望档案: { ...乘客档案, ...新档案 } }
            };
        });
    }, [社交, gameConfig?.都市网约车NSFW设置?.启用都市网约车NSFW系统, 都市网约车系统, 设置都市网约车系统]);

    // 写真约拍 NSFW 系统初始化
    useEffect(() => {
        const nsfw设置 = gameConfig?.写真NSFW设置;
        const 游戏已开始 = 角色?.姓名;
        const 是写真相关背景 = 角色?.出身背景?.名称 &&
            ['写真模特', '摄影师', '自由摄影师', '平面模特', 'Cosplay模特'].includes(角色.出身背景.名称);
        const 写真系统已存在 = (写真系统 as any)?.模特档案 || (写真系统 as any)?.摄影师档案;

        if (nsfw设置?.启用写真NSFW系统 && 游戏已开始 && 是写真相关背景 && !写真系统已存在) {
            const { 创建默认模特, 创建默认摄影师 } = require('../photographyNSFWEngine');
            const 模特Id = `model_${Date.now()}`;
            const 摄影师Id = `photographer_${Date.now()}`;

            const 写真系统初始值 = {
                模特档案: { [模特Id]: 创建默认模特(模特Id, 角色?.姓名 ?? '未知模特', '素人模特', '新人') },
                摄影师档案: { [摄影师Id]: 创建默认摄影师(摄影师Id, '独立摄影师', '独立摄影师', '纯艺术') },
                进行中的拍摄项目: [],
                历史拍摄记录: [],
                泄露事件列表: [],
            };

            设置写真系统(写真系统初始值);
        }
    }, [gameConfig?.写真NSFW设置?.启用写真NSFW系统, 写真系统, 角色?.姓名, 角色?.出身背景?.名称, 设置写真系统]);
}
