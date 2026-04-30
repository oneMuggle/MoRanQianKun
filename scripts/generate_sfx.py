#!/usr/bin/env python3
"""
墨染江湖 8-bit 像素风 SFX 生成器
使用 Python 标准库 + numpy 生成复古游戏音效
"""
import wave
import struct
import math
import os
import sys

# 8-bit 风格采样率
SAMPLE_RATE = 22050

def write_wav(filepath, data, duration_sec=None):
    """写入 WAV 文件"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with wave.open(filepath, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(SAMPLE_RATE)
        # data 可能是 -1.0~1.0 的浮点，或直接的整数
        if isinstance(data[0], float):
            data = [int(d * 32767) for d in data]
        data = [max(-32768, min(32767, d)) for d in data]
        wav.writeframes(struct.pack('<' + 'h' * len(data), *data))
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  ✓ {os.path.basename(filepath)} ({size_kb:.1f} KB)")

def make_noise(duration, fade_in=0.002, fade_out=0.01):
    """生成白噪声，用于打击/爆炸"""
    n = int(duration * SAMPLE_RATE)
    t = [i / SAMPLE_RATE for i in range(n)]
    # 渐变包络
    envelope = []
    for i in range(n):
        ti = i / SAMPLE_RATE
        env = 1.0
        if ti < fade_in:
            env = ti / fade_in
        elif ti > duration - fade_out:
            env = (duration - ti) / fade_out
        envelope.append(env)
    noise = [((hash(i) % 1000) / 500 - 1) * env for i, env in enumerate(envelope)]
    return noise

def make_tone(freq, duration, wave_type='square', fade_in=0.002, fade_out=0.03):
    """生成指定频率和波形的音调"""
    n = int(duration * SAMPLE_RATE)
    t = [i / SAMPLE_RATE for i in range(n)]
    envelope = []
    for i in range(n):
        ti = i / SAMPLE_RATE
        env = 1.0
        if ti < fade_in:
            env = ti / fade_in
        elif ti > duration - fade_out:
            env = max(0, (duration - ti) / fade_out)
        envelope.append(env)
    
    def sample(i):
        phase = 2 * math.pi * freq * t[i]
        if wave_type == 'square':
            return 1.0 if math.sin(phase) > 0 else -1.0
        elif wave_type == 'saw':
            return 2 * ((freq * t[i]) % 1.0) - 1.0
        elif wave_type == 'triangle':
            return 2 * abs(2 * ((freq * t[i]) % 1.0) - 1.0) - 1.0
        else:  # sine
            return math.sin(phase)
    
    return [sample(i) * env for i, env in enumerate(envelope)]

def mix(*signals, volumes=None):
    """混音多条信号"""
    if volumes is None:
        volumes = [1.0] * len(signals)
    max_len = max(len(s) for s in signals)
    result = [0.0] * max_len
    for sig, vol in zip(signals, volumes):
        for i, v in enumerate(sig):
            result[i] += v * vol
    # 限幅
    return [max(-1.0, min(1.0, v)) for v in result]

def make_sweep(start_freq, end_freq, duration, wave_type='square'):
    """频率扫描（上下限音效）"""
    n = int(duration * SAMPLE_RATE)
    result = []
    for i in range(n):
        t = i / SAMPLE_RATE
        freq = start_freq + (end_freq - start_freq) * (t / duration)
        phase = 2 * math.pi * freq * t
        if wave_type == 'square':
            val = 1.0 if math.sin(phase) > 0 else -1.0
        else:
            val = math.sin(phase)
        # 包络
        env = 1.0 - (t / duration) * 0.5
        result.append(val * env)
    return result

# ─────────────────────────────────────────
# SFX 定义
# ─────────────────────────────────────────

def gen_ui_click():
    """按钮点击 - 短促高频"""
    # 主音调快速上滑
    tone1 = make_tone(660, 0.05, 'square')
    tone2 = make_tone(990, 0.05, 'square')
    tone3 = make_tone(1320, 0.04, 'square')
    tone = mix(tone1, tone2, tone3, volumes=[0.4, 0.3, 0.25])
    # 快速淡出
    n = int(0.12 * SAMPLE_RATE)
    env = [1.0 - i/n for i in range(n)]
    tone = [t * e for t, e in zip(tone + [0]*n, env * 3)]
    return tone[:n]

def gen_ui_confirm():
    """确认音效  -  两声短促"""
    t1 = make_tone(523, 0.06, 'square')  # C5
    t2 = make_tone(784, 0.10, 'square')  # G5
    silence = [0.0] * int(0.05 * SAMPLE_RATE)
    combined = t1 + silence + t2
    # 淡出
    for i in range(int(0.08 * SAMPLE_RATE)):
        combined[-(i+1)] *= (1 - i / int(0.08 * SAMPLE_RATE))
    return combined

def gen_level_up():
    """升级音效  -  上升琶音"""
    notes = [523, 659, 784, 1047, 1319, 1568]  # C5 E5 G5 C6 E6 G6
    result = []
    note_dur = 0.07
    for i, freq in enumerate(notes):
        tone = make_tone(freq, note_dur, 'square')
        # 每个音有独立包络
        env_len = int(note_dur * SAMPLE_RATE)
        for j in range(env_len):
            idx = i * int(note_dur * SAMPLE_RATE) + j
            if j < env_len:
                if j < int(0.01 * SAMPLE_RATE):
                    env = j / int(0.01 * SAMPLE_RATE)
                elif j > int(0.05 * SAMPLE_RATE):
                    env = max(0, 1 - (j - int(0.05 * SAMPLE_RATE)) / int(0.02 * SAMPLE_RATE))
                else:
                    env = 1.0
                if idx < len(tone) * len(notes):
                    pass
        result += tone
    
    # 在末尾添加延音
    last_tone = make_tone(1568, 0.3, 'square')
    fade_n = int(0.3 * SAMPLE_RATE)
    last_tone = [v * (1 - i/fade_n) for i, v in enumerate(last_tone)]
    result += last_tone
    
    n_total = int(0.8 * SAMPLE_RATE)
    result = (result + [0.0] * n_total)[:n_total]
    return result

def gen_combat_hit():
    """击中音效  -  短促打击"""
    # 低频冲击
    tone_low = make_tone(80, 0.08, 'square')
    # 白噪声模拟打击感
    noise = make_noise(0.1, fade_in=0.001, fade_out=0.03)
    # 中频"啪"声
    tone_mid = make_tone(220, 0.05, 'saw')
    return mix(tone_low, noise, tone_mid, volumes=[0.5, 0.6, 0.3])

def gen_combat_block():
    """格挡音效  -  金属碰撞"""
    # 高频短促
    tone1 = make_tone(1800, 0.04, 'square')
    tone2 = make_tone(2400, 0.03, 'square')
    # 金属质感噪声
    noise = make_noise(0.08, fade_in=0.001, fade_out=0.04)
    result = mix(tone1, tone2, noise, volumes=[0.4, 0.3, 0.4])
    return result

def gen_combat_dodge():
    """闪避音效  -  快速风声"""
    n = int(0.15 * SAMPLE_RATE)
    t = [i / SAMPLE_RATE for i in range(n)]
    # 频率快速下降
    freq_start = 2000
    freq_end = 300
    noise = make_noise(0.15, fade_in=0.01, fade_out=0.05)
    tone = [math.sin(2 * math.pi * (freq_start - (freq_start-freq_end)*(ti/0.15)) * ti) * 0.3 for ti in t]
    return mix(tone, noise, volumes=[0.5, 0.4])

def gen_sword_swing():
    """挥剑音效  -  嗖声"""
    n = int(0.2 * SAMPLE_RATE)
    t = [i / SAMPLE_RATE for i in range(n)]
    # 频率从高快速滑向低
    freq_start = 1500
    freq_end = 200
    tone = [math.sin(2 * math.pi * (freq_start - (freq_start-freq_end)*(ti/0.2)) * ti) for ti in t]
    # 包络
    env = [max(0, 1 - ti/0.2) for ti in t]
    return [v * e * 0.5 for v, e in zip(tone, env)]

def gen_coin():
    """金币获取  -  清脆双音"""
    t1 = make_tone(987, 0.08, 'square')   # B5
    t2 = make_tone(1318, 0.15, 'square')  # E6
    silence = [0.0] * int(0.05 * SAMPLE_RATE)
    combined = t1 + silence + t2
    # 第二个音渐出
    offset = int(0.13 * SAMPLE_RATE)
    for i in range(len(t2)):
        idx = offset + i
        if idx < len(combined):
            combined[idx] *= max(0, 1 - i / int(0.2 * SAMPLE_RATE))
    n = int(0.35 * SAMPLE_RATE)
    combined = (combined + [0.0] * n)[:n]
    return combined

def gen_notification():
    """通知音效  -  柔和提示"""
    notes = [880, 1100]  # A5, C#6
    result = []
    for freq in notes:
        tone = make_tone(freq, 0.12, 'sine')
        env_n = int(0.12 * SAMPLE_RATE)
        tone = [v * max(0, 1 - i/env_n) for i, v in enumerate(tone)]
        result += tone + [0.0] * int(0.03 * SAMPLE_RATE)
    return (result + [0.0] * int(0.4 * SAMPLE_RATE))[:int(0.4 * SAMPLE_RATE)]

def gen_door_open():
    """开门音效  -  嘎吱木门"""
    n = int(0.4 * SAMPLE_RATE)
    t = [i / SAMPLE_RATE for i in range(n)]
    # 缓慢的摩擦音
    tone = [math.sin(2 * math.pi * 150 * ti) * 0.3 for ti in t]
    noise = make_noise(0.4, fade_in=0.05, fade_out=0.1)
    # 频率微变模拟吱嘎
    freq_mod = [1 + 0.3 * math.sin(2 * math.pi * 3 * ti) for ti in t]
    tone = [tone[i] * freq_mod[i] for i in range(n)]
    env = [1.0 - ti/0.4 for ti in t]
    return [v * env[i] * 0.5 + noise[i] * 0.3 for i, v in enumerate(tone)]

def gen_buff_apply():
    """增益施加  -  魔法光效"""
    # 上升音调
    notes = [440, 554, 659, 880]
    result = []
    for freq in notes:
        tone = make_tone(freq, 0.1, 'sine')
        result += tone
    # 添加高音 sparkle
    sparkle = make_tone(1760, 0.15, 'sine')
    env_n = int(0.15 * SAMPLE_RATE)
    sparkle = [v * max(0, 1 - i/env_n) for i, v in enumerate(sparkle)]
    result += sparkle
    n = int(0.6 * SAMPLE_RATE)
    result = (result + [0.0] * n)[:n]
    return result

def gen_debuff():
    """减益施加  -  不祥下降"""
    notes = [440, 349, 277]
    result = []
    for freq in notes:
        tone = make_tone(freq, 0.15, 'saw')
        result += tone
    # 添加噪声
    noise = make_noise(0.45, fade_in=0.02, fade_out=0.1)
    result += [0.0] * int(0.02 * SAMPLE_RATE)
    result = mix(result, noise[:len(result)], volumes=[0.6, 0.3])
    return result

def gen_miss():
    """闪避/落空  -  虚无"""
    n = int(0.2 * SAMPLE_RATE)
    t = [i / SAMPLE_RATE for i in range(n)]
    # 很低频的嗖声
    freq_start = 800
    freq_end = 100
    tone = [math.sin(2 * math.pi * (freq_start - (freq_start-freq_end)*(ti/0.2)) * ti) * 0.3 for ti in t]
    noise = make_noise(0.2, fade_in=0.02, fade_out=0.05)
    return mix(tone, noise, volumes=[0.4, 0.3])

def gen_victory():
    """战斗胜利  -  凯旋"""
    notes = [523, 659, 784, 1047]  # C5 E5 G5 C6
    result = []
    for freq in notes:
        tone = make_tone(freq, 0.2, 'square')
        env_n = int(0.2 * SAMPLE_RATE)
        tone = [v * (1 - max(0, (i - int(0.1*SAMPLE_RATE)))/int(0.1*SAMPLE_RATE)) for i, v in enumerate(tone)]
        result += tone + [0.0] * int(0.03 * SAMPLE_RATE)
    # 最后一个音延长
    last = make_tone(1047, 0.5, 'square')
    fade_n = int(0.3 * SAMPLE_RATE)
    last = [v * max(0, 1 - i/fade_n) for i, v in enumerate(last)]
    result += last
    n = int(1.2 * SAMPLE_RATE)
    result = (result + [0.0] * n)[:n]
    return result

def gen_defeat():
    """战斗失败  -  悲怆"""
    notes = [392, 349, 330, 262]  # G4 F4 E4 C4
    result = []
    for freq in notes:
        tone = make_tone(freq, 0.3, 'saw')
        env_n = int(0.3 * SAMPLE_RATE)
        tone = [v * max(0, 1 - i/env_n) for i, v in enumerate(tone)]
        result += tone + [0.0] * int(0.02 * SAMPLE_RATE)
    n = int(1.3 * SAMPLE_RATE)
    result = (result + [0.0] * n)[:n]
    return result

# ─────────────────────────────────────────
# 主程序
# ─────────────────────────────────────────

def main():
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'resources', 'audio', 'sfx')
    out_dir = os.path.normpath(out_dir)
    os.makedirs(out_dir, exist_ok=True)
    
    sfx_list = [
        ('sfx_ui_click.wav', gen_ui_click, '按钮点击'),
        ('sfx_ui_confirm.wav', gen_ui_confirm, '确认'),
        ('sfx_level_up.wav', gen_level_up, '升级'),
        ('sfx_combat_hit.wav', gen_combat_hit, '击中'),
        ('sfx_combat_block.wav', gen_combat_block, '格挡'),
        ('sfx_combat_dodge.wav', gen_combat_dodge, '闪避'),
        ('sfx_sword_swing.wav', gen_sword_swing, '挥剑'),
        ('sfx_coin.wav', gen_coin, '金币'),
        ('sfx_notification.wav', gen_notification, '通知'),
        ('sfx_door_open.wav', gen_door_open, '开门'),
        ('sfx_buff_apply.wav', gen_buff_apply, '增益'),
        ('sfx_debuff.wav', gen_debuff, '减益'),
        ('sfx_miss.wav', gen_miss, '落空'),
        ('sfx_victory.wav', gen_victory, '胜利'),
        ('sfx_defeat.wav', gen_defeat, '失败'),
    ]
    
    print(f"输出目录: {out_dir}")
    print(f"生成 {len(sfx_list)} 个 SFX 文件...\n")
    
    for filename, gen_fn, desc in sfx_list:
        filepath = os.path.join(out_dir, filename)
        print(f"[{desc}] ", end='', flush=True)
        data = gen_fn()
        write_wav(filepath, data)
    
    print(f"\n✅ 完成！{len(sfx_list)} 个 SFX 文件已生成。")

if __name__ == '__main__':
    main()
