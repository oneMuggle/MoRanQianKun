#!/usr/bin/env python3
"""
时代素材清单标准化脚本

将所有 era_assets/*/manifest.json 统一为新版格式 (era_id/era_name)
并确保所有资源都有正确的CDN路径

对应 docs/plans/2026-05-04_asset-resource-detailed-requirements.md 第五章 CDN目录结构

Usage:
    python3 scripts/standardize_manifests.py
    python3 scripts/standardize_manifests.py --dry-run
    python3 scripts/standardize_manifests.py --era ancient_eastern_wuxia
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional, Tuple

# Paths
ERA_ASSETS_DIR = Path(__file__).parent.parent / "data" / "era_assets"
CDN_BASE_URL = "https://mrqk.cc.cd"

# Era Name Mapping
ERA_NAME_MAP = {
    'ancient_eastern_conspiracy': '古代·权谋',
    'ancient_eastern_myth': '古代·神话',
    'ancient_eastern_wuxia': '古代·武侠',
    'ancient_eastern_xianxia': '古代·修仙',
    'ancient_eastern_zhiguai': '古代·志怪',
    'ancient_prehistoric': '古代·史前',
    'ancient_western': '古代·西方',
    'ancient_western_celtic': '古代·凯尔特',
    'ancient_western_greek': '古代·古希腊',
    'ancient_western_medieval': '古代·中世纪',
    'ancient_western_roman': '古代·古罗马',
    'ancient_western_viking': '古代·维京',
    'apocalyptic_nuclear': '末日·核战',
    'apocalyptic_plague': '末日·瘟疫',
    'apocalyptic_post_war': '末日·战后',
    'contemporary_apocalypse': '现代·末日',
    'contemporary_campus': '现代·校园',
    'contemporary_extreme_cold': '现代·极寒',
    'contemporary_hippie': '现代·嬉皮士',
    'contemporary_noir': '现代·黑色电影',
    'contemporary_nuclear_winter': '现代·核冬天',
    'contemporary_post_apocalyptic': '现代·末日废土',
    'contemporary_rural': '现代·乡村',
    'contemporary_urban': '现代·都市',
    'contemporary_western': '现代·西部',
    'contemporary_zombie': '现代·生化危机',
    'cyberpunk': '赛博朋克',
    'fantasy_renaissance': '幻想·文艺复兴',
    'far-future': '远未来',
    'far-future_cyborg': '未来·义体化',
    'far-future_space_opera': '未来·太空歌剧',
    'far-future_virtual_reality': '未来·虚拟现实',
    'future_cyberpunk': '未来·赛博',
    'future_near_term': '未来·近未来',
    'future_space_colony': '未来·太空殖民',
    'modern_early_industrial': '近代·早期工业',
    'modern_early_republic': '近代·早期共和',
    'modern_eastern_meiji_taisho': '近代·明治大正',
    'modern_eastern_republic': '近代·民国',
    'modern_steampunk': '近代·蒸汽朋克',
    'modern_wartime': '近代·战时',
    'modern_western_jazz_age': '近代·爵士时代',
    'modern_western_postwar': '近代·战后',
    'modern_western_victorian': '近代·维多利亚',
    'near-future_cyberpunk': '近未来·赛博朋克',
    'near-future_dystopia': '近未来·反乌托邦',
    'near-future_space_colonization': '近未来·太空殖民',
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
}

def get_era_name(era_id: str) -> str:
    return ERA_NAME_MAP.get(era_id, era_id.replace('_', ' ').replace('-', ' '))

def generate_image_id(index: int) -> str:
    return f"scene_{str(index + 1).zfill(2)}_001"

def generate_bgm_id(era_id: str) -> str:
    return f"bgm_{era_id.replace('-', '_')}"

def is_new_format(manifest: Dict) -> bool:
    return 'era_id' in manifest

def is_old_format(manifest: Dict) -> bool:
    return 'id' in manifest and 'images' in manifest

def convert_to_new_format(era_id: str, old_manifest: Dict) -> Dict:
    """Convert old format manifest to new format"""
    
    # Get image filenames from old format
    old_images = old_manifest.get('images', [])
    images = []
    
    for i, img in enumerate(old_images):
        if isinstance(img, str):
            filename = img
        elif isinstance(img, dict):
            # Newer old format with id/cdn_url/local_path
            filename = img.get('local_path', '').split('/')[-1] if img.get('local_path') else img.get('id', f'scene_{i+1}.jpg')
        else:
            filename = f'scene_{i+1}.jpg'
        
        images.append({
            "id": generate_image_id(i),
            "cdn_url": f"{CDN_BASE_URL}/data/era_assets/{era_id}/{filename}",
            "local_path": f"data/era_assets/{era_id}/{filename}",
        })
    
    # Get BGM
    old_bgm = old_manifest.get('bgm')
    bgm = []
    
    if old_bgm:
        if isinstance(old_bgm, str):
            bgm_filename = old_bgm
        elif isinstance(old_bgm, list) and len(old_bgm) > 0:
            first_bgm = old_bgm[0]
            if isinstance(first_bgm, str):
                bgm_filename = first_bgm
            elif isinstance(first_bgm, dict):
                bgm_filename = first_bgm.get('local_path', '').split('/')[-1] if first_bgm.get('local_path') else first_bgm.get('id', 'bgm.mp3')
            else:
                bgm_filename = 'bgm.mp3'
        else:
            bgm_filename = 'bgm.mp3'
        
        bgm.append({
            "id": generate_bgm_id(era_id),
            "cdn_url": f"{CDN_BASE_URL}/data/era_assets/{era_id}/{bgm_filename}",
            "local_path": f"data/era_assets/{era_id}/{bgm_filename}",
        })
    
    # Determine status
    status = old_manifest.get('status', 'pending')
    if len(images) >= 6 and len(bgm) > 0:
        status = 'complete'
    elif len(images) > 0 or len(bgm) > 0:
        status = 'partial'
    
    return {
        "era_id": era_id,
        "era_name": get_era_name(era_id),
        "version": "2.0.0",
        "updated_at": datetime.now().isoformat(),
        "images": images,
        "bgm": bgm,
        "status": status,
    }

def process_manifest(era_dir: Path, era_id: str, dry_run: bool = False) -> Tuple[bool, str, Optional[str]]:
    """Process a single manifest, converting if needed"""
    manifest_path = era_dir / "manifest.json"
    
    if not manifest_path.exists():
        return (False, 'no_manifest', None)
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except Exception as e:
        return (False, f'error: {str(e)}', None)
    
    # Already new format
    if is_new_format(manifest):
        return (True, 'already_new_format', None)
    
    # Old format - convert
    if is_old_format(manifest):
        new_manifest = convert_to_new_format(era_id, manifest)
        
        if dry_run:
            return (True, 'would_convert', json.dumps(new_manifest, indent=2, ensure_ascii=False))
        
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(new_manifest, f, ensure_ascii=False, indent=2)
        return (True, 'converted', None)
    
    return (False, 'unknown_format', None)

def main():
    parser = argparse.ArgumentParser(description='标准化时代素材清单')
    parser.add_argument('--dry-run', action='store_true', help='Do not modify files')
    parser.add_argument('--era', type=str, help='Filter by era name')
    args = parser.parse_args()
    
    if args.dry_run:
        print('[DRY RUN] No files will be modified.\n')
    
    if not ERA_ASSETS_DIR.exists():
        print(f"[ERROR] Era assets directory not found: {ERA_ASSETS_DIR}")
        sys.exit(1)
    
    entries = sorted([e for e in ERA_ASSETS_DIR.iterdir() if e.is_dir() and e.name != 'index.html'])
    results = []
    
    print('Standardizing era asset manifests...\n')
    
    for entry in entries:
        if args.era and args.era not in entry.name:
            continue
        
        success, action, info = process_manifest(entry, entry.name, args.dry_run)
        
        icon = '✅' if success else '❌'
        action_str = action.replace('_', ' ')
        print(f"{icon} {entry.name}: {action_str}")
        
        if args.dry_run and info:
            print(f"\n--- Would convert to: ---")
            print(info[:500] + '...' if len(info) > 500 else info)
            print()
        
        results.append({'era': entry.name, 'status': action})
    
    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Processed {len(results)} eras")
    
    converted = sum(1 for r in results if r['status'] == 'converted')
    already_new = sum(1 for r in results if r['status'] == 'already_new_format')
    errors = sum(1 for r in results if 'error' in r['status'])
    
    print(f"  Converted: {converted}")
    print(f"  Already new format: {already_new}")
    print(f"  Errors: {errors}")
    
    if args.dry_run and converted > 0:
        print(f"\n[INFO] Run without --dry-run to apply changes")

if __name__ == '__main__':
    main()