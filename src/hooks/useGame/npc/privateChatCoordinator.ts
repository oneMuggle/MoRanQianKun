/**
 * 私聊发送协调器
 * 从 useGame.ts 提取的 handlePrivateChatSend 函数
 */

interface PrivateChatDeps {
    apiConfig: any;
    校园系统: any;
    角色: any;
    设置校园系统?: (updater: any) => void;
}

export function 创建私聊发送工作流(deps: PrivateChatDeps) {
    const handlePrivateChatSend = async (
        npcId: string,
        npcName: string,
        content: string
    ): Promise<{ npcReply: string }> => {
        const { 获取主剧情接口配置 } = await import('../../../utils/apiConfig');
        const 私聊Api = 获取主剧情接口配置(deps.apiConfig);
        if (!私聊Api || !私聊Api.apiKey) {
            return { npcReply: '[无法连接AI，私聊功能不可用]' };
        }

        const 私聊列表 = deps.校园系统?.私聊会话列表 || [];
        const 当前会话 = 私聊列表.find((s: any) => s.id === npcId);
        const 会话历史 = (当前会话?.消息列表 || []).map((m: any) => ({
            sender: m.发送者,
            content: m.内容,
            isMe: m.发送者 === (deps.角色?.姓名 || '玩家')
        }));

        try {
            const { 执行私聊发送工作流 } = await import('./privateChatWorkflow');
            const result = await 执行私聊发送工作流({
                npcId,
                npcName,
                玩家姓名: deps.角色?.姓名 || '玩家',
                会话历史,
                校园系统: deps.校园系统,
                apiConfig: 私聊Api
            }, content);

            if (result.状态更新?.更新档案) {
                deps.设置校园系统?.(prev => {
                    const 欲望系统 = (prev?.欲望系统 || {}) as any;
                    const 现有档案 = 欲望系统.NPC欲望档案 || {};
                    const 更新后档案 = { ...现有档案 };
                    for (const [id, 更新] of Object.entries(result.状态更新!.更新档案)) {
                        更新后档案[id] = { ...(更新后档案[id] || {}), ...更新 };
                    }
                    return {
                        ...prev,
                        欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 }
                    };
                });
            }

            return { npcReply: result.npcReply };
        } catch (err) {
            console.warn('[私聊发送] 失败:', err);
            return { npcReply: '[消息发送失败，请重试]' };
        }
    };

    return { handlePrivateChatSend };
}
