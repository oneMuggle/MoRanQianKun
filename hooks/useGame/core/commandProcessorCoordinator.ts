/**
 * 命令处理工作流
 * 从 useGame.ts 提取的 processResponseCommands 函数（含校园系统规范化 + 变量校准）
 */
import type { GameResponse, 详细门派结构, 女主剧情规划结构, 同人剧情规划结构, 同人女主剧情规划结构 } from '../../../types';
import { 执行响应命令处理 } from '../npc/responseCommandProcessor';

interface CommandProcessorDeps {
    角色: any;
    环境: any;
    社交: any[];
    世界: any;
    战斗: any;
    玩家门派?: 详细门派结构;
    任务列表?: any[];
    约定列表?: any[];
    剧情: any;
    剧情规划: any;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;
    校园系统: any;
    写真系统: any;
    都市网约车系统: any;
    规范化环境信息: (...args: any[]) => any;
    规范化社交列表: (list: any[]) => any[];
    规范化世界状态: (...args: any[]) => any;
    规范化战斗状态: (...args: any[]) => any;
    规范化门派状态: (...args: any[]) => any;
    规范化剧情状态: (...args: any[]) => any;
    规范化剧情规划状态: (...args: any[]) => any;
    规范化女主剧情规划状态: (...args: any[]) => any;
    规范化同人剧情规划状态: (...args: any[]) => any;
    规范化同人女主剧情规划状态: (...args: any[]) => any;
    规范化角色物品容器映射: (...args: any[]) => any;
    战斗结束自动清空: (battle: any, story?: any) => any;
    深拷贝: <T>(value: T) => T;
    设置角色: (value: any) => void;
    设置环境: (value: any) => void;
    设置社交: (value: any[] | ((prev: any[]) => any[])) => void;
    设置世界: (value: any) => void;
    设置战斗: (value: any) => void;
    设置玩家门派: (value: any) => void;
    设置任务列表: (value: any[] | ((prev: any[]) => any[])) => void;
    设置约定列表: (value: any[] | ((prev: any[]) => any[])) => void;
    设置剧情: (value: any) => void;
    设置剧情规划: (value: any) => void;
    设置女主剧情规划: (value: any) => void;
    设置同人剧情规划: (value: any) => void;
    设置同人女主剧情规划: (value: any) => void;
    设置校园系统: (value: any) => void;
    设置写真系统: (value: any) => void;
    设置都市网约车系统: (value: any) => void;
    执行变量自动校准: (nextState: any, normalizers: object) => any;
    变量生成功能已启用: (apiConfig: any) => boolean;
    apiConfig: any;
}

