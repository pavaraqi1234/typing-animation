import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';
import { Button, ExportButton } from './Button';
import { TextArea, Input, Select, ColorPicker } from './Input';
import { useTypingAnimation } from '../hooks/useTypingAnimation';
import { useGIFExport } from '../hooks/useGIFExport';
import { useVideoExport } from '../hooks/useVideoExport';
import { cn } from '../utils/cn';

const fontOptions = [
  { value: 'monospace', label: 'Monospace' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
];

export function TypingAnimator() {
  const [text, setText] = useState('سلام! این یک انیمیشن تایپ است.');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('monospace');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cursorColor, setCursorColor] = useState('#000000');
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);

  const [isExportingGif, setIsExportingGif] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    displayedText,
    isComplete,
    isPlaying,
    play,
    pause,
    reset,
  } = useTypingAnimation({
    text,
    typingSpeed,
    autoStart: false,
  });

  const { exportAsGIF } = useGIFExport({
    text,
    fontSize,
    fontFamily,
    textColor,
    backgroundColor,
    cursorColor,
    typingSpeed,
    width,
    height,
  });

  const { exportAsVideo } = useVideoExport({
    text,
    fontSize,
    fontFamily,
    textColor,
    backgroundColor,
    cursorColor,
    typingSpeed,
    width,
    height,
  });

  const handleExportGif = useCallback(async () => {
    setIsExportingGif(true);
    try {
      const blob = await exportAsGIF();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'typing-animation.gif';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting GIF:', error);
    } finally {
      setIsExportingGif(false);
    }
  }, [exportAsGIF]);

  const handleExportVideo = useCallback(async () => {
    setIsExportingVideo(true);
    try {
      const blob = await exportAsVideo();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'typing-animation.webm';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting video:', error);
    } finally {
      setIsExportingVideo(false);
    }
  }, [exportAsVideo]);

  const renderPreview = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set font properties
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'top';

    // Word wrap logic
    const words = displayedText.split(' ');
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

    // Draw blinking cursor
    if (!isComplete) {
      const cursorX = ctx.measureText(line).width + 10;
      const cursorY = y;
      const cursorHeight = fontSize * 0.9;

      // Blink effect
      const blink = Math.floor(Date.now() / 500) % 2 === 0;
      if (blink) {
        ctx.fillStyle = cursorColor;
        ctx.fillRect(cursorX, cursorY, 2, cursorHeight);
      }
    }
  }, [displayedText, fontSize, fontFamily, textColor, backgroundColor, cursorColor, width, height, isComplete]);

  // Update preview on state changes
  React.useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            تایپینگ انیمیشن ساز پیشرفته
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            ایجاد انیمیشن‌های تایپ حرفه‌ای با قابلیت خروجی GIF و ویدئو
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 space-y-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              تنظیمات
            </h2>

            <TextArea
              label="متن:"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="متن خود را وارد کنید..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="اندازه فونت:"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min={12}
                max={72}
              />

              <Select
                label="فونت:"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                options={fontOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="سرعت تایپ (ms):"
                type="number"
                value={typingSpeed}
                onChange={(e) => setTypingSpeed(Number(e.target.value))}
                min={10}
                max={500}
              />

              <Input
                label="عرض (px):"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={400}
                max={1920}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ارتفاع (px):"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={200}
                max={1080}
              />
            </div>

            <div className="space-y-3">
              <ColorPicker
                label="رنگ متن:"
                value={textColor}
                onChange={setTextColor}
              />
              <ColorPicker
                label="رنگ پس‌زمینه:"
                value={backgroundColor}
                onChange={setBackgroundColor}
              />
              <ColorPicker
                label="رنگ نشانگر:"
                value={cursorColor}
                onChange={setCursorColor}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={isPlaying ? pause : play}
                icon={isPlaying ? <Pause size={18} /> : <Play size={18} />}
                variant="primary"
              >
                {isPlaying ? 'توقف' : 'پخش'}
              </Button>

              <Button
                onClick={reset}
                icon={<RotateCcw size={18} />}
                variant="secondary"
              >
                شروع مجدد
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t dark:border-gray-700">
              <ExportButton
                onClick={handleExportGif}
                loading={isExportingGif}
                type="gif"
              />
              <ExportButton
                onClick={handleExportVideo}
                loading={isExportingVideo}
                type="video"
              />
            </div>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              پیش‌نمایش
            </h2>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />

              <AnimatePresence>
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    تکمیل شد!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">وضعیت:</span>{' '}
                {isPlaying ? 'در حال پخش' : isComplete ? 'تکمیل شده' : 'متوقف'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">تعداد کاراکتر:</span> {text.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">مدت زمان تقریبی:</span>{' '}
                {Math.round((text.length * typingSpeed) / 1000)} ثانیه
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
