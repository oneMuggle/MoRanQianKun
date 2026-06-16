/**
 * MobileGalgameView.tsx
 *
 * 移动端 Galgame 视图 — 针对触摸设备优化的全屏视觉小说体验。
 * 支持滑动交互、响应式布局、性能优化。
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SceneBackground } from '../SceneBackground';
import { CharacterSprite } from '../CharacterSprite';
import type { DialogueOption } from '../GalgameDialogueBox';
import type { ExpressionType } from '../../../../hooks/useNpcExpression';

// ── 类型 ──

export interface MobileGalgameCharacter {
  id: string;
  name: string;
  imageUrl?: string;
  expression?: ExpressionType;
  position: 'left' | 'right' | 'center';
}

export interface MobileGalgameViewProps {
  /** 场景背景 */
  backgroundImage?: string;
  /** 场景名称 */
  sceneName?: string;
  /** 时段 */
  timeOfDay?: '清晨' | '上午' | '下午' | '黄昏' | '夜晚' | '深夜';
  /** 当前说话角色 */
  speaker?: MobileGalgameCharacter;
  /** 场景中可见角色 */
  characters?: MobileGalgameCharacter[];
  /** 对话文本 */
  dialogueText?: string;
  /** 打字机速度 */
  typewriterSpeed?: number;
  /** 选项列表 */
  options?: DialogueOption[];
  /** 选择选项回调 */
  onOptionSelect?: (optionId: string) => void;
  /** 点击屏幕推进对话 */
  onClick?: () => void;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 自动播放间隔（毫秒） */
  autoPlayInterval?: number;
}

