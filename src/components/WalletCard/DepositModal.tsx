'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { getRecentDeposits } from '@/app/actions/etherscan';
import { DepositTransaction } from '@/types';

const USDC_CONTRACT = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onDeposit?: () => void;
}

function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function DepositModal({ isOpen, onClose, walletAddress, onDeposit }: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // EIP-681 payment link for USDC token transfer
  // Format: ethereum:<contract>@<chainId>/transfer?address=<recipient>
  const eip681Link = walletAddress
    ? `ethereum:${USDC_CONTRACT}@11155111/transfer?address=${walletAddress}`
    : '';

  // MetaMask deeplink (works better on mobile)
  // Opens MetaMask app directly with the address
  const metamaskDeeplink = walletAddress
    ? `https://metamask.app.link/send/${USDC_CONTRACT}@11155111/transfer?address=${walletAddress}`
    : '';

  const fetchDeposits = useCallback(async (showRefresh = false) => {
    if (!walletAddress) return;

    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const recentDeposits = await getRecentDeposits(walletAddress);
      setDeposits(recentDeposits);
      if (recentDeposits.length > 0 && showRefresh) {
        onDeposit?.();
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [walletAddress, onDeposit]);

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchDeposits();
    }
  }, [isOpen, walletAddress, fetchDeposits]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOpenEIP681 = () => {
    // Create a temporary anchor and click it - this properly triggers protocol handlers
    const link = document.createElement('a');
    link.href = eip681Link;
    link.click();
  };

  const handleOpenMetaMask = () => {
    window.open(metamaskDeeplink, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-lg p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Deposit USDC</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-[#868686]" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-sm text-[#868686]">
                  Send USDC to the following address on Sepolia testnet:
                </p>

                {/* QR Code */}
                {walletAddress && (
                  <div className="flex justify-center py-4">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg">
                      <QRCodeSVG
                        value={walletAddress}
                        size={160}
                        level="M"
                        includeMargin={false}
                        bgColor="#FFFFFF"
                        fgColor="#1A1A1A"
                      />
                    </div>
                  </div>
                )}

                {/* Address Display */}
                <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-4">
                  <p className="text-xs text-[#868686] mb-2">Wallet Address</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm break-all">
                      {walletAddress || 'No wallet configured'}
                    </code>
                    {walletAddress && (
                      <button
                        onClick={handleCopy}
                        className="flex-shrink-0 p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Copy address"
                      >
                        {copied ? (
                          <Check size={16} className="text-[#3CAB68]" />
                        ) : (
                          <Copy size={16} className="text-[#868686]" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment Link Buttons */}
                {walletAddress && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleOpenMetaMask}
                      className="flex-1"
                    >
                      <ExternalLink size={16} />
                      MetaMask
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleOpenEIP681}
                      className="flex-1"
                    >
                      <ExternalLink size={16} />
                      Other Wallet
                    </Button>
                  </div>
                )}
                <p className="text-xs text-[#868686] text-center">
                  Works best on mobile with wallet app installed
                </p>

                {/* Recent Deposits */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Recent Deposits</h3>
                    <button
                      onClick={() => fetchDeposits(true)}
                      disabled={isRefreshing}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw
                        size={14}
                        className={`text-[#868686] ${isRefreshing ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={20} className="animate-spin text-[#868686]" />
                    </div>
                  ) : deposits.length > 0 ? (
                    <div className="space-y-2">
                      {deposits.map((deposit) => (
                        <a
                          key={deposit.hash}
                          href={`https://sepolia.etherscan.io/tx/${deposit.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-[#F8F8F8] rounded-lg hover:bg-[#F0F0F0] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                deposit.status === 'confirmed'
                                  ? 'bg-[#3CAB68]'
                                  : 'bg-yellow-500 animate-pulse'
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium">
                                +{deposit.amount} USDC
                              </p>
                              <p className="text-xs text-[#868686]">
                                From {formatAddress(deposit.from)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#868686]">
                              {formatTimeAgo(deposit.timestamp)}
                            </p>
                            <p className="text-xs text-[#868686]">
                              {deposit.status === 'confirmed'
                                ? `${deposit.confirmations} conf.`
                                : 'Pending'}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-[#868686]">
                      No recent deposits
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-[#FEF3EE] border border-[#FF5100]/20 rounded-lg p-3">
                  <p className="text-xs text-[#FF5100]">
                    Only send USDC on Sepolia testnet. Sending other tokens or using wrong network may result in loss of funds.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
