use anchor_lang::prelude::*;
use crate::error::ErrorCode;

// Fund token calculation constants
pub const FUND_TOKEN_DECIMALS: u8 = 8; // 8 decimals for fund tokens
pub const USDC_DECIMALS: u8 = 6; // 6 decimals for USDC
pub const NAV_DECIMALS: u8 = 8; // 8 decimals for NAV (e.g., $1.00000000)

/// Calculate fund tokens to mint for a USDC deposit
/// Formula: (deposit_amount * 10^fund_decimals * 10^nav_decimals) / (nav_per_share * 10^usdc_decimals)
/// Simplified: (deposit_amount * 100) / nav_per_share
pub fn calculate_fund_tokens(deposit_amount: u64, nav_per_share: u64) -> Result<u64> {
    require!(nav_per_share > 0, ErrorCode::InvalidNAV);
    require!(deposit_amount > 0, ErrorCode::InvalidAmount);
    
    // Convert USDC (6 decimals) to fund token precision (8 decimals)
    // deposit_amount * 100 (to get 8 decimals) / nav_per_share (8 decimals) = fund tokens (8 decimals)
    let numerator = (deposit_amount as u128) * 100; // Multiply by 100 to convert 6 -> 8 decimals
    let fund_tokens = numerator / (nav_per_share as u128);
    
    require!(fund_tokens <= u64::MAX as u128, ErrorCode::MathOverflow);
    
    Ok(fund_tokens as u64)
}

/// Calculate USDC withdrawal amount for fund tokens
/// Formula: (fund_tokens * nav_per_share) / 10^nav_decimals / 100
pub fn calculate_withdrawal_amount(fund_tokens: u64, nav_per_share: u64) -> Result<u64> {
    require!(fund_tokens > 0, ErrorCode::InvalidAmount);
    require!(nav_per_share > 0, ErrorCode::InvalidNAV);
    
    // fund_tokens (8 decimals) * nav_per_share (8 decimals) / 10^8 = value in 8 decimals
    // Then divide by 100 to convert to USDC (6 decimals)
    let value_8_decimals = (fund_tokens as u128) * (nav_per_share as u128) / 100_000_000;
    let usdc_amount = value_8_decimals / 100; // Convert from 8 decimals to 6 decimals
    
    require!(usdc_amount <= u64::MAX as u128, ErrorCode::MathOverflow);
    
    Ok(usdc_amount as u64)
}

/// Calculate NAV per share based on total assets and total shares
pub fn calculate_nav_per_share(total_assets: u64, total_shares: u64) -> Result<u64> {
    require!(total_shares > 0, ErrorCode::NoSharesOutstanding);
    
    // total_assets (8 decimals) * 10^8 / total_shares (8 decimals) = NAV (8 decimals)
    let nav = (total_assets as u128) * 100_000_000 / (total_shares as u128);
    
    require!(nav >= 95_000_000, ErrorCode::NAVTooLow); // Minimum $0.95
    require!(nav <= 105_000_000, ErrorCode::NAVTooHigh); // Maximum $1.05
    require!(nav <= u64::MAX as u128, ErrorCode::MathOverflow);
    
    Ok(nav as u64)
}

/// Calculate daily management fee
pub fn calculate_daily_management_fee(total_assets: u64, annual_fee_bps: u16) -> Result<u64> {
    require!(total_assets > 0, ErrorCode::InvalidAmount);
    require!(annual_fee_bps <= 500, ErrorCode::FeeTooHigh); // Max 5% annual fee
    
    // Daily fee = (total_assets * annual_fee_bps) / (10,000 * 365)
    let annual_fee = (total_assets as u128) * (annual_fee_bps as u128) / 10_000;
    let daily_fee = annual_fee / 365;
    
    require!(daily_fee <= u64::MAX as u128, ErrorCode::MathOverflow);
    
    Ok(daily_fee as u64)
}

/// Calculate APY based on daily yields over the past year
/// Returns APY in basis points with 2 decimal places (e.g., 450 = 4.50%)
pub fn calculate_apy(daily_yields: &[u64; 365], total_assets: u64) -> u32 {
    if total_assets == 0 {
        return 0;
    }
    
    // Sum all daily yields
    let total_yield: u128 = daily_yields.iter().map(|&y| y as u128).sum();
    
    // Calculate APY: (total_yield / total_assets) * 10,000 (to get basis points)
    let apy = (total_yield * 10_000) / (total_assets as u128);
    
    // Cap at 50% APY (5000 basis points) for safety
    std::cmp::min(apy as u32, 5000)
}

/// Calculate yield for a specific day based on asset performance
pub fn calculate_daily_yield(
    treasury_value: u64,
    corporate_bond_value: u64,
    other_assets_value: u64,
    treasury_yield_bps: u32,
    corporate_yield_bps: u32,
    other_yield_bps: u32,
) -> Result<u64> {
    // Calculate daily yield for each asset class
    let treasury_daily = ((treasury_value as u128) * (treasury_yield_bps as u128) / 10_000) / 365;
    let corporate_daily = ((corporate_bond_value as u128) * (corporate_yield_bps as u128) / 10_000) / 365;
    let other_daily = ((other_assets_value as u128) * (other_yield_bps as u128) / 10_000) / 365;
    
    let total_daily_yield = treasury_daily + corporate_daily + other_daily;
    
    require!(total_daily_yield <= u64::MAX as u128, ErrorCode::MathOverflow);
    
    Ok(total_daily_yield as u64)
}

