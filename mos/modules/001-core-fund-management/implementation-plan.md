# Module 001: Core Fund Management - Implementation Plan

## Overview

This implementation plan breaks down the core fund management module into manageable work units that can be completed incrementally. Each work unit is designed to be ≤10 files and ≤1000 logical lines of code, ensuring focused development and testing.

## Work Unit Breakdown

### Work Unit 1: Project Setup & Basic Structure
**Estimated LOC**: ~200 lines
**Files**: 6 files
**Duration**: 1-2 days

#### Deliverables:
1. **Cargo.toml** - Anchor project configuration
2. **lib.rs** - Main program entry point with module declarations
3. **error.rs** - Custom error types
4. **events.rs** - Event definitions
5. **state/mod.rs** - State module structure
6. **instructions/mod.rs** - Instructions module structure

#### Implementation Steps:

**Step 1.1: Initialize Anchor Project**
```bash
anchor init fund_manager --template multiple
cd fund_manager/programs/fund_manager
```

**Step 1.2: Configure Dependencies (Cargo.toml)**
```toml
[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
```

**Step 1.3: Create lib.rs**
```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

#[program]
pub mod fund_manager {
    use super::*;

    pub fn initialize_fund(
        ctx: Context<InitializeFund>,
        management_fee_bps: u16,
        target_liquidity_ratio: u8,
    ) -> Result<()> {
        instructions::initialize_fund(ctx, management_fee_bps, target_liquidity_ratio)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, fund_tokens: u64) -> Result<()> {
        instructions::withdraw(ctx, fund_tokens)
    }

    pub fn update_nav(
        ctx: Context<UpdateNAV>,
        new_treasury_bill_value: u64,
        accrued_yield: u64,
    ) -> Result<()> {
        instructions::update_nav(ctx, new_treasury_bill_value, accrued_yield)
    }
}
```

**Step 1.4: Define Errors (error.rs)**
```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Deposit amount is too small (minimum $10)")]
    DepositTooSmall,
    
    #[msg("Fund is currently paused")]
    FundPaused,
    
    #[msg("Withdrawal amount cannot be zero")]
    WithdrawAmountZero,
    
    #[msg("Insufficient fund tokens for withdrawal")]
    InsufficientFundTokens,
    
    #[msg("Insufficient liquidity for immediate withdrawal")]
    InsufficientLiquidity,
    
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("NAV update too frequent (must wait 23 hours)")]
    NAVUpdateTooFrequent,
    
    #[msg("Mathematical overflow in calculation")]
    MathOverflow,
}
```

**Step 1.5: Define Events (events.rs)**
```rust
use anchor_lang::prelude::*;

#[event]
pub struct FundInitialized {
    pub fund_state: Pubkey,
    pub admin: Pubkey,
    pub inception_date: i64,
}

#[event]
pub struct DepositMade {
    pub user: Pubkey,
    pub amount_usdc: u64,
    pub fund_tokens_minted: u64,
    pub nav_per_share: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawalMade {
    pub user: Pubkey,
    pub fund_tokens_burned: u64,
    pub amount_usdc: u64,
    pub nav_per_share: u64,
    pub timestamp: i64,
}

#[event]
pub struct NAVUpdated {
    pub new_nav: u64,
    pub total_assets: u64,
    pub treasury_bill_value: u64,
    pub cash_reserves: u64,
    pub accrued_yield: u64,
    pub timestamp: i64,
}
```

### Work Unit 2: Account Structures
**Estimated LOC**: ~300 lines
**Files**: 3 files
**Duration**: 1-2 days

#### Deliverables:
1. **state/fund_state.rs** - Main fund state account
2. **state/user_account.rs** - User fund account structure
3. **state/treasury_bill.rs** - Treasury bill representation

#### Implementation Steps:

**Step 2.1: Create FundState (state/fund_state.rs)**
```rust
use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct FundState {
    /// Administrative authority (multisig)
    pub admin_authority: Pubkey,
    /// Fund token mint address
    pub fund_token_mint: Pubkey,
    /// USDC vault for deposits/withdrawals
    pub usdc_vault: Pubkey,
    /// Total assets under management in USD (8 decimals)
    pub total_assets: u64,
    /// Total fund tokens in circulation (8 decimals)
    pub total_shares: u64,
    /// Current NAV per share (8 decimals, target: 100_000_000 = $1.00)
    pub nav_per_share: u64,
    /// Last NAV update timestamp
    pub last_nav_update: i64,
    /// Cash reserves in USDC (6 decimals)
    pub cash_reserves: u64,
    /// Total value of treasury bills (8 decimals)
    pub treasury_bill_value: u64,
    /// Management fee in basis points (15 = 0.15%)
    pub management_fee_bps: u16,
    /// Target liquidity ratio (25 = 25%)
    pub target_liquidity_ratio: u8,
    /// Emergency pause state
    pub is_paused: bool,
    /// Fund inception date
    pub inception_date: i64,
    /// Total yield distributed to date (8 decimals)
    pub total_yield_distributed: u64,
    /// Daily yield tracking for APY calculation
    pub daily_yield_history: [u64; 365],
    /// Current day index in yield history array
    pub yield_history_index: u16,
    /// Total number of unique depositors
    pub total_depositors: u32,
    /// Reserved space for future upgrades
    pub reserved: [u8; 128],
    /// Account bump
    pub bump: u8,
}

impl FundState {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 2 + 1 + 1 + 8 + 8 + 365 * 8 + 2 + 4 + 128 + 1;
}
```

