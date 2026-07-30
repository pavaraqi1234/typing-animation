export interface TypingAnimationProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  cursorColor?: string;
  typingSpeed?: number;
  width?: number;
  height?: number;
  className?: string;
  onTypingComplete?: () => void;
}

export interface ExportOptions {
  format: 'gif' | 'webm' | 'mp4';
  quality?: number;
  fps?: number;
}

export interface AnimationState {
  isPlaying: boolean;
  isComplete: boolean;
  currentIndex: number;
  displayedText: string;
}
