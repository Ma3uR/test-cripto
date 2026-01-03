# Product Requirements Document (PRD)
## Crypto Wallet Dashboard

---

## 1. Overview

### 1.1 Project Summary
A Next.js dashboard displaying a crypto wallet overview with real-time balance tracking, profit/loss visualization, and deposit/withdraw functionality on Ethereum Sepolia testnet.

### 1.2 Tech Stack
| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Styling |
| **NumberFlow** | Animated number transitions |
| **Framer Motion** | UI animations |
| **ethers.js** | Blockchain interactions |
| **EtherScan API** | Wallet data, transactions |
| **CoinGecko API** | Price history for charts |

### 1.3 Network & Tokens
- **Network**: Ethereum Sepolia Testnet
- **Balance Token (USDC)**: For main balance display in left card
  - Contract: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Tracked Asset (ETH)**: For profit/loss tracking in right card
  - Native ETH (no contract needed)
  - "Portfolio (Not USDC)" = ETH holdings value in USD
  - P&L tracks ETH price changes over time

---

## 2. Features & Requirements

### 2.1 Wallet Card (Left Block)

#### UI Elements
| Element | Description |
|---------|-------------|
| Avatar | Wallet icon (orange circle with symbol) |
| Wallet Name | "My Wallet" with edit icon |
| Join Date | "Joined {Month Year}" - derived from first transaction |
| Main Balance | Large USDC balance with NumberFlow animation |
| Daily Change | +/- amount and percentage, green/red color |
| Portfolio (Not USDC) | Sum of other token holdings in USD |
| USDC + Portfolio | Total portfolio value |
| Deposit Button | Orange filled button with icon |
| Withdraw Button | Outlined button with icon |

#### Functionality
- **Deposit**: Opens modal to receive funds (shows wallet address + QR code)
- **Withdraw**: Opens modal to send USDC to another address
- **Real-time balance**: Fetches from EtherScan API
- **NumberFlow**: All numeric values animate on change

#### Animations (Framer Motion)
- Buttons: `whileHover` scale + shadow effect
- Buttons: `whileTap` press effect
- Card: Subtle entrance animation

---

### 2.2 Profit/Loss Chart (Right Block)

#### UI Elements
| Element | Description |
|---------|-------------|
| Header | "Profit/Loss" with refresh icon |
| Time Tabs | 1H, 6H, 1D, 1W, 1M, All (6H selected by default) |
| Main Value | Profit/loss amount with +/- and NumberFlow |
| Period Label | "Past Day", "Past Week", etc. |
| Chart | Interactive line chart with gradient fill |

#### Functionality
- **Time Period Switching**: Click tabs to change chart timeframe
- **Hover Interaction**:
  - Show tooltip with exact date/time
  - Update main value to hovered point (NumberFlow animation)
- **Refresh Button**: Manual data refresh

#### Chart Requirements
- Line chart with orange stroke
- Gradient fill below line (orange to transparent)
- Smooth curve interpolation
- Responsive sizing
- Touch-friendly on mobile

#### Data Source
- **CoinGecko API**: Historical ETH price data (`/coins/ethereum/market_chart`)
- **EtherScan API**: ETH balance for the wallet
- **P&L Calculation**: ETH balance × (current price - price at period start)

---

## 3. Technical Architecture

### 3.1 Directory Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page (server component)
│   ├── globals.css          # Global styles
│   └── actions/
│       ├── wallet.ts        # Wallet server actions
│       ├── etherscan.ts     # EtherScan API calls
│       └── coingecko.ts     # CoinGecko API calls
├── components/
│   ├── WalletCard/
│   │   ├── index.tsx        # Main component (client)
│   │   ├── BalanceDisplay.tsx
│   │   ├── DepositModal.tsx
│   │   └── WithdrawModal.tsx
│   ├── ProfitLossChart/
│   │   ├── index.tsx        # Main component (client)
│   │   ├── Chart.tsx        # Chart visualization
│   │   └── TimeTabs.tsx     # Time period selector
│   └── ui/
│       ├── Button.tsx       # Animated button
│       └── Card.tsx         # Card wrapper
├── lib/
│   ├── ethers.ts            # Ethers.js configuration
│   ├── cache.ts             # Server-side caching utility
│   └── utils.ts             # Helper functions
└── types/
    └── index.ts             # TypeScript interfaces
```

### 3.2 Environment Variables
```env
# EtherScan
ETHERSCAN_API_KEY=your_api_key