**Step 2.2: Create UserFundAccount (state/user_account.rs)**
```rust
use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct UserFundAccount {
    /// Owner of this fund account
    pub owner: Pubkey,
    /// Fund tokens held (8 decimals)
    pub fund_tokens: u64,
    /// Total USD deposited historically (8 decimals)
    pub total_deposited: u64,
    /// Total USD withdrawn historically (8 decimals)
    pub total_withdrawn: u64,
    /// Last deposit timestamp
    pub last_deposit_time: i64,
    /// Last withdrawal timestamp
    pub last_withdrawal_time: i64,
    /// Yield distribution preference (true = auto-compound, false = cash)
    pub auto_compound: bool,
    /// Pending cash yield to be claimed (6 decimals USDC)
    pub pending_yield: u64,
    /// Total yield earned to date (8 decimals)
    pub total_yield_earned: u64,
    /// Account creation timestamp
    pub created_at: i64,
    /// Number of deposits made
    pub deposit_count: u32,
    /// Number of withdrawals made
    pub withdrawal_count: u32,
    /// Reserved space for future features
    pub reserved: [u8; 64],
    /// Account bump
    pub bump: u8,
}

impl UserFundAccount {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 8 + 8 + 4 + 4 + 64 + 1;
}
```

**Step 2.3: Create TreasuryBill (state/treasury_bill.rs)**
```rust
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TreasuryBillStatus {
    Active,
    Matured,
    Sold,
}

impl Default for TreasuryBillStatus {
    fn default() -> Self {
        TreasuryBillStatus::Active
    }
}

#[account]
#[derive(Default)]
pub struct TreasuryBill {
    /// CUSIP identifier (9 characters)
    pub cusip: [u8; 9],
    /// Face value in USD (8 decimals)
    pub face_value: u64,
    /// Purchase price in USD (8 decimals)
    pub purchase_price: u64,
    /// Purchase date timestamp
    pub purchase_date: i64,
    /// Maturity date timestamp
    pub maturity_date: i64,
    /// Current market value (8 decimals)
    pub current_value: u64,
    /// Annualized yield rate (4 decimals, e.g., 5000 = 5.00%)
    pub yield_rate: u32,
    /// Interest accrued to date (8 decimals)
    pub accrued_interest: u64,
    /// Last interest calculation date
    pub last_interest_calculation: i64,
    /// Bill status
    pub status: TreasuryBillStatus,
    /// Days to maturity (updated daily)
    pub days_to_maturity: u16,
    /// Credit rating (AAA = 1, AA+ = 2, etc.)
    pub credit_rating: u8,
    /// Reserved space
    pub reserved: [u8; 32],
    /// Account bump
    pub bump: u8,
}

impl TreasuryBill {
    pub const LEN: usize = 8 + 9 + 8 + 8 + 8 + 8 + 8 + 4 + 8 + 8 + 1 + 2 + 1 + 32 + 1;
}
```

### Work Unit 3: Utility Functions & Calculations
**Estimated LOC**: ~200 lines
**Files**: 2 files
**Duration**: 1 day

#### Deliverables:
1. **utils/mod.rs** - Utility module exports
2. **utils/calculations.rs** - NAV and financial calculations

#### Implementation Steps:

