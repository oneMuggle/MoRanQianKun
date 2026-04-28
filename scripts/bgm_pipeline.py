#!/usr/bin/env python3
"""
BGM 匹配与生成管线
配合 MiniMax 资源生成器使用

功能：
1. 从 eraTheme.ts 解析 BGM 标签
2. 匹配预定义 BGM 风格模板
3. 生成 BGM 生成命令模板
4. 支持批量 BGM 需求分析

Usage:
    python3 scripts/bgm_pipeline.py                    # 分析所有待生成 BGM
    python3 scripts/bgm_pipeline.py --era ancient_eastern_wuxia  # 指定 Era
    python3 scripts/bgm_pipeline.py --export-commands  # 导出命令模板
"""

import os
import sys
import json
import re
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional

PROJECT_ROOT = Path(__file__).parent.parent
ERA_THEME_TS = PROJECT_ROOT / "models" / "eraTheme.ts"
ERA_ASSETS_DIR = PROJECT_ROOT / "data" / "era_assets"

# 预定义 BGM 风格模板
BGM_TEMPLATES = {
    "民乐": {
        "instruments": ["guzheng", "pipa", "dizi", "xiao", "sheng", "bianzhong"],
        "mood": ["hauntingly beautiful", "mystical", "epic", "serene"],
        "tempo": "slow to moderate",
    },
    "古风": {
        "instruments": ["guqin", "bamboo flute", "erhu", "suona"],
        "mood": ["nostalgic", "ancient", "wistful", "romantic"],
        "tempo": "moderate",
    },
    "武侠": {
        "instruments": ["dizi", "guzheng", "pipa", "sheng"],
        "mood": ["heroic", "martial", "adventurous", "wuxia"],
        "tempo": "moderate to fast",
    },
    "古典": {
        "instruments": ["orchestral strings", "brass", "woodwinds", "timpani"],
        "mood": ["elegant", "formal", "classical", "refined"],
        "tempo": "moderate",
    },
    "管弦": {
        "instruments": ["full orchestra", "strings", "brass section"],
        "mood": ["epic", "majestic", "dramatic", "cinematic"],
        "tempo": "varied",
    },
    "爵士": {
        "instruments": ["saxophone", "trumpet", "piano", "double bass", "drums"],
        "mood": ["smooth", "relaxed", "soulful", "improvisational"],
        "tempo": "moderate to fast",
    },
    "电子": {
        "instruments": ["synthesizer", "drum machine", "electronic pads"],
        "mood": ["futuristic", "digital", "cyberpunk", "ambient"],
        "tempo": "varied",
    },
    "合成器": {
        "instruments": ["analog synthesizer", "digital synth", "arpeggiator"],
        "mood": ["retro-futuristic", "sci-fi", "transhumanist"],
        "tempo": "moderate to fast",
    },
    "氛围": {
        "instruments": ["ambient pads", "field recordings", "processed sounds"],
        "mood": ["atmospheric", "textural", "immersive", "ambient"],
        "tempo": "slow",
    },
    "民谣": {
        "instruments": ["acoustic guitar", "harmonica", "fiddle"],
        "mood": ["folksy", "down-to-earth", "storytelling", "rustic"],
        "tempo": "moderate",
    },
}

