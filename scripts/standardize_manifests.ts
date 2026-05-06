#!/usr/bin/env npx ts-node
/**
 * 时代素材清单标准化脚本
 * 
 * 将所有 era_assets/*/manifest.json 统一为新版格式 (era_id/era_name)
 * 并确保所有资源都有正确的CDN路径
 * 
 * 对应 docs/plans/2026-05-04_asset-resource-detailed-requirements.md 第五章 CDN目录结构
 * 
 * Usage:
 *   npx ts-node scripts/standardize_manifests.ts
 *   npx ts-node scripts/standardize_manifests.ts --dry-run
 *   npx ts-node scripts/standardize_manifests.ts --era ancient_eastern_wuxia
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Paths ──────────────────────────────────────────────────────────────────────

const ERA_ASSETS_DIR = path.resolve(__dirname, '../data/era_assets');
const CDN_BASE_URL = 'https://mrqk.cc.cd';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OldManifest {
  id: string;
  status: 'complete' | 'partial' | 'pending';
  images: string[];
  bgm?: string;
  updated_at?: string;
}

interface NewManifest {
  era_id: string;
  era_name: string;
  version: string;
  updated_at: string;
  images: ManifestImage[];
  bgm: ManifestAudio[];
}

interface ManifestImage {
  id: string;
  cdn_url: string;
  local_path: string;
}

interface ManifestAudio {
  id: string;
  cdn_url: string;
  local_path: string;
}

// ── Era Name Mapping ──────────────────────────────────────────────────────────

const ERA_NAME_MAP: Record<string, string> = {
  'ancient_eastern_wuxia': '古代·武侠',
  'ancient_eastern_zhiguai': '古代·志怪',
  'ancient_eastern_myth': '古代·神话',
  'ancient_eastern_xianxia': '古代·修仙',
  'ancient_eastern_conspiracy': '古代·权谋',
  'ancient_western_greek': '古代·古希腊',
  'ancient_western_roman': '古代·古罗马',
  'ancient_western_medieval': '古代·中世纪',
  'ancient_western_viking': '古代·维京',
  'ancient_western_celtic': '古代·凯尔特',
  'ancient_prehistoric': '古代·史前',
  'modern_eastern_republic': '近代·民国',
  'modern_eastern_meiji_taisho': '近代·明治大正',
  'modern_western_victorian': '近代·维多利亚',
  'modern_western_jazz_age': '近代·爵士时代',
  'modern_western_postwar': '近代·战后',
  'modern_steampunk': '近代·蒸汽朋克',
  'modern_early_republic': '近代·早期共和',
  'modern_early_industrial': '近代·早期工业',
  'modern_wartime': '近代·战时',
  'contemporary_urban': '现代·都市',
  'contemporary_rural': '现代·乡村',
  'contemporary_campus': '现代·校园',
  'contemporary_apocalypse': '现代·末日',
  'contemporary_noir': '现代·黑色电影',
  'contemporary_hippie': '现代·嬉皮士',
  'contemporary_zombie': '现代·生化危机',
  'contemporary_extreme_cold': '现代·极寒',
  'contemporary_nuclear_winter': '现代·核冬天',
  'contemporary_post_apocalyptic': '现代·末日废土',
  'near-future_cyberpunk': '近未来·赛博朋克',
  'near-future_dystopia': '近未来·反乌托邦',
  'near-future_space_colonization': '近未来·太空殖民',
  'far-future_space_opera': '未来·太空歌剧',
  'far-future_cyborg': '未来·义体化',
  'far-future_virtual_reality': '未来·虚拟现实',
  'post_human': '后人类',
  'post_human_ai': '后人类·AI觉醒',
  'post_human_transhuman': '后人类·基因改造',
  'post_human_virtual': '后人类·虚拟',
  'prehistoric_dinosaur': '原生·恐龙时代',
  'prehistoric_ice_age': '原生·冰河时代',
  'prehistoric_primeval': '原生·蛮荒时代',
  'cyberpunk': '赛博朋克',
  'fantasy_renaissance': '幻想·文艺复兴',
  'renaissance': '文艺复兴',
  'school_sim': '校园模拟',
  'space_scifi': '太空科幻',
  'apocalyptic_nuclear': '末日·核战',
  'apocalyptic_plague': '末日·瘟疫',
  'apocalyptic_post_war': '末日·战后',
  'future_cyberpunk': '未来·赛博',
  'future_near_term': '未来·近未来',
  'future_space_colony': '未来·太空殖民',
  'contemporary_western': '现代·西部',
  'ancient_western': '古代·西方',
};

// ── Utility Functions ─────────────────────────────────────────────────────────

function getEraName(eraId: string): string {
  return ERA_NAME_MAP[eraId] || eraId.replace(/_/g, ' ').replace(/-/g, ' ');
}

function isOldManifest(obj: any): obj is OldManifest {
  return obj && typeof obj.id === 'string' && Array.isArray(obj.images);
}

