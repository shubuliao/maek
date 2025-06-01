use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// MAEK Protocol - Decentralized Treasury Bill Investment Fund
/// 
/// This program enables users to deposit stablecoins and receive tokenized
/// shares of a treasury bill investment fund, earning competitive yields
/// while maintaining liquidity through on-chain governance.
#[program]
pub mod buidl_protocol {
    use super::*;

    /// Initialize the fund with basic parameters
    pub fn initialize(
        ctx: Context<Initialize>,
        management_fee: u16,
        initial_nav: u64,
    ) -> Result<()> {
        let fund_state = &mut ctx.accounts.fund_state;
        fund_state.authority = ctx.accounts.authority.key();
        fund_state.total_assets = 0;
        fund_state.total_shares = 0;
        fund_state.nav_per_share = initial_nav;
        fund_state.management_fee = management_fee;
        fund_state.liquidity_ratio = 20; // 20% liquidity target
        fund_state.paused = false;
        fund_state.bump = *ctx.bumps.get("fund_state").unwrap();
        
        msg!("MAEK Fund initialized with NAV: {}", initial_nav);
        Ok(())
    }

    /// Deposit stablecoins and receive fund shares
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.fund_state.paused, ErrorCode::FundPaused);
        require!(amount > 0, ErrorCode::InvalidAmount);

        let fund_state = &mut ctx.accounts.fund_state;
        
        // Calculate shares to mint based on current NAV
        let shares_to_mint = if fund_state.total_shares == 0 {
            amount // 1:1 for first deposit
        } else {
            (amount * fund_state.total_shares) / fund_state.total_assets
        };

        // Transfer tokens from user to fund vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.fund_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update fund state
        fund_state.total_assets += amount;
        fund_state.total_shares += shares_to_mint;

        // Update user fund account
        let user_fund_account = &mut ctx.accounts.user_fund_account;
        user_fund_account.owner = ctx.accounts.user.key();
        user_fund_account.shares += shares_to_mint;
        user_fund_account.total_deposits += amount;
        user_fund_account.last_deposit_slot = Clock::get()?.slot;

        msg!("Deposited: {} tokens, Minted: {} shares", amount, shares_to_mint);
        Ok(())
    }

    /// Withdraw fund shares and receive stablecoins
    pub fn withdraw(ctx: Context<Withdraw>, shares: u64) -> Result<()> {
        require!(!ctx.accounts.fund_state.paused, ErrorCode::FundPaused);
        require!(shares > 0, ErrorCode::InvalidAmount);

        let user_fund_account = &mut ctx.accounts.user_fund_account;
        require!(user_fund_account.shares >= shares, ErrorCode::InsufficientShares);

        let fund_state = &mut ctx.accounts.fund_state;
        
        // Calculate tokens to return based on current NAV
        let tokens_to_return = (shares * fund_state.total_assets) / fund_state.total_shares;

        // Transfer tokens from fund vault to user
        let seeds = &[
            b"fund_state",
            &[fund_state.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.fund_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.fund_state.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, tokens_to_return)?;

        // Update fund state
        fund_state.total_assets -= tokens_to_return;
        fund_state.total_shares -= shares;

        // Update user fund account
        user_fund_account.shares -= shares;
        user_fund_account.total_withdrawals += tokens_to_return;

        msg!("Withdrawn: {} shares, Received: {} tokens", shares, tokens_to_return);
        Ok(())
    }

    /// Update the NAV based on treasury bill performance (admin only)
    pub fn update_nav(ctx: Context<UpdateNav>, new_nav: u64) -> Result<()> {
        require!(!ctx.accounts.fund_state.paused, ErrorCode::FundPaused);
        require!(new_nav > 0, ErrorCode::InvalidAmount);

        let fund_state = &mut ctx.accounts.fund_state;
        let old_nav = fund_state.nav_per_share;
        fund_state.nav_per_share = new_nav;

        // Update total assets based on new NAV
        fund_state.total_assets = (fund_state.total_shares * new_nav) / 1_000_000; // Assuming 6 decimals

        msg!("NAV updated from {} to {}", old_nav, new_nav);
        Ok(())
    }

    /// Emergency pause function (admin only)
    pub fn pause_fund(ctx: Context<PauseFund>) -> Result<()> {
        let fund_state = &mut ctx.accounts.fund_state;
        fund_state.paused = true;
        msg!("Fund has been paused");
        Ok(())
    }

    /// Resume fund operations (admin only)
    pub fn resume_fund(ctx: Context<ResumeFund>) -> Result<()> {
        let fund_state = &mut ctx.accounts.fund_state;
        fund_state.paused = false;
        msg!("Fund has been resumed");
        Ok(())
    }
}

/// Fund state account storing global protocol information
#[account]
pub struct FundState {
    pub authority: Pubkey,
    pub total_assets: u64,
    pub total_shares: u64,
    pub nav_per_share: u64,
    pub management_fee: u16, // Basis points (100 = 1%)
    pub liquidity_ratio: u8, // Percentage of assets kept liquid
    pub paused: bool,
    pub bump: u8,
}

/// User's fund account storing individual investment data
#[account]
pub struct UserFundAccount {
    pub owner: Pubkey,
    pub shares: u64,
    pub total_deposits: u64,
    pub total_withdrawals: u64,
    pub last_deposit_slot: u64,
}

/// Context for initializing the fund
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 2 + 1 + 1 + 1,
        seeds = [b"fund_state"],
        bump
    )]
    pub fund_state: Account<'info, FundState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Context for user deposits
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub fund_state: Account<'info, FundState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8,
        seeds = [b"user_fund", user.key().as_ref()],
        bump
    )]
    pub user_fund_account: Account<'info, UserFundAccount>,
    
    #[account(mut)]
    pub fund_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Context for user withdrawals
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub fund_state: Account<'info, FundState>,
    
    #[account(mut)]
    pub user_fund_account: Account<'info, UserFundAccount>,
    
    #[account(mut)]
    pub fund_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

/// Context for NAV updates
#[derive(Accounts)]
pub struct UpdateNav<'info> {
    #[account(
        mut,
        constraint = fund_state.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub authority: Signer<'info>,
}

/// Context for pausing the fund
#[derive(Accounts)]
pub struct PauseFund<'info> {
    #[account(
        mut,
        constraint = fund_state.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub authority: Signer<'info>,
}

/// Context for resuming the fund
#[derive(Accounts)]
pub struct ResumeFund<'info> {
    #[account(
        mut,
        constraint = fund_state.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub fund_state: Account<'info, FundState>,
    
    pub authority: Signer<'info>,
}

/// Custom error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient shares")]
    InsufficientShares,
    #[msg("Fund is currently paused")]
    FundPaused,
} 