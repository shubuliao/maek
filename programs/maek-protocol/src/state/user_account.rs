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
    
    /// Average cost basis per fund token (8 decimals)
    pub avg_cost_basis: u64,
    
    /// Last NAV when user deposited (for performance tracking)
    pub last_deposit_nav: u64,
    
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
        8 + // avg_cost_basis
        8 + // last_deposit_nav
        64 + // reserved
        1; // bump
} 