# SubEra BGM 详细配置
SUBERA_BGM_CONFIG = {
    "ancient_eastern_wuxia": {
        "primary": ["民乐", "武侠"],
        "secondary": ["古风"],
        "instruments": ["古筝", "笛子", "琵琶"],
        "description": "江湖武侠风格，侠客豪情",
        "prompt_en": "Chinese wuxia martial arts atmosphere, guzheng, dizi flute, heroic and adventurous"
    },
    "ancient_eastern_zhiguai": {
        "primary": ["民乐", "古风", "氛围"],
        "secondary": ["民乐"],
        "instruments": ["古筝", "箫", "编钟"],
        "description": "志怪传说风格，神秘幽暗",
        "prompt_en": "Chinese supernatural tales, mystical and eerie atmosphere, guzheng, xiao flute, haunting"
    },
    "ancient_eastern_myth": {
        "primary": ["民乐", "古典"],
        "secondary": ["管弦"],
        "instruments": ["编钟", "埙", "古筝"],
        "description": "上古神话风格，史诗壮观",
        "prompt_en": "Chinese mythological epic, divine and majestic, bianzhong bells, orchestral"
    },
    "ancient_western_greek": {
        "primary": ["古典"],
        "secondary": ["管弦"],
        "instruments": ["里拉琴", "阿夫洛斯管"],
        "description": "古希腊风格，古典庄严",
        "prompt_en": "Ancient Greek atmosphere, lyre, aulos, classical Greek instruments, epic mythology"
    },
    "ancient_western_roman": {
        "primary": ["古典", "管弦"],
        "secondary": ["古典"],
        "instruments": ["罗马军号", "战鼓"],
        "description": "古罗马风格，帝国威严",
        "prompt_en": "Ancient Roman empire, military march, brass, epic and powerful, Roman grandeur"
    },
    "ancient_western_medieval": {
        "primary": ["古典", "氛围"],
        "secondary": ["古典"],
        "instruments": ["竖琴", "鲁特琴", "圣咏"],
        "description": "中世纪风格，手抄本彩绘",
        "prompt_en": "Medieval atmosphere, Gregorian chant, lute, medieval folk, dark ages mystery"
    },
    "modern_eastern_republic": {
        "primary": ["爵士", "民乐"],
        "secondary": ["古风"],
        "instruments": ["爵士乐", "时代曲", "二胡"],
        "description": "民国风云，老上海风情",
        "prompt_en": "1920s-30s Republic of China Shanghai atmosphere, jazz, era songs, nostalgic"
    },
    "modern_eastern_meiji_taisho": {
        "primary": ["古典", "民乐"],
        "secondary": ["爵士"],
        "instruments": ["和乐", "洋乐", "时代曲"],
        "description": "明治大正，东西融合",
        "prompt_en": "Meiji-Taisho era Japan, Japanese-Western fusion, elegant and nostalgic"
    },
    "modern_western_victorian": {
        "primary": ["古典"],
        "secondary": ["管弦"],
        "instruments": ["八音盒", "管弦乐"],
        "description": "维多利亚时代，工业革命",
        "prompt_en": "Victorian era, music box, orchestral, industrial revolution, steampunk elements"
    },
    "modern_western_jazz_age": {
        "primary": ["爵士"],
        "secondary": ["古典"],
        "instruments": ["萨克斯", "小号", "钢琴"],
        "description": "咆哮二十年代，Art Deco",
        "prompt_en": "1920s Jazz Age, swing, brass, prohibition era speakeasy, Art Deco glamour"
    },
    "modern_western_postwar": {
        "primary": ["爵士"],
        "secondary": ["古典"],
        "instruments": ["大乐队", "早期摇滚", "蓝调"],
        "description": "战后重建，彩色胶片",
        "prompt_en": "Post-war 1940s-50s, big band jazz, early rock, blues, recovery and hope"
    },
    "contemporary_urban": {
        "primary": ["电子"],
        "secondary": ["流行"],
        "instruments": ["合成器", "电子鼓"],
        "description": "现代都市，霓虹夜景",
        "prompt_en": "Contemporary urban city, neon nights, electronic, modern city life"
    },
    "contemporary_rural": {
        "primary": ["民谣"],
        "secondary": ["民乐"],
        "instruments": ["吉他", "民谣吉他", "自然声"],
        "description": "田园乡村，自然风光",
        "prompt_en": "Peaceful countryside, folk music, acoustic guitar, nature sounds, rustic"
    },
    "contemporary_post_apocalyptic": {
        "primary": ["氛围", "电子"],
        "secondary": ["电子"],
        "instruments": ["低频音", "合成器"],
        "description": "末日废土，荒芜世界",
        "prompt_en": "Post-apocalyptic wasteland, dark ambient, low frequency drones, desolate tension"
    },
    "near-future_cyberpunk": {
        "primary": ["电子", "合成器"],
        "secondary": ["氛围"],
        "instruments": ["合成器", "赛博朋克音"],
        "description": "赛博朋克，霓虹未来",
        "prompt_en": "Cyberpunk neon future, electronic, synthesizer, cyber atmosphere"
    },
    "near-future_dystopia": {
        "primary": ["电子", "氛围"],
        "secondary": ["古典"],
        "instruments": ["低沉合成器", "电子特效"],
        "description": "反乌托邦，压抑统治",
        "prompt_en": "Dystopian atmosphere, oppressive electronic soundscape, dark ambient, electronic"
    },
    "near-future_space_colonization": {
        "primary": ["管弦", "电子"],
        "secondary": ["氛围"],
        "instruments": ["电子弦乐", "太空音效"],
        "description": "太空殖民，星际探索",
        "prompt_en": "Space colonization, sci-fi orchestral, cosmic wonder, hopeful yet tense"
    },
    "far-future_space_opera": {
        "primary": ["管弦", "电子"],
        "secondary": ["古典"],
        "instruments": ["史诗管弦", "电子合成"],
        "description": "星际科幻，太空歌剧",
        "prompt_en": "Space opera, epic orchestral, electronic synthesis, cosmic battles"
    },
    "far-future_cyborg": {
        "primary": ["电子", "合成器"],
        "secondary": ["氛围"],
        "instruments": ["神经接口音", "机械音效"],
        "description": "赛博格，人机融合",
        "prompt_en": "Cyborg transhumanist world, electronic, synthesizer, neural interface sounds"
    },
    "far-future_virtual_reality": {
        "primary": ["电子", "氛围"],
        "secondary": ["合成器"],
        "instruments": ["数字合成器", "虚拟音效"],
        "description": "虚拟现实，意识数字化",
        "prompt_en": "Virtual reality digital world, ethereal electronic, synthesized pads, otherworldly"
    },
}


