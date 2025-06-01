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

#[event]
pub struct AssetPurchased {
    pub asset_id: Pubkey,
    pub asset_type: u8,
    pub purchase_amount: u64,
    pub yield_rate: u32,
    pub maturity_date: i64,
    pub timestamp: i64,
}

#[event]
pub struct AssetMatured {
    pub asset_id: Pubkey,
    pub maturity_proceeds: u64,
    pub interest_earned: u64,
    pub timestamp: i64,
}

#[event]
pub struct LiquidityManaged {
    pub action: String,
    pub amount: u64,
    pub new_liquidity_ratio: u8,
    pub timestamp: i64,
}

#[event]
pub struct EmergencyPause {
    pub reason: String,
    pub paused_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct FundUnpaused {
    pub unpaused_by: Pubkey,
    pub timestamp: i64,
} 