import Image from 'next/image';
import { WalletCard } from '@/components/WalletCard';
import { ProfitLossChart } from '@/components/ProfitLossChart';
import { getUsdcBalance, getPortfolioValue } from '@/app/actions/etherscan';
import { getEthPriceHistory } from '@/app/actions/coingecko';
import { getWalletInfo } from '@/app/actions/wallet';
import { WalletBalance, PortfolioValue, ChartData, WalletInfo } from '@/types';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

// Demo data for when no wallet is configured
const demoWalletBalance: WalletBalance = {
  usdc: '984420000',
  usdcFormatted: '984.42',
  usdValue: 984.42,
  dailyChange: 23.43,
  dailyChangePercent: 5.2,
  isProfit: true,
};

const demoPortfolio: PortfolioValue = {
  ethValue: 3361.42,
  totalValue: 0.01,
  ethBalance: '0.96',
};

const demoWalletInfo: WalletInfo = {
  name: 'My Wallet',
  address: '',
  joinedDate: 'Joined Nov 2025',
};

// Generate demo chart data outside component to avoid impure function calls during render
function generateDemoChartData(): ChartData {
  const baseTimestamp = 1704067200000; // Fixed timestamp for demo
  const points = Array.from({ length: 36 }, (_, i) => {
    const timestamp = baseTimestamp + i * 10 * 60 * 1000; // 10 min intervals
    const baseValue = 3500;
    // Use deterministic variation based on index
    const variation = Math.sin(i / 5) * 50 + (i % 7) * 5;
    return {
      timestamp,
      value: baseValue + variation,
      date: `Jan ${Math.floor(i / 6) + 1}, ${String(10 + (i % 6)).padStart(2, '0')}:00 AM`,
    };
  });

  return {
    points,
    profitLoss: {
      amount: 223.43,
      isProfit: true,
      periodLabel: 'Past Day',
    },
  };
}

export default async function Home() {
  const walletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS || '';

  let walletBalance: WalletBalance;
  let portfolio: PortfolioValue;
  let walletInfo: WalletInfo;
  let chartData: ChartData;

  if (walletAddress) {
    // Fetch real data
    [walletBalance, portfolio, walletInfo, chartData] = await Promise.all([
      getUsdcBalance(walletAddress),
      getPortfolioValue(walletAddress),
      getWalletInfo(),
      getEthPriceHistory('6H', walletAddress),
    ]);
  } else {
    // Use demo data
    walletBalance = demoWalletBalance;
    portfolio = demoPortfolio;
    walletInfo = demoWalletInfo;
    chartData = generateDemoChartData();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 gap-6">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch max-w-[1200px] w-full">
        <WalletCard
          initialBalance={walletBalance}
          initialPortfolio={portfolio}
          walletInfo={walletInfo}
        />
        <ProfitLossChart
          initialData={chartData}
          initialPeriod="6H"
          walletAddress={walletAddress}
        />
      </div>

      {/* CoinGecko Attribution */}
      <a
        href="https://www.coingecko.com/en/api"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <span className="text-sm text-white/80">Data powered by</span>
        <Image
          src="/CGAPI-Lockup.svg"
          alt="CoinGecko API"
          width={120}
          height={20}
          className="h-5 w-auto"
        />
      </a>
    </main>
  );
}