# CoinGecko (optional, has free tier)
COINGECKO_API_KEY=your_api_key

# Wallet
WALLET_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_WALLET_ADDRESS=your_public_address

# Tokens
USDC_CONTRACT_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
# ETH is native - no contract address needed for P&L tracking

# Network
NEXT_PUBLIC_NETWORK=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
```

### 3.3 Server Actions

#### `getWalletBalance`
```typescript
// Fetches USDC balance from EtherScan
// Caches for 1 minute per wallet address
async function getWalletBalance(address: string): Promise<WalletBalance>
```

#### `getPortfolioValue`
```typescript
// Fetches all token holdings and calculates USD value
// Excludes USDC for "Portfolio (Not USDC)"
async function getPortfolioValue(address: string): Promise<PortfolioValue>
```

#### `getPriceHistory`
```typescript
// Fetches historical price data from CoinGecko for TRACKED token (NOT USDC)
// Periods: 1h, 6h, 1d, 7d, 30d, all
// Caches for 1 minute per period + wallet address
async function getPriceHistory(period: TimePeriod, address: string): Promise<PricePoint[]>
```

#### `getEthBalance`
```typescript
// Fetches ETH balance from EtherScan
// Used for P&L calculations (Portfolio Not USDC)
async function getEthBalance(address: string): Promise<EthBalance>
```

#### `sendTransaction`
```typescript
// Sends USDC to specified address
// Uses private key from env
async function sendTransaction(to: string, amount: string): Promise<TxResult>
```

### 3.4 Caching Strategy
| Data | TTL | Key |
|------|-----|-----|
| Wallet Balance | 60s | `balance:{address}` |
| Portfolio Value | 60s | `portfolio:{address}` |
| Price History | 60s | `prices:{period}:{address}` |
| Transaction History | 60s | `txs:{address}` |

Implementation: In-memory Map with timestamp expiration

---

## 4. API Specifications

### 4.1 EtherScan APIs Used
| Endpoint | Purpose |
|----------|---------|
| `module=account&action=balance` | ETH balance |
| `module=account&action=tokenbalance` | USDC balance |
| `module=account&action=tokentx` | Token transactions |
| `module=account&action=txlist` | Transaction list |

Base URL: `https://api-sepolia.etherscan.io/api`

### 4.2 CoinGecko APIs Used
| Endpoint | Purpose |
|----------|---------|
| `/coins/{id}/market_chart` | Historical price data |
| `/simple/price` | Current price |

Base URL: `https://api.coingecko.com/api/v3`

---

## 5. Component Specifications

### 5.1 WalletCard Component

```typescript
interface WalletCardProps {
  initialBalance: WalletBalance;
  initialPortfolio: PortfolioValue;
}

interface WalletBalance {
  usdc: string;
  usdcUsd: number;
  dailyChange: number;
  dailyChangePercent: number;
}

interface PortfolioValue {
  notUsdc: number;      // Portfolio (Not USDC)
  total: number;        // USDC + Portfolio
  tokens: TokenHolding[];
}
```

### 5.2 ProfitLossChart Component

```typescript
interface ProfitLossChartProps {
  initialData: PricePoint[];
  initialPeriod: TimePeriod;
}

interface PricePoint {
  timestamp: number;
  value: number;
  date: string;
}

type TimePeriod = '1H' | '6H' | '1D' | '1W' | '1M' | 'All';
```

### 5.3 Animated Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Motion animations:
// whileHover: { scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }
// whileTap: { scale: 0.98 }
// whileDrag: { scale: 1.05, rotate: 2 }
```

---

## 6. User Flows

### 6.1 Deposit Flow
1. User clicks "Deposit" button
2. Modal opens showing:
   - Wallet address (copyable)
   - QR code for address
   - Instructions
3. User sends USDC from external wallet
4. Balance updates automatically (polling or manual refresh)

### 6.2 Withdraw Flow
1. User clicks "Withdraw" button
2. Modal opens with:
   - Recipient address input
   - Amount input (with "Max" button)
   - Gas estimate display
   - Confirm button
3. User enters details and confirms
4. Transaction submitted via server action
5. Loading state while pending
6. Success/error notification
7. Balance updates

### 6.3 Chart Interaction Flow
1. Default view: 6H period selected
2. User hovers over chart point
3. Tooltip shows date/time
4. Main value animates to hovered value (NumberFlow)
5. User clicks different time tab
6. Chart fetches new data (with loading state)
7. Data cached for 1 minute

---

## 7. Design Specifications (from Figma)

### 7.1 Colors
```css
/* Primary */
--orange-primary: #FF5100;              /* Primary buttons, chart line */
--orange-light: rgba(255, 81, 0, 0.1);  /* Selected tab background */
--orange-avatar: rgba(255, 81, 0, 0.6); /* Avatar overlay */

