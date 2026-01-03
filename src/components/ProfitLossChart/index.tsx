'use client';

import { useState, useTransition, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Web Components
const NumberFlow = dynamic(
  () => import('@number-flow/react').then((mod) => mod.default),
  { ssr: false }
);

import { continuous } from '@number-flow/react';
import { Card } from '@/components/ui/Card';
import { ArrowUpIcon, ArrowDownIcon, RefreshIcon, EthLogo } from '@/components/ui/Icons';
import { TimeTabs } from './TimeTabs';
import { Chart } from './Chart';
import { ChartData, TimePeriod, PricePoint } from '@/types';
import { getEthPriceHistory } from '@/app/actions/coingecko';
import { motion } from 'motion/react';

interface ProfitLossChartProps {
  initialData: ChartData;
  initialPeriod: TimePeriod;
  walletAddress: string;
}

export function ProfitLossChart({
  initialData,
  initialPeriod,
  walletAddress,
}: ProfitLossChartProps) {
  const [data, setData] = useState(initialData);
  const [period, setPeriod] = useState(initialPeriod);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // When hovering: show ETH price at that point
  // When not hovering: show P&L amount
  const isHovering = hoveredValue !== null;
  const displayValue = isHovering ? hoveredValue : data.profitLoss.amount;
  const displayDate = hoveredDate || data.profitLoss.periodLabel;
  const displayPrefix = isHovering ? '$' : (data.profitLoss.isProfit ? '+$' : '-$');

  const handlePeriodChange = useCallback(
    (newPeriod: TimePeriod) => {
      if (newPeriod === period || isPending) return;

      setPeriod(newPeriod);
      startTransition(async () => {
        try {
          const newData = await getEthPriceHistory(newPeriod, walletAddress);
          setData(newData);
        } catch (error) {
          console.error('Error fetching chart data:', error);
        }
      });
    },
    [period, isPending, walletAddress]
  );

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      try {
        const newData = await getEthPriceHistory(period, walletAddress);
        setData(newData);
      } catch (error) {
        console.error('Error refreshing chart data:', error);
      }
    });
  }, [period, walletAddress]);

  const handleChartHover = useCallback((point: PricePoint | null) => {
    if (point) {
      // Show the ETH price at this point
      setHoveredValue(point.value);
      setHoveredDate(point.date);
    } else {
      setHoveredValue(null);
      setHoveredDate(null);
    }
  }, []);

  return (
    <Card className="flex-1 gap-[5px] min-h-[235px] w-full lg:min-w-[400px]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-[5px]">
            <span className={data.profitLoss.isProfit ? 'text-[#3CAB68]' : 'text-[#EF4444]'}>
              {data.profitLoss.isProfit ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </span>
            <span className="text-sm text-[#868686] tracking-[-0.28px]">
              Profit/Loss
            </span>
          </div>
          <motion.button
            onClick={handleRefresh}
            disabled={isPending}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshIcon className={isPending ? 'animate-spin' : ''} />
          </motion.button>
        </div>

        {/* Time Tabs */}
        <TimeTabs
          selected={period}
          onSelect={handlePeriodChange}
          disabled={isPending}
        />
      </div>

      {/* Value Display */}
      <div className="flex items-center justify-between gap-[5px]">
        <div className="flex-1 flex flex-col gap-1">
          {/* Main Value */}
          <div className="text-[28px] sm:text-[40px] font-normal tracking-[-0.8px]">
            <motion.span
              className={!isHovering && !data.profitLoss.isProfit ? 'text-[#EF4444]' : ''}
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {displayPrefix}
              <NumberFlow
                value={displayValue}
                format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                animated={true}
                respectMotionPreference={false}
                plugins={[continuous]}
                spinTiming={{ duration: 600, easing: 'ease-out' }}
                transformTiming={{ duration: 600, easing: 'ease-out' }}
              />
            </motion.span>
          </div>

          {/* Period Label / Date on hover */}
          <motion.div
            className="text-sm font-medium text-[#868686] tracking-[-0.28px]"
            key={displayDate}
            initial={{ opacity: 0.5, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {displayDate}
          </motion.div>
        </div>

        {/* ETH Logo */}
        <EthLogo />
      </div>

      {/* Chart */}
      <div className={isPending ? 'opacity-50 transition-opacity' : ''}>
        <Chart data={data.points} onHover={handleChartHover} />
      </div>
    </Card>
  );
}