export const MobileGalgameView: React.FC<MobileGalgameViewProps> = ({
  backgroundImage,
  sceneName,
  timeOfDay = '上午',
  speaker,
  characters = [],
  dialogueText = '',
  typewriterSpeed = 50,
  options,
  onOptionSelect,
  onClick,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [isDialogExpanded, setIsDialogExpanded] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef(0);

  // ── 打字机效果 ──

  const startTyping = useCallback(() => {
    if (!dialogueText) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }
    setDisplayedText('');
    setTextIndex(0);
    setIsTyping(true);
  }, [dialogueText]);

  useEffect(() => {
    startTyping();
  }, [dialogueText, startTyping]);

  useEffect(() => {
    if (!isTyping || textIndex >= dialogueText.length) {
      if (textIndex >= dialogueText.length) {
        setIsTyping(false);
      }
      return;
    }

    typingTimerRef.current = setTimeout(() => {
      setTextIndex((prev) => prev + 1);
    }, typewriterSpeed);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [isTyping, textIndex, dialogueText, typewriterSpeed]);

  useEffect(() => {
    setDisplayedText(dialogueText.slice(0, textIndex));
  }, [textIndex, dialogueText]);

  // 点击跳过打字机
  const handleSkipTyping = useCallback(() => {
    if (isTyping) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setDisplayedText(dialogueText);
      setTextIndex(dialogueText.length);
      setIsTyping(false);
      return;
    }

    if (options && options.length > 0) {
      setShowOptions((prev) => !prev);
      return;
    }

    onClick?.();
  }, [isTyping, dialogueText, options, onClick]);

  // ── 自动播放 ──

  useEffect(() => {
    if (autoPlay && !isTyping && dialogueText) {
      autoPlayTimerRef.current = setTimeout(() => {
        onClick?.();
      }, autoPlayInterval);
    }
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [autoPlay, isTyping, dialogueText, autoPlayInterval, onClick]);

  // ── 触摸手势 ──

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      // 双击检测
      const now = Date.now();
      const isDoubleTap = now - lastTapRef.current < 300;
      lastTapRef.current = now;

      if (isDoubleTap && Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        setIsDialogExpanded((prev) => !prev);
        touchStartRef.current = null;
        return;
      }

      if (Math.abs(dx) < 30 && dy < -50) {
        setIsDialogExpanded((prev) => !prev);
      } else if (Math.abs(dx) < 30 && dy > 50) {
        setIsDialogExpanded(false);
      } else if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        handleSkipTyping();
      }

      touchStartRef.current = null;
    },
    [handleSkipTyping]
  );

  // ── 选项选择 ──

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      setShowOptions(false);
      onOptionSelect?.(optionId);
    },
    [onOptionSelect]
  );

  // ── 角色位置样式 ──

  const characterPositionStyle = useMemo(
    () =>
      ({
        left: { left: '5%', transform: 'scaleX(1)' },
        center: { left: '50%', transform: 'translateX(-50%)' },
        right: { right: '5%', transform: 'scaleX(-1)' },
      }) as Record<string, React.CSSProperties>,
    []
  );

  // ── 渲染 ──

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black select-none touch-manipulation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        touchStartRef.current = null;
      }}
    >
      {/* 背景 */}
      <SceneBackground
        imageUrl={backgroundImage}
        sceneName={sceneName}
        timeOfDay={timeOfDay}
      />

      {/* 角色立绘 */}
      {characters.map((char) => (
        <div
          key={char.id}
          className="absolute bottom-0 pointer-events-none"
          style={{
            ...characterPositionStyle[char.position],
            width: char.position === 'center' ? '60%' : '35%',
            maxWidth: '300px',
            transition: 'opacity 0.3s ease',
            opacity: speaker?.id === char.id ? 1 : 0.7,
          }}
        >
          <CharacterSprite
            name={char.name}
            imageUrl={char.imageUrl}
            expression={char.expression}
            position={char.position}
            isSpeaking={speaker?.id === char.id}
          />
        </div>
      ))}

      {/* 顶部：场景信息 */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-3 pt-2 pb-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/60 font-serif">
            {sceneName || '未知场景'} · {timeOfDay}
          </div>
          {speaker && (
            <div className="text-xs text-wuxia-gold font-serif font-bold">
              {speaker.name}
            </div>
          )}
        </div>
      </div>

      {/* 对话框 */}
      <div
        className={`absolute left-0 right-0 z-30 transition-all duration-300 ease-out ${
          isDialogExpanded ? 'bottom-0 top-16' : 'bottom-0'
        }`}
      >
        <div
          className={`bg-gradient-to-t from-black via-black/95 to-black/80 border-t border-wuxia-gold/20 ${
            isDialogExpanded ? 'h-full' : ''
          }`}
          onClick={handleSkipTyping}
        >
          {/* 对话内容区 */}
          <div className={`px-4 ${isDialogExpanded ? 'h-full flex flex-col' : 'py-4'}`}>
            {/* 说话者名称 */}
            {speaker && (
              <div className="mb-2">
                <span className="inline-block text-sm font-bold font-serif text-wuxia-gold px-3 py-0.5 rounded border border-wuxia-gold/30 bg-wuxia-gold/10">
                  {speaker.name}
                </span>
              </div>
            )}

            {/* 对话文本 */}
            <div
              className={`font-serif leading-relaxed text-sm text-gray-100 ${
                isDialogExpanded ? 'flex-1 overflow-y-auto pr-2' : 'line-clamp-4'
              }`}
            >
              {displayedText}
              {isTyping && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-wuxia-gold/60 animate-pulse align-middle" />
              )}
            </div>

            {/* 展开/收起提示 */}
            {!isDialogExpanded && dialogueText.length > 80 && (
              <div className="mt-2 text-[10px] text-gray-500 text-center">
                上滑展开 · 点击推进
              </div>
            )}

            {/* 全屏模式下的关闭按钮 */}
            {isDialogExpanded && (
              <button
                className="mt-4 self-center text-[10px] text-gray-500 hover:text-gray-300 border border-white/10 rounded-full px-4 py-1.5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogExpanded(false);
                }}
              >
                收起对话
              </button>
            )}
          </div>

          {/* 选项区域 */}
          {showOptions && options && options.length > 0 && (
            <div className="px-4 pb-6 space-y-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  className="w-full text-left px-4 py-3 rounded-lg border border-wuxia-gold/20 bg-wuxia-gold/5 text-gray-200 font-serif text-sm active:bg-wuxia-gold/20 active:border-wuxia-gold/40 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect(option.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-wuxia-gold/20 text-wuxia-gold text-xs flex items-center justify-center font-mono shrink-0">
                      {option.id}
                    </span>
                    <span>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部透明点击区域 */}
      {!isDialogExpanded && (
        <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="h-20 pointer-events-auto" onClick={handleSkipTyping} />
        </div>
      )}

      {/* 自动播放指示器 */}
      {autoPlay && (
        <div className="absolute top-10 right-3 z-30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-green-400/80 font-mono">AUTO</span>
        </div>
      )}
    </div>
  );
};

export default MobileGalgameView;
