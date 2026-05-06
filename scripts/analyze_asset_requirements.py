#!/usr/bin/env python3
"""
素材资源需求分析脚本

分析 data/era_assets/ 目录，生成资源缺口报告
对应 docs/plans/2026-05-04_asset-resource-detailed-requirements.md

Usage:
    python3 scripts/analyze_asset_requirements.py
    python3 scripts/analyze_asset_requirements.py --json
    python3 scripts/analyze_asset_requirements.py --era ancient_eastern_wuxia
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

# Paths
ERA_ASSETS_DIR = Path(__file__).parent.parent / "data" / "era_assets"
OUTPUT_DIR = Path(__file__).parent.parent / ".asset-reports"

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

def load_manifest(era_dir: Path) -> Optional[Dict]:
    manifest_path = era_dir / "manifest.json"
    if not manifest_path.exists():
        return None
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Failed to load manifest {manifest_path}: {e}")
        return None

def get_manifest_format(manifest: Optional[Dict]) -> str:
    if manifest is None:
        return 'none'
    if 'era_id' in manifest:
        return 'new'
    if 'id' in manifest:
        return 'old'
    return 'unknown'

def count_images(manifest: Optional[Dict]) -> int:
    if manifest is None:
        return 0
    images = manifest.get('images', [])
    return len(images)

def has_bgm(manifest: Optional[Dict]) -> bool:
    if manifest is None:
        return False
    bgm = manifest.get('bgm')
    if bgm is None:
        return False
    if isinstance(bgm, list):
        return len(bgm) > 0
    return bool(bgm)

def get_status(manifest: Optional[Dict], fmt: str) -> str:
    if manifest is None:
        return 'missing'
    if 'status' in manifest:
        return manifest['status']
    if fmt == 'new':
        img_count = count_images(manifest)
        return 'complete' if img_count >= 6 else ('partial' if img_count > 0 else 'pending')
    return 'unknown'

def analyze_eras() -> List[Dict]:
    results = []
    
    if not ERA_ASSETS_DIR.exists():
        print(f"[ERROR] Era assets directory not found: {ERA_ASSETS_DIR}")
        return results
    
    for entry in sorted(ERA_ASSETS_DIR.iterdir()):
        if not entry.is_dir() or entry.name == 'index.html':
            continue
        
        manifest = load_manifest(entry)
        fmt = get_manifest_format(manifest)
        status = get_status(manifest, fmt)
        
        files = [f.name for f in entry.iterdir() 
                 if f.is_file() and not f.name.endswith('.json')]
        
        img_count = count_images(manifest)
        bgm_exists = has_bgm(manifest)
        is_complete = img_count >= 6 and bgm_exists
        needs_attention = status in ('missing', 'pending', 'partial')
        
        era_id = None
        era_name = None
        if manifest:
            era_id = manifest.get('era_id') or manifest.get('id')
            if 'era_name' in manifest:
                era_name = manifest.get('era_name')
        
        results.append({
            'name': entry.name,
            'id': era_id or entry.name,
            'era_name': era_name or get_era_name(entry.name),
            'has_manifest': fmt != 'none',
            'manifest_format': fmt,
            'status': status,
            'image_count': img_count,
            'has_bgm': bgm_exists,
            'files': files,
            'is_complete': is_complete,
            'needs_attention': needs_attention,
        })
    
    return results

def generate_summary(eras: List[Dict]) -> Dict:
    complete = sum(1 for e in eras if e['status'] == 'complete')
    partial = sum(1 for e in eras if e['status'] == 'partial')
    pending = sum(1 for e in eras if e['status'] == 'pending')
    missing = sum(1 for e in eras if e['status'] == 'missing')
    
    return {
        'era_scenes': {
            'total': len(eras),
            'complete': complete,
            'partial': partial,
            'pending': pending,
            'missing': missing,
        },
        'item_icons': {'total': 60, 'current': 14, 'gap': 46},
        'building_icons': {'total': 21, 'current': 4, 'gap': 17},
        'npc_avatars': {'total': 34},
        'skill_icons': {'total': 28, 'current': 1, 'gap': 27},
        'ui_icons': {'total': 37, 'current': 20, 'gap': 17},
        'bgm': {
            'scene': {'total': 36, 'current': 6, 'gap': 30},
            'era': {'total': 42, 'current': complete, 'gap': 42 - complete},
        },
        'sfx': {'total': 58, 'current': 15, 'gap': 43},
        'covers': {'total': 23},
    }

def print_report(eras: List[Dict], summary: Dict) -> None:
    print('╔══════════════════════════════════════════════════════════════════╗')
    print('║         素材资源需求分析报告                                      ║')
    print('║         Asset Resource Requirements Analysis                       ║')
    print('╚══════════════════════════════════════════════════════════════════╝')
    print()
    
    print('📊 时代素材总览 (Era Scene Assets Overview)')
    print('─' * 70)
    print(f"  总计子纪元: {len(eras)}")
    print(f"  ✅ 已完成 (complete):   {summary['era_scenes']['complete']}")
    print(f"  ⚠️  部分完成 (partial): {summary['era_scenes']['partial']}")
    print(f"  ⏳ 待生成 (pending):   {summary['era_scenes']['pending']}")
    print(f"  ❌ 缺失 (missing):     {summary['era_scenes']['missing']}")
    print()
    
    print('📋 各时代素材状态 (By Era)')
    print('─' * 70)
    
    for era in eras:
        status_icon = '✅' if era['is_complete'] else ('⚠️' if era['needs_attention'] else '❌')
        fmt_label = {'new': '[NEW]', 'old': '[OLD]', 'none': '[NO-MANIFEST]', 'unknown': '[?]'}
        format_str = fmt_label.get(era['manifest_format'], '[?]')
        
        img_info = f"{era['image_count']}/6 images"
        bgm_info = '🎵' if era['has_bgm'] else '❌'
        
        name_display = era.get('era_name', era['name'])
        print(f"  {status_icon} {format_str} {name_display:<20} {era['name']:<30} {img_info:<12} {bgm_info}")
    
    print()
    print('📦 其他资源需求 (Other Asset Requirements)')
    print('─' * 70)
    print(f"  物品图标: {summary['item_icons']['current']}/{summary['item_icons']['total']} (缺口: {summary['item_icons']['gap']})")
    print(f"  建筑图标: {summary['building_icons']['current']}/{summary['building_icons']['total']} (缺口: {summary['building_icons']['gap']})")
    print(f"  NPC头像: {summary['npc_avatars']['total']} (fallback)")
    print(f"  技能图标: {summary['skill_icons']['current']}/{summary['skill_icons']['total']} (缺口: {summary['skill_icons']['gap']})")
    print(f"  UI图标: {summary['ui_icons']['current']}/{summary['ui_icons']['total']} (缺口: {summary['ui_icons']['gap']})")
    print(f"  BGM: 场景{summary['bgm']['scene']['total']}首 + 时代{summary['bgm']['era']['total']}首")
    print(f"  SFX: {summary['sfx']['current']}/{summary['sfx']['total']} (缺口: {summary['sfx']['gap']})")
    print()
    
    # Priority items
    priority_eras = [e for e in eras if e['needs_attention']][:10]
    if priority_eras:
        print('🎯 优先补齐项目 (Priority Items)')
        print('─' * 70)
        for era in priority_eras:
            print(f"  • {era['name']} ({era['status']}) - {era.get('era_name', '')}")
        print()

def save_json_report(eras: List[Dict], summary: Dict) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    report = {
        'generated_at': datetime.now().isoformat(),
        'summary': summary,
        'eras': eras,
    }
    
    output_path = OUTPUT_DIR / f"asset-requirements-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"[INFO] JSON report saved: {output_path}")
    
    latest_path = OUTPUT_DIR / "latest.json"
    with open(latest_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"[INFO] Latest report saved: {latest_path}")

def main():
    parser = argparse.ArgumentParser(description='素材资源需求分析')
    parser.add_argument('--json', action='store_true', help='Output JSON report')
    parser.add_argument('--era', type=str, help='Filter by era name')
    args = parser.parse_args()
    
    print('[INFO] Analyzing era assets...')
    eras = analyze_eras()
    
    if args.era:
        eras = [e for e in eras if args.era in e['name'] or args.era in e.get('era_name', '')]
        print(f'[INFO] Filtered to: {args.era}')
    
    summary = generate_summary(eras)
    
    if args.json:
        save_json_report(eras, summary)
    else:
        print_report(eras, summary)

if __name__ == '__main__':
    main()