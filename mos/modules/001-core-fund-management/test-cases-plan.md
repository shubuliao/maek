# Module 001: Core Fund Management - Test Cases Plan

## Overview

This document provides comprehensive test cases for validating the MAEK protocol's core fund management functionality, ensuring exact compliance with BlackRock BUIDL mechanisms including the critical NAV rebase system for both profits and losses.

## Test Environment Setup

### Initial Fund State
```rust
FundState {
    total_assets: 0,
    total_shares: 0,
    nav_per_share: 100_000_000, // $1.00
    cash_reserves: 0,
    fixed_income_value: 0,
    management_fee_bps: 15, // 0.15% annually
    target_liquidity_ratio: 25, // 25%
    is_paused: false,
    total_depositors: 0,
}
```

### Test Accounts
- **Admin**: `11111111111111111111111111111111` (Fund administrator)
- **User A**: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` (Primary test user)
- **User B**: `BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` (Secondary test user)
- **USDC Mint**: Standard USDC token mint (6 decimals)

## Test Category 1: Fund Initialization & Reset

### TC-001: Initialize Fund
**Description**: Test fund initialization with proper parameters
**Prerequisites**: Clean environment, admin authority

**Test Steps**:
1. Call `initialize_fund(management_fee_bps: 15, target_liquidity_ratio: 25)`

**Expected Output**:
```rust
FundState {
    admin_authority: admin.key(),
    nav_per_share: 100_000_000, // $1.00
    management_fee_bps: 15,
    target_liquidity_ratio: 25,
    inception_date: current_timestamp,
    last_nav_update: current_timestamp,
    is_paused: false,
    // All other fields initialized to 0/default
}

// Event emitted
FundInitialized {
    fund_state: fund_state.key(),
    admin: admin.key(),
    inception_date: current_timestamp,
}
```

### TC-002: Fund Reset (Emergency)
**Description**: Test fund reset functionality for emergency situations
**Prerequisites**: Existing fund with some activity

**Test Steps**:
1. Fund has existing deposits and assets
2. Admin calls emergency reset function
3. Verify all user balances are preserved proportionally

**Expected Output**:
- Fund state reset to initial values
- User fund tokens maintain proportional value
- Emergency reset event emitted

## Test Category 2: Purchase (Token Creation) - Deposit Mechanisms

### TC-010: First Deposit (Bootstrap)
**Description**: Test first deposit to empty fund
**Prerequisites**: Initialized fund, User A has 1000 USDC

**Test Steps**:
1. User A deposits 1000 USDC (1_000_000_000 with 6 decimals)
2. Verify fund token minting

**Expected Output**:
```rust
// Calculation: (1000 USDC * 10^8) / 100_000_000 NAV = 1000.00000000 fund tokens
UserFundAccount {
    owner: user_a.key(),
    fund_tokens: 100_000_000_000, // 1000.00000000 tokens
    total_deposited: 100_000_000_000, // $1000.00000000
    deposit_count: 1,
    created_at: current_timestamp,
}

FundState {
    total_assets: 100_000_000_000, // $1000.00000000
    total_shares: 100_000_000_000, // 1000.00000000 tokens
    cash_reserves: 1_000_000_000, // 1000.000000 USDC
    total_depositors: 1,
}

// Event emitted
DepositMade {
    user: user_a.key(),
    amount_usdc: 1_000_000_000,
    fund_tokens_minted: 100_000_000_000,
    nav_per_share: 100_000_000,
    timestamp: current_timestamp,
}
```

### TC-011: Subsequent Deposit at Higher NAV
**Description**: Test deposit when NAV has increased due to yield
**Prerequisites**: Fund with $1000, NAV increased to $1.02

**Setup**:
```rust
FundState {
    total_assets: 102_000_000_000, // $1020.00000000
    total_shares: 100_000_000_000, // 1000.00000000 tokens
    nav_per_share: 102_000_000, // $1.02
}
```

**Test Steps**:
1. User B deposits 510 USDC when NAV = $1.02

**Expected Output**:
```rust
// Calculation: (510 USDC * 10^8) / 102_000_000 NAV = 500.00000000 fund tokens
UserFundAccount (User B) {
    fund_tokens: 50_000_000_000, // 500.00000000 tokens
    total_deposited: 51_000_000_000, // $510.00000000
}

