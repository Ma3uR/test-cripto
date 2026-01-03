import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatUSDC(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return formatNumber(num, 2).replace('.', ',');
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    '1H': 'Past Hour',
    '6H': 'Past 6 Hours',
    '1D': 'Past Day',
    '1W': 'Past Week',
    '1M': 'Past Month',
    'All': 'All Time',
  };
  return labels[period] || 'Past Day';
}

export function getPeriodDays(period: string): number {
  const days: Record<string, number> = {
    '1H': 1,
    '6H': 1,
    '1D': 1,
    '1W': 7,
    '1M': 30,
    'All': 365,
  };
  return days[period] || 1;
}
