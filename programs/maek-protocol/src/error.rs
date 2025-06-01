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
    
    #[msg("Invalid fixed income asset data")]
    InvalidFixedIncomeAssetData,
    
    #[msg("Mathematical overflow in calculation")]
    MathOverflow,
    
    #[msg("Invalid liquidity ratio")]
    InvalidLiquidityRatio,
    
    #[msg("Deposit amount too large")]
    DepositTooLarge,
    
    #[msg("NAV value too low")]
    NAVTooLow,
    
    #[msg("NAV value too high")]
    NAVTooHigh,
    
    #[msg("Liquidity ratio too low")]
    LiquidityTooLow,
    
    #[msg("Liquidity ratio too high")]
    LiquidityTooHigh,
    
    #[msg("Operation too frequent")]
    OperationTooFrequent,
    
    #[msg("Invalid asset type")]
    InvalidAssetType,
    
    #[msg("Asset already matured")]
    AssetAlreadyMatured,
    
    #[msg("Asset not yet matured")]
    AssetNotMatured,
    
    #[msg("Invalid credit rating")]
    InvalidCreditRating,
    
    #[msg("Insufficient cash reserves")]
    InsufficientCashReserves,
    
    #[msg("Investment amount exceeds limit")]
    InvestmentAmountExceedsLimit,
    
    #[msg("Portfolio concentration limit exceeded")]
    PortfolioConcentrationExceeded,
} 