def parse_bgm_tags_from_ts(era_id: str) -> List[str]:
    """从 eraTheme.ts 解析 BGM 标签"""
    if not ERA_THEME_TS.exists():
        return []
    
    with open(ERA_THEME_TS, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 查找该 era 的 bgmTags
    # 匹配格式: makeNode('era_id', ..., { ... bgmTags: ['tag1', 'tag2'], ... })
    pattern = rf"makeNode\('{era_id}',[^}}]*bgmTags:\s*\[([^\]]+)\]"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        return []
    
    tags_str = match.group(1)
    tags = re.findall(r"'([^']+)'", tags_str)
    return tags


def get_bgm_config(era_id: str) -> Dict[str, Any]:
    """获取 BGM 配置（优先从 SUBERA_BGM_CONFIG，其次从 eraTheme.ts）"""
    if era_id in SUBERA_BGM_CONFIG:
        return SUBERA_BGM_CONFIG[era_id]
    
    # 从 eraTheme.ts 动态解析
    tags = parse_bgm_tags_from_ts(era_id)
    if tags:
        return {
            "primary": tags[:2] if len(tags) >= 2 else tags,
            "secondary": tags[2:] if len(tags) > 2 else [],
            "instruments": tags,
            "description": " ".join(tags),
            "prompt_en": ", ".join(tags),
        }
    
    return {
        "primary": ["氛围"],
        "secondary": [],
        "instruments": [],
        "description": "默认背景音乐",
        "prompt_en": "ambient background music",
    }


def generate_bgm_prompt(era_id: str, style: str = "standard") -> str:
    """生成 BGM 提示词"""
    config = get_bgm_config(era_id)
    
    if style == "detailed":
        # 详细提示词
        instruments = ", ".join(config.get("instruments", []))
        mood = ", ".join(config.get("primary", []))
        return (
            f"{config['description']} background music. "
            f"Instruments: {instruments}. "
            f"Mood: {mood}. "
            f"Cinematic, atmospheric, loopable, high quality."
        )
    elif style == "minimax":
        # MiniMax API 格式
        return f"Generate ambient background music. {config['prompt_en']}. Cinematic, loopable."
    else:
        # 标准格式
        return f"{config['prompt_en']}. Background music for game scene."


def build_minimax_command(era_id: str, output_path: str) -> str:
    """构建 MiniMax API 调用命令模板"""
    prompt = generate_bgm_prompt(era_id, style="minimax")
    
    # 如果有 MiniMax API Key，构建 curl 命令
    api_key = os.environ.get("MINIMAX_API_KEY", "YOUR_API_KEY")
    
    # 使用 curl 的命令模板
    cmd = f'''curl -X POST "https://api.minimax.chat/v1/text_to_speech" \\
  -H "Authorization: Bearer {api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{{
    "model": "speech-01",
    "text": "{prompt}",
    "voice_setting": {{
      "voice_id": "male-qn-qingse"
    }},
    "audio_setting": {{
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }}
  }}' \\
  -o "{output_path}"'''
    
    return cmd


def analyze_all_pending() -> List[Dict[str, Any]]:
    """分析所有待生成的 BGM 需求"""
    # 导入 minimax_resource_generator 的函数
    sys.path.insert(0, str(PROJECT_ROOT / "scripts"))
    from minimax_resource_generator import load_all_manifests, ERA_ASSETS_DIR as ERA_ASSETS_FROM_GENERATOR
    
    manifests = load_all_manifests()
    pending_bgm = []
    
    for era_id, manifest in manifests.items():
        if manifest.get("status") == "pending":
            bgm_name = manifest.get("bgm", f"{era_id}_bgm.mp3")
            config = get_bgm_config(era_id)
            
            # 检查文件是否已存在
            bgm_path = ERA_ASSETS_DIR / era_id / bgm_name
            exists = bgm_path.exists() and bgm_path.stat().st_size > 10000
            
            pending_bgm.append({
                "era_id": era_id,
                "bgm_file": bgm_name,
                "bgm_path": str(bgm_path.relative_to(PROJECT_ROOT)),
                "exists": exists,
                "config": config,
                "prompt": generate_bgm_prompt(era_id),
                "minimax_command": build_minimax_command(era_id, str(bgm_path)),
            })
    
    return pending_bgm


def export_commands(pending_bgm: List[Dict[str, Any]], output_file: str = None) -> str:
    """导出命令模板到文件"""
    lines = ["#!/bin/bash", "# BGM 生成命令模板", "# 使用方法: bash scripts/bgm_commands.sh", "", ""]
    
    for bgm in pending_bgm:
        lines.append(f"# === {bgm['era_id']} ===")
        lines.append(f"# 提示词: {bgm['prompt'][:100]}...")
        lines.append(f"# 命令:")
        for line in bgm['minimax_command'].split('\n'):
            lines.append(line)
        lines.append("")
    
    content = "\n".join(lines)
    
    if output_file:
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"命令模板已导出到: {output_file}")
    
    return content


