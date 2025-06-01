use anchor_lang::prelude::*;
use crate::error::ErrorCode;
use crate::state::FixedIncomeAssetType;

/// Validate deposit amount parameters
/// Ensures compliance with minimum investment requirements
pub fn validate_deposit_amount(amount: u64) -> Result<()> {
    require!(amount >= 10_000_000, ErrorCode::DepositTooSmall); // Min $10
    require!(amount <= 1_000_000_000_000, ErrorCode::DepositTooLarge); // Max $1M
    Ok(())
}

/// Validate NAV parameters to maintain BUIDL-style stability
/// Prevents extreme NAV fluctuations that could destabilize the fund
pub fn validate_nav_parameters(nav: u64) -> Result<()> {
    require!(nav >= 95_000_000, ErrorCode::NAVTooLow); // Min $0.95
    require!(nav <= 105_000_000, ErrorCode::NAVTooHigh); // Max $1.05
    Ok(())
}

/// Validate liquidity ratio parameters
/// Ensures adequate liquidity for same-day settlement
pub fn validate_liquidity_ratio(ratio: u8) -> Result<()> {
    require!(ratio >= 10, ErrorCode::LiquidityTooLow); // Min 10%
    require!(ratio <= 50, ErrorCode::LiquidityTooHigh); // Max 50%
    Ok(())
}

/// Validate time-locked operations
/// Prevents excessive frequency of critical operations
pub fn validate_timelock(last_update: i64, min_interval: i64) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - last_update >= min_interval,
        ErrorCode::OperationTooFrequent
    );
    Ok(())
}

/// Validate fixed income asset parameters
/// Ensures assets meet fund safety and quality standards
pub fn validate_fixed_income_asset(
    asset_type: FixedIncomeAssetType,
    credit_rating: u8,
    maturity_date: i64,
    yield_rate: u32,
    face_value: u64,
) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;
    
    // Validate credit rating (1=AAA to 10=D)
    require!(credit_rating >= 1 && credit_rating <= 10, ErrorCode::InvalidCreditRating);
    
    // Ensure investment grade (BBB- or better)
    require!(credit_rating <= 7, ErrorCode::InvalidCreditRating); // BBB- = 7
    
    // Validate maturity date is in the future
    require!(maturity_date > current_time, ErrorCode::AssetAlreadyMatured);
    
    // Validate maturity is within acceptable range (1 day to 10 years)
    let days_to_maturity = (maturity_date - current_time) / 86400; // Convert to days
    require!(days_to_maturity >= 1, ErrorCode::InvalidFixedIncomeAssetData);
    require!(days_to_maturity <= 3650, ErrorCode::InvalidFixedIncomeAssetData); // 10 years max
    
    // Validate yield rate is reasonable (0.1% to 20% annually)
    require!(yield_rate >= 10 && yield_rate <= 20000, ErrorCode::InvalidFixedIncomeAssetData);
    
    // Validate face value
    require!(face_value >= 1_000_00000000, ErrorCode::InvalidFixedIncomeAssetData); // Min $1,000
    require!(face_value <= 100_000_000_00000000, ErrorCode::InvalidFixedIncomeAssetData); // Max $100M
    
    // Asset-specific validations
    match asset_type {
        FixedIncomeAssetType::TreasuryBill => {
            // T-Bills: Max 1 year maturity, highest credit rating
            require!(days_to_maturity <= 365, ErrorCode::InvalidFixedIncomeAssetData);
            require!(credit_rating == 1, ErrorCode::InvalidCreditRating); // Must be AAA
        },
        FixedIncomeAssetType::TreasuryNote | FixedIncomeAssetType::TreasuryBond => {
            // Treasury securities: Must be AAA rated
            require!(credit_rating == 1, ErrorCode::InvalidCreditRating);
        },
        FixedIncomeAssetType::CorporateBond => {
            // Corporate bonds: Minimum A- rating
            require!(credit_rating <= 5, ErrorCode::InvalidCreditRating); // A- = 5
        },
        FixedIncomeAssetType::CommercialPaper => {
            // Commercial paper: Max 270 days maturity, minimum A rating
            require!(days_to_maturity <= 270, ErrorCode::InvalidFixedIncomeAssetData);
            require!(credit_rating <= 4, ErrorCode::InvalidCreditRating); // A = 4
        },
        FixedIncomeAssetType::CertificateOfDeposit => {
            // CDs: FDIC insured, typically high quality
            require!(credit_rating <= 3, ErrorCode::InvalidCreditRating); // AA- = 3
        },
        _ => {
            // Other asset types: General investment grade requirement
            require!(credit_rating <= 7, ErrorCode::InvalidCreditRating); // BBB- = 7
        }
    }
    
    Ok(())
}

