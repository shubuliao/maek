# Module 001: Core Fund Management - Product Requirements

## Overview

This module implements the foundational mechanisms that directly mimic BlackRock's BUIDL fund operations on Solana. It establishes the core fund state management, share tokenization, and NAV calculation systems that form the backbone of the protocol for a **diversified fixed income fund**.

## BlackRock BUIDL Mechanisms to Implement

### 1. Net Asset Value (NAV) System
**BUIDL Reference**: Daily NAV calculation maintaining ~$1.00 share price

**Requirements**:
- **Daily NAV Calculation**: Automatically calculate fund NAV every 24 hours
- **Share Price Stability**: Maintain fund tokens close to $1.00 value through NAV adjustments
- **Precision**: Use 8 decimal places for NAV calculations to match institutional standards
- **Historical Tracking**: Store NAV history for performance analysis and compliance

**Acceptance Criteria**:
- [ ] NAV calculated daily at 4:00 PM EST (21:00 UTC)
- [ ] Share price variance kept within ±0.01% of $1.00 target
- [ ] NAV calculation includes accrued interest from all fixed income assets
- [ ] Historical NAV data accessible via smart contract queries

### 2. Proportional Share Distribution
**BUIDL Reference**: Users receive shares proportional to their USD investment

**Requirements**:
- **Mint-on-Deposit**: Create fund tokens when users deposit stablecoins
- **Burn-on-Withdrawal**: Destroy fund tokens when users withdraw
- **Proportional Calculation**: Fund tokens = (Deposit Amount / Current NAV) × 10^8
- **Same-Day Settlement**: Process deposits/withdrawals immediately during business hours

**Acceptance Criteria**:
- [ ] User receives exact proportional share of fund based on deposit amount
- [ ] Fund tokens are SPL tokens compatible with Solana ecosystem
- [ ] Minimum deposit of $10 (10 USDC) supported
- [ ] Maximum deposit limited only by available asset capacity

### 3. Fixed Income Asset Investment Management
**BUIDL Reference**: Invest in short-term U.S. Treasury bills (1-month to 1-year maturities)

**Requirements**:
- **Automated Investment**: Automatically invest deposited funds in fixed income assets
- **Diversified Portfolio**: Spread investments across multiple asset types, maturities, and issuers
- **Professional Selection**: Use credit rating and yield optimization algorithms
- **Maturity Management**: Handle asset maturities and reinvestment automatically

**Acceptance Criteria**:
- [ ] Target 60-80% of fund assets in fixed income securities
- [ ] Maintain 20-40% in cash for liquidity (same-day withdrawals)
- [ ] Support multiple asset classes (treasury bills, corporate bonds, CDs, etc.)
- [ ] Average portfolio duration of 30-180 days for optimal liquidity
- [ ] Investment decisions executed within 24 hours of deposits

### 4. Yield Generation and Distribution
**BUIDL Reference**: 4.5-5.2% APY distributed to shareholders

**Requirements**:
- **Interest Accrual**: Track daily interest from all fixed income holdings
- **Automatic Compounding**: Add yields to user's fund token balance by default
- **Cash Distribution Option**: Allow users to opt for cash yield payments
- **Yield Calculation**: (Total Interest Earned / Total Fund Value) × 365 days

**Acceptance Criteria**:
- [ ] Yields calculated and accrued daily across all asset types
- [ ] Target APY of 4-5% based on current fixed income market rates
- [ ] Users can toggle between compounding and cash distribution
- [ ] Yield history tracked for tax reporting purposes

## Functional Requirements

### Core Smart Contract: `FundManager`

#### Data Structures

