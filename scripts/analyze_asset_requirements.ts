#!/usr/bin/env npx ts-node
/**
 * 素材资源需求分析脚本
 * 
 * 分析 data/era_assets/ 目录，生成资源缺口报告
 * 对应 docs/plans/2026-05-04_asset-resource-detailed-requirements.md
 * 
 * Usage:
 *   npx ts-node scripts/analyze_asset_requirements.ts
 *   npx ts-node scripts/analyze_asset_requirements.ts --json
 *   npx ts-node scripts/analyze_asset_requirements.ts --era ancient_eastern_wuxia
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Paths ──────────────────────────────────────────────────────────────────────

const ERA_ASSETS_DIR = path.resolve(__dirname, '../data/era_assets');
const OUTPUT_DIR = path.resolve(__dirname, '../.asset-reports');

// ── Types ─────────────────────────────────────────────────────────────────────

interface EraManifest {
  era_id?: string;
  era_name?: string;
  id?: string;
  status?: 'complete' | 'partial' | 'pending' | string;
  images?: (string | { id: string; cdn_url?: string; local_path?: string })[];
  bgm?: (string | { id: string; cdn_url?: string; local_path?: string })[];
  version?: string;
  updated_at?: string;
}

interface EraAnalysis {
  name: string;
  id: string;
  has_manifest: boolean;
  manifest_format: 'old' | 'new' | 'none';
  status: string;
  image_count: number;
  has_bgm: boolean;
  bgm_name?: string;
  files: string[];
  is_complete: boolean;
  needs_attention: boolean;
}

interface CategorySummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  missing: number;
}

interface AssetRequirements {
  era_scenes: CategorySummary;
  item_icons: { total: number; current: number; gap: number };
  building_icons: { total: number; current: number; gap: number };
  npc_avatars: { total: number };
  skill_icons: { total: number; current: number; gap: number };
  ui_icons: { total: number; current: number; gap: number };
  bgm: { scene: CategorySummary; era: CategorySummary };
  sfx: { total: number; current: number; gap: number };
}

// ── Utility Functions ─────────────────────────────────────────────────────────

function getManifestFormat(manifestPath: string): 'old' | 'new' | 'none' {
  if (!fs.existsSync(manifestPath)) return 'none';
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content) as EraManifest;
    
    if (manifest.era_id) return 'new';
    if (manifest.id) return 'old';
    return 'none';
  } catch {
    return 'none';
  }
}

function countImages(manifest: EraManifest): number {
  if (!manifest.images) return 0;
  return manifest.images.length;
}

function hasBgm(manifest: EraManifest | null): boolean {
  if (!manifest || !manifest.bgm) return false;
  if (Array.isArray(manifest.bgm)) return manifest.bgm.length > 0;
  return true;
}

function getBgmName(manifest: EraManifest): string | undefined {
  if (!manifest.bgm) return undefined;
  if (Array.isArray(manifest.bgm)) {
    return manifest.bgm[0] && typeof manifest.bgm[0] === 'object' 
      ? (manifest.bgm[0] as { id?: string }).id 
      : undefined;
  }
  return typeof manifest.bgm === 'string' ? manifest.bgm : undefined;
}

function loadManifest(eraDir: string): EraManifest | null {
  const manifestPath = path.join(eraDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content) as EraManifest;
  } catch {
    return null;
  }
}

function getStatus(manifest: EraManifest | null, format: 'old' | 'new' | 'none'): string {
  if (!manifest) return 'missing';
  if (manifest.status) return manifest.status;
  if (format === 'new') {
    const imgCount = countImages(manifest);
    return imgCount >= 6 ? 'complete' : imgCount > 0 ? 'partial' : 'pending';
  }
  return 'unknown';
}

// ── Main Analysis ─────────────────────────────────────────────────────────────

function analyzeEras(): EraAnalysis[] {
  const results: EraAnalysis[] = [];
  
  if (!fs.existsSync(ERA_ASSETS_DIR)) {
    console.error(`[ERROR] Era assets directory not found: ${ERA_ASSETS_DIR}`);
    return results;
  }
  
  const entries = fs.readdirSync(ERA_ASSETS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'index.html') continue;
    
    const eraDir = path.join(ERA_ASSETS_DIR, entry.name);
    const manifestPath = path.join(eraDir, 'manifest.json');
    const format = getManifestFormat(manifestPath);
    const manifest = loadManifest(eraDir);
    const status = getStatus(manifest, format);
    
    // Count actual files
    const files = fs.readdirSync(eraDir)
      .filter(f => f !== 'manifest.json' && !f.endsWith('.json'));
    
    // Determine if complete
    const imageCount = manifest ? countImages(manifest) : 0;
    const hasBgmFlag = hasBgm(manifest);
    const isComplete = imageCount >= 6 && hasBgmFlag;
    const needsAttention = status === 'missing' || status === 'pending' || status === 'partial';
    
    results.push({
      name: entry.name,
      id: manifest?.era_id || manifest?.id || entry.name,
      has_manifest: format !== 'none',
      manifest_format: format,
      status,
      image_count: imageCount,
      has_bgm: hasBgmFlag,
      bgm_name: getBgmName(manifest),
      files,
      is_complete: isComplete,
      needs_attention: needsAttention,
    });
  }
  
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

function generateSummary(eras: EraAnalysis[]): AssetRequirements {
  const complete = eras.filter(e => e.status === 'complete').length;
  const partial = eras.filter(e => e.status === 'partial').length;
  const pending = eras.filter(e => e.status === 'pending').length;
  const missing = eras.filter(e => e.status === 'missing').length;
  
  return {
    era_scenes: {
      total: eras.length,
      complete,
      partial,
      pending,
      missing,
    },
    item_icons: { total: 60, current: 14, gap: 46 },
    building_icons: { total: 21, current: 4, gap: 17 },
    npc_avatars: { total: 34 },
    skill_icons: { total: 28, current: 1, gap: 27 },
    ui_icons: { total: 37, current: 20, gap: 17 },
    bgm: {
      scene: { total: 36, complete: 0, partial: 0, pending: 0, missing: 0 }, // 需要单独统计
      era: { total: 42, complete, partial, pending, missing },
    },
    sfx: { total: 58, current: 15, gap: 43 },
  };
}

function printReport(eras: EraAnalysis[], summary: AssetRequirements): void {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         素材资源需求分析报告                                      ║');
  console.log('║         Asset Resource Requirements Analysis                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📊 时代素材总览 (Era Scene Assets Overview)');
  console.log('─'.repeat(70));
  console.log(`  总计子纪元: ${eras.length}`);
  console.log(`  ✅ 已完成 (complete):   ${summary.era_scenes.complete}`);
  console.log(`  ⚠️  部分完成 (partial): ${summary.era_scenes.partial}`);
  console.log(`  ⏳ 待生成 (pending):   ${summary.era_scenes.pending}`);
  console.log(`  ❌ 缺失 (missing):     ${summary.era_scenes.missing}`);
  console.log('');
  
  console.log('📋 各时代素材状态 (By Era)');
  console.log('─'.repeat(70));
  
  for (const era of eras) {
    const statusIcon = era.is_complete ? '✅' : era.needs_attention ? '⚠️' : '❌';
    const formatLabel = era.manifest_format === 'new' ? '[NEW]' : era.manifest_format === 'old' ? '[OLD]' : '[NO-MANIFEST]';
    const imgInfo = `${era.image_count}/6 images`;
    const bgmInfo = era.has_bgm ? '🎵' : '❌';
    
    console.log(`  ${statusIcon} ${formatLabel} ${era.name.padEnd(35)} ${imgInfo.padEnd(12)} ${bgmInfo}`);
  }
  
  console.log('');
  console.log('📦 其他资源需求 (Other Asset Requirements)');
  console.log('─'.repeat(70));
  console.log(`  物品图标: ${summary.item_icons.current}/${summary.item_icons.total} (缺口: ${summary.item_icons.gap})`);
  console.log(`  建筑图标: ${summary.building_icons.current}/${summary.building_icons.total} (缺口: ${summary.building_icons.gap})`);
  console.log(`  NPC头像: ${summary.npc_avatars.total} (fallback)`);
  console.log(`  技能图标: ${summary.skill_icons.current}/${summary.skill_icons.total} (缺口: ${summary.skill_icons.gap})`);
  console.log(`  UI图标: ${summary.ui_icons.current}/${summary.ui_icons.total} (缺口: ${summary.ui_icons.gap})`);
  console.log(`  BGM: 场景${summary.bgm.scene.total}首 + 时代${summary.bgm.era.total}首`);
  console.log(`  SFX: ${summary.sfx.current}/${summary.sfx.total} (缺口: ${summary.sfx.gap})`);
  console.log('');
  
  // Priority items
  const priorityEras = eras.filter(e => e.status === 'pending' || e.status === 'missing').slice(0, 10);
  if (priorityEras.length > 0) {
    console.log('🎯 优先补齐项目 (Priority Items)');
    console.log('─'.repeat(70));
    for (const era of priorityEras) {
      console.log(`  • ${era.name} (${era.status})`);
    }
    console.log('');
  }
}

function saveJsonReport(eras: EraAnalysis[], summary: AssetRequirements): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const report = {
    generated_at: new Date().toISOString(),
    summary,
    eras,
  };
  
  const outputPath = path.join(OUTPUT_DIR, `asset-requirements-${Date.now()}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`[INFO] JSON report saved: ${outputPath}`);
  
  // Also save latest
  const latestPath = path.join(OUTPUT_DIR, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`[INFO] Latest report saved: ${latestPath}`);
}

// ── CLI Entry Point ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const eraFilter = args.find(a => a.startsWith('--era='))?.split('=')[1];
  
  console.log('[INFO] Analyzing era assets...');
  let eras = analyzeEras();
  
  if (eraFilter) {
    eras = eras.filter(e => e.name.includes(eraFilter) || e.id.includes(eraFilter));
    console.log(`[INFO] Filtered to: ${eraFilter}`);
  }
  
  const summary = generateSummary(eras);
  
  if (outputJson) {
    saveJsonReport(eras, summary);
  } else {
    printReport(eras, summary);
  }
}

main().catch(e => {
  console.error('[FATAL]', e);
  process.exit(1);
});
