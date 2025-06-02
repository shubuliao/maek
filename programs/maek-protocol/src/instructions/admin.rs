use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct AdminPause<'info> {
    #[account(
        mut,
        seeds = [b"fund_state"],
        bump = fund_state.bump,
        has_one = admin_authority
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub admin_authority: Signer<'info>,
}

pub fn pause_fund(ctx: Context<AdminPause>) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    fund_state.is_paused = true;
    
    msg!("Fund has been paused");
    Ok(())
}

pub fn unpause_fund(ctx: Context<AdminPause>) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    fund_state.is_paused = false;
    
    msg!("Fund has been unpaused");
    Ok(())
} 