/// Update NAV based on profit/loss
pub fn update_nav_with_pnl(
    current_total_assets: u64,
    total_shares: u64,
    net_daily_pnl: i64, // Positive for profit, negative for loss
) -> Result<(u64, u64)> { // Returns (new_total_assets, new_nav)
    
    let new_total_assets = if net_daily_pnl >= 0 {
        current_total_assets + (net_daily_pnl as u64)
    } else {
        let loss = (-net_daily_pnl) as u64;
        require!(loss <= current_total_assets, ErrorCode::InsufficientFunds);
        current_total_assets - loss
    };
    
    let new_nav = calculate_nav_per_share(new_total_assets, total_shares)?;
    
    Ok((new_total_assets, new_nav))
}

/// Calculate proportional asset allocation based on target percentages
pub fn calculate_asset_allocation(
    total_assets: u64,
    target_treasury_pct: u8,     // 0-100
    target_corporate_pct: u8,    // 0-100
    target_other_pct: u8,        // 0-100
) -> Result<(u64, u64, u64)> {
    require!(
        target_treasury_pct + target_corporate_pct + target_other_pct == 100,
        ErrorCode::InvalidAllocation
    );
    
    let treasury_allocation = (total_assets as u128) * (target_treasury_pct as u128) / 100;
    let corporate_allocation = (total_assets as u128) * (target_corporate_pct as u128) / 100;
    let other_allocation = (total_assets as u128) * (target_other_pct as u128) / 100;
    
    require!(treasury_allocation <= u64::MAX as u128, ErrorCode::MathOverflow);
    require!(corporate_allocation <= u64::MAX as u128, ErrorCode::MathOverflow);
    require!(other_allocation <= u64::MAX as u128, ErrorCode::MathOverflow);
    
    Ok((
        treasury_allocation as u64,
        corporate_allocation as u64,
        other_allocation as u64,
    ))
}

/// Calculate liquidity ratio (cash / total assets)
pub fn calculate_liquidity_ratio(cash_reserves: u64, total_assets: u64) -> u32 {
    if total_assets == 0 {
        return 0;
    }
    
    // Return as percentage (0-100)
    let ratio = (cash_reserves as u128) * 100 / (total_assets as u128);
    std::cmp::min(ratio as u32, 100)
}

/// Validate deposit amount meets fund requirements
pub fn validate_deposit_amount(amount_usdc: u64) -> Result<()> {
    // Minimum deposit: $10 (10,000,000 with 6 decimals)
    require!(amount_usdc >= 10_000_000, ErrorCode::DepositTooSmall);
    
    // Maximum deposit: $1,000,000 (1,000,000,000,000 with 6 decimals)
    require!(amount_usdc <= 1_000_000_000_000, ErrorCode::DepositTooLarge);
    
    Ok(())
}

/// Validate withdrawal amount
pub fn validate_withdrawal_amount(fund_tokens: u64, user_balance: u64) -> Result<()> {
    require!(fund_tokens > 0, ErrorCode::WithdrawAmountZero);
    require!(fund_tokens <= user_balance, ErrorCode::InsufficientFundTokens);
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_fund_tokens_at_par() {
        let deposit = 1_000_000_000u64; // 1000 USDC
        let nav = 100_000_000u64; // $1.00
        let result = calculate_fund_tokens(deposit, nav).unwrap();
        assert_eq!(result, 100_000_000_000u64); // 1000.00000000 tokens
    }

    #[test]
    fn test_calculate_fund_tokens_higher_nav() {
        let deposit = 510_000_000u64; // 510 USDC
        let nav = 102_000_000u64; // $1.02
        let result = calculate_fund_tokens(deposit, nav).unwrap();
        assert_eq!(result, 50_000_000_000u64); // 500.00000000 tokens
    }

    #[test]
    fn test_calculate_withdrawal_amount() {
        let tokens = 100_000_000_000u64; // 1000.00000000 tokens
        let nav = 102_000_000u64; // $1.02
        let result = calculate_withdrawal_amount(tokens, nav).unwrap();
        assert_eq!(result, 1_020_000_000u64); // 1020.000000 USDC
    }

    #[test]
    fn test_calculate_nav_per_share() {
        let assets = 1_000_123_287_671u64; // $10,001.23287671
        let shares = 1_000_000_000_000u64; // 10,000.00000000 tokens
        let result = calculate_nav_per_share(assets, shares).unwrap();
        assert_eq!(result, 100_012_328u64); // $1.00012328
    }

    #[test]
    fn test_update_nav_with_profit() {
        let assets = 1_000_000_000_000u64; // $10,000
        let shares = 1_000_000_000_000u64; // 10,000 tokens
        let profit = 123_287_671i64; // +$1.23287671
        
        let (new_assets, new_nav) = update_nav_with_pnl(assets, shares, profit).unwrap();
        assert_eq!(new_assets, 1_000_123_287_671u64);
        assert_eq!(new_nav, 100_012_328u64); // $1.00012328
    }

    #[test]
    fn test_update_nav_with_loss() {
        let assets = 1_000_000_000_000u64; // $10,000
        let shares = 1_000_000_000_000u64; // 10,000 tokens
        let loss = -5_000_000_000i64; // -$50.00
        
        let (new_assets, new_nav) = update_nav_with_pnl(assets, shares, loss).unwrap();
        assert_eq!(new_assets, 999_500_000_000u64);
        assert_eq!(new_nav, 99_950_000u64); // $0.9995
    }
} 