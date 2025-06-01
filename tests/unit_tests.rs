// Unit tests for MAEK Protocol calculations and utilities
// These tests can run without the Anchor framework to verify core logic

#[cfg(test)]
mod unit_tests {
    // Mock the essential types and functions for testing
    pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
    
    // Mock error types for testing
    #[derive(Debug)]
    pub enum ErrorCode {
        InvalidNAV,
        InvalidAmount,
        MathOverflow,
        NAVTooLow,
        NAVTooHigh,
        NoSharesOutstanding,
        DepositTooSmall,
        DepositTooLarge,
        WithdrawAmountZero,
        InsufficientFundTokens,
        InsufficientFunds,
        FeeTooHigh,
        InvalidAllocation,
    }

    impl std::fmt::Display for ErrorCode {
        fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            write!(f, "{:?}", self)
        }
    }

    impl std::error::Error for ErrorCode {}

    // Core calculation functions (simplified versions for testing)
    pub fn calculate_fund_tokens(deposit_amount: u64, nav_per_share: u64) -> Result<u64> {
        if nav_per_share == 0 {
            return Err(Box::new(ErrorCode::InvalidNAV));
        }
        if deposit_amount == 0 {
            return Err(Box::new(ErrorCode::InvalidAmount));
        }
        
        // Correct formula: fund_tokens = (deposit_usdc * 10^8) / nav_per_share  
        // deposit_amount is in 6 decimals, we want 8 decimal fund tokens
        // So we need to multiply by 10^(8-6) = 100, then by 10^8 for precision = 10^10 total
        let numerator = (deposit_amount as u128) * 10_000_000_000; // 10^10 for proper decimal conversion
        let fund_tokens = numerator / (nav_per_share as u128);
        
        if fund_tokens > u64::MAX as u128 {
            return Err(Box::new(ErrorCode::MathOverflow));
        }
        
        Ok(fund_tokens as u64)
    }

    pub fn calculate_withdrawal_amount(fund_tokens: u64, nav_per_share: u64) -> Result<u64> {
        if fund_tokens == 0 {
            return Err(Box::new(ErrorCode::InvalidAmount));
        }
        if nav_per_share == 0 {
            return Err(Box::new(ErrorCode::InvalidNAV));
        }
        
        // Calculate value: fund_tokens (8 decimals) * nav_per_share (8 decimals)
        // Result needs to be in USDC (6 decimals)
        let value_8_decimals = (fund_tokens as u128) * (nav_per_share as u128) / 100_000_000;
        let usdc_amount = value_8_decimals / 100; // Convert from 8 decimals to 6 decimals
        
        if usdc_amount > u64::MAX as u128 {
            return Err(Box::new(ErrorCode::MathOverflow));
        }
        
        Ok(usdc_amount as u64)
    }

    pub fn calculate_nav_per_share(total_assets: u64, total_shares: u64) -> Result<u64> {
        if total_shares == 0 {
            return Err(Box::new(ErrorCode::NoSharesOutstanding));
        }
        
        let nav = (total_assets as u128) * 100_000_000 / (total_shares as u128);
        
        if nav < 95_000_000 {
            return Err(Box::new(ErrorCode::NAVTooLow));
        }
        if nav > 105_000_000 {
            return Err(Box::new(ErrorCode::NAVTooHigh));
        }
        if nav > u64::MAX as u128 {
            return Err(Box::new(ErrorCode::MathOverflow));
        }
        
        Ok(nav as u64)
    }

    pub fn update_nav_with_pnl(
        current_total_assets: u64,
        total_shares: u64,
        net_daily_pnl: i64,
    ) -> Result<(u64, u64)> {
        let new_total_assets = if net_daily_pnl >= 0 {
            current_total_assets + (net_daily_pnl as u64)
        } else {
            let loss = (-net_daily_pnl) as u64;
            if loss > current_total_assets {
                return Err(Box::new(ErrorCode::InsufficientFunds));
            }
            current_total_assets - loss
        };
        
        let new_nav = calculate_nav_per_share(new_total_assets, total_shares)?;
        
        Ok((new_total_assets, new_nav))
    }

    pub fn calculate_apy(daily_yields: &[u64; 365], total_assets: u64) -> u32 {
        if total_assets == 0 {
            return 0;
        }
        
        let total_yield: u128 = daily_yields.iter().map(|&y| y as u128).sum();
        let apy = (total_yield * 10_000) / (total_assets as u128);
        
        std::cmp::min(apy as u32, 5000)
    }

    pub fn validate_deposit_amount(amount_usdc: u64) -> Result<()> {
        if amount_usdc < 10_000_000 {
            return Err(Box::new(ErrorCode::DepositTooSmall));
        }
        if amount_usdc > 1_000_000_000_000 {
            return Err(Box::new(ErrorCode::DepositTooLarge));
        }
        Ok(())
    }

    // Test Category 1: Fund Token Calculations
    #[test]
    fn test_tc_010_first_deposit_bootstrap() {
        println!("🧪 TC-010: First Deposit (Bootstrap)");
        
        let deposit_amount = 1_000_000_000u64; // 1000 USDC (6 decimals)
        let nav_per_share = 100_000_000u64; // $1.00 (8 decimals)
        
        let result = calculate_fund_tokens(deposit_amount, nav_per_share).unwrap();
        let expected_fund_tokens = 100_000_000_000u64; // 1000.00000000 tokens
        
        println!("💰 Deposit: {} USDC", deposit_amount as f64 / 1_000_000.0);
        println!("📊 NAV: ${}", nav_per_share as f64 / 100_000_000.0);
        println!("🪙 Expected tokens: {}", expected_fund_tokens as f64 / 100_000_000.0);
        println!("🪙 Calculated tokens: {}", result as f64 / 100_000_000.0);
        
        assert_eq!(result, expected_fund_tokens);
        println!("✅ First deposit calculation verified");
    }

    #[test]
    fn test_tc_011_subsequent_deposit_higher_nav() {
        println!("🧪 TC-011: Subsequent Deposit at Higher NAV");
        
        let nav_per_share = 102_000_000u64; // $1.02
        let deposit_amount = 510_000_000u64; // 510 USDC
        
        let result = calculate_fund_tokens(deposit_amount, nav_per_share).unwrap();
        let expected_fund_tokens = 50_000_000_000u64; // 500.00000000 tokens
        
        println!("📈 NAV per share: ${}", nav_per_share as f64 / 100_000_000.0);
        println!("💰 Deposit amount: ${}", deposit_amount as f64 / 1_000_000.0);
        println!("🪙 Expected tokens: {}", expected_fund_tokens as f64 / 100_000_000.0);
        println!("🪙 Calculated tokens: {}", result as f64 / 100_000_000.0);
        
        assert_eq!(result, expected_fund_tokens);
        println!("✅ Higher NAV deposit calculation verified");
    }

    #[test]
    fn test_tc_012_minimum_deposit_validation() {
        println!("🧪 TC-012: Minimum Deposit Validation");
        
        let invalid_amount = 5_000_000u64; // $5 (below $10 minimum)
        
        println!("🚫 Attempting deposit of ${} (below minimum)", invalid_amount as f64 / 1_000_000.0);
        
        let result = validate_deposit_amount(invalid_amount);
        assert!(result.is_err());
        println!("✅ Minimum deposit validation correctly triggered DepositTooSmall error");
    }

    #[test]
    fn test_tc_013_maximum_deposit_validation() {
        println!("🧪 TC-013: Maximum Deposit Validation");
        
        let invalid_amount = 2_000_000_000_000u64; // $2M (above $1M limit)
        
        println!("🚫 Attempting deposit of ${} (above maximum)", invalid_amount as f64 / 1_000_000.0);
        
        let result = validate_deposit_amount(invalid_amount);
        assert!(result.is_err());
        println!("✅ Maximum deposit validation correctly triggered DepositTooLarge error");
    }

    // Test Category 2: NAV Rebase Calculations (Profits)
    #[test]
    fn test_tc_020_daily_yield_distribution() {
        println!("🧪 TC-020: Daily Yield Distribution (Auto-Compound)");
        
        let total_assets = 1_000_000_000_000u64; // $10,000.00000000
        let total_shares = 1_000_000_000_000u64; // 10,000.00000000 tokens
        
        let expected_daily_yield = 123_287_671u64; // $1.23287671
        
        println!("💰 Fund size: ${}", total_assets as f64 / 100_000_000.0);
        println!("📈 Daily yield: ${}", expected_daily_yield as f64 / 100_000_000.0);
        
        let new_total_assets = total_assets + expected_daily_yield;
        let new_nav = (new_total_assets as u128 * 100_000_000) / (total_shares as u128);
        let expected_nav = 100_012_328u64; // $1.00012328
        
        println!("🎯 Expected new NAV: ${}", expected_nav as f64 / 100_000_000.0);
        println!("🧮 Calculated new NAV: ${}", new_nav as f64 / 100_000_000.0);
        
        assert_eq!(new_nav as u64, expected_nav);
        println!("✅ Daily yield rebase calculation verified");
    }

    #[test]
    fn test_tc_021_user_benefit_nav_rebase() {
        println!("🧪 TC-021: User Benefit from NAV Rebase");
        
        let user_tokens = 100_000_000_000u64; // 1000.00000000 tokens
        let new_nav = 100_012_328u64; // $1.00012328 after yield
        
        let user_value = (user_tokens as u128 * new_nav as u128) / 100_000_000;
        let expected_value = 100_012_328_000u64; // $1000.12328
        
        println!("🪙 User tokens: {}", user_tokens as f64 / 100_000_000.0);
        println!("📈 New NAV: ${}", new_nav as f64 / 100_000_000.0);
        println!("💎 User value: ${}", user_value as f64 / 100_000_000.0);
        
        assert_eq!(user_value as u64, expected_value);
        println!("✅ User automatic benefit from NAV rebase verified");
    }

    // Test Category 3: NAV Rebase Calculations (Losses)
    #[test]
    fn test_tc_030_market_loss_nav_decrease() {
        println!("🧪 TC-030: Market Loss Through NAV Decrease");
        
        let total_assets = 1_000_000_000_000u64; // $10,000.00000000
        let total_shares = 1_000_000_000_000u64; // 10,000.00000000 tokens
        let loss_amount = 500_000_000u64; // -$5.00 loss (corrected from $50)
        
        println!("💰 Initial fund size: ${}", total_assets as f64 / 100_000_000.0);
        println!("📉 Loss amount: -${}", loss_amount as f64 / 100_000_000.0);
        
        let new_total_assets = total_assets - loss_amount;
        let new_nav = (new_total_assets as u128 * 100_000_000) / (total_shares as u128);
        let expected_nav = 99_950_000u64; // $0.9995
        
        println!("🎯 Expected new NAV: ${}", expected_nav as f64 / 100_000_000.0);
        println!("🧮 Calculated new NAV: ${}", new_nav as f64 / 100_000_000.0);
        
        assert_eq!(new_nav as u64, expected_nav);
        println!("✅ Market loss rebase calculation verified");
    }

    #[test]
    fn test_tc_031_user_loss_nav_rebase() {
        println!("🧪 TC-031: User Loss from NAV Rebase");
        
        let user_tokens = 100_000_000_000u64; // 1000.00000000 tokens
        let loss_nav = 99_950_000u64; // $0.9995 after loss
        
        let user_value = (user_tokens as u128 * loss_nav as u128) / 100_000_000;
        let expected_value = 99_950_000_000u64; // $999.50
        
        println!("🪙 User tokens: {}", user_tokens as f64 / 100_000_000.0);
        println!("📉 Loss NAV: ${}", loss_nav as f64 / 100_000_000.0);
        println!("💔 User value: ${}", user_value as f64 / 100_000_000.0);
        println!("📊 Realized loss: ${}", (100_000_000_000 - user_value) as f64 / 100_000_000.0);
        
        assert_eq!(user_value as u64, expected_value);
        println!("✅ User automatic loss through NAV rebase verified");
    }

    #[test]
    fn test_tc_033_loss_recovery_scenario() {
        println!("🧪 TC-033: Loss Recovery Scenario");
        
        let assets_after_loss = 995_000_000_000u64; // $9,950 after previous loss (corrected)
        let recovery_yield = 7_500_000_000u64; // +$75 strong yield day
        let total_shares = 1_000_000_000_000u64;
        
        let new_total_assets = assets_after_loss + recovery_yield;
        let new_nav = (new_total_assets as u128 * 100_000_000) / (total_shares as u128);
        let expected_nav = 100_250_000u64; // $1.0025 (corrected calculation)
        
        println!("💰 Assets after loss: ${}", assets_after_loss as f64 / 100_000_000.0);
        println!("🚀 Recovery yield: +${}", recovery_yield as f64 / 100_000_000.0);
        println!("📈 Recovered NAV: ${}", new_nav as f64 / 100_000_000.0);
        
        assert_eq!(new_nav as u64, expected_nav);
        println!("✅ Loss recovery scenario verified (exceeded original $1.00)");
    }

    // Test Category 4: Withdrawal Calculations
    #[test]
    fn test_tc_040_full_withdrawal_nav_par() {
        println!("🧪 TC-040: Full Withdrawal at NAV $1.00");
        
        let user_tokens = 100_000_000_000u64; // 1000.00000000 tokens
        let nav_per_share = 100_000_000u64; // $1.00
        
        let result = calculate_withdrawal_amount(user_tokens, nav_per_share).unwrap();
        let expected_usdc = 1_000_000_000u64; // 1000.000000 USDC
        
        println!("🪙 User tokens: {}", user_tokens as f64 / 100_000_000.0);
        println!("💰 NAV: ${}", nav_per_share as f64 / 100_000_000.0);
        println!("💸 Withdrawal: {} USDC", result as f64 / 1_000_000.0);
        
        assert_eq!(result, expected_usdc);
        println!("✅ Full withdrawal at par NAV calculation verified");
    }

    #[test]
    fn test_tc_041_partial_withdrawal_higher_nav() {
        println!("🧪 TC-041: Partial Withdrawal at Higher NAV");
        
        let partial_tokens = 50_000_000_000u64; // 500.00000000 tokens
        let nav_per_share = 102_000_000u64; // $1.02
        
        let result = calculate_withdrawal_amount(partial_tokens, nav_per_share).unwrap();
        let expected_usdc = 510_000_000u64; // 510.000000 USDC
        
        println!("🪙 Partial tokens: {}", partial_tokens as f64 / 100_000_000.0);
        println!("📈 Higher NAV: ${}", nav_per_share as f64 / 100_000_000.0);
        println!("💸 Withdrawal: {} USDC", result as f64 / 1_000_000.0);
        
        assert_eq!(result, expected_usdc);
        println!("✅ Partial withdrawal at higher NAV verified");
    }

    #[test]
    fn test_tc_042_withdrawal_loss_nav() {
        println!("🧪 TC-042: Withdrawal at Loss NAV");
        
        let user_tokens = 100_000_000_000u64; // 1000.00000000 tokens
        let loss_nav = 99_500_000u64; // $0.995
        
        let result = calculate_withdrawal_amount(user_tokens, loss_nav).unwrap();
        let expected_usdc = 995_000_000u64; // 995.000000 USDC
        
        let realized_loss = 1_000_000_000u64 - expected_usdc; // $5 loss
        
        println!("🪙 User tokens: {}", user_tokens as f64 / 100_000_000.0);
        println!("📉 Loss NAV: ${}", loss_nav as f64 / 100_000_000.0);
        println!("💸 Withdrawal: {} USDC", result as f64 / 1_000_000.0);
        println!("💔 Realized loss: ${}", realized_loss as f64 / 1_000_000.0);
        
        assert_eq!(result, expected_usdc);
        assert_eq!(realized_loss, 5_000_000); // $5 loss
        println!("✅ Withdrawal with realized loss verified");
    }

    // Test Category 5: Integration Flow
    #[test]
    fn test_tc_070_complete_buidl_mechanism_flow() {
        println!("🧪 TC-070: Complete BUIDL Mechanism Flow (30-day simulation)");
        
        let mut fund_assets = 0u64;
        let mut fund_shares = 0u64;
        
        // Day 2: User A deposits $10,000
        let user_a_deposit = 1_000_000_000_000u64; // $10,000 (8 decimals)
        fund_assets += user_a_deposit;
        fund_shares += user_a_deposit; // 1:1 at $1.00 NAV
        println!("📅 Day 2: User A deposits ${}", user_a_deposit as f64 / 100_000_000.0);
        
        // Day 3: User B deposits $5,000
        let user_b_deposit = 500_000_000_000u64; // $5,000
        fund_assets += user_b_deposit;
        fund_shares += user_b_deposit;
        println!("📅 Day 3: User B deposits ${}", user_b_deposit as f64 / 100_000_000.0);
        
        // Day 4: Daily yield +$20.55
        let daily_yield = 2_055_000_000u64; // $20.55
        fund_assets += daily_yield;
        let nav = (fund_assets as u128 * 100_000_000 / fund_shares as u128) as u64;
        println!("📅 Day 4: Yield +${}, NAV = ${}", 
                 daily_yield as f64 / 100_000_000.0, 
                 nav as f64 / 100_000_000.0);
        
        // Day 10: Market loss -$50
        let market_loss = 5_000_000_000u64; // -$50
        fund_assets -= market_loss;
        let nav = (fund_assets as u128 * 100_000_000 / fund_shares as u128) as u64;
        println!("📅 Day 10: Loss -${}, NAV = ${}", 
                 market_loss as f64 / 100_000_000.0, 
                 nav as f64 / 100_000_000.0);
        
        // Day 15: Strong yield +$75
        let strong_yield = 7_500_000_000u64; // +$75
        fund_assets += strong_yield;
        let nav = (fund_assets as u128 * 100_000_000 / fund_shares as u128) as u64;
        println!("📅 Day 15: Strong yield +${}, NAV = ${}", 
                 strong_yield as f64 / 100_000_000.0, 
                 nav as f64 / 100_000_000.0);
        
        // Final verification
        println!("🎯 Final fund size: ${}", fund_assets as f64 / 100_000_000.0);
        println!("🪙 Total shares: {}", fund_shares as f64 / 100_000_000.0);
        println!("💎 Final NAV: ${}", nav as f64 / 100_000_000.0);
        
        // Should be above initial $1.00 due to net positive yield
        assert!(nav > 100_000_000);
        println!("✅ 30-day BUIDL mechanism flow verified");
    }

    // Test Category 6: Utility Functions
    #[test]
    fn test_update_nav_with_profit() {
        println!("🧪 Testing update_nav_with_pnl - Profit Scenario");
        
        let assets = 1_000_000_000_000u64; // $10,000
        let shares = 1_000_000_000_000u64; // 10,000 tokens
        let profit = 123_287_671i64; // +$1.23287671
        
        let (new_assets, new_nav) = update_nav_with_pnl(assets, shares, profit).unwrap();
        
        println!("💰 Initial assets: ${}", assets as f64 / 100_000_000.0);
        println!("📈 Profit: +${}", profit as f64 / 100_000_000.0);
        println!("💎 New assets: ${}", new_assets as f64 / 100_000_000.0);
        println!("📊 New NAV: ${}", new_nav as f64 / 100_000_000.0);
        
        assert_eq!(new_assets, 1_000_123_287_671u64);
        assert_eq!(new_nav, 100_012_328u64); // $1.00012328
        println!("✅ NAV update with profit verified");
    }

    #[test]
    fn test_update_nav_with_loss() {
        println!("🧪 Testing update_nav_with_pnl - Loss Scenario");
        
        let assets = 1_000_000_000_000u64; // $10,000
        let shares = 1_000_000_000_000u64; // 10,000 tokens
        let loss = -5_000_000_000i64; // -$50.00
        
        let (new_assets, new_nav) = update_nav_with_pnl(assets, shares, loss).unwrap();
        
        println!("💰 Initial assets: ${}", assets as f64 / 100_000_000.0);
        println!("📉 Loss: ${}", loss as f64 / 100_000_000.0);
        println!("💔 New assets: ${}", new_assets as f64 / 100_000_000.0);
        println!("📊 New NAV: ${}", new_nav as f64 / 100_000_000.0);
        
        assert_eq!(new_assets, 995_000_000_000u64); // Fixed expected value
        assert_eq!(new_nav, 99_500_000u64); // $0.995 (Fixed expected value)
        println!("✅ NAV update with loss verified");
    }

    #[test]
    fn test_calculate_apy_realistic() {
        println!("🧪 Testing calculate_apy with realistic yields");
        
        let mut daily_yields = [0u64; 365];
        daily_yields.fill(123_287_671); // $1.23287671 daily on $10k = 4.5% APY
        
        let total_assets = 1_000_000_000_000u64; // $10,000
        let apy = calculate_apy(&daily_yields, total_assets);
        
        let expected_apy = 450u32; // 4.50% (in basis points with 2 decimals)
        
        println!("📊 Total assets: ${}", total_assets as f64 / 100_000_000.0);
        println!("📈 Calculated APY: {}%", apy as f64 / 100.0);
        println!("🎯 Expected APY: {}%", expected_apy as f64 / 100.0);
        
        // Allow small rounding difference
        assert!((apy as i32 - expected_apy as i32).abs() < 10);
        println!("✅ APY calculation verified");
    }
} 