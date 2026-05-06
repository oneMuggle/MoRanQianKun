#!/usr/bin/env npx ts-node
/**
 * 初始化缺失的时代素材清单
 * 
 * 为 data/era_assets/ 中存在文件但没有 manifest.json 的目录创建清单
 * 使用新版格式 (era_id/era_name)
 * 
 * Usage:
 *   npx ts-node scripts/init_missing_manifests.ts
 *   npx ts-node scripts/init_missing_manifests.ts --dry-run
 *   npx ts-node scripts/init_missing_manifests.ts --era ancient_eastern_conspiracy
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

interface NewManifest {
  era_id: string;
  era_name: string;
  version: string;
  updated_at: string;
  images: ManifestImage[];
  bgm: ManifestAudio[];
  status: 'pending' | 'partial' | 'complete';
}

// ── Era Name Mapping ──────────────────────────────────────────────────────────

const ERA_NAME_MAP: Record<string, string> = {
  'ancient_eastern_conspiracy': '古代·权谋',
  'ancient_eastern_xianxia': '古代·修仙',
  'ancient_western': '古代·西方',
  'ancient_western_celtic': '古代·凯尔特',
  'ancient_western_viking': '古代·维京',
  'apocalyptic_nuclear': '末日·核战',
  'apocalyptic_plague': '末日·瘟疫',
  'apocalyptic_post_war': '末日·战后',
  'contemporary_apocalypse': '现代·末日',
  'contemporary_extreme_cold': '现代·极寒',
  'contemporary_hippie': '现代·嬉皮士',
  'contemporary_noir': '现代·黑色电影',
  'contemporary_nuclear_winter': '现代·核冬天',
  'contemporary_western': '现代·西部',
  'contemporary_zombie': '现代·生化危机',
  'cyberpunk': '赛博朋克',
  'fantasy_renaissance': '幻想·文艺复兴',
  'far-future': '远未来',
  'future_cyberpunk': '未来·赛博',
  'future_near_term': '未来·近未来',
  'future_space_colony': '未来·太空殖民',
  'modern_early_industrial': '近代·早期工业',
  'modern_early_republic': '近代·早期共和',
  'modern_steampunk': '近代·蒸汽朋克',
  'modern_wartime': '近代·战时',
  'post_human': '后人类',
  'post_human_ai': '后人类·AI觉醒',
  'post_human_transhuman': '后人类·基因改造',
  'post_human_virtual': '后人类·虚拟',
  'prehistoric_dinosaur': '原生·恐龙时代',
  'prehistoric_ice_age': '原生·冰河时代',
  'prehistoric_primeval': '原生·蛮荒时代',
  'renaissance': '文艺复兴',
  'school_sim': '校园模拟',
  'space_scifi': '太空科幻',
};

function getEraName(eraId: string): string {
  return ERA_NAME_MAP[eraId] || eraId.replace(/_/g, ' ').replace(/-/g, ' ');
}

function generateImageId(index: number): string {
  return `scene_${String(index + 1).padStart(2, '0')}_001`;
}

function generateBgmId(eraId: string): string {
  return `bgm_${eraId.replace(/-/g, '_')}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const eraFilter = args.find(a => a.startsWith('--era='))?.split('=')[1];
  
  if (dryRun) {
    console.log('[DRY RUN] No files will be created.\n');
  }
  
  if (!fs.existsSync(ERA_ASSETS_DIR)) {
    console.error(`[ERROR] Era assets directory not found: ${ERA_ASSETS_DIR}`);
    process.exit(1);
  }
  
  const entries = fs.readdirSync(ERA_ASSETS_DIR, { withFileTypes: true });
  const results: { era: string; status: string; images: number; bgm: boolean }[] = [];
  
  console.log('Initializing missing manifests...\n');
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'index.html') continue;
    
    if (eraFilter && !entry.name.includes(eraFilter)) continue;
    
    const eraDir = path.join(ERA_ASSETS_DIR, entry.name);
    const manifestPath = path.join(eraDir, 'manifest.json');
    
    // Skip if manifest already exists
    if (fs.existsSync(manifestPath)) {
      console.log(`⏭️  ${entry.name}: manifest already exists, skipping`);
      continue;
    }
    
    // Find all image files
    const files = fs.readdirSync(eraDir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    // Find BGM files
    const bgmFiles = fs.readdirSync(eraDir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.mp3', '.ogg', '.wav', '.m4a'].includes(ext);
    });
    
    if (files.length === 0 && bgmFiles.length === 0) {
      console.log(`❌ ${entry.name}: no assets found, skipping`);
      continue;
    }
    
    // Build manifest
    const images: ManifestImage[] = files.map((file, i) => ({
      id: generateImageId(i),
      cdn_url: `${CDN_BASE_URL}/data/era_assets/${entry.name}/${file}`,
      local_path: `data/era_assets/${entry.name}/${file}`,
    }));
    
    const bgm: ManifestAudio[] = bgmFiles.map(file => ({
      id: generateBgmId(entry.name),
      cdn_url: `${CDN_BASE_URL}/data/era_assets/${entry.name}/${file}`,
      local_path: `data/era_assets/${entry.name}/${file}`,
    }));
    
    // Determine status
    let status: 'pending' | 'partial' | 'complete' = 'pending';
    if (images.length >= 6 && bgm.length > 0) {
      status = 'complete';
    } else if (images.length > 0 || bgm.length > 0) {
      status = 'partial';
    }
    
    const manifest: NewManifest = {
      era_id: entry.name,
      era_name: getEraName(entry.name),
      version: '2.0.0',
      updated_at: new Date().toISOString(),
      images,
      bgm,
      status,
    };
    
    const statusIcon = status === 'complete' ? '✅' : status === 'partial' ? '⚠️' : '⏳';
    console.log(`${statusIcon} ${entry.name}: ${images.length} images, ${bgm.length} bgm`);
    
    if (!dryRun) {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
      console.log(`   Written: ${manifestPath}`);
    }
    
    results.push({ era: entry.name, status, images: images.length, bgm: bgm.length > 0 });
  }
  
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Initialized ${results.length} manifests`);
  
  const complete = results.filter(r => r.status === 'complete').length;
  const partial = results.filter(r => r.status === 'partial').length;
  const pending = results.filter(r => r.status === 'pending').length;
  
  console.log(`  Complete: ${complete}`);
  console.log(`  Partial: ${partial}`);
  console.log(`  Pending: ${pending}`);
  
  if (dryRun) {
    console.log(`\n[INFO] Run without --dry-run to create files`);
  }
}

main().catch(e => {
  console.error('[FATAL]', e);
  process.exit(1);
});