/* Text */
--text-primary: #000000;    /* Primary text, balances */
--text-secondary: #868686;  /* Labels, muted text */

/* Status */
--green-profit: #3CAB68;    /* Profit indicator */
--red-loss: #EF4444;        /* Loss indicator */

/* Background & Borders */
--white: #FFFFFF;           /* Card background */
--border-card: #E5E5E5;     /* Card border */
--bg-button-secondary: #F8F8F8;   /* Withdraw button bg */
--border-button-secondary: #E1E1E1; /* Withdraw button border */
```

### 7.2 Typography
```css
/* Font Family */
font-family: 'Euclid Circular A', sans-serif;

/* Balance (large) */
font-size: 40px;
font-weight: 400; /* Regular */
letter-spacing: -0.8px;

/* Medium text (wallet name, values) */
font-size: 16px;
font-weight: 500; /* Medium */
letter-spacing: -0.32px;

/* Small values (change %) */
font-size: 14px;
font-weight: 500; /* Medium */
letter-spacing: -0.28px;

/* Labels */
font-size: 12px;
font-weight: 400; /* Regular */
letter-spacing: -0.24px;
color: #868686;
```

### 7.3 Spacing & Layout
- Card padding: 20px
- Card border-radius: 8px
- Card border: 1px solid #E5E5E5
- Gap between cards: 12px
- Gap inside wallet card: 19px
- Button height: 44px
- Button border-radius: 8px
- Button gap: 8px
- Avatar size: 40px (circular)
- Time tab height: 24px
- Time tab border-radius: 70px (pill shape)
- Selected tab padding: 12px horizontal
- Unselected tab padding: 6px horizontal

---

## 8. Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@number-flow/react": "^0.4.0",
    "framer-motion": "^11.0.0",
    "ethers": "^6.9.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

---

## 9. Security Considerations

1. **Private Key**: Never expose in client code, only use in server actions
2. **Input Validation**: Validate all addresses and amounts server-side
3. **Rate Limiting**: Implement rate limiting on transaction endpoints
4. **Amount Validation**: Prevent sending more than balance
5. **Address Validation**: Verify recipient is valid Ethereum address

---

## 10. Testing Checklist

- [x] Wallet balance displays correctly
- [ ] NumberFlow animates on value changes
- [x] Deposit modal shows correct address
- [x] Withdraw transaction succeeds
- [x] Chart renders with correct data
- [x] Time tabs switch chart period
- [x] Chart hover shows tooltip
- [x] Chart hover updates main value
- [x] Buttons animate on hover/tap
- [ ] Data caches for 1 minute
- [ ] Error states handled gracefully
- [ ] Mobile responsive layout

Тестовое задание

нужно сделать по дизайну этот экран тут 2 блока, с использованием Next.js, typescript only, NumberFlow, EtherScan, Motion для анимаций и графики по своему усмотрению

нужно чтоб весь функционал работал все ключи в .env + private key кошелька 

это должен быть готовый рабочий функционал вывода и депозита + отслеживание позиций profit / loss без USDC ( хеш монеты также в env )

все кнопки анимированы с motion на whileDrag whileHover 

график рабочий при наведении на граф он подписывает дату и меняет значение выше красиво с numberflow также временные метки должны работать 

все запросы выполняются через serverAction


делим клиентские и серверные компоненты и используем прогрузку данных с бека и доп запросами получаем при клике смену графа с кешированием результатов в минуту со стороны сервера с привязкой к publickey

---

## 11. Implementation Order

1. **Phase 1**: Project setup, env config, basic layout
2. **Phase 2**: Server actions (EtherScan, CoinGecko)
3. **Phase 3**: WalletCard with balance display
4. **Phase 4**: Deposit/Withdraw modals
5. **Phase 5**: ProfitLossChart with interactions
6. **Phase 6**: NumberFlow integration
7. **Phase 7**: Motion animations
8. **Phase 8**: Caching implementation
9. **Phase 9**: Polish and testing