export function 创建命令处理工作流(deps: CommandProcessorDeps) {
    const processResponseCommands = (
        response: GameResponse,
        baseState?: {
            角色: any;
            环境: any;
            社交: any[];
            世界: any;
            战斗: any;
            玩家门派?: 详细门派结构;
            任务列表?: any[];
            约定列表?: any[];
            剧情: any;
            剧情规划: any;
            女主剧情规划?: 女主剧情规划结构;
            同人剧情规划?: 同人剧情规划结构;
            同人女主剧情规划?: 同人女主剧情规划结构;
        },
        options?: { applyState?: boolean; rawContent?: string }
    ) => 执行响应命令处理(
        response,
        {
            角色: deps.角色,
            环境: deps.环境,
            社交: deps.社交,
            世界: deps.世界,
            战斗: deps.战斗,
            玩家门派: deps.玩家门派,
            任务列表: deps.任务列表,
            约定列表: deps.约定列表,
            剧情: deps.剧情,
            剧情规划: deps.剧情规划,
            女主剧情规划: deps.女主剧情规划,
            同人剧情规划: deps.同人剧情规划,
            同人女主剧情规划: deps.同人女主剧情规划,
            校园系统: deps.校园系统
        },
        {
            规范化环境信息: deps.规范化环境信息,
            规范化社交列表: deps.规范化社交列表,
            规范化世界状态: deps.规范化世界状态,
            规范化战斗状态: deps.规范化战斗状态,
            规范化门派状态: deps.规范化门派状态,
            规范化剧情状态: deps.规范化剧情状态,
            规范化剧情规划状态: deps.规范化剧情规划状态,
            规范化女主剧情规划状态: deps.规范化女主剧情规划状态,
            规范化同人剧情规划状态: deps.规范化同人剧情规划状态,
            规范化同人女主剧情规划状态: deps.规范化同人女主剧情规划状态,
            规范化角色物品容器映射: deps.规范化角色物品容器映射,
            战斗结束自动清空: deps.战斗结束自动清空,
            规范化校园系统: (raw?: any) => {
                const safe = deps.深拷贝(raw || {});
                return {
                    论坛帖子列表: Array.isArray(safe.论坛帖子列表) ? safe.论坛帖子列表 : [],
                    表白墙帖子列表: Array.isArray(safe.表白墙帖子列表) ? safe.表白墙帖子列表 : [],
                    BDSM帖子列表: Array.isArray(safe.BDSM帖子列表) ? safe.BDSM帖子列表 : [],
                    私聊会话列表: Array.isArray(safe.私聊会话列表) ? safe.私聊会话列表 : [],
                    课程表: (safe.课程表 && typeof safe.课程表 === 'object') ? safe.课程表 : {},
                    校园卡: (safe.校园卡 && typeof safe.校园卡 === 'object') ? {
                        余额: typeof safe.校园卡.余额 === 'number' ? safe.校园卡.余额 : 0,
                        消费记录: Array.isArray(safe.校园卡.消费记录) ? safe.校园卡.消费记录 : [],
                    } : { 余额: 0, 消费记录: [] },
                    社团活动列表: Array.isArray(safe.社团活动列表) ? safe.社团活动列表 : [],
                    欲望系统: safe.欲望系统 ?? undefined,
                    见面预约列表: Array.isArray(safe.见面预约列表) ? safe.见面预约列表 : undefined,
                };
            },
            设置角色: deps.设置角色,
            设置环境: deps.设置环境,
            设置社交: deps.设置社交,
            设置世界: deps.设置世界,
            设置战斗: deps.设置战斗,
            设置玩家门派: deps.设置玩家门派,
            设置任务列表: deps.设置任务列表,
            设置约定列表: deps.设置约定列表,
            设置剧情: deps.设置剧情,
            设置剧情规划: deps.设置剧情规划,
            设置女主剧情规划: deps.设置女主剧情规划,
            设置同人剧情规划: deps.设置同人剧情规划,
            设置同人女主剧情规划: deps.设置同人女主剧情规划,
            设置校园系统: deps.设置校园系统,
            设置写真系统: deps.设置写真系统,
            设置都市网约车系统: deps.设置都市网约车系统,
            命令后校准: (nextState) => {
                if (!deps.变量生成功能已启用(deps.apiConfig)) return nextState;
                return deps.执行变量自动校准(nextState, {
                    规范化环境信息: deps.规范化环境信息,
                    规范化社交列表: deps.规范化社交列表,
                    规范化世界状态: deps.规范化世界状态,
                    规范化战斗状态: deps.规范化战斗状态,
                    规范化门派状态: deps.规范化门派状态,
                    规范化剧情状态: deps.规范化剧情状态,
                    规范化剧情规划状态: deps.规范化剧情规划状态,
                    规范化女主剧情规划状态: deps.规范化女主剧情规划状态,
                    规范化同人剧情规划状态: deps.规范化同人剧情规划状态,
                    规范化同人女主剧情规划状态: deps.规范化同人女主剧情规划状态,
                    规范化角色物品容器映射: deps.规范化角色物品容器映射
                });
            }
        },
        baseState,
        options
    );

    return { processResponseCommands };
}
