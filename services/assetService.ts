/**
 * 素材资源服务 (Asset Resource Service)
 * 
 * 统一管理游戏内所有素材资源的加载、缓存和访问
 * 遵循 docs/plans/2026-05-04_asset-resource-detailed-requirements.md 规范
 * 
 * 资源类型:
 * - 时代场景图 (Era Scene Images)
 * - 物品/道具图标 (Item Icons)
 * - 建筑图标 (Building Icons)
 * - NPC头像 (NPC Avatars)
 * - 技能/功法图标 (Skill Icons)
 * - UI图标 (UI Icons/SVG)
 * - 封面/宣传图 (Cover Images)
 * - BGM (Background Music)
 * - SFX (Sound Effects)
 */

import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Types ─────────────────────────────────────────────────────────────────────

/** 时代素材清单 - 新版格式 (对应 manifest_v2) */
export interface EraAssetManifest {
  era_id: string;
  era_name: string;
  version: string;
  updated_at: string;
  images: EraImage[];
  bgm: EraAudio[];
  status?: 'complete' | 'partial' | 'pending';
}

export interface EraImage {
  id: string;
  cdn_url: string;
  local_path: string;
}

export interface EraAudio {
  id: string;
  cdn_url: string;
  local_path: string;
}

/** 旧版 manifest 兼容格式 */
export interface LegacyEraAssetManifest {
  id: string;
  status: 'complete' | 'partial' | 'pending';
  images: string[];
  bgm?: string;
}

/** 物品图标配置 */
export interface ItemIconConfig {
  id: string;
  name: string;
  category: ItemCategory;
  cdn_url: string;
  local_path: string;
}

export type ItemCategory = 
  | 'weapon' 
  | 'armor' 
  | 'pill' 
  | 'manual' 
  | 'material' 
  | 'consumable' 
  | 'quest_item' 
  | 'special';

/** 建筑图标配置 */
export interface BuildingIconConfig {
  id: string;
  name: string;
  category: BuildingCategory;
  cdn_url: string;
  local_path: string;
}

export type BuildingCategory = 
  | 'inn' 
  | 'market' 
  | 'temple' 
  | 'martial_arts' 
  | 'government' 
  | 'sect' 
  | 'residence' 
  | 'castle' 
  | 'school' 
  | 'entertainment';

/** NPC头像配置 */
export interface NpcAvatarConfig {
  id: string;
  name: string;
  type: NpcAvatarType;
  cdn_url: string;
  local_path: string;
}

export type NpcAvatarType = 
  | 'male' 
  | 'female' 
  | 'elder' 
  | 'child' 
  | 'villain' 
  | 'special';

/** 技能图标配置 */
export interface SkillIconConfig {
  id: string;
  name: string;
  category: SkillCategory;
  cdn_url: string;
  local_path: string;
}

export type SkillCategory = 
  | 'sword' 
  | 'fist' 
  | 'internal' 
  | 'lightness' 
  | 'odd' 
  | 'nsfw';

/** UI图标配置 */
export interface UiIconConfig {
  id: string;
  name: string;
  category: UiIconCategory;
  svg_path?: string;
  cdn_url?: string;
  local_path?: string;
}

export type UiIconCategory = 
  | 'music' 
  | 'video' 
  | 'album' 
  | 'social' 
  | 'quest' 
  | 'save' 
  | 'settings' 
  | 'era';

/** SFX音效配置 */
export interface SfxConfig {
  id: string;
  name: string;
  category: SfxCategory;
  cdn_url: string;
  local_path: string;
}

export type SfxCategory = 
  | 'ui' 
  | 'combat' 
  | 'system' 
  | 'environment' 
  | 'social' 
  | 'narrative' 
  | 'nsfw';

// ── Constants ─────────────────────────────────────────────────────────────────

/** CDN基础URL */
export const CDN_BASE_URL = 'https://mrqk.cc.cd';

/** 资源目录路径 */
export const ASSETS_BASE = path.resolve(__dirname, '../data/era_assets');
export const ICONS_BASE = path.resolve(__dirname, '../public/icons');
export const AUDIO_BASE = path.resolve(__dirname, '../data/resources/audio');

/** 资源清单文件 */
export const ERA_MANIFEST_NAME = 'manifest.json';
export const GLOBAL_MANIFEST_NAME = 'manifest.json';

// ── Asset Registry ─────────────────────────────────────────────────────────────

/**
 * 全局资源清单注册表
 * 记录所有可用资源及其CDN路径
 */