```rust
#[account]
pub struct FundState {
    /// Total assets under management in USD (8 decimals)
    pub total_assets: u64,
    /// Total fund tokens in circulation (8 decimals) 
    pub total_shares: u64,
    /// Current NAV per share (8 decimals, target: 100_000_000 = $1.00)
    pub nav_per_share: u64,
    /// Last NAV update timestamp
    pub last_nav_update: i64,
    /// Administrative authority
    pub admin_authority: Pubkey,
    /// Emergency pause state
    pub is_paused: bool,
    /// Management fee (basis points, e.g., 15 = 0.15%)
    pub management_fee_bps: u16,
    /// Target liquidity ratio (percentage, e.g., 25 = 25%)
    pub target_liquidity_ratio: u8,
    /// Fund inception date
    pub inception_date: i64,
    /// Total yield distributed to date
    pub total_yield_distributed: u64,
    /// Reserve bump
    pub bump: u8,
}

#[account]
pub struct UserFundAccount {
    /// Owner of this fund account
    pub owner: Pubkey,
    /// Fund tokens held (8 decimals)
    pub fund_tokens: u64,
    /// Total USD deposited historically
    pub total_deposited: u64,
    /// Total USD withdrawn historically  
    pub total_withdrawn: u64,
    /// Last deposit timestamp
    pub last_deposit_time: i64,
    /// Yield distribution preference (true = compound, false = cash)
    pub auto_compound: bool,
    /// Account creation timestamp
    pub created_at: i64,
    /// Reserve bump
    pub bump: u8,
}

#[account]
pub struct FixedIncomeAsset {
    /// Asset identifier (CUSIP, ISIN, or custom ID)
    pub asset_id: [u8; 12],
    /// Asset type (Treasury, Corporate, CD, etc.)
    pub asset_type: FixedIncomeAssetType,
    /// Face value in USD (8 decimals)
    pub face_value: u64,
    /// Purchase price in USD (8 decimals)
    pub purchase_price: u64,
    /// Purchase date
    pub purchase_date: i64,
    /// Maturity date
    pub maturity_date: i64,
    /// Current market value (updated daily)
    pub current_value: u64,
    /// Annualized yield rate (4 decimals, e.g., 5000 = 5.00%)
    pub yield_rate: u32,
    /// Interest accrued to date
    pub accrued_interest: u64,
    /// Status (Active, Matured, Sold)
    pub status: AssetStatus,
    /// Issuer information
    pub issuer: Pubkey,
    /// Credit rating (AAA = 1, AA+ = 2, etc.)
    pub credit_rating: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum FixedIncomeAssetType {
    TreasuryBill,
    TreasuryNote,
    TreasuryBond,
    CorporateBond,
    CommercialPaper,
    CertificateOfDeposit,
    MunicipalBond,
    AssetBackedSecurity,
    MortgageBackedSecurity,
}
```

#### Core Functions

##### 1. Fund Operations

```rust
/// Deposit stablecoins and receive fund tokens
/// Mimics BUIDL's same-day settlement
pub fn deposit(
    ctx: Context<Deposit>,
    amount: u64,  // USDC amount (6 decimals)
) -> Result<()>
```

**Logic**:
1. Validate deposit amount ≥ $10
2. Calculate fund tokens: `(amount × 10^8) / nav_per_share`
3. Transfer USDC to fund vault
4. Mint fund tokens to user
5. Update fund state and user account
6. Emit deposit event

```rust
/// Withdraw fund tokens and receive stablecoins
/// Supports same-day settlement up to liquidity limits
pub fn withdraw(
    ctx: Context<Withdraw>, 
    fund_tokens: u64,  // Fund tokens to redeem (8 decimals)
) -> Result<()>
```

**Logic**:
1. Validate user has sufficient fund tokens
2. Calculate withdrawal amount: `(fund_tokens × nav_per_share) / 10^8`
3. Check available liquidity
4. Burn fund tokens
5. Transfer USDC to user
6. Update fund state and user account
7. Emit withdrawal event

##### 2. NAV Management

```rust
/// Update Net Asset Value (daily at 4 PM EST)
/// Mimics BUIDL's daily NAV calculation process
pub fn update_nav(
    ctx: Context<UpdateNAV>,
    asset_values: Vec<AssetValuation>,  // Current values of all fixed income assets
) -> Result<()>
```

**Logic**:
1. Validate caller is authorized (admin or oracle)
2. Calculate total fixed income asset value across all types
3. Add cash reserves
4. Subtract accrued management fees
5. Calculate new NAV: `total_value / total_shares`
6. Update fund state with new NAV
7. Emit NAV update event

##### 3. Fixed Income Asset Management

```rust
/// Purchase fixed income assets with available cash
/// Automates professional fund management across asset types
pub fn invest_in_fixed_income(
    ctx: Context<InvestFixedIncome>,
    assets: Vec<AssetPurchase>,
) -> Result<()>
```

**Logic**:
1. Validate investment parameters for each asset type
2. Check available cash reserves
3. Verify assets meet credit and maturity requirements
4. Execute purchases across different asset classes
5. Update asset records
6. Adjust cash reserves
7. Emit investment event

```rust
/// Handle fixed income asset maturity
/// Automatic reinvestment to maintain yield
pub fn handle_asset_maturity(
    ctx: Context<HandleMaturity>,
    asset_id: Pubkey,
) -> Result<()>
```

**Logic**:
1. Validate asset has matured
2. Calculate maturity proceeds
3. Add proceeds to cash reserves
4. Update asset status to "Matured"
5. Trigger reinvestment if cash exceeds target
6. Emit maturity event

