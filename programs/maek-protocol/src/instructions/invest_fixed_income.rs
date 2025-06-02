use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AssetPurchase {
    pub asset_type: u8, // 1=Treasury Bill, 2=Corporate Bond, etc.
    pub amount: u64,
    pub maturity_date: i64,
    pub yield_rate: u16, // Basis points
}

#[derive(Accounts)]
pub struct InvestFixedIncome<'info> {
    #[account(
        mut,
        seeds = [b"fund_state"],
        bump = fund_state.bump,
        has_one = admin_authority
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub admin_authority: Signer<'info>,
}

pub fn invest_in_fixed_income(
    ctx: Context<InvestFixedIncome>,
    assets: Vec<AssetPurchase>,
) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    
    let mut total_investment = 0u64;
    
    for asset in assets {
        // Validate asset parameters
        require!(asset.amount > 0, ErrorCode::InvalidAmount);
        require!(asset.maturity_date > Clock::get()?.unix_timestamp, ErrorCode::InvalidMaturityDate);
        require!(asset.yield_rate <= 2000, ErrorCode::InvalidYieldRate); // Max 20% yield
        
        total_investment = total_investment.checked_add(asset.amount).ok_or(ErrorCode::MathOverflow)?;
    }
    
    // Check if we have enough cash reserves
    require!(fund_state.cash_reserves >= total_investment, ErrorCode::InsufficientLiquidity);
    
    // Update fund state
    fund_state.cash_reserves = fund_state.cash_reserves.checked_sub(total_investment).ok_or(ErrorCode::MathOverflow)?;
    fund_state.fixed_income_value = fund_state.fixed_income_value.checked_add(total_investment * 100).ok_or(ErrorCode::MathOverflow)?; // Convert to 8 decimals
    
    msg!("Invested {} USDC in fixed income assets", total_investment);
    
    Ok(())
} 