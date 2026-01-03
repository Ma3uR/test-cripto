'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { PricePoint } from '@/types';

interface ChartProps {
  data: PricePoint[];
  onHover?: (point: PricePoint | null) => void;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ payload: PricePoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-[#868686]">{data.date}</p>
        <p className="text-sm font-medium">
          ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
}

export function Chart({ data, onHover }: ChartProps) {
  // Calculate min and max for better chart visualization
  const { minValue, maxValue } = useMemo(() => {
    if (data.length === 0) return { minValue: 0, maxValue: 100 };

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;

    return {
      minValue: min - padding,
      maxValue: max + padding,
    };
  }, [data]);

  const handleMouseMove = (state: unknown) => {
    const chartState = state as { activePayload?: Array<{ payload: PricePoint }> };
    if (chartState.activePayload && chartState.activePayload.length > 0) {
      onHover?.(chartState.activePayload[0].payload);
    }
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  if (data.length === 0) {
    return (
      <div className="h-[88px] flex items-center justify-center text-sm text-[#868686]">
        No data available
      </div>
    );
  }

  return (
    <div className="h-[88px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5100" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FF5100" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={[minValue, maxValue]} hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#FF5100', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FF5100"
            strokeWidth={2}
            fill="url(#colorValue)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
