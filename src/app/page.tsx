import Image from 'next/image';
import { WalletCard } from '@/components/WalletCard';
import { ProfitLossChart } from '@/components/ProfitLossChart';
import { getUsdcBalance, getPortfolioValue } from '@/app/actions/etherscan';
import { getEthPriceHistory } from '@/app/actions/coingecko';
import { getWalletInfo } from '@/app/actions/wallet';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

export default async function Home() {
  const walletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS;

  if (!walletAddress) {
    throw new Error('NEXT_PUBLIC_WALLET_ADDRESS is not configured');
  }

  const [walletBalance, portfolio, walletInfo, chartData] = await Promise.all([
    getUsdcBalance(walletAddress),
    getPortfolioValue(walletAddress),
    getWalletInfo(),
    getEthPriceHistory('6H', walletAddress),
  ]);

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
