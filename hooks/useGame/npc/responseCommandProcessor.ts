import {
    GameResponse,
    角色数据结构,
    环境信息结构,
    世界数据结构,
    战斗状态结构,
    详细门派结构,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构
} from '../../../types';
import type { 校园系统数据 } from '../../../models/campusPhone';
import type { 校园NSFW系统扩展 } from '../../../models/campusNSFW';
import type { 写真系统扩展 } from '../../../models/photographyNSFW';
import { applyStateCommand } from '../../../utils/stateHelpers';
import type { 性癖触发事件 } from '../../../models/npcNSFWEnhancement/eventMapping';
import { 记录性癖触发事件, 批量应用性癖衰减 } from '../../../models/npcNSFWEnhancement/evolutionEngine';
import { 推进妊娠进程 } from '../../../models/npcNSFWEnhancement/pregnancyEngine';
import { 评估护理质量, 记录事后情绪 } from '../../../models/npcNSFWEnhancement/aftercareSystem';
import { 创建初始情绪, 计算下一回合情绪, 计算心情阶段 } from '../../../models/npcNSFWEnhancement/emotionSystem';
import { 创建初始羁绊树, 达成里程碑 } from '../../../models/npcNSFWEnhancement/bondTree';
import { 添加NSFW记忆, 创建初始记忆库 } from '../../../models/npcNSFWEnhancement/nsfwMemory';
import { 添加后果, 创建初始后果系统 } from '../../../models/npcNSFWEnhancement/unifiedConsequences';

const 深拷贝 = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export type 响应命令处理状态 = {
    角色: 角色数据结构;
    环境: 环境信息结构;
    社交: any[];
    世界: 世界数据结构;
    战斗: 战斗状态结构;
    玩家门派: 详细门派结构;
    任务列表: any[];
    约定列表: any[];
    剧情: 剧情系统结构;
    剧情规划: 剧情规划结构;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;
    校园系统: 校园系统数据;
};

type 响应命令处理依赖 = {
    规范化环境信息: (envLike?: any) => 环境信息结构;
    规范化社交列表: (raw?: any[], options?: { 合并同名?: boolean }) => any[];
    规范化世界状态: (raw?: any) => 世界数据结构;
    规范化战斗状态: (raw?: any) => 战斗状态结构;
    规范化门派状态: (raw?: any) => 详细门派结构;
    规范化剧情状态: (raw?: any) => 剧情系统结构;
    规范化剧情规划状态: (raw?: any) => 剧情规划结构;
    规范化女主剧情规划状态: (raw?: any) => 女主剧情规划结构 | undefined;
    规范化同人剧情规划状态: (raw?: any) => 同人剧情规划结构 | undefined;
    规范化同人女主剧情规划状态: (raw?: any) => 同人女主剧情规划结构 | undefined;
    规范化角色物品容器映射: (raw?: any) => 角色数据结构;
    规范化校园系统: (raw?: any) => 校园系统数据;
    战斗结束自动清空: (battle: 战斗状态结构, story?: 剧情系统结构) => 战斗状态结构;
    设置角色?: (value: 角色数据结构) => void;
    设置环境?: (value: 环境信息结构) => void;
    设置社交?: (value: any[]) => void;
    设置世界?: (value: 世界数据结构) => void;
    设置战斗?: (value: 战斗状态结构) => void;
    设置玩家门派?: (value: 详细门派结构) => void;
    设置任务列表?: (value: any[]) => void;
    设置约定列表?: (value: any[]) => void;
    设置剧情?: (value: 剧情系统结构) => void;
    设置剧情规划?: (value: 剧情规划结构) => void;
    设置女主剧情规划?: (value: 女主剧情规划结构 | undefined) => void;
    设置同人剧情规划?: (value: 同人剧情规划结构 | undefined) => void;
    设置同人女主剧情规划?: (value: 同人女主剧情规划结构 | undefined) => void;
    设置校园系统?: (value: 校园系统数据) => void;
    设置写真系统?: (value: unknown) => void;
    设置都市网约车系统?: (value: unknown) => void;
    命令后校准?: (state: 响应命令处理状态) => { state: 响应命令处理状态; corrections?: string[] } | 响应命令处理状态;
};