FundState {
    total_assets: 153_000_000_000, // $1530.00000000
    total_shares: 150_000_000_000, // 1500.00000000 tokens
    nav_per_share: 102_000_000, // $1.02 (unchanged)
    cash_reserves: 1_510_000_000, // 1510.000000 USDC
}
```

### TC-012: Minimum Deposit Validation
**Description**: Test minimum deposit enforcement ($10)
**Prerequisites**: Initialized fund

**Test Steps**:
1. User A attempts to deposit 5 USDC (below $10 minimum)

**Expected Output**:
```rust
Error: ErrorCode::DepositTooSmall
// No state changes
// No events emitted
```

### TC-013: Maximum Deposit Validation
**Description**: Test maximum deposit limit ($1M)
**Prerequisites**: Initialized fund

**Test Steps**:
1. User A attempts to deposit 2,000,000 USDC (above $1M limit)

**Expected Output**:
```rust
Error: ErrorCode::DepositTooLarge
// No state changes
```

## Test Category 3: Distribution via NAV Rebase (Profit)

### TC-020: Daily Yield Distribution (Auto-Compound)
**Description**: Test BUIDL-style yield distribution through NAV increase
**Prerequisites**: Fund with $10,000, earning 4.5% APY

**Setup**:
```rust
FundState {
    total_assets: 1_000_000_000_000, // $10,000.00000000
    total_shares: 1_000_000_000_000, // 10,000.00000000 tokens
    nav_per_share: 100_000_000, // $1.00
}
```

**Test Steps**:
1. Daily yield calculation: ($10,000 * 4.5% / 365) = $1.23287671
2. Call `update_nav(net_daily_pnl: 123_287_671)` // $1.23287671 profit

**Expected Output**:
```rust
FundState {
    total_assets: 1_000_123_287_671, // $10,001.23287671
    total_shares: 1_000_000_000_000, // 10,000.00000000 tokens (unchanged)
    nav_per_share: 100_012_328, // $1.00012328 (rebase effect)
    daily_yield_history[today]: 123_287_671,
    total_yield_distributed: 123_287_671,
}

// Event emitted
NAVUpdated {
    new_nav: 100_012_328,
    previous_nav: 100_000_000,
    nav_change: 12_328, // Positive change
    daily_pnl: 123_287_671,
    timestamp: current_timestamp,
}
```

### TC-021: User Benefit from NAV Rebase
**Description**: Verify users automatically benefit from NAV increase
**Prerequisites**: User A has 1000 tokens before rebase in TC-020

**Test Steps**:
1. After NAV rebase to $1.00012328
2. Check User A's effective balance

**Expected Output**:
```rust
UserFundAccount {
    fund_tokens: 100_000_000_000, // 1000.00000000 tokens (unchanged)
    // Effective value = 1000 tokens * $1.00012328 = $1000.12328
}

// If User A withdraws all tokens:
withdrawal_amount = (100_000_000_000 * 100_012_328) / 100_000_000 = 1000.12328 USDC
```

### TC-022: Compound Yield Over Multiple Days
**Description**: Test compounding effect over time
**Prerequisites**: Fund with yield from TC-020

**Test Steps**:
1. Day 1: Yield $1.23 → NAV = $1.00012328
2. Day 2: Yield $1.23 on new base → NAV = $1.00024659
3. Day 3: Yield $1.23 on new base → NAV = $1.00036993

**Expected Output**:
```rust
// After 3 days of compounding
FundState {
    nav_per_share: 100_036_993, // $1.00036993
    total_yield_distributed: 369_930_013, // Total cumulative yield
}
```

## Test Category 4: Rebase Loss Handling

### TC-030: Market Loss Through NAV Decrease
**Description**: Test BUIDL-style loss handling through NAV reduction
**Prerequisites**: Fund with $10,000 at NAV $1.00

**Setup**:
```rust
FundState {
    total_assets: 1_000_000_000_000, // $10,000.00000000
    total_shares: 1_000_000_000_000, // 10,000.00000000 tokens
    nav_per_share: 100_000_000, // $1.00
}
```

**Test Steps**:
1. Fixed income assets lose value: -$50.00
2. Call `update_nav(net_daily_pnl: -5_000_000_000)` // -$50.00 loss

**Expected Output**:
```rust
FundState {
    total_assets: 999_500_000_000, // $9,950.00000000
    total_shares: 1_000_000_000_000, // 10,000.00000000 tokens (unchanged)
    nav_per_share: 99_950_000, // $0.9995 (rebase loss effect)
    daily_yield_history[today]: 0, // Losses recorded as zero for APY
}

// Event emitted
NAVUpdated {
    new_nav: 99_950_000,
    previous_nav: 100_000_000,
    nav_change: -50_000, // Negative change
    daily_pnl: -5_000_000_000,
    timestamp: current_timestamp,
}
```

### TC-031: User Loss from NAV Rebase
**Description**: Verify users automatically bear losses through NAV decrease
**Prerequisites**: User A has 1000 tokens before loss in TC-030

**Test Steps**:
1. After NAV rebase to $0.9995
2. Check User A's effective balance

**Expected Output**:
```rust
UserFundAccount {
    fund_tokens: 100_000_000_000, // 1000.00000000 tokens (unchanged)
    // Effective value = 1000 tokens * $0.9995 = $999.50
}