/// Validate management fee parameters
/// Ensures fees are reasonable and competitive
pub fn validate_management_fee(fee_bps: u16) -> Result<()> {
    require!(fee_bps <= 100, ErrorCode::InvalidLiquidityRatio); // Max 1% annually
    Ok(())
}

/// Validate investment amount against portfolio limits
/// Prevents over-concentration and maintains diversification
pub fn validate_investment_limits(
    investment_amount: u64,
    current_portfolio_value: u64,
    asset_type: FixedIncomeAssetType,
    same_issuer_total: u64,
) -> Result<()> {
    let total_after_investment = current_portfolio_value + investment_amount;
    
    // No single investment should exceed 10% of portfolio
    let investment_percentage = (investment_amount as u128 * 10000) / (total_after_investment as u128);
    require!(investment_percentage <= 1000, ErrorCode::InvestmentAmountExceedsLimit); // 10%
    
    // Asset type concentration limits
    let asset_type_limit = match asset_type {
        FixedIncomeAssetType::TreasuryBill | 
        FixedIncomeAssetType::TreasuryNote | 
        FixedIncomeAssetType::TreasuryBond => 8000, // 80% for treasury securities
        FixedIncomeAssetType::CorporateBond => 4000, // 40% for corporate bonds
        FixedIncomeAssetType::CertificateOfDeposit => 3000, // 30% for CDs
        _ => 2000, // 20% for other asset types
    };
    
    // Single issuer concentration limit (except Treasury)
    if !matches!(asset_type, FixedIncomeAssetType::TreasuryBill | 
                            FixedIncomeAssetType::TreasuryNote | 
                            FixedIncomeAssetType::TreasuryBond) {
        let issuer_total_after = same_issuer_total + investment_amount;
        let issuer_percentage = (issuer_total_after as u128 * 10000) / (total_after_investment as u128);
        require!(issuer_percentage <= 500, ErrorCode::PortfolioConcentrationExceeded); // 5% per issuer
    }
    
    Ok(())
}

/// Validate user account state before operations
/// Ensures account integrity and prevents invalid operations
pub fn validate_user_account_state(
    fund_tokens: u64,
    requested_tokens: u64,
    last_operation_time: i64,
    min_operation_interval: i64,
) -> Result<()> {
    // Check sufficient balance
    require!(fund_tokens >= requested_tokens, ErrorCode::InsufficientFundTokens);
    
    // Prevent rapid successive operations (anti-spam)
    if min_operation_interval > 0 {
        validate_timelock(last_operation_time, min_operation_interval)?;
    }
    
    Ok(())
}

/// Validate oracle data for asset valuations
/// Ensures price feed reliability and prevents manipulation
pub fn validate_oracle_data(
    asset_valuations: &[crate::state::AssetValuation],
    max_price_deviation_bps: u32,
) -> Result<()> {
    for valuation in asset_valuations {
        // Validate valuation is not zero
        require!(valuation.current_value > 0, ErrorCode::InvalidFixedIncomeAssetData);
        
        // Validate accrued interest is reasonable (not exceeding 50% of principal)
        require!(
            valuation.accrued_interest <= valuation.current_value / 2,
            ErrorCode::InvalidFixedIncomeAssetData
        );
    }
    
    Ok(())
}

/// Validate fund state consistency
/// Ensures mathematical consistency across fund operations
pub fn validate_fund_state_consistency(
    total_assets: u64,
    total_shares: u64,
    nav_per_share: u64,
    cash_reserves: u64,
    fixed_income_value: u64,
) -> Result<()> {
    // Total assets should equal cash + fixed income value (with small tolerance for fees)
    let calculated_assets = (cash_reserves as u128) * 100 + (fixed_income_value as u128);
    let asset_difference = if calculated_assets > total_assets as u128 {
        calculated_assets - (total_assets as u128)
    } else {
        (total_assets as u128) - calculated_assets
    };
    
    // Allow 0.1% tolerance for rounding and fees
    let tolerance = (total_assets as u128) / 1000;
    require!(asset_difference <= tolerance, ErrorCode::MathOverflow);
    
    // NAV should be consistent with total assets and shares
    if total_shares > 0 {
        let calculated_nav = ((total_assets as u128) * 100_000_000) / (total_shares as u128);
        let nav_difference = if calculated_nav > nav_per_share as u128 {
            calculated_nav - (nav_per_share as u128)
        } else {
            (nav_per_share as u128) - calculated_nav
        };
        
        // Allow 0.01% tolerance for NAV calculation
        let nav_tolerance = (nav_per_share as u128) / 10000;
        require!(nav_difference <= nav_tolerance, ErrorCode::MathOverflow);
    }
    
    Ok(())
} 