/**
 * useGalgameAudio.ts
 *
 * Galgame 音频集成 Hook — 场景 BGM 切换、打字音效、结局音效。
 * 复用现有 MusicProvider 模块。
 */

import { useCallback, useEffect, useRef } from 'react';
import { useMusic } from '../components/features/Music/MusicProvider';

export interface SceneBGMConfig {
  sceneKeyword: string;
  trackId: string;
}

export interface GalgameAudioConfig {
  sceneBGM: SceneBGMConfig[];
  typeSoundEnabled: boolean;
  typeSoundVolume: number;
  typeSoundInterval: number;
}

const DEFAULT_CONFIG: GalgameAudioConfig = {
  sceneBGM: [
    { sceneKeyword: '门派', trackId: 'bgm_sect' },
    { sceneKeyword: '客栈', trackId: 'bgm_inn' },
    { sceneKeyword: '市集', trackId: 'bgm_market' },
    { sceneKeyword: '秘境', trackId: 'bgm_secret' },
    { sceneKeyword: '战斗', trackId: 'bgm_battle' },
    { sceneKeyword: '夜晚', trackId: 'bgm_night' },
  ],
  typeSoundEnabled: false,
  typeSoundVolume: 0.3,
  typeSoundInterval: 3,
};

export function useGalgameAudio(config?: Partial<GalgameAudioConfig>) {
  const music = useMusic();
  const effectiveConfig = { ...DEFAULT_CONFIG, ...config };
  const typeSoundCharCount = useRef(0);
  const typeAudioRef = useRef<HTMLAudioElement | null>(null);

  const matchBGMForScene = useCallback(
    (sceneName: string): string | null => {
      for (const mapping of effectiveConfig.sceneBGM) {
        if (sceneName.includes(mapping.sceneKeyword)) return mapping.trackId;
      }
      return null;
    },
    [effectiveConfig.sceneBGM]
  );

  const switchSceneBGM = useCallback(
    (sceneName: string) => {
      const trackId = matchBGMForScene(sceneName);
      if (trackId) music.playTrack(trackId);
    },
    [matchBGMForScene, music]
  );

  const playTypeSound = useCallback(() => {
    if (!effectiveConfig.typeSoundEnabled) return;
    typeSoundCharCount.current++;
    if (typeSoundCharCount.current % effectiveConfig.typeSoundInterval !== 0) return;
    if (!typeAudioRef.current) {
      typeAudioRef.current = new Audio();
      typeAudioRef.current.volume = effectiveConfig.typeSoundVolume;
    }
    typeAudioRef.current.currentTime = 0;
    typeAudioRef.current.play().catch(() => {});
  }, [effectiveConfig.typeSoundEnabled, effectiveConfig.typeSoundVolume, effectiveConfig.typeSoundInterval]);

  const playEndingSound = useCallback(
    (endingType: string) => {
      const soundMap: Record<string, string> = {
        good: 'sfx_ending_good',
        normal: 'sfx_ending_normal',
        bad: 'sfx_ending_bad',
        true: 'sfx_ending_true',
        secret: 'sfx_ending_secret',
      };
      const soundId = soundMap[endingType];
      if (soundId) music.playTrack(soundId);
    },
    [music]
  );

  const setVolume = useCallback(
    (vol: number) => {
      music.setVolume(vol);
      if (typeAudioRef.current) typeAudioRef.current.volume = effectiveConfig.typeSoundVolume;
    },
    [music, effectiveConfig.typeSoundVolume]
  );

  useEffect(() => {
    return () => {
      if (typeAudioRef.current) {
        typeAudioRef.current.pause();
        typeAudioRef.current = null;
      }
    };
  }, []);

  return {
    switchSceneBGM,
    playTypeSound,
    playEndingSound,
    setVolume,
    isPlaying: music.isPlaying,
    volume: music.volume,
    currentTrackId: music.currentTrackId,
  };
}