export interface GlobalAssetRegistry {
  version: string;
  updated_at: string;
  era_assets: EraAssetSummary[];
  item_icons: ItemIconSummary[];
  building_icons: BuildingIconSummary[];
  npc_avatars: NpcAvatarSummary[];
  skill_icons: SkillIconSummary[];
  ui_icons: UiIconSummary[];
  bgm: BgmSummary[];
  sfx: SfxSummary[];
}

export interface EraAssetSummary {
  era_id: string;
  era_name: string;
  status: 'complete' | 'partial' | 'pending' | 'missing';
  image_count: number;
  bgm_count: number;
  has_bgm: boolean;
  cdn_prefix: string;
}

export interface ItemIconSummary {
  id: string;
  category: ItemCategory;
  cdn_url: string;
}

export interface BuildingIconSummary {
  id: string;
  category: BuildingCategory;
  cdn_url: string;
}

export interface NpcAvatarSummary {
  id: string;
  type: NpcAvatarType;
  cdn_url: string;
}

export interface SkillIconSummary {
  id: string;
  category: SkillCategory;
  cdn_url: string;
}

export interface UiIconSummary {
  id: string;
  category: UiIconCategory;
  svg_path?: string;
  cdn_url?: string;
}

export interface BgmSummary {
  id: string;
  era_id?: string;
  category: 'scene' | 'era';
  cdn_url: string;
  duration?: number;
}

export interface SfxSummary {
  id: string;
  category: SfxCategory;
  cdn_url: string;
}

// ── Asset Requirements (from plan) ────────────────────────────────────────────

/** 资源需求清单 - 按优先级分类 */
export const ASSET_REQUIREMENTS = {
  // 最高优先级 - 时代场景图 (252张 = 42子纪元 × 6)
  era_scenes: {
    total: 252,
    per_subera: 6,
    resolution: '1024x1024',
    format: 'jpg/webp',
    status: {
      complete: 0,    // 需要统计
      partial: 0,
      pending: 0,
      missing: 0,
    }
  },
  
  // 物品图标 - 目标60张，当前14张，缺口53张
  item_icons: {
    total: 60,
    current: 14,
    gap: 46,
    categories: {
      weapon: { target: 12, current: 2, gap: 10 },
      armor: { target: 8, current: 1, gap: 7 },
      pill: { target: 10, current: 2, gap: 8 },
      manual: { target: 8, current: 1, gap: 7 },
      material: { target: 8, current: 0, gap: 8 },
      consumable: { target: 6, current: 0, gap: 6 },
      quest_item: { target: 4, current: 0, gap: 4 },
      special: { target: 4, current: 1, gap: 3 },
    }
  },
  
  // 建筑图标 - 目标21张，当前4张，缺口17张
  building_icons: {
    total: 21,
    current: 4,
    gap: 17,
  },
  
  // NPC头像 - 目标34张，作为fallback
  npc_avatars: {
    total: 34,
    categories: {
      male: 8,
      female: 8,
      elder: 4,
      child: 4,
      villain: 4,
      special: 6,
    }
  },
  
  // 技能图标 - 目标28张，当前1张
  skill_icons: {
    total: 28,
    current: 1,
    gap: 27,
    categories: {
      sword: { target: 6, current: 1, gap: 5 },
      fist: { target: 4, current: 0, gap: 4 },
      internal: { target: 6, current: 0, gap: 6 },
      lightness: { target: 4, current: 0, gap: 4 },
      odd: { target: 4, current: 0, gap: 4 },
      nsfw: { target: 4, current: 0, gap: 4 },
    }
  },
  
  // UI图标 - 目标37张
  ui_icons: {
    total: 37,
    current: 20,
    gap: 17,
    categories: {
      music: 4,
      video: 2,
      album: 3,
      social: 4,
      quest: 3,
      save: 3,
      settings: 2,
      era: 16, // 每个时代1个专属SVG
    }
  },
  
  // BGM音乐
  bgm: {
    scene: { total: 36, current: 6, gap: 30 },
    era: { total: 42, current: 16, gap: 26 },
  },
  
  // SFX音效
  sfx: {
    total: 58,
    current: 15,
    gap: 43,
  },
  
  // 封面/宣传图
  covers: {
    total: 23,
    game_cover: 1,
    era_covers: 16,
    share_images: 2,
    pwa_icons: 4,
  },
} as const;

// ── Storage Budget ────────────────────────────────────────────────────────────

