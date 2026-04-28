#!/bin/bash
# BGM 生成命令模板
# 使用方法: bash scripts/bgm_commands.sh


# === modern_western_jazz_age ===
# 提示词: 1920s Jazz Age, swing, brass, prohibition era speakeasy, Art Deco glamour. Background music for game...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. 1920s Jazz Age, swing, brass, prohibition era speakeasy, Art Deco glamour. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/modern_western_jazz_age/modern_western_jazz_age_bgm.mp3"

# === contemporary_post_apocalyptic ===
# 提示词: Post-apocalyptic wasteland, dark ambient, low frequency drones, desolate tension. Background music f...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Post-apocalyptic wasteland, dark ambient, low frequency drones, desolate tension. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/contemporary_post_apocalyptic/contemporary_post_apocalyptic_bgm.mp3"

# === ancient_eastern_myth ===
# 提示词: Chinese mythological epic, divine and majestic, bianzhong bells, orchestral. Background music for ga...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Chinese mythological epic, divine and majestic, bianzhong bells, orchestral. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/ancient_eastern_myth/ancient_eastern_myth_bgm.mp3"

# === ancient_western_roman ===
# 提示词: Ancient Roman empire, military march, brass, epic and powerful, Roman grandeur. Background music for...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Ancient Roman empire, military march, brass, epic and powerful, Roman grandeur. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/ancient_western_roman/ancient_western_roman_bgm.mp3"

# === near-future_dystopia ===
# 提示词: Dystopian atmosphere, oppressive electronic soundscape, dark ambient, electronic. Background music f...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Dystopian atmosphere, oppressive electronic soundscape, dark ambient, electronic. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/near-future_dystopia/near-future_dystopia_bgm.mp3"

# === far-future_cyborg ===
# 提示词: Cyborg transhumanist world, electronic, synthesizer, neural interface sounds. Background music for g...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Cyborg transhumanist world, electronic, synthesizer, neural interface sounds. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/far-future_cyborg/far-future_cyborg_bgm.mp3"

# === near-future_space_colonization ===
# 提示词: Space colonization, sci-fi orchestral, cosmic wonder, hopeful yet tense. Background music for game s...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Space colonization, sci-fi orchestral, cosmic wonder, hopeful yet tense. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/near-future_space_colonization/near-future_space_colonization_bgm.mp3"

# === far-future_virtual_reality ===
# 提示词: Virtual reality digital world, ethereal electronic, synthesized pads, otherworldly. Background music...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Virtual reality digital world, ethereal electronic, synthesized pads, otherworldly. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/far-future_virtual_reality/far-future_virtual_reality_bgm.mp3"

# === modern_western_victorian ===
# 提示词: Victorian era, music box, orchestral, industrial revolution, steampunk elements. Background music fo...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Victorian era, music box, orchestral, industrial revolution, steampunk elements. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/modern_western_victorian/modern_western_victorian_bgm.mp3"

# === modern_eastern_meiji_taisho ===
# 提示词: Meiji-Taisho era Japan, Japanese-Western fusion, elegant and nostalgic. Background music for game sc...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Meiji-Taisho era Japan, Japanese-Western fusion, elegant and nostalgic. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/modern_eastern_meiji_taisho/modern_eastern_meiji_taisho_bgm.mp3"

# === modern_western_postwar ===
# 提示词: Post-war 1940s-50s, big band jazz, early rock, blues, recovery and hope. Background music for game s...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Post-war 1940s-50s, big band jazz, early rock, blues, recovery and hope. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/modern_western_postwar/modern_western_postwar_bgm.mp3"

# === contemporary_rural ===
# 提示词: Peaceful countryside, folk music, acoustic guitar, nature sounds, rustic. Background music for game ...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Peaceful countryside, folk music, acoustic guitar, nature sounds, rustic. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/contemporary_rural/contemporary_rural_bgm.mp3"

# === ancient_western_medieval ===
# 提示词: Medieval atmosphere, Gregorian chant, lute, medieval folk, dark ages mystery. Background music for g...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Medieval atmosphere, Gregorian chant, lute, medieval folk, dark ages mystery. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/ancient_western_medieval/ancient_western_medieval_bgm.mp3"

# === ancient_western_greek ===
# 提示词: Ancient Greek atmosphere, lyre, aulos, classical Greek instruments, epic mythology. Background music...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Ancient Greek atmosphere, lyre, aulos, classical Greek instruments, epic mythology. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/ancient_western_greek/ancient_western_greek_bgm.mp3"

# === ancient_eastern_zhiguai ===
# 提示词: Chinese supernatural tales, mystical and eerie atmosphere, guzheng, xiao flute, haunting. Background...
# 命令:
curl -X POST "https://api.minimax.chat/v1/text_to_speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01",
    "text": "Generate ambient background music. Chinese supernatural tales, mystical and eerie atmosphere, guzheng, xiao flute, haunting. Cinematic, loopable.",
    "voice_setting": {
      "voice_id": "male-qn-qingse"
    },
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128,
      "format": "mp3"
    }
  }' \
  -o "/home/ubuntu/project/MoRanJiangHu/data/era_assets/ancient_eastern_zhiguai/ancient_eastern_zhiguai_bgm.mp3"