def print_bgm_report(pending_bgm: List[Dict[str, Any]]) -> None:
    """打印 BGM 分析报告"""
    print("\n" + "=" * 70)
    print("BGM 匹配/生成分析报告")
    print("=" * 70)
    
    for bgm in pending_bgm:
        config = bgm["config"]
        print(f"\n【{bgm['era_id']}】")
        print(f"  BGM 文件: {bgm['bgm_file']}")
        print(f"  路径: {bgm['bgm_path']}")
        print(f"  状态: {'已存在' if bgm['exists'] else '待生成'}")
        print(f"  描述: {config.get('description', 'N/A')}")
        print(f"  主要风格: {', '.join(config.get('primary', []))}")
        print(f"  次要风格: {', '.join(config.get('secondary', []))}")
        print(f"  乐器: {', '.join(config.get('instruments', []))}")
        print(f"  提示词: {bgm['prompt'][:100]}...")
    
    print("\n" + "=" * 70)
    print(f"共 {len(pending_bgm)} 个待生成 BGM")
    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(description="BGM 匹配与生成管线")
    parser.add_argument("--era", type=str, help="指定 Era ID")
    parser.add_argument("--export-commands", action="store_true", help="导出命令模板")
    parser.add_argument("--output", type=str, default="scripts/bgm_commands.sh", help="导出文件路径")
    parser.add_argument("--prompt-only", action="store_true", help="只显示提示词")
    args = parser.parse_args()

    # 分析
    pending = analyze_all_pending()
    
    if args.era:
        pending = [p for p in pending if p["era_id"] == args.era]
        if not pending:
            print(f"[WARN] Era '{args.era}' 不在待生成列表中或已存在")
            return
    
    if not pending:
        print("没有待生成的 BGM")
        return
    
    # 输出
    if args.prompt_only:
        for bgm in pending:
            print(f"\n=== {bgm['era_id']} ===")
            print(f"Prompt: {bgm['prompt']}")
    elif args.export_commands:
        export_commands(pending, args.output)
    else:
        print_bgm_report(pending)


if __name__ == "__main__":
    main()
