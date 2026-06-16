/**
 * useTypewriter.ts
 *
 * 逐字显示 hook，支持中文按字符（非按字节）显示。
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  /** 每个字符的显示间隔（毫秒），默认 50ms */
  speed?: number;
  /** 是否在文本显示完成后自动暂停，默认 false */
  pauseOnComplete?: boolean;
}

interface UseTypewriterReturn {
  /** 当前已显示的文本 */
  displayedText: string;
  /** 是否正在逐字显示中 */
  isTyping: boolean;
  /** 是否已显示完整文本 */
  isComplete: boolean;
  /** 跳过到完整显示 */
  skip: () => void;
  /** 暂停逐字显示 */
  pause: () => void;
  /** 恢复逐字显示 */
  resume: () => void;
}

export function useTypewriter(
  text: string,
  { speed = 50, pauseOnComplete = false }: UseTypewriterOptions = {},
): UseTypewriterReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paused, setPaused] = useState(false);

  const textRef = useRef(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  // 当 text 变化时重置状态
  useEffect(() => {
    textRef.current = text;
    indexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);
    setIsComplete(false);
    setPaused(false);
  }, [text]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const fullText = textRef.current;
    const chars = [...fullText];

    if (indexRef.current >= chars.length) {
      setIsTyping(false);
      setIsComplete(true);
      clearTimer();
      return;
    }

    if (paused) {
      timerRef.current = setTimeout(tick, speed);
      return;
    }

    indexRef.current += 1;
    const nextText = chars.slice(0, indexRef.current).join('');
    setDisplayedText(nextText);

    if (indexRef.current >= chars.length) {
      setIsTyping(false);
      setIsComplete(true);
      clearTimer();
      if (pauseOnComplete) {
        setPaused(true);
      }
    } else {
      timerRef.current = setTimeout(tick, speed);
    }
  }, [speed, paused, pauseOnComplete, clearTimer]);

  useEffect(() => {
    if (isTyping) {
      timerRef.current = setTimeout(tick, speed);
    }
    return clearTimer;
  }, [isTyping, tick, speed, clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    setDisplayedText(textRef.current);
    setIsTyping(false);
    setIsComplete(true);
  }, [clearTimer]);

  const pause = useCallback(() => {
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    setPaused(false);
  }, []);

  return {
    displayedText,
    isTyping,
    isComplete,
    skip,
    pause,
    resume,
  };
}
