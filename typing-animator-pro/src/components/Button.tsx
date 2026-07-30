import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Download, Film, Video } from 'lucide-react';
import { cn } from '../utils/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = 'primary',
      icon,
      loading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      outline:
        'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {!loading && icon}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);

interface ExportButtonProps {
  onClick: () => void;
  loading?: boolean;
  type: 'gif' | 'video';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  loading,
  type,
}) => {
  const isGif = type === 'gif';

  return (
    <Button
      variant="outline"
      onClick={onClick}
      loading={loading}
      icon={isGif ? <Film size={18} /> : <Video size={18} />}
      className="w-full sm:w-auto"
    >
      {isGif ? 'خروجی GIF' : 'خروجی ویدئو'}
    </Button>
  );
};
