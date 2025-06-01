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
    
    /// Treasury vault for fixed income investments
    pub treasury_vault: Pubkey,
    
    /// Total assets under management in USD (8 decimals)
    /// Includes cash + fixed income asset value
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
    
    /// Total value of fixed income assets (8 decimals)
    pub fixed_income_value: u64,
    
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
    
    /// Asset allocation tracking
    pub treasury_bill_allocation: u32,    // Basis points (e.g., 5000 = 50%)
    pub corporate_bond_allocation: u32,   // Basis points
    pub other_asset_allocation: u32,      // Basis points
    
    /// Portfolio metrics
    pub weighted_avg_maturity: u16,      // Days
    pub weighted_avg_credit_rating: u8,  // 1=AAA, 2=AA+, etc.
    pub total_assets_count: u32,         // Number of individual assets
    
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
        8 + // fixed_income_value
        2 + // management_fee_bps
        1 + // target_liquidity_ratio
        1 + // is_paused
        8 + // inception_date
        8 + // total_yield_distributed
        365 * 8 + // daily_yield_history
        2 + // yield_history_index
        4 + // total_depositors
        4 + // treasury_bill_allocation
        4 + // corporate_bond_allocation
        4 + // other_asset_allocation
        2 + // weighted_avg_maturity
        1 + // weighted_avg_credit_rating
        4 + // total_assets_count
        128 + // reserved
        1; // bump
} 