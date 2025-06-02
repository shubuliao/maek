use anchor_lang::prelude::*;

declare_id!("2gtiJ4B3Fv6oF6ZEYJcXdoNTGVC4jG5bNQjXs9ELWrhx");

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

#[program]
pub mod maek_protocol {
    use super::*;

    // Temporarily commented out to reduce stack usage
    // pub fn initialize_fund(
    //     ctx: Context<InitializeFund>,
    //     management_fee_bps: u16,
    //     target_liquidity_ratio: u8,
    // ) -> Result<()> {
    //     instructions::initialize_fund(ctx, management_fee_bps, target_liquidity_ratio)
    // }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, fund_tokens: u64) -> Result<()> {
        instructions::withdraw(ctx, fund_tokens)
    }

    pub fn update_nav(
        ctx: Context<UpdateNAV>,
        new_asset_valuations: Vec<AssetValuation>,
        net_daily_pnl: i64,
    ) -> Result<()> {
        instructions::update_nav(ctx, new_asset_valuations, net_daily_pnl)
    }

    // Temporarily commented out to reduce stack usage
    // pub fn invest_in_fixed_income(
    //     ctx: Context<InvestFixedIncome>,
    //     assets: Vec<AssetPurchase>,
    // ) -> Result<()> {
    //     instructions::invest_in_fixed_income(ctx, assets)
    // }

    // pub fn handle_asset_maturity(
    //     ctx: Context<HandleMaturity>,
    //     asset_id: Pubkey,
    // ) -> Result<()> {
    //     instructions::handle_asset_maturity(ctx, asset_id)
    // }
} 