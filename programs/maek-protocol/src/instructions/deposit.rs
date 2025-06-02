use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::*;
use crate::error::ErrorCode;
use crate::utils::calculations::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"fund_state"],
        bump = fund_state.bump
    )]
    pub fund_state: Account<'info, FundState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = UserFundAccount::LEN,
        seeds = [b"user_account", user.key().as_ref()],
        bump
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
        init_if_needed,
        payer = user,
        associated_token::mint = fund_token_mint,
        associated_token::authority = user
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
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    let user_account = &mut ctx.accounts.user_account;
    let clock = Clock::get()?;
    
    // Validate fund is not paused
    require!(!fund_state.is_paused, ErrorCode::FundPaused);
    
    // Validate deposit amount
    require!(amount >= 1_000_000, ErrorCode::DepositTooSmall); // Min $1 USDC
    require!(amount <= 1_000_000_000_000, ErrorCode::DepositTooLarge); // Max $1M USDC
    
    // Calculate fund tokens to mint
    let fund_tokens = calculate_fund_tokens(amount, fund_state.nav_per_share)?;
    
    // Transfer USDC from user to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.usdc_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;
    
    // Mint fund tokens to user
    let seeds = &[b"fund_state".as_ref(), &[fund_state.bump]];
    let signer = &[&seeds[..]];
    
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.fund_token_mint.to_account_info(),
            to: ctx.accounts.user_fund_token_account.to_account_info(),
            authority: fund_state.to_account_info(),
        },
        signer,
    );
    token::mint_to(mint_ctx, fund_tokens)?;
    
    // Update fund state
    fund_state.total_assets = fund_state.total_assets.checked_add(amount * 100).ok_or(ErrorCode::MathOverflow)?; // Convert 6 to 8 decimals
    fund_state.total_shares = fund_state.total_shares.checked_add(fund_tokens).ok_or(ErrorCode::MathOverflow)?;
    fund_state.cash_reserves = fund_state.cash_reserves.checked_add(amount).ok_or(ErrorCode::MathOverflow)?;
    
    // Initialize user account if needed
    if user_account.owner == Pubkey::default() {
        user_account.owner = ctx.accounts.user.key();
        user_account.created_at = clock.unix_timestamp;
        user_account.bump = ctx.bumps.user_account;
        fund_state.total_depositors = fund_state.total_depositors.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
    }
    
    // Update user account
    user_account.fund_tokens = user_account.fund_tokens.checked_add(fund_tokens).ok_or(ErrorCode::MathOverflow)?;
    user_account.total_deposited = user_account.total_deposited.checked_add(amount * 100).ok_or(ErrorCode::MathOverflow)?; // Convert to 8 decimals
    user_account.last_deposit_time = clock.unix_timestamp;
    user_account.last_deposit_nav = fund_state.nav_per_share;
    user_account.deposit_count = user_account.deposit_count.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
    
    // Update average cost basis
    let total_cost = user_account.avg_cost_basis
        .checked_mul(user_account.fund_tokens.checked_sub(fund_tokens).ok_or(ErrorCode::MathOverflow)?)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_add(fund_state.nav_per_share.checked_mul(fund_tokens).ok_or(ErrorCode::MathOverflow)?)
        .ok_or(ErrorCode::MathOverflow)?;
    user_account.avg_cost_basis = total_cost.checked_div(user_account.fund_tokens).ok_or(ErrorCode::MathOverflow)?;
    
    msg!("Deposit successful: {} USDC for {} fund tokens", amount, fund_tokens);
    
    Ok(())
} 