export const 执行响应命令处理 = (
    response: GameResponse,
    currentState: 响应命令处理状态,
    deps: 响应命令处理依赖,
    baseState?: Partial<响应命令处理状态>,
    options?: {
        applyState?: boolean;
        /** AI 原始响应文本，用于解析 <欲望系统状态> XML 标签 */
        rawContent?: string;
    }
): 响应命令处理状态 => {
    const shouldApplyState = options?.applyState !== false;
    const rawContent = options?.rawContent;
    let charBuffer = baseState?.角色 || currentState.角色;
    const 原始气运列表 = Array.isArray(charBuffer?.气运列表) ? charBuffer.气运列表 : [];
    let envBuffer = deps.规范化环境信息(baseState?.环境 || currentState.环境);
    let socialBuffer = Array.isArray(baseState?.社交) ? baseState.社交 : currentState.社交;
    let worldBuffer = deps.规范化世界状态(baseState?.世界 || currentState.世界);
    let battleBuffer = deps.规范化战斗状态(baseState?.战斗 || currentState.战斗);
    let sectBuffer = deps.规范化门派状态(baseState?.玩家门派 || currentState.玩家门派);
    let tasksBuffer = Array.isArray(baseState?.任务列表) ? baseState.任务列表 : currentState.任务列表;
    let agreementsBuffer = Array.isArray(baseState?.约定列表) ? baseState.约定列表 : currentState.约定列表;
    let storyBuffer = deps.规范化剧情状态(baseState?.剧情 || currentState.剧情);
    let storyPlanBuffer = deps.规范化剧情规划状态(baseState?.剧情规划 || currentState.剧情规划);
    let heroinePlanBuffer = deps.规范化女主剧情规划状态(baseState?.女主剧情规划 ?? currentState.女主剧情规划);
    let fandomStoryPlanBuffer = deps.规范化同人剧情规划状态(baseState?.同人剧情规划 ?? currentState.同人剧情规划);
    let fandomHeroinePlanBuffer = deps.规范化同人女主剧情规划状态(baseState?.同人女主剧情规划 ?? currentState.同人女主剧情规划);
    let campusBuffer = deps.规范化校园系统(baseState?.校园系统 ?? currentState.校园系统);

    if (Array.isArray(response.tavern_commands)) {
        response.tavern_commands.forEach(cmd => {
            const result = applyStateCommand(
                charBuffer,
                envBuffer,
                socialBuffer,
                worldBuffer,
                battleBuffer,
                storyBuffer,
                storyPlanBuffer,
                heroinePlanBuffer,
                fandomStoryPlanBuffer,
                fandomHeroinePlanBuffer,
                sectBuffer,
                tasksBuffer,
                agreementsBuffer,
                campusBuffer,
                cmd.key,
                cmd.value,
                cmd.action
            );
            charBuffer = result.char;
            envBuffer = deps.规范化环境信息(result.env);
            socialBuffer = deps.规范化社交列表(result.social, { 合并同名: false });
            worldBuffer = deps.规范化世界状态(result.world);
            battleBuffer = result.battle;
            sectBuffer = deps.规范化门派状态(result.sect);
            tasksBuffer = Array.isArray(result.tasks) ? result.tasks : [];
            agreementsBuffer = Array.isArray(result.agreements) ? result.agreements : [];
            storyBuffer = result.story;
            storyPlanBuffer = deps.规范化剧情规划状态(result.storyPlan);
            heroinePlanBuffer = deps.规范化女主剧情规划状态(result.heroinePlan);
            fandomStoryPlanBuffer = deps.规范化同人剧情规划状态(result.fandomStoryPlan);
            fandomHeroinePlanBuffer = deps.规范化同人女主剧情规划状态(result.fandomHeroinePlan);
            campusBuffer = deps.规范化校园系统(result.campus);
        });

        battleBuffer = deps.战斗结束自动清空(battleBuffer, storyBuffer);
        charBuffer = deps.规范化角色物品容器映射(charBuffer);

        if (原始气运列表.length > 0 && (!Array.isArray(charBuffer?.气运列表) || charBuffer.气运列表.length === 0)) {
            charBuffer = { ...charBuffer, 气运列表: 深拷贝(原始气运列表) };
        }

        socialBuffer = deps.规范化社交列表(socialBuffer);
        storyBuffer = deps.规范化剧情状态(storyBuffer);

        // 解析 XML 标签：欲望系统状态、关系状态更新、性癖变化
        if (typeof rawContent === 'string') {
            const 游戏时间 = envBuffer?.时间 ?? '';

            // 解析 <欲望系统状态> XML 标签，应用 AI 返回的欲望档案更新
            const 欲望系统状态匹配 = rawContent.match(/<欲望系统状态>\s*([\s\S]*?)\s*<\/欲望系统状态>/);
            if (欲望系统状态匹配) {
                try {
                    const 解析结果 = JSON.parse(欲望系统状态匹配[1]) as { 更新档案?: Record<string, Partial<import('../../models/campusNSFW').NPC欲望档案>> };
                    if (解析结果.更新档案 && Object.keys(解析结果.更新档案).length > 0) {
                        const 欲望系统 = (campusBuffer.欲望系统 || {}) as NonNullable<校园NSFW系统扩展['欲望系统']>;
                        const 现有档案 = 欲望系统.NPC欲望档案 || {};
                        const 更新后档案 = { ...现有档案 };
                        for (const [npcId, 更新] of Object.entries(解析结果.更新档案)) {
                            更新后档案[npcId] = { ...(更新后档案[npcId] || {}), ...更新 } as any;
                        }
                        campusBuffer = {
                            ...campusBuffer,
                            欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 } as 校园NSFW系统扩展['欲望系统']
                        };
                    }
                } catch {
                    // JSON 解析失败，忽略本次更新
                }
            }

            // 解析 <关系状态更新> XML 标签，应用 NPC 关系数据更新
            const 关系状态匹配 = rawContent.match(/<关系状态更新>\s*([\s\S]*?)\s*<\/关系状态更新>/);
            if (关系状态匹配) {
                try {
                    const 解析结果 = JSON.parse(关系状态匹配[1]);
                    // 关系变化：Array<{npcId, 好感度, 亲密度, 信任度, 感情值}>
                    if (Array.isArray(解析结果.关系变化)) {
                        for (const 变化 of 解析结果.关系变化) {
                            if (!变化.npcId) continue;
                            const idx = socialBuffer.findIndex((n: any) => n.id === 变化.npcId);
                            if (idx >= 0) {
                                const npc = { ...socialBuffer[idx] };
                                if (!npc.关系数据) {
                                    npc.关系数据 = {
                                        npcId: npc.id,
                                        关系类型: '陌生',
                                        关系状态: '单恋',
                                        好感度: 0,
                                        亲密度: 0,
                                        信任度: 0,
                                        感情值: 0,
                                        互动次数: 0,
                                        关键事件: [],
                                        独家标记: false,
                                        解锁场景: [],
                                    };
                                }
                                if (变化.好感度 !== undefined) {
                                    npc.关系数据.好感度 = Math.max(0, Math.min(100, npc.关系数据.好感度 + 变化.好感度));
                                    npc.好感度 = npc.关系数据.好感度;
                                }
                                if (变化.亲密度 !== undefined) npc.关系数据.亲密度 = Math.max(0, Math.min(100, npc.关系数据.亲密度 + 变化.亲密度));
                                if (变化.信任度 !== undefined) npc.关系数据.信任度 = Math.max(0, Math.min(100, npc.关系数据.信任度 + 变化.信任度));
                                if (变化.感情值 !== undefined) npc.关系数据.感情值 = Math.max(0, Math.min(100, npc.关系数据.感情值 + 变化.感情值));
                                socialBuffer = [...socialBuffer];
                                socialBuffer[idx] = npc;
                            }
                        }
                    }
                    // 阶段推进：{npcId, 原阶段, 新阶段}
                    if (解析结果.阶段推进?.npcId) {
                        const idx = socialBuffer.findIndex((n: any) => n.id === 解析结果.阶段推进.npcId);
                        if (idx >= 0) {
                            const npc = { ...socialBuffer[idx] };
                            if (npc.关系数据) {
                                npc.关系数据 = { ...npc.关系数据, 关系类型: 解析结果.阶段推进.新阶段 };
                            }
                            socialBuffer = [...socialBuffer];
                            socialBuffer[idx] = npc;
                        }
                    }
                } catch {
                    // JSON 解析失败，忽略本次更新
                }
            }

            // 解析 <性癖变化> XML 标签，应用性癖动态变化
            const 性癖变化匹配 = rawContent.match(/<性癖变化>\s*([\s\S]*?)\s*<\/性癖变化>/g);
            if (性癖变化匹配 && 性癖变化匹配.length > 0) {
                const 游戏时间 = envBuffer?.时间 ?? '';
                for (const 匹配项 of 性癖变化匹配) {
                    try {
                        const json = 匹配项.replace(/<\/?性癖变化>/g, '').trim();
                        const 解析结果 = JSON.parse(json) as {
                            npc姓名: string;
                            触发事件: 性癖触发事件;
                            事件描述: string;
                        };
                        if (!解析结果.npc姓名 || !解析结果.触发事件) continue;

                        const idx = socialBuffer.findIndex((n: any) => n.姓名 === 解析结果.npc姓名);
                        if (idx < 0) continue;

                        const npc = { ...socialBuffer[idx] };
                        const 结果 = 记录性癖触发事件(npc, 解析结果.触发事件, 游戏时间, 解析结果.事件描述);
                        if (结果.有变化) {
                            socialBuffer = [...socialBuffer];
                            socialBuffer[idx] = npc;
                        }
                    } catch {
                        // JSON 解析失败，忽略本条
                    }
                }
            }

            // 解析 <人格演化> XML 标签（AI报告的人格变化，实际翻转已由引擎自动处理）
            const 人格演化匹配 = rawContent.match(/<人格演化>\s*([\s\S]*?)\s*<\/人格演化>/g);
            if (人格演化匹配 && 人格演化匹配.length > 0) {
                const 游戏时间 = envBuffer?.时间 ?? '';
                for (const 匹配项 of 人格演化匹配) {
                    try {
                        const json = 匹配项.replace(/<\/?人格演化>/g, '').trim();
                        const 解析结果 = JSON.parse(json) as {
                            npc姓名: string;
                            演化类型: string;
                            描述: string;
                        };
                        if (!解析结果.npc姓名) continue;

                        const idx = socialBuffer.findIndex((n: any) => n.姓名 === 解析结果.npc姓名);
                        if (idx < 0) continue;

                        const npc = { ...socialBuffer[idx] };
                        // 人格演化已通过 记录性癖触发事件 内部自动处理，此处仅更新时间戳
                        if (npc.完整演化状态?.人格演化) {
                            npc.完整演化状态.人格演化.最后演化时间 = 游戏时间;
                            socialBuffer = [...socialBuffer];
                            socialBuffer[idx] = npc;
                        }
                    } catch {
                        // JSON 解析失败，忽略本条
                    }
                }
            }

            // 解析 <孕产变化> XML 标签，应用孕产状态更新
            const 孕产变化匹配 = rawContent.match(/<孕产变化>\s*([\s\S]*?)\s*<\/孕产变化>/g);
            if (孕产变化匹配 && 孕产变化匹配.length > 0) {
              const 游戏时间 = envBuffer?.时间 ?? '';
              for (const 匹配项 of 孕产变化匹配) {
                try {
                  const json = 匹配项.replace(/<\/?孕产变化>/g, '').trim();
                  const 解析结果 = JSON.parse(json) as {
                    npc姓名: string;
                    变化类型: string;
                    旧阶段: string;
                    新阶段: string;
                    描述: string;
                  };
                  if (!解析结果.npc姓名) continue;

                  const idx = socialBuffer.findIndex((n: any) => n.姓名 === 解析结果.npc姓名);
                  if (idx < 0) continue;

                  const npc = { ...socialBuffer[idx] };
                  // 孕产变化已由引擎自动处理，此处仅更新妊娠进度
                  推进妊娠进程(npc, 游戏时间);
                  socialBuffer = [...socialBuffer];
                  socialBuffer[idx] = npc;
                } catch {
                  // JSON 解析失败，忽略本条
                }
              }
            }

            // 解析 <事后护理> XML 标签，应用事后护理状态更新
            const 事后护理匹配 = rawContent.match(/<事后护理>\s*([\s\S]*?)\s*<\/事后护理>/g);
            if (事后护理匹配 && 事后护理匹配.length > 0) {
              const 游戏时间 = envBuffer?.时间 ?? '';
              for (const 匹配项 of 事后护理匹配) {
                try {
                  const json = 匹配项.replace(/<\/?事后护理>/g, '').trim();
                  const 解析结果 = JSON.parse(json) as {
                    npc姓名: string;
                    护理质量: '无视' | '敷衍' | '温柔' | '用心';
                    情绪变化?: { 情绪类型: string; 强度: number }[];
                  };
                  if (!解析结果.npc姓名) continue;

                  const idx = socialBuffer.findIndex((n: any) => n.姓名 === 解析结果.npc姓名);
                  if (idx < 0) continue;

                  const npc = { ...socialBuffer[idx] };
                  // 评估护理质量
                  评估护理质量(npc, 解析结果.护理质量, 游戏时间, 'AI叙事触发');
                  // 记录情绪变化
                  if (解析结果.情绪变化) {
                    for (const 情绪 of 解析结果.情绪变化) {
                      记录事后情绪(npc, 情绪.情绪类型 as any, 情绪.强度, 游戏时间, 'AI叙事触发');
                    }
                  }
                  socialBuffer = [...socialBuffer];
                  socialBuffer[idx] = npc;
                } catch {
                  // JSON 解析失败，忽略本条
                }
              }
            }

            // 解析 <情绪变化> XML 标签，应用情绪状态更新
            const 情绪变化匹配 = rawContent.match(/<情绪变化>\s*([\s\S]*?)\s*<\/情绪变化>/g);
            if (情绪变化匹配 && 情绪变化匹配.length > 0) {
              for (const 匹配项 of 情绪变化匹配) {
                try {
                  const json = 匹配项.replace(/<\/?情绪变化>/g, '').trim();
                  const 解析结果 = JSON.parse(json) as {
                    npc姓名: string;
                    心情变化: number;
                    触发类型: '场景' | '对话' | '记忆' | '环境' | 'NSFW互动' | '社交事件';
                    触发源: string;
                  };
                  if (!解析结果.npc姓名) continue;

                  const idx = socialBuffer.findIndex((n: any) => n.姓名 === 解析结果.npc姓名);
                  if (idx < 0) continue;

                  const npc = { ...socialBuffer[idx] };
                  const 当前情绪 = (npc as any).NSFW扩展?.情绪状态 || 创建初始情绪(npc.人格类型);
                  const 新情绪 = 计算下一回合情绪({
                    当前情绪,
                    人格标签: npc.人格类型,
                  });
                  // 应用AI指定的心情变化
                  新情绪.心情值 = clamp(新情绪.心情值 + 解析结果.心情变化, 0, 100);
                  新情绪.心情阶段 = 计算心情阶段(新情绪.心情值);
                  (npc as any).NSFW扩展 = {
                    ...(npc as any).NSFW扩展 || {},
                    情绪状态: 新情绪,
                  };
                  socialBuffer = [...socialBuffer];
                  socialBuffer[idx] = npc;
                } catch {
                  // JSON 解析失败，忽略本条
                }
              }
            }

            // 解析 <羁绊进展> XML 标签，应用羁绊里程碑
            const 羁绊进展匹配 = rawContent.match(/<羁绊进展>\s*([\s\S]*?)\s*<\/羁绊进展>/g);
            if (羁绊进展匹配 && 羁绊进展匹配.length > 0) {
              for (const 匹配项 of 羁绊进展匹配) {
                try {
                  const json = 匹配项.replace(/<\/?羁绊进展>/g, '').trim();
                  const 解析结果 = JSON.parse(json) as {
                    npc姓名: string;
                    里程碑Id: string;
                    备注?: string;
                  };
                  if (!解析结果.npc姓名 || !解析结果.里程碑Id) continue;

                  const idx = socialBuffer.findIndex((n: any) => n.姓名 === 解析结果.npc姓名);
                  if (idx < 0) continue;

                  const npc = { ...socialBuffer[idx] };
                  const 当前羁绊树 = npc.NSFW扩展?.羁绊树 || 创建初始羁绊树();
                  npc.NSFW扩展 = {
                    ...(npc.NSFW扩展 || {}),
                    羁绊树: 达成里程碑(当前羁绊树, 解析结果.里程碑Id, 解析结果.备注 || ''),
                  };
                  socialBuffer = [...socialBuffer];
                  socialBuffer[idx] = npc;
                } catch {
                  // JSON 解析失败，忽略本条
                }
              }
            }

            // 解析 <NSFW记忆> XML 标签，添加NSFW记忆条目
            const NSFW记忆匹配 = rawContent.match(/<NSFW记忆>\s*([\s\S]*?)\s*<\/NSFW记忆>/g);
            if (NSFW记忆匹配 && NSFW记忆匹配.length > 0) {
              const 游戏时间 = envBuffer?.时间 ?? '';
              for (const 匹配项 of NSFW记忆匹配) {
                try {
                  const json = 匹配项.replace(/<\/?NSFW记忆>/g, '').trim();
                  const 解析结果 = JSON.parse(json) as {
                    npc姓名: string;
                    类别: '首次体验' | '突破事件' | '情感高潮' | '特殊场景' | '道具使用' | '角色扮演' | '多人互动' | '事后温馨';
                    内容: string;
                    情感极性: '正面' | '负面' | '中性' | '复杂';
                    触发关键词?: string[];
                    重要度?: number;
                  };
                  if (!解析结果.npc姓名 || !解析结果.类别 || !解析结果.内容) continue;

                  const idx = socialBuffer.findIndex((n: any) => n.姓名 === 解析结果.npc姓名);
                  if (idx < 0) continue;

                  const npc = { ...socialBuffer[idx] };
                  const 当前记忆 = (npc as any).NSFW扩展?.NSFW记忆 || 创建初始记忆库();
                  (npc as any).NSFW扩展 = {
                    ...(npc as any).NSFW扩展 || {},
                    NSFW记忆: 添加NSFW记忆(当前记忆, {
                      类别: 解析结果.类别,
                      标题: 解析结果.类别,
                      描述: 解析结果.内容,
                      发生时间: 游戏时间,
                      关联NPC: [解析结果.npc姓名],
                      重要度: 解析结果.重要度 ?? 3,
                      情感色彩: 解析结果.情感极性,
                      回忆触发词: 解析结果.触发关键词 || [],
                    }),
                  };
                  socialBuffer = [...socialBuffer];
                  socialBuffer[idx] = npc;
                } catch {
                  // JSON 解析失败，忽略本条
                }
              }
            }

            // 解析 <系统后果> XML 标签，添加系统后果
            const 系统后果匹配 = rawContent.match(/<系统后果>\s*([\s\S]*?)\s*<\/系统后果>/g);
            if (系统后果匹配 && 系统后果匹配.length > 0) {
              for (const 匹配项 of 系统后果匹配) {
                try {
                  const json = 匹配项.replace(/<\/?系统后果>/g, '').trim();
                  const 解析结果 = JSON.parse(json) as {
                    类型: '短期情绪' | '中期关系' | '长期人格' | '声誉影响' | '行为模式';
                    描述: string;
                    来源事件?: string;
                    影响值: number;
                    持续时间: number;
                    严重度: '轻微' | '中等' | '严重' | '极端';
                  };
                  if (!解析结果.类型 || !解析结果.描述) continue;

                  const 当前后果 = (campusBuffer as any).NSFW后果 || 创建初始后果系统();
                  (campusBuffer as any).NSFW后果 = 添加后果(当前后果, {
                    类型: 解析结果.类型,
                    严重度: 解析结果.严重度,
                    描述: 解析结果.描述,
                    来源事件: 解析结果.来源事件 || 'AI叙事触发',
                    影响值: 解析结果.影响值,
                    持续时间: 解析结果.持续时间,
                  });
                } catch {
                  // JSON 解析失败，忽略本条
                }
              }
            }

            // 回合结束：对所有女性 NPC 应用性癖衰减
            if (游戏时间) {
                const 衰减结果 = 批量应用性癖衰减(socialBuffer, 游戏时间);
                if (衰减结果.length > 0) {
                    for (const 结果 of 衰减结果) {
                        const idx = socialBuffer.findIndex((n: any) => n.姓名 === 结果.npc姓名);
                        if (idx >= 0) {
                            socialBuffer = [...socialBuffer];
                            socialBuffer[idx] = { ...socialBuffer[idx] };
                        }
                    }
                }
            }
        }

        let finalState: 响应命令处理状态 = {
            角色: charBuffer,
            环境: deps.规范化环境信息(envBuffer),
            社交: socialBuffer,
            世界: deps.规范化世界状态(worldBuffer),
            战斗: battleBuffer,
            玩家门派: deps.规范化门派状态(sectBuffer),
            任务列表: Array.isArray(tasksBuffer) ? tasksBuffer : [],
            约定列表: Array.isArray(agreementsBuffer) ? agreementsBuffer : [],
            剧情: storyBuffer,
            剧情规划: deps.规范化剧情规划状态(storyPlanBuffer),
            女主剧情规划: deps.规范化女主剧情规划状态(heroinePlanBuffer),
            同人剧情规划: deps.规范化同人剧情规划状态(fandomStoryPlanBuffer),
            同人女主剧情规划: deps.规范化同人女主剧情规划状态(fandomHeroinePlanBuffer),
            校园系统: campusBuffer
        };
        const calibrated = deps.命令后校准?.(finalState);
        if (calibrated) {
            finalState = 'state' in calibrated ? calibrated.state : calibrated;
        }

        if (shouldApplyState) {
            deps.设置角色?.(finalState.角色);
            deps.设置环境?.(finalState.环境);
            deps.设置社交?.(finalState.社交);
            deps.设置世界?.(finalState.世界);
            deps.设置战斗?.(finalState.战斗);
            deps.设置玩家门派?.(finalState.玩家门派);
            deps.设置任务列表?.(finalState.任务列表);
            deps.设置约定列表?.(finalState.约定列表);
            deps.设置剧情?.(finalState.剧情);
            deps.设置剧情规划?.(finalState.剧情规划);
            deps.设置女主剧情规划?.(finalState.女主剧情规划);
            deps.设置同人剧情规划?.(finalState.同人剧情规划);
            deps.设置同人女主剧情规划?.(finalState.同人女主剧情规划);
            deps.设置校园系统?.(finalState.校园系统);
            if ((finalState as any).写真系统) {
                deps.设置写真系统?.((finalState as any).写真系统);
            }
            if ((finalState as any).都市网约车系统) {
                deps.设置都市网约车系统?.((finalState as any).都市网约车系统);
            }
        }

        return finalState;
    }

    let finalState: 响应命令处理状态 = {
        角色: charBuffer,
        环境: deps.规范化环境信息(envBuffer),
        社交: deps.规范化社交列表(socialBuffer),
        世界: deps.规范化世界状态(worldBuffer),
        战斗: battleBuffer,
        玩家门派: deps.规范化门派状态(sectBuffer),
        任务列表: Array.isArray(tasksBuffer) ? tasksBuffer : [],
        约定列表: Array.isArray(agreementsBuffer) ? agreementsBuffer : [],
        剧情: deps.规范化剧情状态(storyBuffer),
        剧情规划: deps.规范化剧情规划状态(storyPlanBuffer),
        女主剧情规划: deps.规范化女主剧情规划状态(heroinePlanBuffer),
        同人剧情规划: deps.规范化同人剧情规划状态(fandomStoryPlanBuffer),
        同人女主剧情规划: deps.规范化同人女主剧情规划状态(fandomHeroinePlanBuffer),
        校园系统: campusBuffer
    };

    // 无 tavern_commands 时也解析欲望系统状态更新
    if (typeof rawContent === 'string') {
        const 欲望系统状态匹配 = rawContent.match(/<欲望系统状态>\s*([\s\S]*?)\s*<\/欲望系统状态>/);
        if (欲望系统状态匹配) {
            try {
                const 解析结果 = JSON.parse(欲望系统状态匹配[1]) as { 更新档案?: Record<string, any> };
                if (解析结果.更新档案 && Object.keys(解析结果.更新档案).length > 0) {
                    const 欲望系统 = (campusBuffer.欲望系统 || {}) as NonNullable<校园NSFW系统扩展['欲望系统']>;
                    const 现有档案 = 欲望系统.NPC欲望档案 || {};
                    const 更新后档案 = { ...现有档案 };
                    for (const [npcId, 更新] of Object.entries(解析结果.更新档案)) {
                        更新后档案[npcId] = { ...(更新后档案[npcId] || {}), ...更新 };
                    }
                    campusBuffer = {
                        ...campusBuffer,
                        欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 } as 校园NSFW系统扩展['欲望系统']
                    };
                }
            } catch { /* JSON 解析失败，忽略 */ }
        }
    }

    // 更新 finalState 中的校园系统
    finalState.校园系统 = campusBuffer;

    // 解析 <写真系统状态> XML 标签，应用 AI 返回的写真系统更新
    if (typeof rawContent === 'string') {
        const 写真系统状态匹配 = rawContent.match(/<写真系统状态>\s*([\s\S]*?)\s*<\/写真系统状态>/);
        if (写真系统状态匹配) {
            try {
                const 写真解析结果 = JSON.parse(写真系统状态匹配[1]) as {
                    更新模特档案?: Record<string, Partial<import('../../../models/photographyNSFW').模特核心状态>>;
                    更新拍摄项目?: Partial<import('../../../models/photographyNSFW').拍摄项目状态>[];
                    新泄露事件?: import('../../../models/photographyNSFW').泄露事件状态[];
                };
                const 写真系统 = (finalState as any).写真系统 || {} as 写真系统扩展;
                const 更新后模特档案 = { ...(写真系统.模特档案 || {}) };
                if (写真解析结果.更新模特档案) {
                    for (const [id, 更新] of Object.entries(写真解析结果.更新模特档案)) {
                        更新后模特档案[id] = { ...(更新后模特档案[id] || {}), ...更新 } as any;
                    }
                }
                const 更新后项目 = [...(写真系统.进行中的拍摄项目 || [])];
                if (写真解析结果.更新拍摄项目) {
                    for (const 更新 of 写真解析结果.更新拍摄项目) {
                        if (更新.id) {
                            const idx = 更新后项目.findIndex(p => p.id === 更新.id);
                            if (idx >= 0) 更新后项目[idx] = { ...更新后项目[idx], ...更新 } as any;
                        }
                    }
                }
                const 更新后泄露 = [...(写真系统.泄露事件列表 || [])];
                if (写真解析结果.新泄露事件) {
                    更新后泄露.push(...写真解析结果.新泄露事件);
                }
                (finalState as any).写真系统 = {
                    ...写真系统,
                    模特档案: 更新后模特档案,
                    进行中的拍摄项目: 更新后项目,
                    泄露事件列表: 更新后泄露,
                } as 写真系统扩展;
            } catch { /* JSON 解析失败，忽略 */ }
        }
    }

    const calibrated = deps.命令后校准?.(finalState);
    if (calibrated) {
        finalState = 'state' in calibrated ? calibrated.state : calibrated;
        if (shouldApplyState) {
            deps.设置角色?.(finalState.角色);
            deps.设置环境?.(finalState.环境);
            deps.设置社交?.(finalState.社交);
            deps.设置世界?.(finalState.世界);
            deps.设置战斗?.(finalState.战斗);
            deps.设置玩家门派?.(finalState.玩家门派);
            deps.设置任务列表?.(finalState.任务列表);
            deps.设置约定列表?.(finalState.约定列表);
            deps.设置剧情?.(finalState.剧情);
            deps.设置剧情规划?.(finalState.剧情规划);
            deps.设置女主剧情规划?.(finalState.女主剧情规划);
            deps.设置同人剧情规划?.(finalState.同人剧情规划);
            deps.设置同人女主剧情规划?.(finalState.同人女主剧情规划);
            deps.设置校园系统?.(finalState.校园系统);
            if ((finalState as any).写真系统) {
                deps.设置写真系统?.((finalState as any).写真系统);
            }
            if ((finalState as any).都市网约车系统) {
                deps.设置都市网约车系统?.((finalState as any).都市网约车系统);
            }
        }
    };
    return finalState;
};
