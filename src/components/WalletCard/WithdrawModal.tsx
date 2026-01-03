'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Copy, Check } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { sendUsdc, validateAddress } from '@/app/actions/wallet';

const USDC_CONTRACT = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: string;
  onSuccess?: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  maxAmount,
  onSuccess,
}: WithdrawModalProps) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopyContract = async () => {
    try {
      await navigator.clipboard.writeText(USDC_CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleMaxClick = () => {
    setAmount(maxAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate address
    const isValidAddress = await validateAddress(address);
    if (!isValidAddress) {
      setError('Invalid Ethereum address');
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > parseFloat(maxAmount)) {
      setError('Insufficient balance');
      return;
    }

    startTransition(async () => {
      const result = await sendUsdc(address, amount);

      if (result.success) {
        setTxHash(result.hash || '');
        setSuccess('Transaction sent successfully!');
        // Don't auto-close - let user copy the contract address
      } else {
        setError(result.error || 'Transaction failed');
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      const hadSuccess = !!success;
      setAddress('');
      setAmount('');
      setError('');
      setSuccess('');
      setTxHash('');
      setCopied(false);
      onClose();

      // Delay refresh to allow modal to close and animation to play
      if (hadSuccess) {
        setTimeout(() => {
          onSuccess?.();
        }, 300);
      }
    }
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-lg p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Withdraw USDC</h2>
                <button
                  onClick={handleClose}
                  disabled={isPending}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={20} className="text-[#868686]" />
                </button>
              </div>

              {/* Success State */}
              {success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                    <p className="text-xs text-[#3CAB68]">{success}</p>

                    {txHash && (
                      <div className="pt-2 border-t border-green-200">
                        <p className="text-xs text-[#868686] mb-1">Transaction Hash:</p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#FF5100] hover:underline break-all"
                        >
                          {txHash}
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-green-200">
                      <p className="text-xs text-[#868686] mb-2">
                        Recipient needs to import this token in their wallet:
                      </p>
                      <div className="flex items-center gap-2 bg-white rounded px-2 py-1.5">
                        <code className="text-xs text-[#1A1A1A] break-all flex-1">
                          {USDC_CONTRACT}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyContract}
                          className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
                          title="Copy contract address"
                        >
                          {copied ? (
                            <Check size={14} className="text-[#3CAB68]" />
                          ) : (
                            <Copy size={14} className="text-[#868686]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Recipient Address */}
                  <div>
                    <label className="block text-sm text-[#868686] mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="0x..."
                      disabled={isPending}
                      className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#FF5100] disabled:opacity-50"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm text-[#868686] mb-2">
                      Amount (USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={isPending}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 pr-16 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#FF5100] disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handleMaxClick}
                        disabled={isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-[#FF5100] hover:bg-[#FF5100]/10 rounded transition-colors disabled:opacity-50"
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-xs text-[#868686] mt-1">
                      Available: {maxAmount} USDC
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isPending || !address || !amount}
                    className="w-full"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Withdrawal'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
