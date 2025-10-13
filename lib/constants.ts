/**
 * Application Constants
 * Centralized location for all magic numbers and configuration values
 */

// ============================================================================
// QUALITY TIER THRESHOLDS
// ============================================================================

export const QUALITY_TIER = {
  TOP_PICK: {
    MIN_SCORE: 80,
    LABEL: 'Top Pick',
    DESCRIPTION: 'Exceptional vehicles that meet all criteria',
  },
  GOOD_BUY: {
    MIN_SCORE: 65,
    MAX_SCORE: 79,
    LABEL: 'Good Buy',
    DESCRIPTION: 'Solid vehicles with minor compromises',
  },
  CAUTION: {
    MAX_SCORE: 64,
    LABEL: 'Caution',
    DESCRIPTION: 'Vehicles requiring careful consideration',
  },
} as const;

// ============================================================================
// PAGINATION CONSTANTS
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5,
} as const;

// ============================================================================
// SORTING CONSTANTS
// ============================================================================

export const SORT = {
  DEFAULT_FIELD: 'priority' as const,
  DEFAULT_ORDER: 'desc' as const,
} as const;

// ============================================================================
// VEHICLE SEARCH CRITERIA (from search-settings.json)
// ============================================================================

export const SEARCH_CRITERIA = {
  PRICE: {
    MIN: 10000,
    MAX: 20000,
  },
  YEAR: {
    MIN: 2015,
  },
  MILEAGE: {
    MAX: 100000,
    PER_YEAR_IDEAL: 12000,
    PER_YEAR_MAX: 15000,
  },
  OWNER: {
    MAX: 2,
  },
  ACCIDENT: {
    MAX: 0,
  },
  DISTANCE: {
    MAX_MILES: 100,
  },
} as const;

// ============================================================================
// MILEAGE RATING THRESHOLDS
// ============================================================================

export const MILEAGE_RATING = {
  EXCELLENT: {
    MAX_PER_YEAR: 10000,
    LABEL: 'Excellent',
    DESCRIPTION: 'Very low mileage for age',
  },
  GOOD: {
    MIN_PER_YEAR: 10001,
    MAX_PER_YEAR: 13000,
    LABEL: 'Good',
    DESCRIPTION: 'Average mileage',
  },
  ACCEPTABLE: {
    MIN_PER_YEAR: 13001,
    MAX_PER_YEAR: 15000,
    LABEL: 'Acceptable',
    DESCRIPTION: 'Higher mileage but within limits',
  },
} as const;

// ============================================================================
// PRIORITY SCORING WEIGHTS
// ============================================================================

export const SCORING_WEIGHTS = {
  TITLE_STATUS: 15,
  MILEAGE: 25,
  PRICE: 20,
  DISTANCE: 10,
  MODEL_PRIORITY: 15,
  CONDITION: 15,
} as const;

// ============================================================================
// MODEL PRIORITIES
// ============================================================================

export const MODEL_PRIORITY = {
  'RAV4': 20,
  'CR-V': 20,
  'Highlander': 18,
  'Pilot': 18,
  'Camry': 15,
  'Accord': 15,
  'Corolla': 12,
  'Civic': 12,
  'Tacoma': 10,
  'Ridgeline': 10,
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
  ANIMATION: {
    DURATION_FAST: 150,
    DURATION_NORMAL: 200,
    DURATION_SLOW: 300,
  },
  DEBOUNCE: {
    SEARCH: 300,
    FILTER: 500,
  },
  TOAST: {
    SUCCESS_DURATION: 3000,
    ERROR_DURATION: 5000,
  },
} as const;

// ============================================================================
// API CONSTANTS
// ============================================================================

export const API = {
  TIMEOUT: {
    DEFAULT: 30000, // 30 seconds
    VIN_DECODE: 10000, // 10 seconds
    SEARCH: 60000, // 60 seconds
  },
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_DAY: 5000,
  },
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION = {
  VIN: {
    LENGTH: 17,
    PATTERN: /^[A-HJ-NPR-Z0-9]{17}$/i,
  },
  YEAR: {
    MIN: 2000,
    MAX: new Date().getFullYear() + 1,
  },
  PRICE: {
    MIN: 1000,
    MAX: 1000000,
  },
  MILEAGE: {
    MIN: 0,
    MAX: 500000,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get quality tier based on priority score
 */
export function getQualityTier(
  score: number
): 'top_pick' | 'good_buy' | 'caution' {
  if (score >= QUALITY_TIER.TOP_PICK.MIN_SCORE) return 'top_pick';
  if (score >= QUALITY_TIER.GOOD_BUY.MIN_SCORE) return 'good_buy';
  return 'caution';
}

/**
 * Get quality tier label
 */
export function getQualityTierLabel(
  tier: 'top_pick' | 'good_buy' | 'caution'
): string {
  switch (tier) {
    case 'top_pick':
      return QUALITY_TIER.TOP_PICK.LABEL;
    case 'good_buy':
      return QUALITY_TIER.GOOD_BUY.LABEL;
    case 'caution':
      return QUALITY_TIER.CAUTION.LABEL;
    default:
      return 'Unknown';
  }
}

/**
 * Validate VIN format
 */
export function isValidVIN(vin: string): boolean {
  return (
    vin.length === VALIDATION.VIN.LENGTH && VALIDATION.VIN.PATTERN.test(vin)
  );
}

/**
 * Check if year is within valid range
 */
export function isValidYear(year: number): boolean {
  return year >= VALIDATION.YEAR.MIN && year <= VALIDATION.YEAR.MAX;
}

/**
 * Check if price is within valid range
 */
export function isValidPrice(price: number): boolean {
  return price >= VALIDATION.PRICE.MIN && price <= VALIDATION.PRICE.MAX;
}

/**
 * Check if mileage is within valid range
 */
export function isValidMileage(mileage: number): boolean {
  return mileage >= VALIDATION.MILEAGE.MIN && mileage <= VALIDATION.MILEAGE.MAX;
}

/**
 * Get mileage rating based on mileage per year
 */
export function getMileageRating(
  mileagePerYear: number
): 'excellent' | 'good' | 'acceptable' | 'high' {
  if (mileagePerYear <= MILEAGE_RATING.EXCELLENT.MAX_PER_YEAR) {
    return 'excellent';
  }
  if (
    mileagePerYear >= MILEAGE_RATING.GOOD.MIN_PER_YEAR &&
    mileagePerYear <= MILEAGE_RATING.GOOD.MAX_PER_YEAR
  ) {
    return 'good';
  }
  if (
    mileagePerYear >= MILEAGE_RATING.ACCEPTABLE.MIN_PER_YEAR &&
    mileagePerYear <= MILEAGE_RATING.ACCEPTABLE.MAX_PER_YEAR
  ) {
    return 'acceptable';
  }
  return 'high';
}
