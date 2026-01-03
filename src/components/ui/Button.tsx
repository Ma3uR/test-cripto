'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  icon,
  className,
  type = 'button',
}: ButtonProps) {
  const baseStyles =
    'flex items-center justify-center gap-2 h-[44px] px-3 py-[7px] rounded-lg font-medium text-sm tracking-[-0.28px] transition-colors';

  const variants = {
    primary: 'bg-[#FF5100] text-white hover:bg-[#e64900]',
    secondary:
      'bg-[#F8F8F8] border border-[#E1E1E1] text-black hover:bg-[#f0f0f0]',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.02,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }
      }
      whileTap={disabled ? {} : { scale: 0.98 }}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
