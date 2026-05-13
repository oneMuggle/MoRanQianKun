import { 构建NPC上下文 } from '../npc/npcContext';
import type { 记忆配置结构, 世界书作用域 } from '../../../types';
import type { OpeningConfig } from '../../../types';
import type { LiModeStage } from '../../../models/eraTheme/types';

export const 构建社交上下文 = (
    socialData: any[],
    memoryConfig: 记忆配置结构,
    params: {
        worldPrompt: string;
        realmPrompt: string;
        openingConfig?: OpeningConfig;
        cultivationSystemEnabled: boolean;
        eraId?: string | null;
        启用子纪元里模式?: Record<string, boolean>;
        子纪元里模式阶段?: Record<string, LiModeStage>;
    }
) => {
    return 构建NPC上下文(socialData || [], memoryConfig, {
        worldPrompt: params.worldPrompt,
        realmPrompt: params.realmPrompt,
        openingConfig: params.openingConfig,
        cultivationSystemEnabled: params.cultivationSystemEnabled,
        eraId: params.eraId,
        启用子纪元里模式: params.启用子纪元里模式,
        子纪元里模式阶段: params.子纪元里模式阶段
    });
};
