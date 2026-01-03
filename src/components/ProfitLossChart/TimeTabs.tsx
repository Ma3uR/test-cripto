'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { TimePeriod } from '@/types';

interface TimeTabsProps {
  selected: TimePeriod;
  onSelect: (period: TimePeriod) => void;
  disabled?: boolean;
}

const periods: TimePeriod[] = ['1H', '6H', '1D', '1W', '1M', 'All'];

export function TimeTabs({ selected, onSelect, disabled }: TimeTabsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-[5px] overflow-x-auto">
      {periods.map((period) => {
        const isSelected = selected === period;

        return (
          <motion.button
            key={period}
            onClick={() => !disabled && onSelect(period)}
            disabled={disabled}
            className={cn(
              'h-6 px-2 sm:px-3 rounded-[70px] text-xs tracking-[-0.24px] transition-colors shrink-0',
              isSelected
                ? 'bg-[#FF5100]/10 text-[#FF5100]'
                : 'text-[#868686] hover:bg-gray-100',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            whileHover={!disabled && !isSelected ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            {period}
          </motion.button>
        );
      })}
    </div>
  );
}
