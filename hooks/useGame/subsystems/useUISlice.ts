// hooks/useGame/subsystems/useUISlice.ts
// UI 辅助 slice — 通知、回档快照
// Zustand 就绪 { state, actions } 模式

import { useCallback, useState, useRef } from 'react';
import { 创建通知系统, type 右下角提示结构 } from '../ui/notificationSystem';
import { 创建回档快照系统, type 回合快照结构 } from '../ui/rollbackSnapshot';

export interface UISliceState {
    右下角提示列表: 右下角提示结构[];
    聊天区自动滚动抑制令牌: number;
    聊天区强制置底令牌: number;
    回合快照栈Ref: React.MutableRefObject<回合快照结构[]>;
    可重Roll计数: number;
    推送右下角提示: (toast: Omit<右下角提示结构, 'id'>) => void;
}

export interface UISliceActions {
    dismissNotification: (toastId: string) => void;
    同步重Roll计数: () => void;
    清空重Roll快照: () => void;
    推入重Roll快照: () => void;
    弹出重Roll快照: (snapshot?: 回合快照结构) => 回合快照结构 | null;
    回档到快照: (snapshot: 回合快照结构) => void;
    重置自动存档状态: () => void;
    删除最近自动存档并重置状态: () => void;
    set聊天区自动滚动抑制令牌: React.Dispatch<React.SetStateAction<number>>;
    set聊天区强制置底令牌: React.Dispatch<React.SetStateAction<number>>;
}

type UISliceContext = {
    深拷贝: <T>(data: T) => T;
    规范化角色物品容器映射: (raw: any) => any;
    规范化环境信息: (raw: any) => any;
    规范化社交列表: (raw: any[], options?: any) => any[];
    规范化世界状态: (raw: any) => any;
    规范化剧情状态: (raw: any) => any;
    规范化剧情规划状态: (raw: any) => any;
    规范化女主剧情规划状态: (raw: any) => any;
    规范化同人剧情规划状态: (raw: any) => any;
    规范化同人女主剧情规划状态: (raw: any) => any;
    应用并同步记忆系统: (memory: any, options?: any) => void;
    设置历史记录: React.Dispatch<React.SetStateAction<any[]>>;
    应用视觉设置到状态: (value: any) => void;
    应用场景图片档案到状态: (value: any) => void;
    最近自动存档时间戳Ref: React.MutableRefObject<number>;
    最近自动存档签名Ref: React.MutableRefObject<string>;
};

export function useUISlice(ctx: UISliceContext): { state: UISliceState; actions: UISliceActions } {
    const [右下角提示列表, set右下角提示列表] = useState<右下角提示结构[]>([]);
    const [聊天区自动滚动抑制令牌, set聊天区自动滚动抑制令牌] = useState(0);
    const [聊天区强制置底令牌, set聊天区强制置底令牌] = useState(0);
    const [可重Roll计数, set可重Roll计数] = useState(0);
    const 回合快照栈Ref = useRef<回合快照结构[]>([]);

    const 通知系统 = 创建通知系统(set右下角提示列表);
    const 推送右下角提示 = 通知系统.推送右下角提示;

    const 回档快照系统 = 创建回档快照系统({
        回合快照栈Ref,
        可重Roll计数,
        set可重Roll计数,
        最近自动存档时间戳Ref: ctx.最近自动存档时间戳Ref,
        最近自动存档签名Ref: ctx.最近自动存档签名Ref,
        深拷贝: ctx.深拷贝,
        规范化角色物品容器映射: ctx.规范化角色物品容器映射,
        规范化环境信息: ctx.规范化环境信息,
        规范化社交列表: ctx.规范化社交列表,
        规范化世界状态: ctx.规范化世界状态,
        规范化剧情状态: ctx.规范化剧情状态,
        规范化剧情规划状态: ctx.规范化剧情规划状态,
        规范化女主剧情规划状态: ctx.规范化女主剧情规划状态,
        规范化同人剧情规划状态: ctx.规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: ctx.规范化同人女主剧情规划状态,
        应用并同步记忆系统: (memory) => ctx.应用并同步记忆系统(memory),
        设置历史记录: ctx.设置历史记录,
        应用视觉设置到状态: ctx.应用视觉设置到状态,
        应用场景图片档案到状态: ctx.应用场景图片档案到状态,
    });

    const { 同步重Roll计数, 清空重Roll快照, 推入重Roll快照, 弹出重Roll快照, 回档到快照, 重置自动存档状态, 删除最近自动存档并重置状态 } = 回档快照系统;

    const dismissNotification = useCallback((toastId: string) => {
        if (!toastId) return;
        set右下角提示列表(prev => prev.filter(item => item.id !== toastId));
    }, []);

    return {
        state: { 右下角提示列表, 聊天区自动滚动抑制令牌, 聊天区强制置底令牌, 回合快照栈Ref, 可重Roll计数, 推送右下角提示 },
        actions: { dismissNotification, 同步重Roll计数, 清空重Roll快照, 推入重Roll快照, 弹出重Roll快照, 回档到快照, 重置自动存档状态, 删除最近自动存档并重置状态, set聊天区自动滚动抑制令牌, set聊天区强制置底令牌 },
    };
}