**Step 3.1: Create calculations.rs**
```rust
use anchor_lang::prelude::*;
use crate::error::ErrorCode;

/// Calculate fund tokens for a given deposit amount
pub fn calculate_fund_tokens(
    deposit_amount_usdc: u64,  // 6 decimals
    nav_per_share: u64,        // 8 decimals
) -> Result<u64> {
    let deposit_amount_8_decimals = (deposit_amount_usdc as u128) * 100;
    let fund_tokens = deposit_amount_8_decimals * 100_000_000 / (nav_per_share as u128);
    
    if fund_tokens > u64::MAX as u128 {
        return Err(ErrorCode::MathOverflow.into());
    }
    
    Ok(fund_tokens as u64)
}

/// Calculate withdrawal amount for given fund tokens
pub fn calculate_withdrawal_amount(
    fund_tokens: u64,          // 8 decimals
    nav_per_share: u64,        // 8 decimals
) -> Result<u64> {
    let withdrawal_amount = (fund_tokens as u128) * (nav_per_share as u128) / 100_000_000;
    let withdrawal_amount_usdc = withdrawal_amount / 100; // Convert to 6 decimals
    
    if withdrawal_amount_usdc > u64::MAX as u128 {
        return Err(ErrorCode::MathOverflow.into());
    }
    
    Ok(withdrawal_amount_usdc as u64)
}

/// Calculate annual percentage yield (APY)
pub fn calculate_apy(daily_yields: &[u64; 365], total_assets: u64) -> u32 {
    let total_annual_yield: u128 = daily_yields.iter().map(|&x| x as u128).sum();
    
    if total_assets == 0 {
        return 0;
    }
    
    let apy = (total_annual_yield * 10000) / (total_assets as u128);
    std::cmp::min(apy as u32, u32::MAX)
}

/// Calculate current liquidity ratio
pub fn calculate_liquidity_ratio(cash_reserves: u64, total_assets: u64) -> u8 {
    if total_assets == 0 {
        return 100;
    }
    
    let cash_usd_8_decimals = (cash_reserves as u128) * 100;
    let ratio = (cash_usd_8_decimals * 100) / (total_assets as u128);
    std::cmp::min(ratio as u8, 100)
}
```

### Work Unit 4: Initialize Fund Instruction
**Estimated LOC**: ~150 lines
**Files**: 1 file
**Duration**: 1 day

#### Deliverables:
1. **instructions/initialize_fund.rs** - Fund initialization logic

#### Implementation Steps:

**Step 4.1: Create initialization instruction**
```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::FundState;
use crate::events::FundInitialized;

#[derive(Accounts)]
pub struct InitializeFund<'info> {
    #[account(
        init,
        payer = admin,
        space = FundState::LEN,
        seeds = [b"fund_state"],
        bump
    )]
    pub fund_state: Account<'info, FundState>,
    
    #[account(
        init,
        payer = admin,
        mint::decimals = 8,
        mint::authority = fund_state,
        seeds = [b"fund_token_mint"],
        bump
    )]
    pub fund_token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = admin,
        token::mint = usdc_mint,
        token::authority = fund_state,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_fund(
    ctx: Context<InitializeFund>,
    management_fee_bps: u16,
    target_liquidity_ratio: u8,
) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    
    fund_state.admin_authority = ctx.accounts.admin.key();
    fund_state.fund_token_mint = ctx.accounts.fund_token_mint.key();
    fund_state.usdc_vault = ctx.accounts.usdc_vault.key();
    fund_state.nav_per_share = 100_000_000; // $1.00 initial NAV
    fund_state.management_fee_bps = management_fee_bps;
    fund_state.target_liquidity_ratio = target_liquidity_ratio;
    fund_state.inception_date = Clock::get()?.unix_timestamp;
    fund_state.last_nav_update = Clock::get()?.unix_timestamp;
    fund_state.bump = *ctx.bumps.get("fund_state").unwrap();
    
    emit!(FundInitialized {
        fund_state: fund_state.key(),
        admin: ctx.accounts.admin.key(),
        inception_date: fund_state.inception_date,
    });
    
    Ok(())
}
```

### Work Unit 5: Deposit Instruction
**Estimated LOC**: ~180 lines
**Files**: 1 file
**Duration**: 1-2 days

#### Deliverables:
1. **instructions/deposit.rs** - Deposit functionality with fund token minting

#### Implementation Steps:

