use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, Burn};
use crate::state::*;
use crate::error::ErrorCode;
use crate::utils::calculations::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"fund_state"],
        bump = fund_state.bump
    )]
    pub fund_state: Account<'info, FundState>,
    
    #[account(
        mut,
        seeds = [b"user_account", user.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserFundAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// User's USDC token account
    #[account(
        mut,
        constraint = user_usdc_account.mint == fund_state.usdc_mint,
        constraint = user_usdc_account.owner == user.key()
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    /// User's fund token account
    #[account(
        mut,
        token::mint = fund_state.fund_token_mint,
        token::authority = user
    )]
    pub user_fund_token_account: Account<'info, TokenAccount>,
    
    /// Fund's USDC vault
    #[account(
        mut,
        address = fund_state.usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
    
    /// Fund token mint
    #[account(
        mut,
        address = fund_state.fund_token_mint
    )]
    pub fund_token_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
}

pub fn withdraw(ctx: Context<Withdraw>, fund_tokens: u64) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    let user_account = &mut ctx.accounts.user_account;
    let clock = Clock::get()?;
    
    // Validate fund is not paused
    require!(!fund_state.is_paused, ErrorCode::FundPaused);
    
    // Validate withdrawal amount
    require!(fund_tokens > 0, ErrorCode::WithdrawAmountZero);
    require!(user_account.fund_tokens >= fund_tokens, ErrorCode::InsufficientFundTokens);
    
    // Calculate USDC amount to withdraw
    let usdc_amount = calculate_withdrawal_amount(fund_tokens, fund_state.nav_per_share)?;
    
    // Check liquidity
    require!(fund_state.cash_reserves >= usdc_amount, ErrorCode::InsufficientLiquidity);
    
    // Burn fund tokens from user
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.fund_token_mint.to_account_info(),
            from: ctx.accounts.user_fund_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::burn(burn_ctx, fund_tokens)?;
    
    // Transfer USDC from vault to user
    let seeds = &[b"fund_state".as_ref(), &[fund_state.bump]];
    let signer = &[&seeds[..]];
    
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.usdc_vault.to_account_info(),
            to: ctx.accounts.user_usdc_account.to_account_info(),
            authority: fund_state.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_ctx, usdc_amount)?;
    
    // Update fund state
    fund_state.total_assets = fund_state.total_assets.checked_sub(usdc_amount * 100).ok_or(ErrorCode::MathOverflow)?; // Convert 6 to 8 decimals
    fund_state.total_shares = fund_state.total_shares.checked_sub(fund_tokens).ok_or(ErrorCode::MathOverflow)?;
    fund_state.cash_reserves = fund_state.cash_reserves.checked_sub(usdc_amount).ok_or(ErrorCode::MathOverflow)?;
    
    // Update user account
    user_account.fund_tokens = user_account.fund_tokens.checked_sub(fund_tokens).ok_or(ErrorCode::MathOverflow)?;
    user_account.total_withdrawn = user_account.total_withdrawn.checked_add(usdc_amount * 100).ok_or(ErrorCode::MathOverflow)?; // Convert to 8 decimals
    user_account.last_withdrawal_time = clock.unix_timestamp;
    user_account.withdrawal_count = user_account.withdrawal_count.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
    
    msg!("Withdrawal successful: {} fund tokens for {} USDC", fund_tokens, usdc_amount);
    
    Ok(())
} 