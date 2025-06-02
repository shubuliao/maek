use anchor_lang::prelude::*;

#[account]
pub struct FundState {
    /// Administrative authority (multisig)
    pub admin_authority: Pubkey,
    
    /// Fund token mint address
    pub fund_token_mint: Pubkey,
    
    /// USDC mint address
    pub usdc_mint: Pubkey,
    
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
    
    /// Total number of unique depositors
    pub total_depositors: u32,
    
    /// Account bump
    pub bump: u8,
}

impl Default for FundState {
    fn default() -> Self {
        Self {
            admin_authority: Pubkey::default(),
            fund_token_mint: Pubkey::default(),
            usdc_mint: Pubkey::default(),
            usdc_vault: Pubkey::default(),
            treasury_vault: Pubkey::default(),
            total_assets: 0,
            total_shares: 0,
            nav_per_share: 100_000_000, // $1.00 initial NAV
            last_nav_update: 0,
            cash_reserves: 0,
            fixed_income_value: 0,
            management_fee_bps: 0,
            target_liquidity_ratio: 25, // 25% default
            is_paused: false,
            inception_date: 0,
            total_yield_distributed: 0,
            total_depositors: 0,
            bump: 0,
        }
    }
}

impl FundState {
    pub const LEN: usize = 8 + // discriminator
        32 + // admin_authority
        32 + // fund_token_mint
        32 + // usdc_mint
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
        4 + // total_depositors
        1; // bump
} 