'use server';

import { getCachedData, setCachedData, generateCacheKey } from '@/lib/cache';
import { PricePoint, ChartData, TimePeriod, ProfitLoss } from '@/types';
import { getPeriodLabel, getPeriodDays } from '@/lib/utils';
import { getEthBalance } from './etherscan';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

interface CoinGeckoMarketChart {
  prices: [number, number][];
}

function getPeriodParams(period: TimePeriod): { days: string; interval?: string } {
  switch (period) {
    case '1H':
      return { days: '1' };
    case '6H':
      return { days: '1' };
    case '1D':
      return { days: '1' };
    case '1W':
      return { days: '7' };
    case '1M':
      return { days: '30' };
    case 'All':
      return { days: '365' };
    default:
      return { days: '1' };
  }
}

function filterDataByPeriod(prices: [number, number][], period: TimePeriod): [number, number][] {
  const now = Date.now();
  let cutoff: number;

  switch (period) {
    case '1H':
      cutoff = now - 60 * 60 * 1000; // 1 hour
      break;
    case '6H':
      cutoff = now - 6 * 60 * 60 * 1000; // 6 hours
      break;
    case '1D':
      cutoff = now - 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1W':
      cutoff = now - 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case '1M':
      cutoff = now - 30 * 24 * 60 * 60 * 1000; // 1 month
      break;
    case 'All':
    default:
      return prices;
  }

  return prices.filter(([timestamp]) => timestamp >= cutoff);
}

export async function getEthPriceHistory(
  period: TimePeriod,
  address: string
): Promise<ChartData> {
  const cacheKey = generateCacheKey('eth-history', period, address);
  const cached = getCachedData<ChartData>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const params = getPeriodParams(period);
    const url = `${COINGECKO_API_URL}/coins/ethereum/market_chart?vs_currency=usd&days=${params.days}`;

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoMarketChart = await response.json();
    const filteredPrices = filterDataByPeriod(data.prices, period);

    // Convert to our format
    const points: PricePoint[] = filteredPrices.map(([timestamp, price]) => ({
      timestamp,
      value: price,
      date: new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    // Calculate profit/loss based on first and last price
    const firstPrice = points[0]?.value || 0;
    const lastPrice = points[points.length - 1]?.value || 0;
    const priceDiff = lastPrice - firstPrice;

    // Get user's actual ETH balance for P/L calculation
    const ethBalanceData = await getEthBalance(address);
    const ethHolding = parseFloat(ethBalanceData.ethFormatted) || 0;
    const profitLossAmount = priceDiff * ethHolding;

    const profitLoss: ProfitLoss = {
      amount: Math.abs(profitLossAmount),
      isProfit: priceDiff >= 0,
      periodLabel: getPeriodLabel(period),
    };

    const chartData: ChartData = {
      points,
      profitLoss,
    };

    setCachedData(cacheKey, chartData);
    return chartData;
  } catch (error) {
    console.error('Error fetching price history:', error);

    // Return fallback data when API fails
    return generateFallbackChartData(period);
  }
}

function generateFallbackChartData(period: TimePeriod): ChartData {
  const now = Date.now();
  const periodMs = getPeriodDays(period) * 24 * 60 * 60 * 1000;
  const points: PricePoint[] = [];
  const numPoints = period === '1H' ? 12 : period === '6H' ? 36 : 48;

  const basePrice = 3500;
  // Use deterministic variation based on timestamp for consistent fallback
  for (let i = 0; i < numPoints; i++) {
    const timestamp = now - periodMs + (periodMs / numPoints) * i;
    const variation = Math.sin(i / 5) * 30 + Math.cos(i / 3) * 20;

    points.push({
      timestamp,
      value: basePrice + variation,
      date: new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }

  const firstPrice = points[0]?.value || basePrice;
  const lastPrice = points[points.length - 1]?.value || basePrice;
  const priceDiff = lastPrice - firstPrice;

  return {
    points,
    profitLoss: {
      amount: Math.abs(priceDiff * 0.01), // Small fallback value
      isProfit: priceDiff >= 0,
      periodLabel: getPeriodLabel(period),
    },
  };
}

export async function getCurrentEthPrice(): Promise<number> {
  const cacheKey = generateCacheKey('eth-current-price');
  const cached = getCachedData<number>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=ethereum&vs_currencies=usd`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data.ethereum?.usd || 3500;

    setCachedData(cacheKey, price);
    return price;
  } catch (error) {
    console.error('Error fetching current ETH price:', error);
    return 3500; // Fallback price
  }
}
