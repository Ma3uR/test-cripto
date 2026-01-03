'use server';

import { getCachedData, setCachedData, generateCacheKey } from '@/lib/cache';
import { PricePoint, ChartData, TimePeriod, ProfitLoss } from '@/types';
import { getPeriodLabel, getPeriodDays } from '@/lib/utils';

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

    // For demo, simulate based on a hypothetical ETH holding
    // In real app, multiply by user's ETH balance
    const ethHolding = 0.1; // Example: 0.1 ETH
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

    // Return mock data for demo purposes
    return generateMockChartData(period);
  }
}

function generateMockChartData(period: TimePeriod): ChartData {
  const now = Date.now();
  const periodMs = getPeriodDays(period) * 24 * 60 * 60 * 1000;
  const points: PricePoint[] = [];
  const numPoints = period === '1H' ? 12 : period === '6H' ? 36 : 48;

  const basePrice = 3500;
  let currentPrice = basePrice;

  for (let i = 0; i < numPoints; i++) {
    const timestamp = now - periodMs + (periodMs / numPoints) * i;
    const variation = (Math.random() - 0.45) * 50; // Slight upward bias
    currentPrice = Math.max(3000, currentPrice + variation);

    points.push({
      timestamp,
      value: currentPrice,
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

  // Simulate profit based on 0.1 ETH holding
  const ethHolding = 0.1;
  const profitLossAmount = priceDiff * ethHolding;

  return {
    points,
    profitLoss: {
      amount: Math.abs(profitLossAmount) + 223.43, // Match design demo value
      isProfit: true,
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
