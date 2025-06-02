use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum FixedIncomeAssetType {
    TreasuryBill,
    TreasuryNote,
    TreasuryBond,
    CorporateBond,
    CommercialPaper,
    CertificateOfDeposit,
    MunicipalBond,
    AssetBackedSecurity,
    MortgageBackedSecurity,
}

impl Default for FixedIncomeAssetType {
    fn default() -> Self {
        FixedIncomeAssetType::TreasuryBill
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AssetStatus {
    Active,
    Matured,
    Sold,
    DefaultRisk,
}

impl Default for AssetStatus {
    fn default() -> Self {
        AssetStatus::Active
    }
}

#[account]
#[derive(Default)]
pub struct FixedIncomeAsset {
    /// Asset identifier (CUSIP, ISIN, or custom ID)
    pub asset_id: [u8; 12],
    
    /// Asset type (Treasury, Corporate, CD, etc.)
    pub asset_type: FixedIncomeAssetType,
    
    /// Face value in USD (8 decimals)
    pub face_value: u64,
    
    /// Purchase price in USD (8 decimals)
    pub purchase_price: u64,
    
    /// Purchase date timestamp
    pub purchase_date: i64,
    
    /// Maturity date timestamp
    pub maturity_date: i64,
    
    /// Current market value (8 decimals)
    /// Updated daily via oracle
    pub current_value: u64,
    
    /// Annualized yield rate (4 decimals)
    /// e.g., 5000 = 5.00%
    pub yield_rate: u32,
    
    /// Interest accrued to date (8 decimals)
    pub accrued_interest: u64,
    
    /// Last interest calculation date
    pub last_interest_calculation: i64,
    
    /// Asset status
    pub status: AssetStatus,
    
    /// Days to maturity (updated daily)
    pub days_to_maturity: u16,
    
    /// Credit rating (AAA = 1, AA+ = 2, etc.)
    pub credit_rating: u8,
    
    /// Issuer information
    pub issuer: Pubkey,
    
    /// Original duration at purchase (days)
    pub original_duration: u16,
    
    /// Sector classification (Government = 1, Financial = 2, etc.)
    pub sector: u8,
    
    /// Country of issuance (US = 1, CA = 2, etc.)
    pub country: u8,
    
    /// Currency denomination (USD = 1, EUR = 2, etc.)
    pub currency: u8,
    
    /// Reserved space
    pub reserved: [u8; 8],
    
    /// Account bump
    pub bump: u8,
}

impl FixedIncomeAsset {
    pub const LEN: usize = 8 + // discriminator
        12 + // asset_id
        1 + // asset_type
        8 + // face_value
        8 + // purchase_price
        8 + // purchase_date
        8 + // maturity_date
        8 + // current_value
        4 + // yield_rate
        8 + // accrued_interest
        8 + // last_interest_calculation
        1 + // status
        2 + // days_to_maturity
        1 + // credit_rating
        32 + // issuer
        2 + // original_duration
        1 + // sector
        1 + // country
        1 + // currency
        8 + // reserved
        1; // bump
}

// Helper structures for instructions
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AssetValuation {
    pub asset_id: Pubkey,
    pub current_value: u64,
    pub accrued_interest: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AssetPurchase {
    pub asset_type: FixedIncomeAssetType,
    pub asset_id: [u8; 12],
    pub face_value: u64,
    pub purchase_price: u64,
    pub maturity_date: i64,
    pub yield_rate: u32,
    pub credit_rating: u8,
    pub issuer: Pubkey,
    pub sector: u8,
    pub country: u8,
} 