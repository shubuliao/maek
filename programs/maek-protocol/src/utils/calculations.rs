use anchor_lang::prelude::*;
use crate::error::ErrorCode;

/// Calculate fund tokens for a given deposit amount
/// Mimics BUIDL's proportional share calculation
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
/// Implements BUIDL's same-day settlement calculation
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
/// Matches BUIDL's 4-5% APY calculation methodology
pub fn calculate_apy(daily_yields: &[u64; 365], total_assets: u64) -> u32 {
    let total_annual_yield: u128 = daily_yields.iter().map(|&x| x as u128).sum();
    
    if total_assets == 0 {
        return 0;
    }
    
    let apy = (total_annual_yield * 10000) / (total_assets as u128); // 4 decimal places
    std::cmp::min(apy as u32, u32::MAX)
}

/// Calculate current liquidity ratio
/// Ensures BUIDL-style same-day settlement capability
pub fn calculate_liquidity_ratio(cash_reserves: u64, total_assets: u64) -> u8 {
    if total_assets == 0 {
        return 100;
    }
    
    let cash_usd_8_decimals = (cash_reserves as u128) * 100;
    let ratio = (cash_usd_8_decimals * 100) / (total_assets as u128);
    std::cmp::min(ratio as u8, 100)
}

/// Calculate weighted average maturity of fixed income portfolio
/// Essential for portfolio risk management
pub fn calculate_weighted_avg_maturity(
    asset_values: &[u64],
    maturities: &[u16],
    total_value: u64,
) -> Result<u16> {
    if asset_values.len() != maturities.len() {
        return Err(ErrorCode::InvalidFixedIncomeAssetData.into());
    }
    
    if total_value == 0 {
        return Ok(0);
    }
    
    let weighted_sum: u128 = asset_values
        .iter()
        .zip(maturities.iter())
        .map(|(&value, &maturity)| (value as u128) * (maturity as u128))
        .sum();
    
    let weighted_avg = weighted_sum / (total_value as u128);
    Ok(weighted_avg.min(u16::MAX as u128) as u16)
}

/// Calculate weighted average credit rating
/// Maintains BUIDL-level safety standards
pub fn calculate_weighted_avg_credit_rating(
    asset_values: &[u64],
    credit_ratings: &[u8],
    total_value: u64,
) -> Result<u8> {
    if asset_values.len() != credit_ratings.len() {
        return Err(ErrorCode::InvalidFixedIncomeAssetData.into());
    }
    
    if total_value == 0 {
        return Ok(1); // Default to AAA
    }
    
    let weighted_sum: u128 = asset_values
        .iter()
        .zip(credit_ratings.iter())
        .map(|(&value, &rating)| (value as u128) * (rating as u128))
        .sum();
    
    let weighted_avg = weighted_sum / (total_value as u128);
    Ok(weighted_avg.min(u8::MAX as u128) as u8)
}

/// Calculate daily management fee
/// Matches BlackRock's fee structure (0.25% annually)
pub fn calculate_daily_management_fee(
    total_assets: u64,
    annual_fee_bps: u16,
) -> Result<u64> {
    let daily_fee_bps = (annual_fee_bps as u128) / 365;
    let daily_fee = (total_assets as u128) * daily_fee_bps / 10_000;
    
    if daily_fee > u64::MAX as u128 {
        return Err(ErrorCode::MathOverflow.into());
    }
    
    Ok(daily_fee as u64)
}

/// Calculate accrued interest for a fixed income asset
/// Daily compounding for accurate yield calculation
pub fn calculate_accrued_interest(
    principal: u64,
    annual_yield_rate: u32,
    days_elapsed: u16,
) -> Result<u64> {
    let daily_rate = (annual_yield_rate as u128) / 365 / 10_000; // Convert to daily decimal
    let accrued = (principal as u128) * (days_elapsed as u128) * daily_rate / 10_000;
    
    if accrued > u64::MAX as u128 {
        return Err(ErrorCode::MathOverflow.into());
    }
    
    Ok(accrued as u64)
}

/// Calculate portfolio allocation percentages
/// Ensures diversification within BUIDL-style safety parameters
pub fn calculate_allocation_percentage(
    asset_value: u64,
    total_value: u64,
) -> Result<u32> {
    if total_value == 0 {
        return Ok(0);
    }
    
    let percentage = ((asset_value as u128) * 10_000) / (total_value as u128); // Basis points
    Ok(percentage.min(10_000) as u32)
}

/// Validate portfolio concentration limits
/// Prevents over-concentration in any single asset or issuer
pub fn check_concentration_limits(
    new_asset_value: u64,
    total_portfolio_value: u64,
    max_concentration_bps: u32,
) -> Result<bool> {
    let concentration = calculate_allocation_percentage(new_asset_value, total_portfolio_value)?;
    Ok(concentration <= max_concentration_bps)
}

/// Calculate optimal liquidity target based on portfolio size
/// Larger funds can operate with lower liquidity ratios
pub fn calculate_optimal_liquidity_ratio(total_assets: u64) -> u8 {
    match total_assets {
        0..=1_000_000_00000000 => 40,      // ≤$1M: 40% liquidity
        1_000_000_00000001..=10_000_000_00000000 => 30, // $1M-$10M: 30% liquidity
        10_000_000_00000001..=100_000_000_00000000 => 25, // $10M-$100M: 25% liquidity
        _ => 20,                           // >$100M: 20% liquidity (BUIDL-like)
    }
} 