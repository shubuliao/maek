# Module 001: Core Fund Management - Technical Design

## Overview

This document provides the detailed technical specifications for implementing the core fund management system on Solana using the Anchor framework. The design directly mimics BlackRock BUIDL's mechanisms while leveraging Solana's unique capabilities for improved performance and transparency.

## Smart Contract Architecture

### Contract Structure

```
fund_manager/
├── lib.rs                 // Main program entry point
├── instructions/          // Instruction handlers
│   ├── mod.rs
│   ├── deposit.rs        // Deposit handling
│   ├── withdraw.rs       // Withdrawal handling
│   ├── update_nav.rs     // NAV updates
│   ├── distribute_yield.rs // Yield distribution
│   └── admin.rs          // Administrative functions
├── state/                // Account structures
│   ├── mod.rs
│   ├── fund_state.rs     // Main fund state
│   ├── user_account.rs   // User fund accounts
│   └── treasury_bill.rs  // Treasury bill records
├── error.rs              // Custom error types
├── events.rs             // Event definitions
└── utils/                // Utility functions
    ├── mod.rs
    ├── calculations.rs    // NAV and yield calculations
    └── validation.rs      // Input validation
```

## Account Structures

### 1. FundState Account

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
    
    /// Treasury bill vault for investments
    pub treasury_vault: Pubkey,
    
    /// Total assets under management in USD (8 decimals)
    /// Includes cash + treasury bill value
    pub total_assets: u64,
    
    /// Total fund tokens in circulation (8 decimals)
    pub total_shares: u64,
    
    /// Current NAV per share (8 decimals)
    /// Target: 100_000_000 = $1.00
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
    pub daily_yield_history: [u64; 365], // Last 365 days of yield
    
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
    pub const LEN: usize = 8 + // discriminator
        32 + // admin_authority
        32 + // fund_token_mint
        32 + // usdc_vault
        32 + // treasury_vault
        8 + // total_assets
        8 + // total_shares
        8 + // nav_per_share
        8 + // last_nav_update
        8 + // cash_reserves
        8 + // treasury_bill_value
        2 + // management_fee_bps
        1 + // target_liquidity_ratio
        1 + // is_paused
        8 + // inception_date
        8 + // total_yield_distributed
        365 * 8 + // daily_yield_history
        2 + // yield_history_index
        4 + // total_depositors
        128 + // reserved
        1; // bump
}
```

### 2. UserFundAccount

```rust
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
    
    /// Yield distribution preference
    /// true = auto-compound, false = cash distribution
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
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        8 + // fund_tokens
        8 + // total_deposited
        8 + // total_withdrawn
        8 + // last_deposit_time
        8 + // last_withdrawal_time
        1 + // auto_compound
        8 + // pending_yield
        8 + // total_yield_earned
        8 + // created_at
        4 + // deposit_count
        4 + // withdrawal_count
        64 + // reserved
        1; // bump
}
```

### 3. TreasuryBill Account

```rust
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
    /// Updated daily via oracle
    pub current_value: u64,
    
    /// Annualized yield rate (4 decimals)
    /// e.g., 5000 = 5.00%
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
    pub const LEN: usize = 8 + // discriminator
        9 + // cusip
        8 + // face_value
        8 + // purchase_price
        8 + // purchase_date
        8 + // maturity_date
        8 + // current_value
        4 + // yield_rate
        8 + // accrued_interest
        8 + // last_interest_calculation
        1 + // status
        2 + // days_to_maturity
        1 + // credit_rating
        32 + // reserved
        1; // bump
}
```

## Core Instructions

### 1. Initialize Fund

```rust
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

### 2. Deposit Function

```rust
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
    require!(amount >= 10_000_000, ErrorCode::DepositTooSmall); // 10 USDC (6 decimals)
    require!(!fund_state.is_paused, ErrorCode::FundPaused);
    
    // Calculate fund tokens to mint
    // fund_tokens = (amount_usd_8_decimals / nav_per_share) * 10^8
    let amount_usd_8_decimals = (amount as u128) * 100; // Convert 6 decimals to 8 decimals
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
    let seeds = &[
        b"fund_state",
        &[fund_state.bump],
    ];
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
        user_account.auto_compound = true; // Default to auto-compound
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

### 3. Withdraw Function

```rust
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub fund_state: Account<'info, FundState>,
    
    #[account(
        mut,
        seeds = [b"user_fund_account", user.key().as_ref()],
        bump = user_fund_account.bump
    )]
    pub user_fund_account: Account<'info, UserFundAccount>,
    
    #[account(mut)]
    pub fund_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        token::mint = fund_token_mint,
        token::authority = user
    )]
    pub user_fund_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = usdc_mint,
        token::authority = user
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub usdc_vault: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