// If User A withdraws all tokens:
withdrawal_amount = (100_000_000_000 * 99_950_000) / 100_000_000 = 999.50 USDC
```

### TC-032: Extreme Loss Scenario
**Description**: Test handling of severe market losses
**Prerequisites**: Fund with $10,000

**Test Steps**:
1. Extreme loss: -$500.00 (5% loss)
2. Call `update_nav(net_daily_pnl: -50_000_000_000)`

**Expected Output**:
```rust
FundState {
    total_assets: 950_000_000_000, // $9,500.00000000
    nav_per_share: 95_000_000, // $0.95 (5% loss)
}

// Validation: NAV should not go below $0.95 limit
// If loss would push NAV below $0.95, transaction should fail
```

### TC-033: Loss Recovery Scenario
**Description**: Test NAV recovery after losses
**Prerequisites**: Fund at NAV $0.995 from previous loss

**Test Steps**:
1. Strong yield day: +$75.00 profit
2. Call `update_nav(net_daily_pnl: 7_500_000_000)`

**Expected Output**:
```rust
FundState {
    nav_per_share: 100_200_000, // $1.002 (recovered and exceeded $1.00)
    total_assets: 1_002_000_000_000, // $10,020.00000000
}
```

## Test Category 5: Withdrawal (Token Burning)

### TC-040: Full Withdrawal at NAV $1.00
**Description**: Test complete user withdrawal at par NAV
**Prerequisites**: User A has 1000 tokens, NAV = $1.00

**Test Steps**:
1. User A withdraws all 100_000_000_000 fund tokens

**Expected Output**:
```rust
// Calculation: (100_000_000_000 * 100_000_000) / 100_000_000 = 1000.00 USDC
UserFundAccount {
    fund_tokens: 0,
    total_withdrawn: 100_000_000_000, // $1000.00000000
    withdrawal_count: 1,
}

FundState {
    total_shares: 0, // All tokens burned
    cash_reserves: 0, // All cash withdrawn
    total_depositors: 0, // No remaining depositors
}

// Event emitted
WithdrawalMade {
    user: user_a.key(),
    fund_tokens_burned: 100_000_000_000,
    amount_usdc: 1_000_000_000,
    nav_per_share: 100_000_000,
    timestamp: current_timestamp,
}
```

### TC-041: Partial Withdrawal at Higher NAV
**Description**: Test partial withdrawal when NAV has increased
**Prerequisites**: User A has 1000 tokens, NAV = $1.02

**Test Steps**:
1. User A withdraws 50_000_000_000 tokens (500 tokens)

**Expected Output**:
```rust
// Calculation: (50_000_000_000 * 102_000_000) / 100_000_000 = 510.00 USDC
UserFundAccount {
    fund_tokens: 50_000_000_000, // 500.00000000 tokens remaining
    total_withdrawn: 51_000_000_000, // $510.00000000
}

FundState {
    total_shares: reduced by 50_000_000_000,
    cash_reserves: reduced by 510_000_000,
}
```

### TC-042: Withdrawal at Loss NAV
**Description**: Test withdrawal when user has unrealized losses
**Prerequisites**: User A has 1000 tokens, NAV = $0.995

**Test Steps**:
1. User A withdraws all tokens at loss

**Expected Output**:
```rust
// Calculation: (100_000_000_000 * 99_500_000) / 100_000_000 = 995.00 USDC
WithdrawalMade {
    amount_usdc: 995_000_000, // User receives $995 (realizes $5 loss)
    fund_tokens_burned: 100_000_000_000,
    nav_per_share: 99_500_000,
}
```

### TC-043: Insufficient Liquidity Withdrawal
**Description**: Test withdrawal when insufficient cash reserves
**Prerequisites**: Fund with 90% assets invested, 10% cash

**Test Steps**:
1. Large withdrawal request exceeding cash reserves

**Expected Output**:
```rust
Error: ErrorCode::InsufficientLiquidity
// Transaction fails, no state changes
// User must wait for asset maturities or smaller withdrawal
```

### TC-044: Withdrawal Validation Errors
**Description**: Test withdrawal input validation

**Test Cases**:
1. **Zero withdrawal**: `withdraw(0)` → `ErrorCode::WithdrawAmountZero`
2. **Insufficient tokens**: User has 100 tokens, tries to withdraw 200 → `ErrorCode::InsufficientFundTokens`
3. **Paused fund**: Fund is paused → `ErrorCode::FundPaused`

## Test Category 6: Management Fee Handling

### TC-050: Daily Management Fee Calculation
**Description**: Test daily management fee deduction from NAV
**Prerequisites**: Fund with $100,000, 0.15% annual fee

**Test Steps**:
1. Daily fee = ($100,000 * 15 basis points) / 365 = $0.41096
2. Update NAV with fee deduction

**Expected Output**:
```rust
// Gross assets: $100,000
// Daily fee: $0.41096
// Net assets after fee: $99,999.58904
management_fee_deducted = 4_109_589, // $0.41095890 (8 decimals)

