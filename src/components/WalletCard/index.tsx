'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Web Components
const NumberFlow = dynamic(
  () => import('@number-flow/react').then((mod) => mod.default),
  { ssr: false }
);

// Import continuous separately
import { continuous } from '@number-flow/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  DepositIcon,
  WithdrawIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  WalletIcon,
  UsdcIcon,
} from '@/components/ui/Icons';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { WalletBalance, PortfolioValue, WalletInfo } from '@/types';
import { fetchWalletBalances } from '@/app/actions/wallet';

interface WalletCardProps {
  initialBalance: WalletBalance;
  initialPortfolio: PortfolioValue;
  walletInfo: WalletInfo;
}

export function WalletCard({
  initialBalance,
  initialPortfolio,
  walletInfo,
}: WalletCardProps) {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Keep balance in state so NumberFlow can animate changes
  const [balance, setBalance] = useState(initialBalance);
  const [portfolio, setPortfolio] = useState(initialPortfolio);

  const handleRefresh = useCallback(async () => {
    try {
      // Fetch fresh data and update state - this triggers NumberFlow animation
      const { balance: newBalance, portfolio: newPortfolio } = await fetchWalletBalances();
      setBalance(newBalance);
      setPortfolio(newPortfolio);
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    }
  }, []);

  const handleWithdrawSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleDepositDetected = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <>
      <Card className="flex-1 gap-[19px] w-full lg:min-w-[400px]">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Wallet Info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative w-10 h-10 shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#FF5100]/60 flex items-center justify-center">
                <WalletIcon />
              </div>
            </div>

            {/* Name & Date */}
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-medium tracking-[-0.32px]">
                {walletInfo.name}
              </span>
              <span className="text-xs text-[#868686] tracking-[-0.24px]">
                {walletInfo.joinedDate}
              </span>
            </div>
          </div>

          {/* Portfolio Stats */}
          <div className="flex items-center gap-4 sm:gap-7">
            {/* Portfolio (Not USDC) */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-[#868686] tracking-[-0.24px] whitespace-nowrap">
                Portfolio (Not USDC)
              </span>
              <span className="text-sm sm:text-base font-medium tracking-[-0.32px]">
                $<NumberFlow
                  value={portfolio.ethValue}
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  animated={true}
                  respectMotionPreference={false}
                  plugins={[continuous]}
                  spinTiming={{ duration: 500, easing: 'ease-out' }}
                />
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-[#E5E5E5]" />

            {/* USDC + Portfolio */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-[#868686] tracking-[-0.24px] whitespace-nowrap">
                USDC + Portfolio
              </span>
              <div className="flex items-center gap-1.5">
                <UsdcIcon />
                <span className="text-sm sm:text-base font-medium tracking-[-0.32px]">
                  $<NumberFlow
                    value={portfolio.totalValue}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                    animated={true}
                    respectMotionPreference={false}
                    plugins={[continuous]}
                    spinTiming={{ duration: 500, easing: 'ease-out' }}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="flex flex-col gap-1">
          {/* Main Balance */}
          <div className="text-[28px] sm:text-[40px] font-normal tracking-[-0.8px]">
            <NumberFlow
              value={balance.usdValue}
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
              animated={true}
              respectMotionPreference={false}
              plugins={[continuous]}
              spinTiming={{ duration: 750, easing: 'ease-out' }}
              transformTiming={{ duration: 750, easing: 'ease-out' }}
            />
            {' USDC'}
          </div>

          {/* Daily Change */}
          <div className="flex flex-wrap items-center gap-1">
            <span
              className={`text-sm font-medium tracking-[-0.28px] ${
                balance.isProfit ? 'text-[#3CAB68]' : 'text-[#EF4444]'
              }`}
            >
              {balance.isProfit ? '+' : '-'}$
              <NumberFlow
                value={Math.abs(balance.dailyChange)}
                format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                animated={true}
                respectMotionPreference={false}
                plugins={[continuous]}
                spinTiming={{ duration: 500, easing: 'ease-out' }}
              />
            </span>

            <div className="flex items-center gap-0.5">
              <span className={balance.isProfit ? 'text-[#3CAB68]' : 'text-[#EF4444]'}>
                {balance.isProfit ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </span>
              <span
                className={`text-sm font-medium tracking-[-0.28px] ${
                  balance.isProfit ? 'text-[#3CAB68]' : 'text-[#EF4444]'
                }`}
              >
                <NumberFlow
                  value={balance.dailyChangePercent}
                  format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                  animated={true}
                  respectMotionPreference={false}
                  plugins={[continuous]}
                  spinTiming={{ duration: 500, easing: 'ease-out' }}
                />%
              </span>
            </div>

            <span className="text-sm font-medium text-[#868686] tracking-[-0.28px]">
              Today
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={<DepositIcon />}
            onClick={() => setIsDepositOpen(true)}
            className="flex-1"
          >
            Deposit
          </Button>
          <Button
            variant="secondary"
            icon={<WithdrawIcon />}
            onClick={() => setIsWithdrawOpen(true)}
            className="flex-1"
          >
            Withdraw
          </Button>
        </div>
      </Card>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        walletAddress={walletInfo.address}
        onDeposit={handleDepositDetected}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        maxAmount={balance.usdcFormatted}
        onSuccess={handleWithdrawSuccess}
      />
    </>
  );
}
