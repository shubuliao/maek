use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    // Fund Management Errors
    #[msg("Fund is not initialized")]
    FundNotInitialized,
    
    #[msg("Fund is paused for maintenance")]
    FundPaused,
    
    #[msg("Unauthorized operation - admin authority required")]
    UnauthorizedAccess,
    
    #[msg("Fund has already been initialized")]
    FundAlreadyInitialized,
    
    // Deposit/Withdrawal Errors
    #[msg("Deposit amount is below the minimum threshold")]
    DepositTooSmall,
    
    #[msg("Deposit amount exceeds maximum allowed limit")]
    DepositTooLarge,
    
    #[msg("Withdrawal amount cannot be zero")]
    WithdrawAmountZero,
    
    #[msg("Insufficient fund tokens for withdrawal")]
    InsufficientFundTokens,
    
    #[msg("Insufficient cash reserves for withdrawal")]
    InsufficientLiquidity,
    
    #[msg("Insufficient funds for operation")]
    InsufficientFunds,
    
    // NAV and Calculation Errors
    #[msg("Invalid NAV value")]
    InvalidNAV,
    
    #[msg("NAV is below minimum threshold")]
    NAVTooLow,
    
    #[msg("NAV exceeds maximum threshold")]
    NAVTooHigh,
    
    #[msg("NAV update attempted too soon - minimum 23 hours required")]
    NAVUpdateTooFrequent,
    
    #[msg("No shares outstanding for NAV calculation")]
    NoSharesOutstanding,
    
    // Mathematical and Validation Errors
    #[msg("Mathematical operation resulted in overflow")]
    MathOverflow,
    
    #[msg("Invalid amount specified")]
    InvalidAmount,
    
    #[msg("Invalid asset allocation percentages")]
    InvalidAllocation,
    
    #[msg("Management fee exceeds maximum allowed rate")]
    FeeTooHigh,
    
    // Fixed Income Asset Errors
    #[msg("Invalid fixed income asset type")]
    InvalidAssetType,
    
    #[msg("Asset maturity date is invalid")]
    InvalidMaturityDate,
    
    #[msg("Credit rating is invalid or not supported")]
    InvalidCreditRating,
    
    #[msg("Asset yield rate is outside acceptable range")]
    InvalidYieldRate,
    
    #[msg("Fixed income asset data is inconsistent")]
    InvalidFixedIncomeAssetData,
    
    // Portfolio Management Errors
    #[msg("Portfolio concentration limit exceeded")]
    ConcentrationLimitExceeded,
    
    #[msg("Insufficient portfolio diversification")]
    InsufficientDiversification,
    
    #[msg("Liquidity ratio below required minimum")]
    LiquidityRatioBelowMinimum,
    
    // Token and Account Errors
    #[msg("Invalid token mint address")]
    InvalidTokenMint,
    
    #[msg("Token account does not exist or is invalid")]
    InvalidTokenAccount,
    
    #[msg("User account does not exist")]
    UserAccountNotFound,
    
    #[msg("User account already exists")]
    UserAccountAlreadyExists,
    
    // Time and State Errors
    #[msg("Operation attempted outside allowed timeframe")]
    InvalidTimeframe,
    
    #[msg("Fund state is inconsistent")]
    InconsistentFundState,
    
    #[msg("Account data is corrupted or invalid")]
    InvalidAccountData,
    
    // Asset Management Errors
    #[msg("Asset purchase failed due to market conditions")]
    AssetPurchaseFailed,
    
    #[msg("Asset sale failed due to liquidity constraints")]
    AssetSaleFailed,
    
    #[msg("Asset valuation is stale or unavailable")]
    StaleAssetValuation,
    
    // Risk Management Errors
    #[msg("Risk exposure exceeds fund limits")]
    RiskExposureExceeded,
    
    #[msg("Credit exposure limit exceeded")]
    CreditExposureExceeded,
    
    #[msg("Duration risk exceeds acceptable threshold")]
    DurationRiskExceeded,
} 