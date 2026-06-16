import { resolveEraNode } from '../../models/eraTheme';
import type { EraOpeningScene } from '../../models/eraTheme/types';

/** 从时代元数据中选取一个开局场景并生成注入提示词 */
export const 构建时代开局场景注入 = (eraId: string | null | undefined, seed?: number, selectedSceneId?: string): string => {
    if (!eraId) return '';

    const resolved = resolveEraNode(eraId);
    if (!resolved) return '';

    const scenes = resolved.inherited.openingScenes;
    if (!scenes || scenes.length === 0) return '';

    let scene: EraOpeningScene | undefined;
    if (selectedSceneId) {
        scene = scenes.find((s) => s.id === selectedSceneId);
    }
    if (!scene) {
        const index = seed !== undefined ? seed % scenes.length : Math.floor(Math.random() * scenes.length);
        scene = scenes[index];
    }
    if (!scene) return '';

    return `【时代开局场景】
场景：${scene.name}
描述：${scene.description}
请将此场景作为开场叙事的切入点或背景氛围，自然融入第一幕。`;
};
