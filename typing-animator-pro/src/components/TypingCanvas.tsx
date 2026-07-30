import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';
import type { TypingAnimationProps } from '../types';

export const TypingCanvas = forwardRef<HTMLCanvasElement, TypingAnimationProps>(
  function TypingCanvas(
    {
      text,
      fontSize = 24,
      fontFamily = 'monospace',
      textColor = '#000000',
      backgroundColor = '#ffffff',
      cursorColor = '#000000',
      width = 800,
      height = 400,
      className,
    },
    ref
  ) {
    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        className={cn('rounded-lg shadow-lg', className)}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    );
  }
);
