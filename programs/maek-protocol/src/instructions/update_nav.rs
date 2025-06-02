use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AssetValuation {
    pub asset_id: Pubkey,
    pub current_value: u64,
}

#[derive(Accounts)]
pub struct UpdateNAV<'info> {
    #[account(
        mut,
        seeds = [b"fund_state"],
        bump = fund_state.bump,
        has_one = admin_authority
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub admin_authority: Signer<'info>,
}

pub fn update_nav(
    ctx: Context<UpdateNAV>,
    new_asset_valuations: Vec<AssetValuation>,
    net_daily_pnl: i64,
) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    let clock = Clock::get()?;
    
    // Validate NAV update frequency (minimum 23 hours)
    let time_since_last_update = clock.unix_timestamp - fund_state.last_nav_update;
    require!(time_since_last_update >= 82800, ErrorCode::NAVUpdateTooFrequent); // 23 hours
    
    // Update asset valuations and calculate new total assets
    let mut new_total_assets = fund_state.cash_reserves * 100; // Convert USDC to 8 decimals
    
    for valuation in new_asset_valuations {
        new_total_assets = new_total_assets.checked_add(valuation.current_value).ok_or(ErrorCode::MathOverflow)?;
    }
    
    // Apply daily P&L
    if net_daily_pnl >= 0 {
        new_total_assets = new_total_assets.checked_add(net_daily_pnl as u64).ok_or(ErrorCode::MathOverflow)?;
    } else {
        new_total_assets = new_total_assets.checked_sub((-net_daily_pnl) as u64).ok_or(ErrorCode::MathOverflow)?;
    }
    
    // Calculate new NAV per share
    if fund_state.total_shares > 0 {
        fund_state.nav_per_share = new_total_assets.checked_div(fund_state.total_shares).ok_or(ErrorCode::MathOverflow)?;
    }
    
    // Update fund state
    fund_state.total_assets = new_total_assets;
    fund_state.last_nav_update = clock.unix_timestamp;
    
    // Update total yield distributed if positive P&L
    if net_daily_pnl > 0 {
        fund_state.total_yield_distributed = fund_state.total_yield_distributed.checked_add(net_daily_pnl as u64).ok_or(ErrorCode::MathOverflow)?;
    }
    
    msg!("NAV updated to: {} (${:.8})", fund_state.nav_per_share, fund_state.nav_per_share as f64 / 100_000_000.0);
    
    Ok(())
} 