function isNewManifest(obj: any): obj is NewManifest {
  return obj && typeof obj.era_id === 'string';
}

function generateImageId(index: number): string {
  return `scene_${String(index + 1).padStart(2, '0')}_001`;
}

function generateBgmId(eraId: string): string {
  return `bgm_${eraId.replace(/-/g, '_')}`;
}

// ── Manifest Conversion ────────────────────────────────────────────────────────

function convertToNewFormat(eraId: string, oldManifest: OldManifest): NewManifest {
  const images: ManifestImage[] = oldManifest.images.map((img, i) => {
    // Determine actual filename
    let filename: string;
    if (typeof img === 'string') {
      filename = img;
    } else if (img && typeof img === 'object' && 'id' in img) {
      filename = (img as any).local_path || (img as any).cdn_url?.split('/').pop() || `scene_${i + 1}.jpg`;
    } else {
      filename = `scene_${i + 1}.jpg`;
    }
    
    return {
      id: generateImageId(i),
      cdn_url: `${CDN_BASE_URL}/data/era_assets/${eraId}/${filename}`,
      local_path: `data/era_assets/${eraId}/${filename}`,
    };
  });
  
  const bgmAudio: ManifestAudio[] = [];
  if (oldManifest.bgm) {
    const bgmFile = typeof oldManifest.bgm === 'string' ? oldManifest.bgm : oldManifest.bgm;
    bgmAudio.push({
      id: generateBgmId(eraId),
      cdn_url: `${CDN_BASE_URL}/data/era_assets/${eraId}/${bgmFile}`,
      local_path: `data/era_assets/${eraId}/${bgmFile}`,
    });
  }
  
  return {
    era_id: eraId,
    era_name: getEraName(eraId),
    version: '2.0.0',
    updated_at: oldManifest.updated_at || new Date().toISOString(),
    images,
    bgm: bgmAudio,
  };
}

function standardizeManifest(eraDir: string, eraId: string, dryRun: boolean = false): {
  success: boolean;
  action: string;
  oldFormat?: string;
  newFormat?: string;
  error?: string;
} {
  const manifestPath = path.join(eraDir, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    return { success: false, action: 'no_manifest', error: 'No manifest.json found' };
  }
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    
    if (isNewManifest(manifest)) {
      return { success: true, action: 'already_new_format' };
    }
    
    if (isOldManifest(manifest)) {
      const newManifest = convertToNewFormat(eraId, manifest);
      
      if (dryRun) {
        return {
          success: true,
          action: 'would_convert',
          oldFormat: JSON.stringify(manifest, null, 2),
          newFormat: JSON.stringify(newManifest, null, 2),
        };
      }
      
      // Write new format
      fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2), 'utf-8');
      return { success: true, action: 'converted' };
    }
    
    return { success: false, action: 'unknown_format', error: 'Cannot determine manifest format' };
    
  } catch (e) {
    return { success: false, action: 'error', error: String(e) };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const eraFilter = args.find(a => a.startsWith('--era='))?.split('=')[1];
  
  if (dryRun) {
    console.log('[DRY RUN] No files will be modified.\n');
  }
  
  if (!fs.existsSync(ERA_ASSETS_DIR)) {
    console.error(`[ERROR] Era assets directory not found: ${ERA_ASSETS_DIR}`);
    process.exit(1);
  }
  
  const entries = fs.readdirSync(ERA_ASSETS_DIR, { withFileTypes: true });
  const results: { era: string; status: string }[] = [];
  
  console.log('Standardizing era asset manifests...\n');
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'index.html') continue;
    
    if (eraFilter && !entry.name.includes(eraFilter)) continue;
    
    const eraDir = path.join(ERA_ASSETS_DIR, entry.name);
    const result = standardizeManifest(eraDir, entry.name, dryRun);
    
    const icon = result.success ? '✅' : '❌';
    const action = result.action.replace(/_/g, ' ');
    console.log(`${icon} ${entry.name}: ${action}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    results.push({ era: entry.name, status: action });
    
    if (dryRun && result.newFormat) {
      console.log('\n--- Would convert to: ---');
      console.log(result.newFormat);
      console.log('\n');
    }
  }
  
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Processed ${results.length} eras`);
  
  const converted = results.filter(r => r.status === 'converted').length;
  const alreadyNew = results.filter(r => r.status === 'already_new_format').length;
  const errors = results.filter(r => !results.find(x => x.era === r.era)?.status.startsWith('converted') && !results.find(x => x.era === r.era)?.status.includes('already'));
  
  console.log(`  Converted: ${converted}`);
  console.log(`  Already new format: ${alreadyNew}`);
  console.log(`  Errors: ${errors.length}`);
  
  if (dryRun && converted > 0) {
    console.log(`\n[INFO] Run without --dry-run to apply changes`);
  }
}

main().catch(e => {
  console.error('[FATAL]', e);
  process.exit(1);
});
