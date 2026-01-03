'use server';

import { ethers } from 'ethers';
import { TransactionResult, WalletInfo, WalletBalance, PortfolioValue } from '@/types';
import { getFirstTransactionDate, getUsdcBalance, getPortfolioValue } from './etherscan';
import { invalidateCache } from '@/lib/cache';

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';
const USDC_CONTRACT = process.env.USDC_CONTRACT_ADDRESS || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// ERC20 ABI for transfer function
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
}

function getWallet(): ethers.Wallet {
  if (!WALLET_PRIVATE_KEY) {
    throw new Error('Wallet private key not configured');
  }

  const provider = getProvider();
  return new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
}

export async function getWalletInfo(): Promise<WalletInfo> {
  const address = process.env.NEXT_PUBLIC_WALLET_ADDRESS || '';

  if (!address) {
    return {
      name: 'My Wallet',
      address: '',
      joinedDate: 'Nov 2025',
    };
  }

  const joinedDate = await getFirstTransactionDate(address);

  return {
    name: 'My Wallet',
    address,
    joinedDate: `Joined ${joinedDate}`,
  };
}

export async function sendUsdc(
  toAddress: string,
  amount: string
): Promise<TransactionResult> {
  try {
    // Validate inputs
    if (!ethers.isAddress(toAddress)) {
      return {
        success: false,
        error: 'Invalid recipient address',
      };
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        error: 'Invalid amount',
      };
    }

    const wallet = getWallet();
    const usdcContract = new ethers.Contract(USDC_CONTRACT, ERC20_ABI, wallet);

    // USDC has 6 decimals
    const amountInWei = ethers.parseUnits(amount, 6);

    // Check balance
    const balance = await usdcContract.balanceOf(wallet.address);
    if (balance < amountInWei) {
      return {
        success: false,
        error: 'Insufficient USDC balance',
      };
    }

    // Send transaction
    const tx = await usdcContract.transfer(toAddress, amountInWei);
    const receipt = await tx.wait();

    // Invalidate cache after successful transaction
    invalidateCache(wallet.address);

    return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error('Error sending USDC:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

export async function getGasEstimate(
  toAddress: string,
  amount: string
): Promise<{ gasEstimate: string; gasCostUsd: number } | null> {
  try {
    if (!ethers.isAddress(toAddress)) {
      return null;
    }

    const wallet = getWallet();
    const provider = getProvider();
    const usdcContract = new ethers.Contract(USDC_CONTRACT, ERC20_ABI, wallet);

    const amountInWei = ethers.parseUnits(amount || '0', 6);

    // Estimate gas
    const gasEstimate = await usdcContract.transfer.estimateGas(
      toAddress,
      amountInWei
    );

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

    // Calculate cost in ETH
    const gasCostWei = gasEstimate * gasPrice;
    const gasCostEth = parseFloat(ethers.formatEther(gasCostWei));

    // Convert to USD (approximate)
    const ethPriceUsd = 3500; // Should fetch from API
    const gasCostUsd = gasCostEth * ethPriceUsd;

    return {
      gasEstimate: gasEstimate.toString(),
      gasCostUsd,
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    return null;
  }
}

export async function validateAddress(address: string): Promise<boolean> {
  return ethers.isAddress(address);
}

export async function refreshWalletData(): Promise<void> {
  const address = process.env.NEXT_PUBLIC_WALLET_ADDRESS || '';
  if (address) {
    // Clear all cache entries for this wallet
    invalidateCache(address);
  }
}

export async function fetchWalletBalances(): Promise<{
  balance: WalletBalance;
  portfolio: PortfolioValue;
}> {
  const address = process.env.NEXT_PUBLIC_WALLET_ADDRESS || '';

  if (!address) {
    throw new Error('No wallet address configured');
  }

  // Clear cache first to get fresh data
  invalidateCache(address);

  // Fetch fresh data
  const [balance, portfolio] = await Promise.all([
    getUsdcBalance(address),
    getPortfolioValue(address),
  ]);

  return { balance, portfolio };
}
