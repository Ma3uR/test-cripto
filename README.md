# Crypto Wallet Dashboard

A real-time cryptocurrency wallet dashboard built with Next.js. Track your USDC balance, portfolio value, and profit/loss with interactive charts.

## Features

- **Wallet Overview** - View USDC balance and total portfolio value
- **Profit/Loss Chart** - Interactive ETH price chart with multiple time periods (1H, 6H, 1D, 1W, 1M, All)
- **Deposit** - Generate QR code for receiving USDC
- **Withdraw** - Send USDC to any address with gas estimation
- **Real-time Updates** - Animated number transitions on data refresh
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)
- **Blockchain**: ethers.js v6
- **APIs**: Etherscan, CoinGecko

## Prerequisites

- Node.js >= 20.9.0
- npm or yarn
- Ethereum wallet on Sepolia testnet
- API keys for Etherscan and CoinGecko

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required
NEXT_PUBLIC_WALLET_ADDRESS=0x...         # Your wallet address
WALLET_PRIVATE_KEY=...                    # Private key for withdrawals

# API Keys
ETHERSCAN_API_KEY=...                     # Get from etherscan.io
COINGECKO_API_KEY=...                     # Get from coingecko.com

# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# USDC Contract (Sepolia)
USDC_CONTRACT_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Optional
NEXT_PUBLIC_WALLET_NAME=My Wallet         # Custom wallet display name
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd test-cripto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
src/
├── app/
│   ├── actions/           # Server actions
│   │   ├── coingecko.ts   # Price data fetching
│   │   ├── etherscan.ts   # Blockchain data
│   │   └── wallet.ts      # Wallet operations
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ProfitLossChart/   # P/L chart component
│   │   ├── Chart.tsx
│   │   ├── TimeTabs.tsx
│   │   └── index.tsx
│   ├── WalletCard/        # Wallet display component
│   │   ├── DepositModal.tsx
│   │   ├── WithdrawModal.tsx
│   │   └── index.tsx
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Icons.tsx
├── lib/
│   ├── cache.ts           # Data caching
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## API Attribution

Price data powered by [CoinGecko API](https://www.coingecko.com/en/api)

## License

MIT
