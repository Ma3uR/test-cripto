export interface WalletBalance {
  usdc: string;
  usdcFormatted: string;
  usdValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  isProfit: boolean;
}

export interface EthBalance {
  eth: string;
  ethFormatted: string;
  usdValue: number;
}

export interface PortfolioValue {
  ethValue: number;      // Portfolio (Not USDC) - ETH holdings in USD
  totalValue: number;    // USDC + Portfolio
  ethBalance: string;    // Raw ETH balance
}

export interface PricePoint {
  timestamp: number;
  value: number;
  date: string;
}

export interface ProfitLoss {
  amount: number;
  isProfit: boolean;
  periodLabel: string;
}

export type TimePeriod = '1H' | '6H' | '1D' | '1W' | '1M' | 'All';

export interface ChartData {
  points: PricePoint[];
  profitLoss: ProfitLoss;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface WalletInfo {
  name: string;
  address: string;
  joinedDate: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface DepositTransaction {
  hash: string;
  from: string;
  amount: string;
  timestamp: number;
  confirmations: number;
  status: 'pending' | 'confirmed';
}