FundState {
    total_assets: reduced by management fee,
    nav_per_share: reflects fee impact,
}
```

## Test Category 7: Edge Cases & Error Conditions

### TC-060: NAV Boundary Validations
**Description**: Test NAV limits enforcement

**Test Cases**:
1. **NAV too low**: Attempt to set NAV below $0.95 → `ErrorCode::NAVTooLow`
2. **NAV too high**: Attempt to set NAV above $1.05 → `ErrorCode::NAVTooHigh`
3. **Frequent updates**: Update NAV twice within 23 hours → `ErrorCode::NAVUpdateTooFrequent`

### TC-061: Mathematical Overflow Protection
**Description**: Test overflow protection in calculations

**Test Cases**:
1. **Massive deposit**: Attempt deposit causing token overflow
2. **Huge NAV calculation**: Values approaching u64::MAX
3. **Precision loss**: Verify no precision loss in calculations

### TC-062: State Consistency Validation
**Description**: Test fund state consistency checks

**Test Steps**:
1. Attempt to create inconsistent state (total_assets ≠ cash + fixed_income)
2. Verify automatic validation triggers

**Expected Output**:
```rust
Error: ErrorCode::MathOverflow
// Transaction reverted, state remains consistent
```

## Test Category 8: Integration Test Flows

### TC-070: Complete BUIDL Mechanism Flow
**Description**: End-to-end test of BUIDL-style operations
**Duration**: 30-day simulation

**Test Flow**:
```
Day 1:  Initialize fund
Day 2:  User A deposits $10,000 → 10,000 tokens at $1.00 NAV
Day 3:  User B deposits $5,000 → 5,000 tokens at $1.00 NAV
Day 4:  Daily yield +$20.55 → NAV = $1.00137
Day 5:  User C deposits $2,000 → 1,997.26 tokens at $1.00137 NAV
Day 10: Market loss -$50 → NAV = $0.99877
Day 15: Strong yield +$75 → NAV = $1.00315
Day 20: User A withdraws 5,000 tokens → receives $5,015.75
Day 30: Final NAV calculation and yield distribution
```

**Expected Final State**:
```rust
FundState {
    total_depositors: 2, // User B and C remain
    nav_per_share: ~100_500_000, // ~$1.005 after 30 days of 4.5% APY
    total_yield_distributed: ~41_095_890, // ~$41.10 total yield
}
```

### TC-071: Stress Test - High Volume Operations
**Description**: Test system under high transaction volume

**Test Steps**:
1. 100 concurrent deposits of varying amounts
2. Daily NAV updates with market volatility
3. 50 concurrent withdrawals
4. Verify all calculations remain accurate

**Expected Output**:
- All transactions process successfully
- NAV calculations remain precise
- Fund state consistency maintained
- Events properly emitted for all operations

### TC-072: Multi-User Yield Scenarios
**Description**: Test yield distribution across multiple users

**Setup**:
- User A: 1,000 tokens (deposited Day 1)
- User B: 500 tokens (deposited Day 5 at higher NAV)
- User C: 2,000 tokens (deposited Day 10 at different NAV)

**Test Steps**:
1. Daily yield events over 30 days
2. Verify each user benefits proportionally to their token holdings
3. Test withdrawals at different times and NAV levels

**Expected Output**:
- Users automatically receive proportional yield through NAV appreciation
- No separate dividend calculations required
- Withdrawal amounts reflect current NAV accurately

## Test Execution Framework

### Automated Test Suite Structure
```rust
mod tests {
    mod fund_initialization;
    mod deposit_mechanisms;
    mod nav_rebase_profits;
    mod nav_rebase_losses;
    mod withdrawal_mechanisms;
    mod management_fees;
    mod edge_cases;
    mod integration_flows;
}
```

### Test Data Generation
- **Randomized amounts**: Generate realistic deposit/withdrawal amounts
- **Market scenarios**: Simulate various market conditions
- **Time-based tests**: Multi-day scenarios with proper timestamp progression
- **Precision validation**: Verify all calculations to 8-decimal precision

### Success Criteria
1. ✅ All unit tests pass with 100% coverage
2. ✅ Integration tests complete without errors
3. ✅ Mathematical precision maintained throughout
4. ✅ BUIDL mechanism compliance verified
5. ✅ Edge cases handled gracefully
6. ✅ State consistency maintained under all conditions

This comprehensive test plan ensures the MAEK protocol accurately implements BlackRock BUIDL's core mechanisms while supporting diversified fixed income assets with institutional-grade precision and reliability. 