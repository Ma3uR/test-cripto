'use client';

import Image from 'next/image';

export function DepositIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/deposit.svg"
      alt="Deposit"
      width={20}
      height={20}
      className={className}
    />
  );
}

export function WithdrawIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/withdraw.svg"
      alt="Withdraw"
      width={20}
      height={20}
      className={className}
    />
  );
}

export function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.72916 2.10001L2.95416 7.17501C2.77083 7.37501 2.59333 7.76918 2.55833 8.04001L2.33833 9.89334C2.26249 10.5717 2.74999 11.0358 3.42249 10.925L5.26416 10.6167C5.53499 10.57 5.91749 10.375 6.10666 10.175L10.8817 5.10001C11.6892 4.23918 12.0542 3.25251 10.7942 2.06418C9.53999 0.887512 8.53666 1.23918 7.72916 2.10001Z"
        stroke="#868686"
        strokeWidth="0.875"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.95166 2.93335C7.21499 4.51418 8.50249 5.72668 10.095 5.90418"
        stroke="#868686"
        strokeWidth="0.875"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.75 12.8333H12.25"
        stroke="#868686"
        strokeWidth="0.875"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.65 6.34666C13.2033 3.71332 10.93 1.66666 8.17333 1.66666C5.98 1.66666 4.08 2.94666 3.14 4.81332"
        stroke="#868686"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.35001 9.65334C2.79667 12.2867 5.07001 14.3333 7.82667 14.3333C10.02 14.3333 11.92 13.0533 12.86 11.1867"
        stroke="#868686"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.84668 4.99334L3.14001 4.81334L3.32001 6.10668"
        stroke="#868686"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1533 11.0067L12.86 11.1867L12.68 9.89334"
        stroke="#868686"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 9.5V2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 5L6 2L9 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 2.5V9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 7L6 10L9 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WalletIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/1.svg"
      alt="Wallet"
      width={36}
      height={36}
      className={className}
    />
  );
}

export function UsdcIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/2.svg"
      alt="USDC"
      width={24}
      height={24}
      className={className}
    />
  );
}

export function EthLogo({ className }: { className?: string }) {
  return (
    <svg
      width="30"
      height="20"
      viewBox="0 0 30 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15 0L8.5 10L15 13.5L21.5 10L15 0Z"
        fill="#E5E5E5"
        fillOpacity="0.6"
      />
      <path
        d="M8.5 11L15 20L21.5 11L15 14.5L8.5 11Z"
        fill="#E5E5E5"
        fillOpacity="0.6"
      />
    </svg>
  );
}
