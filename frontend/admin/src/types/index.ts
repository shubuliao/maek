import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

// Current MAEK Protocol Types (Updated for actual implementation)
export interface FundState {
  adminAuthority: PublicKey;
  fundTokenMint: PublicKey;
  usdcMint: PublicKey;
  usdcVault: PublicKey;
  treasuryVault: PublicKey;
  totalAssets: BN; // 8 decimals - includes cash + fixed income
  totalShares: BN; // 8 decimals - total fund tokens in circulation
  navPerShare: BN; // 8 decimals, e.g., 100_000_000 = $1.00
  lastNavUpdate: BN; // timestamp
  cashReserves: BN; // 6 decimals (USDC)
  fixedIncomeValue: BN; // 8 decimals
  managementFeeBps: number; // Basis points (15 = 0.15%)
  targetLiquidityRatio: number; // Percentage (25 = 25%)
  isPaused: boolean;
  inceptionDate: BN;
  totalYieldDistributed: BN; // 8 decimals
  totalDepositors: number;
  bump: number;
}

export interface UserFundAccount {
  owner: PublicKey;
  fundTokens: BN; // 8 decimals
  totalDeposited: BN; // 8 decimals (cumulative USD)
  totalWithdrawn: BN; // 8 decimals (cumulative USD)
  lastDepositTime: BN;
  lastWithdrawalTime: BN;
  autoCompound: boolean; // yield distribution preference
  pendingYield: BN; // 6 decimals USDC
  totalYieldEarned: BN; // 8 decimals
  createdAt: BN;
  depositCount: number;
  withdrawalCount: number;
  avgCostBasis: BN; // 8 decimals - average cost per fund token
  lastDepositNav: BN; // 8 decimals - for performance tracking
  bump: number;
}

// Asset Management Types (For future implementation)
export interface AssetValuation {
  assetId: PublicKey;
  currentValue: BN; // 8 decimals
}

export interface FixedIncomeAsset {
  assetId: string;
  assetType: 'TreasuryBill' | 'TreasuryNote' | 'CorporateBond' | 'CommercialPaper' | 'CD';
  faceValue: BN;
  purchasePrice: BN;
  currentValue: BN;
  purchaseDate: Date;
  maturityDate: Date;
  yieldRate: number; // APY in basis points
  accruedInterest: BN;
  status: 'Active' | 'Matured' | 'Sold';
  issuer: string;
  creditRating: string;
}

// Dashboard Data Types
export interface DashboardMetrics {
  totalAssets: number; // In USD
  totalShares: number;
  navPerShare: number;
  totalDepositors: number;
  dailyVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  currentYield: number; // APY
  liquidityRatio: number; // Percentage
  lastNavUpdate: Date;
}

export interface UserSummary {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  activeUsers: number;
  avgDepositSize: number;
  largestDepositor: number;
}

export interface RiskMetrics {
  liquidityRatio: number;
  concentrationRisk: number;
  creditRisk: number;
  durationRisk: number;
  withdrawalPressure: number;
  stressTestResults: {
    scenario: string;
    impact: number;
    probability: number;
  }[];
}

export interface TransactionEvent {
  signature: string;
  type: 'deposit' | 'withdraw' | 'nav_update' | 'admin_action';
  user?: PublicKey;
  amount?: BN;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  details: any;
}

export interface NavHistoryPoint {
  date: Date;
  navPerShare: number;
  totalAssets: number;
  totalShares: number;
  yieldGenerated: number;
}

// UI Component Types
export interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  loading?: boolean;
  icon?: React.ComponentType<any>;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Form Types
export interface NavUpdateForm {
  newAssetValuations: AssetValuation[];
  netDailyPnl: string;
  notes?: string;
}

export interface AdminActionForm {
  action: 'pause' | 'unpause' | 'emergency_withdraw' | 'update_fees';
  reason: string;
  parameters?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  dateRange?: {
    start: Date;
    end: Date;
  };
  userType?: 'all' | 'retail' | 'institutional';
  transactionType?: 'all' | 'deposit' | 'withdraw';
  amountRange?: {
    min: number;
    max: number;
  };
}

// Constants
export const DECIMAL_PLACES = {
  NAV: 8,
  FUND_TOKENS: 8,
  USDC: 6,
  PERCENTAGE: 2,
  CURRENCY: 2,
} as const;

export const PROGRAM_CONFIG = {
  PROGRAM_ID: '2gtiJ4B3Fv6oF6ZEYJcXdoNTGVC4jG5bNQjXs9ELWrhx',
  NETWORK: 'localnet',
  RPC_URL: 'http://localhost:8899',
} as const; 