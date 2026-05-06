#!/usr/bin/env python3
"""
初始化缺失的时代素材清单

为 data/era_assets/ 中存在文件但没有 manifest.json 的目录创建清单
使用新版格式 (era_id/era_name)

Usage:
    python3 scripts/init_missing_manifests.py
    python3 scripts/init_missing_manifests.py --dry-run
    python3 scripts/init_missing_manifests.py --era ancient_eastern_conspiracy
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# Paths
ERA_ASSETS_DIR = Path(__file__).parent.parent / "data" / "era_assets"
CDN_BASE_URL = "https://mrqk.cc.cd"

# Era Name Mapping
ERA_NAME_MAP = {
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
}

def get_era_name(era_id: str) -> str:
    return ERA_NAME_MAP.get(era_id, era_id.replace('_', ' ').replace('-', ' '))

def generate_image_id(index: int) -> str:
    return f"scene_{str(index + 1).zfill(2)}_001"

def generate_bgm_id(era_id: str) -> str:
    return f"bgm_{era_id.replace('-', '_')}"

def is_image_file(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in ('.jpg', '.jpeg', '.png', '.webp', '.gif')

def is_audio_file(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in ('.mp3', '.ogg', '.wav', '.m4a', '.aac')

def main():
    parser = argparse.ArgumentParser(description='初始化缺失的时代素材清单')
    parser.add_argument('--dry-run', action='store_true', help='Do not create files')
    parser.add_argument('--era', type=str, help='Filter by era name')
    args = parser.parse_args()
    
    if args.dry_run:
        print('[DRY RUN] No files will be created.\n')
    
    if not ERA_ASSETS_DIR.exists():
        print(f"[ERROR] Era assets directory not found: {ERA_ASSETS_DIR}")
        sys.exit(1)
    
    entries = sorted([e for e in ERA_ASSETS_DIR.iterdir() if e.is_dir() and e.name != 'index.html'])
    results: List[Dict] = []
    
    print('Initializing missing manifests...\n')
    
    for entry in entries:
        if args.era and args.era not in entry.name:
            continue
        
        manifest_path = entry / "manifest.json"
        
        # Skip if manifest already exists
        if manifest_path.exists():
            print(f"⏭️  {entry.name}: manifest already exists, skipping")
            continue
        
        # Find all image files
        image_files = [f.name for f in entry.iterdir() if is_image_file(f.name)]
        
        # Find BGM files
        bgm_files = [f.name for f in entry.iterdir() if is_audio_file(f.name)]
        
        if not image_files and not bgm_files:
            print(f"❌ {entry.name}: no assets found, skipping")
            continue
        
        # Build manifest
        images = [
            {
                "id": generate_image_id(i),
                "cdn_url": f"{CDN_BASE_URL}/data/era_assets/{entry.name}/{file}",
                "local_path": f"data/era_assets/{entry.name}/{file}",
            }
            for i, file in enumerate(sorted(image_files))
        ]
        
        bgm = [
            {
                "id": generate_bgm_id(entry.name),
                "cdn_url": f"{CDN_BASE_URL}/data/era_assets/{entry.name}/{file}",
                "local_path": f"data/era_assets/{entry.name}/{file}",
            }
            for file in sorted(bgm_files)
        ]
        
        # Determine status
        if len(images) >= 6 and len(bgm) > 0:
            status = "complete"
        elif len(images) > 0 or len(bgm) > 0:
            status = "partial"
        else:
            status = "pending"
        
        manifest = {
            "era_id": entry.name,
            "era_name": get_era_name(entry.name),
            "version": "2.0.0",
            "updated_at": datetime.now().isoformat(),
            "images": images,
            "bgm": bgm,
            "status": status,
        }
        
        status_icon = '✅' if status == 'complete' else ('⚠️' if status == 'partial' else '⏳')
        print(f"{status_icon} {entry.name}: {len(images)} images, {len(bgm)} bgm")
        
        if not args.dry_run:
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, ensure_ascii=False, indent=2)
            print(f"   Written: {manifest_path}")
        
        results.append({
            'era': entry.name,
            'status': status,
            'images': len(images),
            'bgm': len(bgm) > 0,
        })
    
    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Initialized {len(results)} manifests")
    
    complete = sum(1 for r in results if r['status'] == 'complete')
    partial = sum(1 for r in results if r['status'] == 'partial')
    pending = sum(1 for r in results if r['status'] == 'pending')
    
    print(f"  Complete: {complete}")
    print(f"  Partial: {partial}")
    print(f"  Pending: {pending}")
    
    if args.dry_run:
        print(f"\n[INFO] Run without --dry-run to create files")

if __name__ == '__main__':
    main()