import { useRef, useCallback } from 'react';
import GIF from 'gif.js';

interface UseGIFExportProps {
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  cursorColor: string;
  typingSpeed: number;
  width: number;
  height: number;
}

export function useGIFExport({
  text,
  fontSize,
  fontFamily,
  textColor,
  backgroundColor,
  cursorColor,
  typingSpeed,
  width,
  height,
}: UseGIFExportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isExporting = useRef(false);

  const renderFrame = useCallback(
    (ctx: CanvasRenderingContext2D, frameIndex: number) => {
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Set font properties
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';

      // Get text to display for this frame
      const displayText = text.substring(0, frameIndex);
      
      // Word wrap logic
      const words = displayText.split(' ');
      let line = '';
      let y = 10;
      const lineHeight = fontSize * 1.4;
      const maxWidth = width - 20;

      for (let n = 0; n < words.length; n++) {
        const testLine = `${line}${words[n]} `;
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, 10, y);
          line = `${words[n]} `;
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 10, y);

      // Draw cursor
      const cursorX = ctx.measureText(line).width + 10;
      const cursorY = y;
      const cursorHeight = fontSize * 0.9;
      
      // Blink cursor every other frame
      if (frameIndex % 2 === 0) {
        ctx.fillStyle = cursorColor;
        ctx.fillRect(cursorX, cursorY, 2, cursorHeight);
      }
    },
    [text, fontSize, fontFamily, textColor, backgroundColor, cursorColor, width, height]
  );

  const exportAsGIF = useCallback(async (): Promise<Blob | null> => {
    if (isExporting.current || !canvasRef.current) {
      return null;
    }

    isExporting.current = true;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Calculate total frames needed
      const framesPerChar = Math.max(1, Math.floor(typingSpeed / 50));
      const totalFrames = text.length * framesPerChar + 10; // Extra frames for complete text

      // Create GIF with web worker
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: width,
        height: height,
        workerScript: '/gif.worker.js',
      });

      // Render all frames
      for (let frame = 0; frame <= totalFrames; frame++) {
        const charIndex = Math.min(Math.floor(frame / framesPerChar), text.length);
        renderFrame(ctx, charIndex);
        gif.addFrame(canvas, { copy: true, delay: 50 });
      }

      // Generate GIF
      return new Promise<Blob | null>((resolve) => {
        gif.on('finished', (blob) => {
          isExporting.current = false;
          resolve(blob);
        });
        
        gif.render();
      });
    } catch (error) {
      console.error('Error exporting GIF:', error);
      isExporting.current = false;
      return null;
    }
  }, [text, typingSpeed, width, height, renderFrame]);

  return {
    canvasRef,
    exportAsGIF,
    isExporting: isExporting.current,
  };
}