pub fn withdraw(ctx: Context<Withdraw>, fund_tokens: u64) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    let user_account = &mut ctx.accounts.user_fund_account;
    
    // Validation
    require!(!fund_state.is_paused, ErrorCode::FundPaused);
    require!(fund_tokens > 0, ErrorCode::WithdrawAmountZero);
    require!(user_account.fund_tokens >= fund_tokens, ErrorCode::InsufficientFundTokens);
    
    // Calculate withdrawal amount in USD
    // withdrawal_amount = (fund_tokens * nav_per_share) / 10^8
    let withdrawal_amount_usd = (fund_tokens as u128) * (fund_state.nav_per_share as u128) / 100_000_000;
    let withdrawal_amount_usdc = (withdrawal_amount_usd / 100) as u64; // Convert to 6 decimals
    
    // Check liquidity
    require!(fund_state.cash_reserves >= withdrawal_amount_usdc, ErrorCode::InsufficientLiquidity);
    
    // Burn fund tokens
    let cpi_accounts = Burn {
        mint: ctx.accounts.fund_token_mint.to_account_info(),
        from: ctx.accounts.user_fund_token_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, fund_tokens)?;
    
    // Transfer USDC to user
    let seeds = &[
        b"fund_state",
        &[fund_state.bump],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = Transfer {
        from: ctx.accounts.usdc_vault.to_account_info(),
        to: ctx.accounts.user_usdc_account.to_account_info(),
        authority: fund_state.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, withdrawal_amount_usdc)?;
    
    // Update fund state
    fund_state.total_assets -= withdrawal_amount_usd as u64;
    fund_state.total_shares -= fund_tokens;
    fund_state.cash_reserves -= withdrawal_amount_usdc;
    
    // Update user account
    user_account.fund_tokens -= fund_tokens;
    user_account.total_withdrawn += withdrawal_amount_usd as u64;
    user_account.last_withdrawal_time = Clock::get()?.unix_timestamp;
    user_account.withdrawal_count += 1;
    
    emit!(WithdrawalMade {
        user: ctx.accounts.user.key(),
        fund_tokens_burned: fund_tokens,
        amount_usdc: withdrawal_amount_usdc,
        nav_per_share: fund_state.nav_per_share,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

### 4. Update NAV Function

```rust
#[derive(Accounts)]
pub struct UpdateNAV<'info> {
    #[account(
        mut,
        constraint = fund_state.admin_authority == admin.key() @ ErrorCode::Unauthorized
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub admin: Signer<'info>,
}

pub fn update_nav(
    ctx: Context<UpdateNAV>,
    new_asset_valuations: Vec<AssetValuation>,
    net_daily_pnl: i64,  // Can be positive (profit) or negative (loss)
) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Validate that at least 23 hours have passed since last update
    require!(
        current_time - fund_state.last_nav_update >= 82800, // 23 hours
        ErrorCode::NAVUpdateTooFrequent
    );
    
    // Calculate total fixed income asset value from all holdings
    let total_asset_value: u128 = new_asset_valuations
        .iter()
        .map(|v| v.current_value as u128)
        .sum();
    
    fund_state.treasury_bill_value = total_asset_value as u64;
    
    // Calculate gross total assets (cash + fixed income assets)
    let gross_total_assets = (fund_state.cash_reserves as u128) * 100 + // Convert USDC to 8 decimals
                           total_asset_value;
    
    // Calculate management fee (daily fee = annual fee / 365)
    let daily_fee_bps = fund_state.management_fee_bps as u128 / 365;
    let management_fee = gross_total_assets * daily_fee_bps / 1_000_000;
    
    // Apply daily P&L (can be positive or negative) - BUIDL's core mechanism
    let net_total_assets = if net_daily_pnl >= 0 {
        gross_total_assets + (net_daily_pnl as u128) - management_fee
    } else {
        let loss = (-net_daily_pnl) as u128;
        if gross_total_assets >= loss + management_fee {
            gross_total_assets - loss - management_fee
        } else {
            // In extreme loss scenario, ensure we don't go negative
            0u128
        }
    };
    
    // Calculate new NAV per share (BUIDL's core rebase mechanism)
    // This automatically handles both profits (NAV increases) and losses (NAV decreases)
    let previous_nav = fund_state.nav_per_share;
    if fund_state.total_shares > 0 {
        fund_state.nav_per_share = (net_total_assets / (fund_state.total_shares as u128)) as u64;
    }
    
    // Track yield/loss for analytics (but don't distribute separately)
    let yield_index = fund_state.yield_history_index as usize;
    if net_daily_pnl >= 0 {
        fund_state.daily_yield_history[yield_index] = net_daily_pnl as u64;
        fund_state.total_yield_distributed += net_daily_pnl as u64;
    } else {
        // Record losses as zero for APY calculation
        fund_state.daily_yield_history[yield_index] = 0;
    }
    fund_state.yield_history_index = (fund_state.yield_history_index + 1) % 365;
    
    // Update fund state
    fund_state.total_assets = net_total_assets as u64;
    fund_state.last_nav_update = current_time;
    
    // Determine NAV change for event
    let nav_change = (fund_state.nav_per_share as i128) - (previous_nav as i128);
    
    emit!(NAVUpdated {
        new_nav: fund_state.nav_per_share,
        previous_nav,
        nav_change,
        total_assets: fund_state.total_assets,
        asset_value: total_asset_value as u64,
        cash_reserves: fund_state.cash_reserves,
        daily_pnl: net_daily_pnl,
        management_fee: management_fee as u64,
        timestamp: current_time,
    });
    
    Ok(())
}
```

## Error Definitions

```rust
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
    
    #[msg("Invalid treasury bill data")]
    InvalidTreasuryBillData,
    
    #[msg("Mathematical overflow in calculation")]
    MathOverflow,
    
    #[msg("Invalid liquidity ratio")]
    InvalidLiquidityRatio,
}
```

## Event Definitions

```rust
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
    pub previous_nav: u64,
    pub nav_change: i128,
    pub total_assets: u64,
    pub asset_value: u64,
    pub cash_reserves: u64,
    pub daily_pnl: i64,
    pub management_fee: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldDistributed {
    pub total_yield: u64,
    pub per_share_yield: u64,
    pub distribution_date: i64,
}
```

## Utility Functions

### NAV Calculation Utilities

```rust
pub mod calculations {
    use super::*;
    
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
        
        let apy = (total_annual_yield * 10000) / (total_assets as u128); // 4 decimal places
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
}
```

## Security Considerations

### Access Control Patterns

```rust
// Multisig validation for admin functions
#[derive(Accounts)]
pub struct AdminOperation<'info> {
    #[account(
        constraint = fund_state.admin_authority == admin.key() @ ErrorCode::Unauthorized
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub admin: Signer<'info>,
}

// Time-locked operations for critical changes
pub fn validate_timelock(last_update: i64, min_interval: i64) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - last_update >= min_interval,
        ErrorCode::OperationTooFrequent
    );
    Ok(())
}
```

### Input Validation

```rust
pub mod validation {
    use super::*;
    
    pub fn validate_deposit_amount(amount: u64) -> Result<()> {
        require!(amount >= 10_000_000, ErrorCode::DepositTooSmall); // Min $10
        require!(amount <= 1_000_000_000_000, ErrorCode::DepositTooLarge); // Max $1M
        Ok(())
    }
    
    pub fn validate_nav_parameters(nav: u64) -> Result<()> {
        require!(nav >= 95_000_000, ErrorCode::NAVTooLow); // Min $0.95
        require!(nav <= 105_000_000, ErrorCode::NAVTooHigh); // Max $1.05
        Ok(())
    }
    
    pub fn validate_liquidity_ratio(ratio: u8) -> Result<()> {
        require!(ratio >= 10, ErrorCode::LiquidityTooLow); // Min 10%
        require!(ratio <= 50, ErrorCode::LiquidityTooHigh); // Max 50%
        Ok(())
    }
}
```

## Testing Framework

### Unit Test Structure

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;
    
    #[test]
    fn test_nav_calculation() {
        let deposit_amount = 1_000_000; // $1,000 USDC
        let nav_per_share = 100_000_000; // $1.00
        
        let fund_tokens = calculate_fund_tokens(deposit_amount, nav_per_share).unwrap();
        assert_eq!(fund_tokens, 100_000_000_000); // 1,000 fund tokens
    }
    
    #[test]
    fn test_withdrawal_calculation() {
        let fund_tokens = 100_000_000_000; // 1,000 fund tokens
        let nav_per_share = 101_000_000; // $1.01 (1% yield)
        
        let withdrawal_amount = calculate_withdrawal_amount(fund_tokens, nav_per_share).unwrap();
        assert_eq!(withdrawal_amount, 1_010_000); // $1,010 USDC
    }
    
    #[test]
    fn test_apy_calculation() {
        let mut daily_yields = [0u64; 365];
        daily_yields.fill(274); // ~$274 daily yield on $100k = 1% daily = 365% APY
        
        let apy = calculate_apy(&daily_yields, 10_000_000_000); // $100k total assets
        assert!(apy > 36000); // Should be around 365% (36500 basis points)
    }
}
```

This technical design provides engineers with comprehensive specifications to implement a production-ready core fund management system that directly mimics BlackRock BUIDL's mechanisms while leveraging Solana's unique advantages. The design prioritizes security, precision, and transparency while maintaining the performance characteristics needed for institutional-scale operations. 