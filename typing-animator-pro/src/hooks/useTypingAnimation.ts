import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnimationState } from '../types';

interface UseTypingAnimationProps {
  text: string;
  typingSpeed?: number;
  autoStart?: boolean;
  onTypingComplete?: () => void;
}

export function useTypingAnimation({
  text,
  typingSpeed = 100,
  autoStart = false,
  onTypingComplete,
}: UseTypingAnimationProps) {
  const [state, setState] = useState<AnimationState>({
    isPlaying: autoStart,
    isComplete: false,
    currentIndex: 0,
    displayedText: '',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setState({
      isPlaying: false,
      isComplete: false,
      currentIndex: 0,
      displayedText: '',
    });
  }, []);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  useEffect(() => {
    if (!state.isPlaying || state.isComplete) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.currentIndex >= text.length) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          onTypingComplete?.();
          return {
            ...prev,
            isPlaying: false,
            isComplete: true,
          };
        }

        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
          displayedText: text.substring(0, prev.currentIndex + 1),
        };
      });
    }, typingSpeed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [text, typingSpeed, state.isPlaying, state.isComplete, onTypingComplete]);

  useEffect(() => {
    if (autoStart && !state.isPlaying && !state.isComplete) {
      play();
    }
  }, [autoStart, state.isPlaying, state.isComplete, play]);

  return {
    ...state,
    play,
    pause,
    reset,
  };
}
