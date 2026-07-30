import { useRef, useCallback } from 'react';

interface UseVideoExportProps {
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

export function useVideoExport({
  text,
  fontSize,
  fontFamily,
  textColor,
  backgroundColor,
  cursorColor,
  typingSpeed,
  width,
  height,
}: UseVideoExportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRecording = useRef(false);

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

      // Draw cursor with blink effect
      const cursorX = ctx.measureText(line).width + 10;
      const cursorY = y;
      const cursorHeight = fontSize * 0.9;
      
      ctx.fillStyle = cursorColor;
      ctx.fillRect(cursorX, cursorY, 2, cursorHeight);
    },
    [text, fontSize, fontFamily, textColor, backgroundColor, cursorColor, width, height]
  );

  const exportAsVideo = useCallback(async (): Promise<Blob | null> => {
    if (isRecording.current || !canvasRef.current) {
      return null;
    }

    isRecording.current = true;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Calculate animation duration and FPS
      const fps = 30;
      const totalDuration = text.length * typingSpeed + 1000; // ms
      const totalFrames = Math.floor((totalDuration / 1000) * fps);
      const framesPerChar = Math.max(1, Math.floor(typingSpeed * fps / 1000));

      // Create MediaRecorder
      const stream = canvas.captureStream(fps);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Start recording
      return new Promise<Blob | null>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          isRecording.current = false;
          resolve(blob);
        };

        mediaRecorder.start();

        // Animate and record frames
        let currentFrame = 0;
        
        const animate = () => {
          if (currentFrame >= totalFrames) {
            // Hold on final frame for a bit
            setTimeout(() => {
              mediaRecorder.stop();
            }, 500);
            return;
          }

          const charIndex = Math.min(Math.floor(currentFrame / framesPerChar), text.length);
          renderFrame(ctx, charIndex);
          
          currentFrame++;
          requestAnimationFrame(animate);
        };

        animate();
      });
    } catch (error) {
      console.error('Error exporting video:', error);
      isRecording.current = false;
      return null;
    }
  }, [text, typingSpeed, renderFrame]);

  return {
    canvasRef,
    exportAsVideo,
    isRecording: isRecording.current,
  };
}
