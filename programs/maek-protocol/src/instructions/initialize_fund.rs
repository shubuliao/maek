use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct InitializeFund<'info> {
    #[account(
        init,
        payer = admin,
        space = FundState::LEN,
        seeds = [b"fund_state"],
        bump
    )]
    pub fund_state: Account<'info, FundState>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// USDC mint (6 decimals)
    pub usdc_mint: Account<'info, Mint>,
    
    /// Fund token mint (8 decimals)
    #[account(
        init,
        payer = admin,
        mint::decimals = 8,
        mint::authority = fund_state,
        seeds = [b"fund_token_mint"],
        bump
    )]
    pub fund_token_mint: Account<'info, Mint>,
    
    /// USDC vault for deposits/withdrawals
    #[account(
        init,
        payer = admin,
        token::mint = usdc_mint,
        token::authority = fund_state,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_fund(
    ctx: Context<InitializeFund>,
    management_fee_bps: u16,
    target_liquidity_ratio: u8,
) -> Result<()> {
    let fund_state = &mut ctx.accounts.fund_state;
    let clock = Clock::get()?;
    
    // Validate parameters
    require!(management_fee_bps <= 100, ErrorCode::FeeTooHigh); // Max 1% annually
    require!(target_liquidity_ratio >= 10 && target_liquidity_ratio <= 50, ErrorCode::InvalidLiquidityRatio);
    
    // Initialize fund state
    fund_state.admin_authority = ctx.accounts.admin.key();
    fund_state.fund_token_mint = ctx.accounts.fund_token_mint.key();
    fund_state.usdc_mint = ctx.accounts.usdc_mint.key();
    fund_state.usdc_vault = ctx.accounts.usdc_vault.key();
    fund_state.treasury_vault = Pubkey::default(); // To be set later
    fund_state.management_fee_bps = management_fee_bps;
    fund_state.target_liquidity_ratio = target_liquidity_ratio;
    fund_state.inception_date = clock.unix_timestamp;
    fund_state.last_nav_update = clock.unix_timestamp;
    fund_state.nav_per_share = 100_000_000; // $1.00 initial NAV
    fund_state.bump = ctx.bumps.fund_state;
    
    msg!("MAEK Fund initialized with management fee: {} bps, target liquidity: {}%", 
         management_fee_bps, target_liquidity_ratio);
    
    Ok(())
} 