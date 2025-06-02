import BN from 'bn.js';
import Decimal from 'decimal.js';
import { format, formatDistanceToNow } from 'date-fns';

// Configure Decimal.js for high precision
Decimal.set({ precision: 28 });

/**
 * Convert BN to number with specified decimal places
 */
export const bnToNumber = (bn: BN, decimals: number): number => {
  const divisor = new BN(10).pow(new BN(decimals));
  const quotient = bn.div(divisor);
  const remainder = bn.mod(divisor);
  
  return quotient.toNumber() + remainder.toNumber() / divisor.toNumber();
};

/**
 * Convert number to BN with specified decimal places
 */
export const numberToBN = (num: number, decimals: number): BN => {
  const decimal = new Decimal(num);
  const multiplier = new Decimal(10).pow(decimals);
  const result = decimal.mul(multiplier);
  return new BN(result.toFixed(0));
};

/**
 * Format currency with proper decimal places and commas
 */
export const formatCurrency = (amount: number | BN, decimals?: number, symbol = '$'): string => {
  const num = typeof amount === 'number' ? amount : bnToNumber(amount, decimals || 8);
  
  // Determine appropriate decimal places based on amount size
  let decimalPlaces = 2;
  if (num < 0.01 && num > 0) {
    decimalPlaces = 8; // Show full precision for very small amounts
  } else if (num < 1 && num > 0) {
    decimalPlaces = 4; // Show more precision for amounts < $1
  }
  
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}`;
};

/**
 * Format number with appropriate precision and commas
 */
export const formatNumber = (num: number | BN, decimals?: number, maxDecimals = 8): string => {
  const value = typeof num === 'number' ? num : bnToNumber(num, decimals || 8);
  
  // Auto-adjust decimal places based on value
  let decimalPlaces = 2;
  if (value < 0.01 && value > 0) {
    decimalPlaces = Math.min(maxDecimals, 8);
  } else if (value < 1 && value > 0) {
    decimalPlaces = Math.min(maxDecimals, 4);
  } else if (value >= 1000000) {
    decimalPlaces = 0;
  }
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  });
};

/**
 * Format percentage with appropriate precision
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format NAV with full 8-decimal precision
 */
export const formatNAV = (nav: number | BN): string => {
  const value = typeof nav === 'number' ? nav : bnToNumber(nav, 8);
  return `$${value.toFixed(8)}`;
};

/**
 * Format fund tokens with appropriate precision
 */
export const formatFundTokens = (tokens: number | BN): string => {
  const value = typeof tokens === 'number' ? tokens : bnToNumber(tokens, 8);
  return formatNumber(value, 8, 6) + ' MAEK';
};

/**
 * Format USDC amount
 */
export const formatUSDC = (amount: number | BN): string => {
  const value = typeof amount === 'number' ? amount : bnToNumber(amount, 6);
  return formatCurrency(value, 6);
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`;
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`;
  }
  return formatNumber(num);
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | number | string): string => {
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy HH:mm');
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | number | string): string => {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
};

/**
 * Format address for display (show first 4 and last 4 characters)
 */
export const formatAddress = (address: string): string => {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

/**
 * Format transaction signature for display
 */
export const formatSignature = (signature: string): string => {
  return formatAddress(signature);
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format percentage change with appropriate styling classes
 */
export const formatPercentageChange = (
  current: number, 
  previous: number
): { text: string; className: string } => {
  const change = calculatePercentageChange(current, previous);
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  const text = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
  const className = isNeutral 
    ? 'text-gray-500' 
    : isPositive 
      ? 'text-success-600' 
      : 'text-danger-600';
  
  return { text, className };
};

/**
 * Calculate APY from daily yield
 */
export const calculateAPY = (dailyYield: number): number => {
  return (Math.pow(1 + dailyYield, 365) - 1) * 100;
};

/**
 * Format APY
 */
export const formatAPY = (apy: number): string => {
  return `${apy.toFixed(2)}% APY`;
};

/**
 * Parse user input to number with validation
 */
export const parseUserInput = (input: string): number | null => {
  // Remove commas and whitespace
  const cleaned = input.replace(/[,\s]/g, '');
  
  // Check if it's a valid number
  const num = parseFloat(cleaned);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  return num;
};

/**
 * Validate and format user currency input
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 2 for currency
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  
  return cleaned;
};

/**
 * Convert basis points to percentage
 */
export const bpsToPercentage = (bps: number): number => {
  return bps / 100;
};

/**
 * Format basis points as percentage
 */
export const formatBps = (bps: number): string => {
  return formatPercentage(bpsToPercentage(bps));
}; 