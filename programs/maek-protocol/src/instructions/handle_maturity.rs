use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct HandleMaturity<'info> {
    #[account(
        mut,
        seeds = [b"fund_state"],
        bump = fund_state.bump,
        has_one = admin_authority
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub admin_authority: Signer<'info>,
}

pub fn handle_asset_maturity(
    ctx: Context<HandleMaturity>,
    asset_id: Pubkey,
) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    
    // This is a simplified implementation
    // In a real implementation, you would:
    // 1. Look up the asset details
    // 2. Calculate maturity proceeds
    // 3. Update cash reserves
    // 4. Remove asset from portfolio
    
    msg!("Handling maturity for asset: {}", asset_id);
    
    Ok(())
} 