**Step 5.1: Implement deposit instruction**
```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo};
use crate::state::{FundState, UserFundAccount};
use crate::events::DepositMade;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub fund_state: Account<'info, FundState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = UserFundAccount::LEN,
        seeds = [b"user_fund_account", user.key().as_ref()],
        bump
    )]
    pub user_fund_account: Account<'info, UserFundAccount>,
    
    #[account(mut)]
    pub fund_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        token::mint = usdc_mint,
        token::authority = user
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = user,
        token::mint = fund_token_mint,
        token::authority = user,
        seeds = [b"user_fund_token_account", user.key().as_ref()],
        bump
    )]
    pub user_fund_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub usdc_vault: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    let user_account = &mut ctx.accounts.user_fund_account;
    
    // Validate deposit amount (minimum $10)
    require!(amount >= 10_000_000, ErrorCode::DepositTooSmall);
    require!(!fund_state.is_paused, ErrorCode::FundPaused);
    
    // Calculate fund tokens to mint
    let amount_usd_8_decimals = (amount as u128) * 100;
    let fund_tokens = amount_usd_8_decimals * 100_000_000 / (fund_state.nav_per_share as u128);
    let fund_tokens = fund_tokens as u64;
    
    // Transfer USDC from user to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_usdc_account.to_account_info(),
        to: ctx.accounts.usdc_vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;
    
    // Mint fund tokens to user
    let seeds = &[b"fund_state", &[fund_state.bump]];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = MintTo {
        mint: ctx.accounts.fund_token_mint.to_account_info(),
        to: ctx.accounts.user_fund_token_account.to_account_info(),
        authority: fund_state.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::mint_to(cpi_ctx, fund_tokens)?;
    
    // Update fund state
    fund_state.total_assets += amount_usd_8_decimals as u64;
    fund_state.total_shares += fund_tokens;
    fund_state.cash_reserves += amount;
    
    // Initialize user account if needed
    if user_account.owner == Pubkey::default() {
        user_account.owner = ctx.accounts.user.key();
        user_account.created_at = Clock::get()?.unix_timestamp;
        user_account.auto_compound = true;
        user_account.bump = *ctx.bumps.get("user_fund_account").unwrap();
        fund_state.total_depositors += 1;
    }
    
    // Update user account
    user_account.fund_tokens += fund_tokens;
    user_account.total_deposited += amount_usd_8_decimals as u64;
    user_account.last_deposit_time = Clock::get()?.unix_timestamp;
    user_account.deposit_count += 1;
    
    emit!(DepositMade {
        user: ctx.accounts.user.key(),
        amount_usdc: amount,
        fund_tokens_minted: fund_tokens,
        nav_per_share: fund_state.nav_per_share,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

### Work Unit 6: Withdraw Instruction
**Estimated LOC**: ~150 lines
**Files**: 1 file
**Duration**: 1-2 days

#### Deliverables:
1. **instructions/withdraw.rs** - Withdrawal functionality with fund token burning

### Work Unit 7: Update NAV Instruction
**Estimated LOC**: ~120 lines
**Files**: 1 file
**Duration**: 1 day

#### Deliverables:
1. **instructions/update_nav.rs** - Daily NAV calculation and update

### Work Unit 8: Integration & Testing
**Estimated LOC**: ~300 lines
**Files**: 3 files
**Duration**: 2-3 days

#### Deliverables:
1. **tests/integration_tests.rs** - Comprehensive integration tests
2. **tests/unit_tests.rs** - Unit tests for calculations
3. **scripts/deploy.ts** - Deployment scripts

## Development Timeline

### Phase 1: Foundation (Week 1)
- **Day 1-2**: Work Unit 1 (Project Setup)
- **Day 3-4**: Work Unit 2 (Account Structures)
- **Day 5**: Work Unit 3 (Utility Functions)

### Phase 2: Core Functions (Week 2)
- **Day 1**: Work Unit 4 (Initialize Fund)
- **Day 2-3**: Work Unit 5 (Deposit Instruction)
- **Day 4-5**: Work Unit 6 (Withdraw Instruction)

### Phase 3: NAV & Testing (Week 3)
- **Day 1**: Work Unit 7 (Update NAV)
- **Day 2-4**: Work Unit 8 (Integration & Testing)
- **Day 5**: Code review and optimization

## Testing Strategy

### Unit Tests
- Test all calculation functions with edge cases
- Validate account initialization
- Check error conditions

### Integration Tests
- End-to-end deposit/withdrawal flow
- NAV update scenarios
- Multi-user interactions
- Edge case handling

### Security Tests
- Access control validation
- Mathematical overflow protection
- State consistency checks
- Reentrancy protection

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Code review approved
- [ ] Documentation updated

### Deployment Steps
1. Deploy to Solana devnet
2. Run comprehensive tests
3. Deploy to mainnet
4. Initialize fund with parameters
5. Monitor initial operations

### Post-deployment
- [ ] Monitor fund operations
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Plan next module integration

## Success Criteria

### Technical Metrics
- All functions execute successfully
- Gas costs within expected ranges
- No security vulnerabilities
- Performance meets requirements

### Business Metrics
- NAV calculations match BlackRock BUIDL precision
- Same-day settlement for deposits/withdrawals
- Accurate yield tracking and distribution
- User experience comparable to traditional finance

This implementation plan provides a clear roadmap for building the core fund management system with specific work units that can be completed incrementally while maintaining code quality and security standards. 