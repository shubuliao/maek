# Frontend UX Engineering Guide
## MAEK Protocol - Building Exceptional User Experiences

### Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Contract API Reference](#contract-api-reference)
3. [Investor Experience Guidelines](#investor-experience-guidelines)
4. [Fund Admin Experience Guidelines](#fund-admin-experience-guidelines)
5. [Real-time Data Handling](#real-time-data-handling)
6. [Error Handling & Validation](#error-handling--validation)
7. [Security Best Practices](#security-best-practices)
8. [Performance Optimization](#performance-optimization)
9. [Mobile & Accessibility](#mobile--accessibility)
10. [Component Library & Patterns](#component-library--patterns)

---

## Overview & Architecture

### MAEK Protocol Summary
MAEK is a decentralized fixed income fund protocol mimicking BlackRock's BUIDL mechanism:
- **NAV-based pricing**: All gains/losses reflected through Net Asset Value changes
- **Automatic rebalancing**: No separate dividend distributions
- **Same-day settlement**: Instant deposits/withdrawals (subject to liquidity)
- **Institutional-grade**: 8-decimal precision, professional risk management

### Core User Personas
1. **Retail Investors**: Seeking stable yield with easy access
2. **Institutional Investors**: Requiring detailed analytics and bulk operations
3. **Fund Administrators**: Managing fund operations and compliance
4. **Risk Managers**: Monitoring exposure and compliance metrics

### Technical Stack Recommendations
```typescript
// Core Dependencies
{
  "@solana/web3.js": "^1.87.0",
  "@solana/wallet-adapter": "^0.15.0",
  "@project-serum/anchor": "^0.28.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "recharts": "^2.8.0", // For financial charts
  "decimal.js": "^10.4.0", // For precise calculations
  "date-fns": "^2.30.0" // For date handling
}
```

---

## Contract API Reference

### Core Instructions

#### 1. Initialize Fund (Admin Only)
```typescript
interface InitializeFundParams {
  managementFeeBps: number; // e.g., 15 for 0.15%
  targetLiquidityRatio: number; // e.g., 25 for 25%
}

const initializeFund = async (
  program: Program,
  admin: Keypair,
  params: InitializeFundParams
) => {
  return await program.methods
    .initializeFund(params.managementFeeBps, params.targetLiquidityRatio)
    .accounts({
      admin: admin.publicKey,
      fundState: fundStatePDA,
      systemProgram: SystemProgram.programId,
    })
    .signers([admin])
    .rpc();
};
```

#### 2. User Deposit
```typescript
interface DepositParams {
  amountUsdc: number; // Amount in USDC (6 decimals)
}

const deposit = async (
  program: Program,
  user: Keypair,
  params: DepositParams
) => {
  // Validate minimum deposit ($10)
  if (params.amountUsdc < 10_000_000) {
    throw new Error("Minimum deposit is $10");
  }
  
  return await program.methods
    .deposit(new BN(params.amountUsdc))
    .accounts({
      user: user.publicKey,
      userFundAccount: userFundAccountPDA,
      fundState: fundStatePDA,
      userUsdcAccount: userUsdcATA,
      fundUsdcAccount: fundUsdcATA,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([user])
    .rpc();
};
```

#### 3. User Withdrawal
```typescript
interface WithdrawParams {
  fundTokens: number; // Fund tokens to burn (8 decimals)
}

const withdraw = async (
  program: Program,
  user: Keypair,
  params: WithdrawParams
) => {
  return await program.methods
    .withdraw(new BN(params.fundTokens))
    .accounts({
      user: user.publicKey,
      userFundAccount: userFundAccountPDA,
      fundState: fundStatePDA,
      userUsdcAccount: userUsdcATA,
      fundUsdcAccount: fundUsdcATA,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([user])
    .rpc();
};
```

#### 4. Update NAV (Admin Only)
```typescript
interface UpdateNavParams {
  netDailyPnl: number; // Positive for profit, negative for loss (8 decimals)
}

const updateNav = async (
  program: Program,
  admin: Keypair,
  params: UpdateNavParams
) => {
  return await program.methods
    .updateNav(new BN(params.netDailyPnl))
    .accounts({
      admin: admin.publicKey,
      fundState: fundStatePDA,
    })
    .signers([admin])
    .rpc();
};
```

### Account State Interfaces

```typescript
interface FundState {
  adminAuthority: PublicKey;
  totalAssets: BN; // 8 decimals
  totalShares: BN; // 8 decimals
  navPerShare: BN; // 8 decimals, e.g., 100_000_000 = $1.00
  cashReserves: BN; // 6 decimals (USDC)
  fixedIncomeValue: BN; // 8 decimals
  managementFeeBps: number; // Basis points
  targetLiquidityRatio: number; // Percentage
  isPaused: boolean;
  inceptionDate: BN;
  lastNavUpdate: BN;
  totalDepositors: BN;
  dailyYieldHistory: BN[]; // Last 365 days
}

interface UserFundAccount {
  owner: PublicKey;
  fundTokens: BN; // 8 decimals
  totalDeposited: BN; // 8 decimals (cumulative)
  totalWithdrawn: BN; // 8 decimals (cumulative)
  depositCount: number;
  withdrawalCount: number;
  createdAt: BN;
  lastActivity: BN;
}
```

---

## Investor Experience Guidelines

### 1. Dashboard Design Principles

#### Key Metrics Display
```typescript
interface InvestorDashboard {
  // Primary metrics (always visible)
  currentBalance: {
    value: string; // "1,234.56 USDC"
    fundTokens: string; // "1,234.56789012 MAEK"
    navPerShare: string; // "$1.02345678"
  };
  
  // Performance metrics
  performance: {
    dailyChange: string; // "+$1.23 (+0.12%)"
    totalReturn: string; // "+$45.67 (+3.84%)"
    currentApy: string; // "4.52%"
    sinceInception: string; // "+$123.45 (+12.34%)"
  };
  
  // Quick actions
  actions: {
    canDeposit: boolean;
    canWithdraw: boolean;
    maxWithdrawal: string; // Available liquidity
  };
}
```

#### UX Best Practices for Investors

**1. Clear Value Proposition**
```tsx
const HeroSection = () => (
  <div className="hero-section">
    <h1>Earn {currentApy}% APY on Fixed Income</h1>
    <p>Institutional-grade fund accessible to everyone</p>
    <div className="key-benefits">
      <Benefit icon="shield" text="Transparent & Secure" />
      <Benefit icon="clock" text="Same-day Settlement" />
      <Benefit icon="chart" text="Professional Management" />
    </div>
  </div>
);
```

**2. Progressive Disclosure**
- Show essential info first, details on demand
- Use expandable sections for advanced metrics
- Provide tooltips for technical terms

**3. Real-time Updates**
```tsx
const BalanceDisplay = ({ balance, isLive }) => (
  <div className="balance-card">
    <div className="balance-header">
      <h3>Your Balance</h3>
      <LiveIndicator active={isLive} />
    </div>
    <div className="balance-amount">
      <AnimatedNumber value={balance} />
      <span className="currency">USDC</span>
    </div>
  </div>
);
```

### 2. Deposit Flow UX

#### Step-by-Step Deposit Process
```tsx
const DepositFlow = () => {
  const [step, setStep] = useState(1);
  
  return (
    <div className="deposit-flow">
      <ProgressIndicator current={step} total={4} />
      
      {step === 1 && (
        <AmountInput
          min={10}
          max={1000000}
          onNext={(amount) => {
            validateAmount(amount);
            setStep(2);
          }}
        />
      )}
      
      {step === 2 && <ReviewDeposit onConfirm={() => setStep(3)} />}
      {step === 3 && <WalletConnection onConnect={() => setStep(4)} />}
      {step === 4 && <TransactionConfirmation />}
    </div>
  );
};
```

#### Smart Validation & Feedback
```typescript
const validateDepositAmount = (amount: number, userBalance: number) => {
  const errors: string[] = [];
  
  if (amount < 10) {
    errors.push("Minimum deposit is $10");
  }
  
  if (amount > 1000000) {
    errors.push("Maximum deposit is $1,000,000");
  }
  
  if (amount > userBalance) {
    errors.push("Insufficient USDC balance");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions: generateSuggestions(amount, userBalance)
  };
};
```

### 3. Portfolio Visualization

#### Performance Charts
```tsx
const PerformanceChart = ({ data, timeframe }) => (
  <div className="chart-container">
    <ChartHeader timeframe={timeframe} />
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
        <Tooltip formatter={formatCurrency} />
        <Line 
          type="monotone" 
          dataKey="nav" 
          stroke="#2563eb" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
```

#### Transaction History
```tsx
const TransactionHistory = ({ transactions }) => (
  <div className="transaction-history">
    <h3>Recent Activity</h3>
    {transactions.map(tx => (
      <TransactionCard
        key={tx.signature}
        type={tx.type} // 'deposit' | 'withdrawal'
        amount={tx.amount}
        nav={tx.navAtTime}
        timestamp={tx.timestamp}
        status={tx.status}
      />
    ))}
  </div>
);
```

---

## Fund Admin Experience Guidelines

### 1. Admin Dashboard Architecture

#### Comprehensive Overview
```typescript
interface AdminDashboard {
  fundMetrics: {
    totalAum: string; // Total Assets Under Management
    totalInvestors: number;
    currentNav: string;
    liquidityRatio: string;
    managementFeeAccrued: string;
  };
  
  dailyOperations: {
    pendingNavUpdate: boolean;
    cashMovements: {
      depositsToday: string;
      withdrawalsToday: string;
      netFlow: string;
    };
    assetMaturityCalendar: MaturityEvent[];
  };
  
  riskMetrics: {
    portfolioAllocation: AllocationBreakdown;
    creditExposure: CreditExposure;
    durationRisk: DurationMetrics;
    concentrationLimits: ConcentrationCheck[];
  };
}
```

### 2. NAV Management Interface

#### Daily NAV Update Workflow
```tsx
const NavUpdatePanel = () => {
  const [navData, setNavData] = useState<NavUpdateData>();
  const [isCalculating, setIsCalculating] = useState(false);
  
  return (
    <div className="nav-update-panel">
      <div className="nav-header">
        <h2>Daily NAV Update</h2>
        <LastUpdateIndicator />
      </div>
      
      <AssetValuationInput 
        onValuationChange={handleValuationChange}
      />
      
      <PnLCalculation
        data={navData}
        isCalculating={isCalculating}
      />
      
      <NavPreview 
        currentNav={navData?.currentNav}
        proposedNav={navData?.proposedNav}
        impact={navData?.impactAnalysis}
      />
      
      <ConfirmationPanel
        onConfirm={submitNavUpdate}
        requiresApprovals={true}
      />
    </div>
  );
};
```

#### Asset Management Interface
```tsx
const AssetManagement = () => (
  <div className="asset-management">
    <PortfolioOverview />
    
    <div className="asset-actions">
      <AssetPurchasePanel />
      <MaturityManagement />
      <LiquidityOptimization />
    </div>
    
    <ComplianceMonitoring />
  </div>
);
```

### 3. Risk Management Dashboard

#### Real-time Risk Monitoring
```tsx
const RiskDashboard = () => (
  <div className="risk-dashboard">
    <RiskMetricsGrid>
      <MetricCard
        title="Portfolio Concentration"
        value="12.5%"
        limit="15%"
        status="good"
      />
      <MetricCard
        title="Liquidity Ratio"
        value="28%"
        target="25%"
        status="good"
      />
      <MetricCard
        title="Duration Risk"
        value="2.3 years"
        limit="3.0 years"
        status="warning"
      />
    </RiskMetricsGrid>
    
    <AlertsPanel />
    <ComplianceChecklist />
  </div>
);
```

---

## Real-time Data Handling

### 1. WebSocket Connection Management

```typescript
class MaekDataService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<Function>> = new Map();
  
  connect() {
    this.ws = new WebSocket(process.env.REACT_APP_WS_URL);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifySubscribers(data.type, data.payload);
    };
    
    this.ws.onclose = () => {
      // Implement exponential backoff reconnection
      setTimeout(() => this.connect(), this.getReconnectDelay());
    };
  }
  
  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
  }
  
  // Subscribe to real-time events
  subscribeToNavUpdates(callback: (nav: NavUpdate) => void) {
    this.subscribe('nav_update', callback);
  }
  
  subscribeToUserBalance(userKey: string, callback: (balance: UserBalance) => void) {
    this.subscribe(`user_balance_${userKey}`, callback);
  }
}
```

### 2. State Management with Real-time Updates

```typescript
// Using React Query for server state management
const useRealtimeFundData = () => {
  const queryClient = useQueryClient();
  const dataService = useMaekDataService();
  
  useEffect(() => {
    const unsubscribe = dataService.subscribeToNavUpdates((update) => {
      queryClient.setQueryData(['fund-state'], (old: FundState) => ({
        ...old,
        navPerShare: update.newNav,
        totalAssets: update.totalAssets,
        lastNavUpdate: update.timestamp,
      }));
    });
    
    return unsubscribe;
  }, [queryClient, dataService]);
  
  return useQuery(['fund-state'], () => fetchFundState(), {
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute backup polling
  });
};
```

### 3. Optimistic Updates

```typescript
const useOptimisticDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation(depositFunds, {
    onMutate: async (depositData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['user-balance']);
      
      // Snapshot the previous value
      const previousBalance = queryClient.getQueryData(['user-balance']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['user-balance'], (old: UserBalance) => ({
        ...old,
        fundTokens: old.fundTokens.add(depositData.expectedTokens),
        totalDeposited: old.totalDeposited.add(depositData.amount),
      }));
      
      return { previousBalance };
    },
    
    onError: (err, depositData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user-balance'], context?.previousBalance);
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['user-balance']);
    },
  });
};
```

---

## Error Handling & Validation

### 1. Comprehensive Error Mapping

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  // Deposit errors
  'DepositTooSmall': 'Minimum deposit is $10. Please increase your deposit amount.',
  'DepositTooLarge': 'Maximum deposit is $1,000,000. Please reduce your deposit amount.',
  'InsufficientFunds': 'Insufficient USDC balance. Please add funds to your wallet.',
  
  // Withdrawal errors
  'InsufficientFundTokens': 'Insufficient fund tokens. Your maximum withdrawal is {maxAmount}.',
  'InsufficientLiquidity': 'Temporary liquidity shortage. Please try a smaller amount or try again later.',
  
  // NAV errors
  'NAVUpdateTooFrequent': 'NAV can only be updated once per day. Next update available at {nextUpdate}.',
  'NAVTooLow': 'Proposed NAV is below safety threshold. Please review asset valuations.',
  'NAVTooHigh': 'Proposed NAV exceeds safety threshold. Please review calculations.',
  
  // General errors
  'FundPaused': 'Fund operations are temporarily paused for maintenance.',
  'UnauthorizedAccess': 'You do not have permission to perform this action.',
  'NetworkError': 'Network connection error. Please check your internet connection.',
};

const formatErrorMessage = (error: any): string => {
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code].replace(
      /\{(\w+)\}/g, 
      (match, key) => error.data?.[key] || match
    );
  }
  
  return 'An unexpected error occurred. Please try again or contact support.';
};
```

### 2. Input Validation Hooks

```typescript
const useDepositValidation = () => {
  return (amount: string, userBalance: number) => {
    const numAmount = parseFloat(amount);
    const errors: ValidationError[] = [];
    
    // Required field
    if (!amount || isNaN(numAmount)) {
      errors.push({
        field: 'amount',
        type: 'required',
        message: 'Please enter a deposit amount'
      });
      return { isValid: false, errors };
    }
    
    // Minimum amount
    if (numAmount < 10) {
      errors.push({
        field: 'amount',
        type: 'min',
        message: 'Minimum deposit is $10',
        suggestion: 'Enter at least $10'
      });
    }
    
    // Maximum amount
    if (numAmount > 1000000) {
      errors.push({
        field: 'amount',
        type: 'max',
        message: 'Maximum deposit is $1,000,000',
        suggestion: 'Enter no more than $1,000,000'
      });
    }
    
    // User balance check
    if (numAmount > userBalance) {
      errors.push({
        field: 'amount',
        type: 'insufficient',
        message: `Insufficient balance. You have $${userBalance.toLocaleString()}`,
        suggestion: `Maximum you can deposit: $${userBalance.toLocaleString()}`
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: generateWarnings(numAmount, userBalance)
    };
  };
};
```

### 3. Transaction Error Recovery

```tsx
const TransactionHandler = ({ children }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleTransactionError = async (error: any, retryFn: Function) => {
    const maxRetries = 3;
    
    if (retryCount < maxRetries && isRetriableError(error)) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
      
      try {
        await retryFn();
        setRetryCount(0);
      } catch (retryError) {
        handleTransactionError(retryError, retryFn);
      } finally {
        setIsRetrying(false);
      }
    } else {
      // Show user-friendly error
      showErrorToast(formatErrorMessage(error));
    }
  };
  
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
};
```

---

## Security Best Practices

### 1. Wallet Security

```typescript
// Secure wallet connection with validation
const useSecureWallet = () => {
  const { wallet, connected } = useWallet();
  const [isValidated, setIsValidated] = useState(false);
  
  useEffect(() => {
    if (connected && wallet) {
      validateWalletSecurity(wallet).then(setIsValidated);
    }
  }, [connected, wallet]);
  
  const validateWalletSecurity = async (wallet: Wallet) => {
    // Check for known malicious addresses
    const isBlacklisted = await checkBlacklist(wallet.adapter.publicKey);
    if (isBlacklisted) {
      throw new Error('Wallet address is blacklisted');
    }
    
    // Verify wallet signature
    const challenge = generateChallenge();
    const signature = await wallet.adapter.signMessage(challenge);
    return verifySignature(signature, challenge, wallet.adapter.publicKey);
  };
  
  return { wallet, connected, isValidated };
};
```

### 2. Transaction Security

```typescript
// Secure transaction building with validation
const buildSecureTransaction = async (
  instruction: TransactionInstruction,
  user: PublicKey
) => {
  const transaction = new Transaction();
  
  // Add priority fee for faster processing
  const priorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1000,
  });
  transaction.add(priorityFee);
  
  // Add the main instruction
  transaction.add(instruction);
  
  // Set recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = user;
  
  // Simulate transaction before sending
  const simulation = await connection.simulateTransaction(transaction);
  if (simulation.value.err) {
    throw new Error(`Transaction simulation failed: ${simulation.value.err}`);
  }
  
  return transaction;
};
```

### 3. Input Sanitization

```typescript
// Sanitize and validate all user inputs
const sanitizeInput = {
  amount: (input: string): number => {
    // Remove all non-numeric characters except decimal point
    const cleaned = input.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parseFloat(parts[0] + '.' + parts[1]);
    }
    
    const amount = parseFloat(cleaned);
    
    // Validate range
    if (amount < 0) return 0;
    if (amount > 1000000) return 1000000;
    
    return amount;
  },
  
  publicKey: (input: string): PublicKey | null => {
    try {
      return new PublicKey(input.trim());
    } catch {
      return null;
    }
  }
};
```

---

## Performance Optimization

### 1. Code Splitting & Lazy Loading

```typescript
// Lazy load admin components
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const InvestorDashboard = lazy(() => import('./components/investor/InvestorDashboard'));

const App = () => (
  <Router>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/invest" element={<InvestorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  </Router>
);
```

### 2. Data Fetching Optimization

```typescript
// Efficient data fetching with batching
const useBatchedQueries = () => {
  return useQueries([
    {
      queryKey: ['fund-state'],
      queryFn: fetchFundState,
      staleTime: 30000,
    },
    {
      queryKey: ['user-balance'],
      queryFn: fetchUserBalance,
      staleTime: 10000,
    },
    {
      queryKey: ['price-history'],
      queryFn: fetchPriceHistory,
      staleTime: 300000, // 5 minutes
    },
  ]);
};

// Implement pagination for transaction history
const useTransactionHistory = (limit = 20) => {
  return useInfiniteQuery(
    ['transactions'],
    ({ pageParam = 0 }) => fetchTransactions({ offset: pageParam, limit }),
    {
      getNextPageParam: (lastPage, pages) => 
        lastPage.hasMore ? pages.length * limit : undefined,
    }
  );
};
```

### 3. Memoization & Optimization

```typescript
// Memoize expensive calculations
const usePortfolioCalculations = (fundData: FundState) => {
  return useMemo(() => {
    if (!fundData) return null;
    
    return {
      totalValue: calculateTotalValue(fundData),
      allocationBreakdown: calculateAllocation(fundData),
      riskMetrics: calculateRisk(fundData),
    };
  }, [fundData]);
};

// Virtualized lists for large datasets
const VirtualizedTransactionList = ({ transactions }) => (
  <FixedSizeList
    height={400}
    itemCount={transactions.length}
    itemSize={64}
    itemData={transactions}
  >
    {TransactionRow}
  </FixedSizeList>
);
```

---

## Mobile & Accessibility

### 1. Responsive Design Patterns

```scss
// Mobile-first responsive design
.dashboard {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  
  // Mobile (default)
  grid-template-columns: 1fr;
  
  // Tablet
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    padding: 2rem;
  }
  
  // Desktop
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
}

.metric-card {
  // Touch-friendly sizing
  min-height: 44px;
  padding: 1rem;
  
  // Prevent text scaling issues
  text-size-adjust: 100%;
}
```

### 2. Accessibility Implementation

```tsx
// ARIA-compliant components
const BalanceCard = ({ balance, isLoading }) => (
  <div 
    className="balance-card"
    role="region"
    aria-label="Account balance"
    aria-live="polite"
    aria-busy={isLoading}
  >
    <h3 id="balance-heading">Your Balance</h3>
    <div 
      aria-labelledby="balance-heading"
      aria-describedby="balance-description"
    >
      {isLoading ? (
        <span aria-label="Loading balance">...</span>
      ) : (
        <span aria-label={`Balance: ${balance} dollars`}>
          ${balance.toLocaleString()}
        </span>
      )}
    </div>
    <p id="balance-description" className="sr-only">
      This shows your current account balance in US dollars
    </p>
  </div>
);

// Keyboard navigation support
const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1: Go to dashboard
      if (e.altKey && e.key === '1') {
        navigate('/dashboard');
      }
      
      // Alt + 2: Go to deposit
      if (e.altKey && e.key === '2') {
        navigate('/deposit');
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

### 3. Mobile-Optimized Flows

```tsx
// Mobile-optimized deposit flow
const MobileDepositFlow = () => {
  const [amount, setAmount] = useState('');
  const isValid = amount && parseFloat(amount) >= 10;
  
  return (
    <div className="mobile-deposit">
      <div className="amount-input-section">
        <label htmlFor="deposit-amount" className="amount-label">
          How much would you like to deposit?
        </label>
        
        <div className="currency-input">
          <span className="currency-symbol">$</span>
          <input
            id="deposit-amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="amount-field"
          />
        </div>
        
        <QuickAmountButtons 
          amounts={[10, 100, 500, 1000]}
          onSelect={setAmount}
        />
      </div>
      
      <div className="action-section">
        <Button
          disabled={!isValid}
          onClick={handleDeposit}
          className="primary-action"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
```

---

## Component Library & Patterns

### 1. Design System Foundation

```typescript
// Theme configuration
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    neutral: {
      100: '#f5f5f5',
      500: '#6b7280',
      900: '#111827',
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
};
```

### 2. Reusable Components

#### Currency Display Component
```tsx
interface CurrencyDisplayProps {
  amount: number | string;
  currency?: 'USD' | 'USDC' | 'MAEK';
  precision?: number;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'USD',
  precision = 2,
  showSign = false,
  size = 'md',
}) => {
  const formatAmount = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (currency === 'MAEK') {
      return num.toFixed(8); // 8 decimals for fund tokens
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(num);
  };
  
  const displayValue = formatAmount(amount);
  const isNegative = parseFloat(amount.toString()) < 0;
  
  return (
    <span 
      className={clsx(
        'currency-display',
        `size-${size}`,
        isNegative && 'negative',
        showSign && 'show-sign'
      )}
    >
      {displayValue}
      {currency !== 'USD' && (
        <span className="currency-suffix"> {currency}</span>
      )}
    </span>
  );
};
```

#### Performance Chart Component
```tsx
interface PerformanceChartProps {
  data: Array<{ date: string; nav: number }>;
  timeframe: '24h' | '7d' | '30d' | '1y';
  height?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  timeframe,
  height = 200,
}) => {
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      date: format(new Date(point.date), getDateFormat(timeframe)),
    }));
  }, [data, timeframe]);
  
  return (
    <div className="performance-chart">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            tickFormatter={(value) => `$${value.toFixed(4)}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(8)}`, 'NAV']}
            labelFormatter={(date) => `Date: ${date}`}
          />
          <Line 
            type="monotone" 
            dataKey="nav" 
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

#### Smart Loading States
```tsx
const SmartLoader = ({ 
  isLoading, 
  error, 
  children, 
  skeleton,
  retry 
}) => {
  if (error) {
    return (
      <ErrorState 
        message={error.message}
        onRetry={retry}
      />
    );
  }
  
  if (isLoading) {
    return skeleton || <LoadingSkeleton />;
  }
  
  return children;
};

// Usage
<SmartLoader
  isLoading={isLoadingBalance}
  error={balanceError}
  retry={refetchBalance}
  skeleton={<BalanceSkeleton />}
>
  <BalanceCard balance={userBalance} />
</SmartLoader>
```

### 3. Form Patterns

#### Smart Form Hook
```typescript
const useSmartForm = <T>(
  initialValues: T,
  validationSchema: yup.Schema<T>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const validate = async (field?: keyof T) => {
    try {
      if (field) {
        await validationSchema.validateAt(field as string, values);
        setErrors(prev => ({ ...prev, [field]: undefined }));
      } else {
        await validationSchema.validate(values, { abortEarly: false });
        setErrors({});
      }
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        err.inner.forEach(error => {
          if (error.path) {
            newErrors[error.path as keyof T] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleChange = (field: keyof T) => (value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validate(field);
    }
  };
  
  const handleBlur = (field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate(field);
  };
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    isValid: Object.keys(errors).length === 0,
  };
};
```

---

## Implementation Checklist

### For Investor Interface ✅
- [ ] Wallet connection with security validation
- [ ] Real-time balance updates
- [ ] Intuitive deposit/withdrawal flows
- [ ] Performance visualization
- [ ] Transaction history with filtering
- [ ] Mobile-responsive design
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Error handling and recovery
- [ ] Offline state management
- [ ] Push notifications for important updates

### For Admin Interface ✅
- [ ] Comprehensive fund dashboard
- [ ] NAV update workflow
- [ ] Risk monitoring tools
- [ ] Asset management interface
- [ ] Compliance reporting
- [ ] Audit trail logging
- [ ] Multi-signature support
- [ ] Role-based access control
- [ ] Data export functionality
- [ ] Emergency controls

### Performance & Security ✅
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] CDN integration
- [ ] Security headers
- [ ] Input sanitization
- [ ] Rate limiting
- [ ] Error tracking (Sentry)
- [ ] Analytics integration
- [ ] Performance monitoring
- [ ] Load testing

---

## Getting Started

### 1. Project Setup
```bash
# Create new React project
npx create-react-app maek-frontend --template typescript

# Install required dependencies
npm install @solana/web3.js @solana/wallet-adapter-react \
  @project-serum/anchor decimal.js date-fns recharts \
  react-query @headlessui/react clsx

# Install development dependencies
npm install -D @types/node tailwindcss postcss autoprefixer
```

### 2. Environment Configuration
```env
# .env.local
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_PROGRAM_ID=YourProgramIdHere
REACT_APP_WS_URL=wss://api.devnet.solana.com
REACT_APP_API_URL=https://api.maek.finance
```

### 3. Development Guidelines
- Use TypeScript for all components
- Implement comprehensive error boundaries
- Write unit tests for all utility functions
- Use React Query for server state management
- Follow the established design system
- Implement proper loading states
- Add comprehensive accessibility features
- Test on multiple devices and browsers

This guide provides the foundation for building exceptional user experiences on top of the MAEK protocol. Focus on user needs, maintain high performance standards, and prioritize security in every implementation decision. 