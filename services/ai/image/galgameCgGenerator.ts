/**
 * galgameCgGenerator.ts
 *
 * 基于 AI 的 Galgame CG 生成服务。
 * 复用现有图片生成后端（OpenAI/ComfyUI/NovelAI/SDWebUI），
 * 针对 CG 场景组装提示词，生成后自动解锁 CG 条目。
 */

import { generateImageByPrompt, persistImageAssetLocally } from './imageTasks';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { GalgameCG } from '../../../models/avg/galgame';
import { getGalgameEventBus } from '../../../hooks/useGame/avg/galgame/galgameEventBus';

// ==================== CG 提示词模板 ====================

interface CgPromptParams {
  /** 角色名称 */
  characterName: string;
  /** 角色外貌描述 */
  characterAppearance?: string;
  /** 场景描述 */
  sceneDescription: string;
  /** 氛围/情绪 */
  mood: string;
  /** 构图 */
  composition: '特写' | '半身' | '全身' | '场景';
  /** 额外正向描述 */
  extraPositive?: string;
}

/**
 * 组装 CG 生成提示词。
 */
function buildCgPrompt(params: CgPromptParams): string {
  const parts: string[] = [];

  if (params.characterAppearance) {
    parts.push(params.characterAppearance);
  } else {
    parts.push(params.characterName);
  }

  parts.push(params.sceneDescription);
  parts.push(params.mood);

  const compositionMap: Record<string, string> = {
    '特写': 'close up, detailed face',
    '半身': 'upper body, portrait',
    '全身': 'full body, standing',
    '场景': 'wide shot, scene, environment',
  };
  parts.push(compositionMap[params.composition] || compositionMap['半身']);

  if (params.extraPositive) {
    parts.push(params.extraPositive);
  }

  parts.push('masterpiece, best quality, highres, detailed');

  return parts.join(', ');
}

/**
 * CG 生成负面提示词。
 */
function buildCgNegativePrompt(): string {
  return 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry';
}

// ==================== CG 生成 ====================

interface CgGenerationOptions {
  /** 目标 CG 尺寸（默认 1024x1024） */
  size?: string;
}

interface CgGenerationResult {
  /** 是否成功 */
  success: boolean;
  /** 生成的图片 URL 或本地路径 */
  imageUrl: string | null;
  /** 错误信息 */
  error: string | null;
}

/**
 * 为指定 CG 条目生成图片。
 */
export async function generateCgImage(
  cg: GalgameCG,
  apiConfig: 当前可用接口结构,
  params: CgPromptParams,
  options?: CgGenerationOptions
): Promise<CgGenerationResult> {
  const positivePrompt = buildCgPrompt(params);
  const negativePrompt = buildCgNegativePrompt();
  const size = options?.size || '1024x1024';

  try {
    const result = await generateImageByPrompt(positivePrompt, apiConfig, undefined, {
      尺寸: size,
      附加正向提示词: '',
      附加负面提示词: negativePrompt,
      构图: params.composition === '场景' ? '场景' : params.composition === '特写' ? '头像' : params.composition === '全身' ? '立绘' : '半身',
    });

    let imageUrl: string | null = result.图片URL || result.本地路径 || null;

    if (result.图片URL && !result.本地路径) {
      const persistedResult = await persistImageAssetLocally(result);
      imageUrl = persistedResult.本地路径 || persistedResult.图片URL || null;
    }

    if (imageUrl) {
      getGalgameEventBus().publishCGUnlock({
        cgIds: [cg.id],
        routeId: cg.routeId,
      });
    }

    return {
      success: !!imageUrl,
      imageUrl,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      imageUrl: null,
      error: message,
    };
  }
}

/**
 * 批量生成 CG 图片。
 */
export async function generateCgImagesBatch(
  cgs: GalgameCG[],
  apiConfig: 当前可用接口结构,
  paramsMap: Map<string, CgPromptParams>,
  options?: CgGenerationOptions
): Promise<Map<string, CgGenerationResult>> {
  const results = new Map<string, CgGenerationResult>();

  for (const cg of cgs) {
    const params = paramsMap.get(cg.id);
    if (!params) {
      results.set(cg.id, {
        success: false,
        imageUrl: null,
        error: `Missing prompt params for CG: ${cg.id}`,
      });
      continue;
    }

    const result = await generateCgImage(cg, apiConfig, params, options);
    results.set(cg.id, result);
  }

  return results;
}