/** CDN存储预算 (按计划第五章) */
export const STORAGE_BUDGET = {
  era_scenes: { files: 252, avg_size: '300KB', total: '~75MB' },
  item_building_icons: { files: 74, avg_size: '50KB', total: '~3.7MB' },
  npc_avatars: { files: 34, avg_size: '100KB', total: '~3.4MB' },
  skill_icons: { files: 28, avg_size: '30KB', total: '~0.8MB' },
  covers: { files: 23, avg_size: '200KB', total: '~4.6MB' },
  bgm: { files: 78, avg_size: '4MB', total: '~312MB' },
  sfx: { files: 58, avg_size: '20KB', total: '~1.2MB' },
  fonts: { files: 4, avg_size: '250KB', total: '~1MB' },
  total: { files: 555, total: '~400MB' },
} as const;

// ── Utility Functions ────────────────────────────────────────────────────────

/**
 * 构建CDN资源URL
 */
export function buildCdnUrl(...parts: string[]): string {
  return `${CDN_BASE_URL}/${parts.join('/')}`;
}

/**
 * 获取资源文件扩展名
 */
export function getResourceExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext === '.jpeg' ? '.jpg' : ext;
}

/**
 * 判断是否为图片资源
 */
export function isImageFile(filename: string): boolean {
  const ext = getResourceExtension(filename);
  return ['.jpg', '.jpeg', '.webp', '.png', '.gif', '.bmp'].includes(ext);
}

/**
 * 判断是否为音频资源
 */
export function isAudioFile(filename: string): boolean {
  const ext = getResourceExtension(filename);
  return ['.mp3', '.ogg', '.wav', '.m4a', '.aac'].includes(ext);
}

/**
 * 资源大小格式化
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ── Asset Validation ─────────────────────────────────────────────────────────

/**
 * 验证时代素材清单完整性
 */
export interface EraAssetValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  image_count: number;
  has_bgm: boolean;
  missing_images: number[];
}

export function validateEraManifest(manifest: EraAssetManifest | LegacyEraAssetManifest): EraAssetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for new format
  if ('era_id' in manifest) {
    if (manifest.images.length !== 6) {
      errors.push(`Expected 6 images, got ${manifest.images.length}`);
    }
    if (manifest.bgm.length === 0) {
      warnings.push('No BGM defined');
    }
    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      image_count: manifest.images.length,
      has_bgm: manifest.bgm.length > 0,
      missing_images: [],
    };
  }
  
  // Legacy format validation
  if (manifest.images.length !== 6) {
    errors.push(`Expected 6 images, got ${manifest.images.length}`);
  }
  if (!manifest.bgm) {
    warnings.push('No BGM defined');
  }
  
  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    image_count: manifest.images.length,
    has_bgm: !!manifest.bgm,
    missing_images: [],
  };
}

// ── Resource Loading ─────────────────────────────────────────────────────────

/**
 * 加载指定时代的素材清单
 */
export async function loadEraManifest(eraId: string): Promise<EraAssetManifest | LegacyEraAssetManifest | null> {
  try {
    const manifestPath = path.join(ASSETS_BASE, eraId, ERA_MANIFEST_NAME);
    const fs = await import('fs');
    
    if (!fs.existsSync(manifestPath)) {
      return null;
    }
    
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`[AssetService] Failed to load manifest for ${eraId}:`, e);
    return null;
  }
}

/**
 * 获取所有已完成的时代素材
 */
export async function getCompletedEras(): Promise<string[]> {
  const fs = await import('fs');
  const completed: string[] = [];
  
  try {
    const entries = fs.readdirSync(ASSETS_BASE, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const manifest = await loadEraManifest(entry.name);
      if (!manifest) continue;
      
      const status = 'status' in manifest ? manifest.status : 
                     ('images' in manifest && manifest.images.length === 6 ? 'complete' : 'pending');
      
      if (status === 'complete') {
        completed.push(entry.name);
      }
    }
  } catch (e) {
    console.error('[AssetService] Failed to enumerate eras:', e);
  }
  
  return completed;
}

// ── Export Service Instance ───────────────────────────────────────────────────

export const assetService = {
  ASSET_REQUIREMENTS,
  STORAGE_BUDGET,
  CDN_BASE_URL,
  ASSETS_BASE,
  ICONS_BASE,
  AUDIO_BASE,
  
  buildCdnUrl,
  getResourceExtension,
  isImageFile,
  isAudioFile,
  formatFileSize,
  
  validateEraManifest,
  loadEraManifest,
  getCompletedEras,
};

export default assetService;