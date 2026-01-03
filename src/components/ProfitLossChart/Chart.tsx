'use client';

import { useMemo, useRef, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PricePoint } from '@/types';

interface ChartProps {
  data: PricePoint[];
  onHover?: (point: PricePoint | null) => void;
}

export function Chart({ data, onHover }: ChartProps) {
  const lastPointRef = useRef<PricePoint | null>(null);

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

  // Format timestamp for X-axis labels
  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Get evenly spaced ticks for X-axis
  const xAxisTicks = useMemo(() => {
    if (data.length < 2) return [];
    const tickCount = 5;
    const step = Math.floor((data.length - 1) / (tickCount - 1));
    return Array.from({ length: tickCount }, (_, i) => {
      const index = Math.min(i * step, data.length - 1);
      return data[index].timestamp;
    });
  }, [data]);

  const handleMouseLeave = useCallback(() => {
    lastPointRef.current = null;
    onHover?.(null);
  }, [onHover]);

  // Render tooltip and trigger callback
  const renderTooltip = useCallback(
    (props: { active?: boolean; payload?: ReadonlyArray<{ payload: PricePoint }> }) => {
      if (props.active && props.payload && props.payload.length > 0) {
        const point = props.payload[0].payload;
        // Only call onHover if point changed
        if (lastPointRef.current?.timestamp !== point.timestamp) {
          lastPointRef.current = point;
          onHover?.(point);
        }
      }
      return null;
    },
    [onHover]
  );

  if (data.length === 0) {
    return (
      <div className="h-[80px] flex items-center justify-center text-sm text-[#868686]">
        No data available
      </div>
    );
  }

  return (
    <div className="h-[80px] w-full" onMouseLeave={handleMouseLeave}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5100" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FF5100" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#868686' }}
            tickFormatter={formatXAxisLabel}
            ticks={xAxisTicks}
            interval="preserveStartEnd"
          />
          <YAxis domain={[minValue, maxValue]} hide />
          <Tooltip
            content={renderTooltip}
            cursor={{ stroke: '#FF5100', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FF5100"
            strokeWidth={2}
            fill="url(#colorValue)"
            animationDuration={500}
            activeDot={{
              r: 6,
              fill: '#FF5100',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