##### 4. Yield Distribution

```rust
/// Distribute daily yield to fund token holders
/// Mimics BUIDL's yield accrual mechanism across all asset types
pub fn distribute_yield(
    ctx: Context<DistributeYield>,
    total_yield: u64,  // Total yield earned today (8 decimals)
) -> Result<()>
```

**Logic**:
1. Validate yield amount against all fixed income asset performance
2. Calculate per-share yield
3. Update NAV to reflect yield distribution
4. For auto-compound users: increase fund token balance
5. For cash distribution users: queue cash payment
6. Update yield tracking metrics
7. Emit yield distribution event

## User Stories

### Primary User Flows

#### Story 1: New Investor Deposit
**As a retail investor**, I want to deposit $1,000 USDC and receive fund tokens so that I can earn yield from a diversified fixed income portfolio.

**Acceptance Criteria**:
- User connects Solana wallet
- User enters $1,000 deposit amount
- System calculates fund tokens based on current NAV (~1,000 tokens at $1.00 NAV)
- Transaction completes within 30 seconds
- User sees updated balance immediately
- Funds are automatically invested across multiple fixed income asset types within 24 hours

#### Story 2: Daily Yield Compounding
**As an investor**, I want my yields to compound automatically so that I maximize my long-term returns.

**Acceptance Criteria**:
- Daily yield calculated based on entire fixed income portfolio performance
- Yield automatically added to user's fund token balance
- No manual intervention required
- Compound interest effect visible in portfolio growth
- Historical yield data available for review

#### Story 3: Same-Day Withdrawal
**As an investor**, I want to withdraw $500 and receive USDC immediately so that I maintain liquidity for other opportunities.

**Acceptance Criteria**:
- User requests withdrawal of $500 worth of fund tokens
- System calculates required fund tokens based on current NAV
- If liquidity available: immediate USDC transfer
- If insufficient liquidity: placed in withdrawal queue with estimated processing time
- User receives confirmation and updated balance

## Performance Requirements

### Transaction Throughput
- **Deposits**: Support 100+ deposits per minute
- **Withdrawals**: Support 50+ withdrawals per minute  
- **NAV Updates**: Complete in <10 seconds across all asset types
- **Yield Distribution**: Process for 10,000+ users in <5 minutes

### Data Precision
- **NAV Calculation**: 8 decimal places (100,000,000 = $1.00)
- **Fund Tokens**: 8 decimal places matching USDC precision scaling
- **Yield Rates**: 4 decimal places (5000 = 5.00% APY)
- **USD Amounts**: 8 decimal places for institutional precision

### Availability
- **Uptime Target**: 99.9% (8.76 hours downtime per year)
- **Deposit Processing**: 24/7 availability
- **Withdrawal Processing**: Business hours for same-day, 24/7 for queued
- **NAV Updates**: Daily at 4 PM EST, emergency updates as needed

## Security Requirements

### Access Controls
- **Multi-signature**: All administrative functions require 3-of-5 signatures
- **Time Locks**: Critical parameter changes have 48-hour delay
- **Emergency Pause**: Immediate halt capability for security incidents
- **Role-based Access**: Segregated duties for different operations

### Data Validation
- **Input Validation**: All user inputs validated and sanitized
- **Overflow Protection**: Safe math for all financial calculations
- **Precision Loss**: Prevent rounding errors in NAV calculations
- **State Consistency**: Atomic updates to prevent inconsistent states

### Audit Trail
- **Event Logging**: All operations emit detailed events
- **State Snapshots**: Daily fund state snapshots for auditing
- **Transaction History**: Complete history of all fund operations
- **Performance Tracking**: Historical NAV and yield data across all asset types

## Integration Points

### External Dependencies
- **USDC Token Program**: SPL token integration for deposits/withdrawals
- **Fixed Income Oracles**: Real-time pricing and maturity data for all asset types
- **Time Oracles**: Accurate timestamp for NAV calculations
- **Yield Calculators**: Interest accrual and distribution algorithms across asset classes

### Protocol Interfaces
- **Fund Management Interface**: Administrative operations
- **User Interface**: Investor deposit/withdrawal operations
- **Oracle Interface**: Multi-asset external data integration
- **Governance Interface**: Parameter updates and upgrades

This comprehensive requirements document provides engineers with detailed specifications to implement a core fund management system that directly mimics BlackRock BUIDL's proven mechanisms while supporting a diversified portfolio of fixed income assets, leveraging Solana's unique advantages for improved accessibility and transparency. 