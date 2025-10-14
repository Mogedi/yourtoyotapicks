// Filter engine for YourToyotaPicks
// Applies strict criteria to curate vehicle listings based on user requirements

import type { Vehicle, MileageRating, RawListing } from '../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Comprehensive filter criteria based on user requirements
 */
export interface FilterCriteria {
  // Price constraints
  priceMin: number; // Default: $10,000
  priceMax: number; // Default: $20,000

  // Year constraints
  yearMin: number; // Default: 2015
  yearMax: number; // Default: current year
  maxAgeYears: number; // Default: 10 years
  idealAgeMin: number; // Default: 4 years
  idealAgeMax: number; // Default: 7 years

  // Mileage constraints
  mileageAbsoluteMax: number; // Default: 160,000
  mileagePerYearIdeal: number; // Default: 15,000
  mileagePerYearMax: number; // Default: 20,000
  excellentMileageThreshold: number; // Default: 100,000

  // Title & History requirements
  titleStatus: 'clean'; // Only clean titles
  maxAccidents: number; // Default: 0
  maxOwners: number; // Default: 2
  excludeRental: boolean; // Default: true
  excludeFleet: boolean; // Default: true
  requireVIN: boolean; // Default: true
  excludeLiens: boolean; // Default: true

  // Geographic preferences
  excludeRustBelt: boolean; // Default: false (soft preference)
  rustBeltStates: string[]; // List of rust belt state codes

  // Brand & Model
  allowedMakes: ('Toyota' | 'Honda')[];
  modelPriorities: Record<string, number>; // Model name to priority score (1-10)
}

/**
 * Result of applying filters to a listing
 */
export interface FilterResult {
  pass: boolean;
  reasons: string[];
  mileageRating?: MileageRating;
  priorityScore?: number;
  isRustBeltConcern?: boolean;
}

/**
 * Validation result for must-have criteria
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// DEFAULT FILTER CRITERIA
// ============================================================================

/**
 * Default filter criteria based on user requirements
 */
export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  // Price
  priceMin: 10000,
  priceMax: 20000,

  // Year
  yearMin: 2015,
  yearMax: new Date().getFullYear(),
  maxAgeYears: 10,
  idealAgeMin: 4,
  idealAgeMax: 7,

  // Mileage
  mileageAbsoluteMax: 160000,
  mileagePerYearIdeal: 15000,
  mileagePerYearMax: 20000,
  excellentMileageThreshold: 100000,

  // Title & History
  titleStatus: 'clean',
  maxAccidents: 0,
  maxOwners: 2,
  excludeRental: true,
  excludeFleet: true,
  requireVIN: true,
  excludeLiens: true,

  // Geographic
  excludeRustBelt: false, // Soft preference, not hard reject
  rustBeltStates: [
    'OH',
    'MI',
    'WI',
    'IL',
    'IN',
    'MN',
    'IA',
    'PA',
    'NY',
    'MA',
    'CT',
    'VT',
    'NH',
    'ME',
  ],

  // Brand & Model
  allowedMakes: ['Toyota', 'Honda'],
  modelPriorities: {
    RAV4: 10,
    'C-HR': 9,
    'CR-V': 9,
    'HR-V': 8,
    Highlander: 8,
    '4Runner': 7,
    Venza: 7,
    Pilot: 6,
  },
};

// ============================================================================
// RUST BELT CHECKER
// ============================================================================

/**
 * Check if a state is in the rust belt region
 *
 * Rust belt states have higher exposure to road salt and corrosion,
 * which can affect vehicle longevity and resale value.
 *
 * @param state - Two-letter state code (e.g., 'OH', 'MI')
 * @param rustBeltStates - Array of rust belt state codes
 * @returns true if state is in rust belt
 *
 * @example
 * checkRustBeltState('OH', DEFAULT_FILTER_CRITERIA.rustBeltStates) // true
 * checkRustBeltState('TX', DEFAULT_FILTER_CRITERIA.rustBeltStates) // false
 */
export function checkRustBeltState(
  state: string,
  rustBeltStates: string[] = DEFAULT_FILTER_CRITERIA.rustBeltStates
): boolean {
  if (!state) return false;
  const stateUpper = state.toUpperCase();
  return rustBeltStates.includes(stateUpper);
}

// ============================================================================
// MILEAGE RATING CALCULATOR
// ============================================================================

/**
 * Calculate mileage rating based on vehicle age and mileage
 *
 * Rating criteria:
 * - Excellent: < 100K miles regardless of age
 * - Good: <= (age × 15K miles per year)
 * - Acceptable: <= (age × 20K miles per year)
 *
 * @param mileage - Current vehicle mileage
 * @param year - Vehicle year
 * @param criteria - Filter criteria with mileage thresholds
 * @returns MileageRating ('excellent' | 'good' | 'acceptable') or null if exceeds limits
 *
 * @example
 * calculateMileageRating(80000, 2020, DEFAULT_FILTER_CRITERIA) // 'excellent'
 * calculateMileageRating(60000, 2020, DEFAULT_FILTER_CRITERIA) // 'excellent'
 * calculateMileageRating(70000, 2020, DEFAULT_FILTER_CRITERIA) // 'good'
 * calculateMileageRating(95000, 2020, DEFAULT_FILTER_CRITERIA) // 'acceptable'
 */
export function calculateMileageRating(
  mileage: number,
  year: number,
  criteria: FilterCriteria = DEFAULT_FILTER_CRITERIA
): MileageRating | null {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // Handle edge case of brand new or future year vehicles
  const effectiveAge = Math.max(1, age);

  // Calculate thresholds
  const excellentThreshold = criteria.excellentMileageThreshold;
  const goodThreshold = effectiveAge * criteria.mileagePerYearIdeal;
  const acceptableThreshold = effectiveAge * criteria.mileagePerYearMax;

  // Apply rating logic
  if (mileage < excellentThreshold) {
    return 'excellent';
  } else if (mileage <= goodThreshold) {
    return 'good';
  } else if (mileage <= acceptableThreshold) {
    return 'acceptable';
  }

  // Exceeds all thresholds
  return null;
}

// ============================================================================
// PRIORITY SCORE CALCULATOR
// ============================================================================

/**
 * Calculate priority score for a vehicle model
 *
 * Priority scoring (1-10 scale):
 * - 10: RAV4 (highest priority)
 * - 9: C-HR, CR-V
 * - 8: HR-V, Highlander
 * - 7: 4Runner, Venza
 * - 6: Pilot
 * - 5: Default for other models
 *
 * @param model - Vehicle model name
 * @param priorities - Model priority mapping
 * @returns Priority score (1-10)
 *
 * @example
 * calculatePriorityScore('RAV4', DEFAULT_FILTER_CRITERIA.modelPriorities) // 10
 * calculatePriorityScore('CR-V', DEFAULT_FILTER_CRITERIA.modelPriorities) // 9
 * calculatePriorityScore('Camry', DEFAULT_FILTER_CRITERIA.modelPriorities) // 5
 */
export function calculatePriorityScore(
  model: string,
  priorities: Record<string, number> = DEFAULT_FILTER_CRITERIA.modelPriorities
): number {
  if (!model) return 5;

  // Normalize model name (trim whitespace, handle case variations)
  const normalizedModel = model.trim();

  // Direct match
  if (priorities[normalizedModel] !== undefined) {
    return priorities[normalizedModel];
  }

  // Case-insensitive match
  const modelKey = Object.keys(priorities).find(
    (key) => key.toLowerCase() === normalizedModel.toLowerCase()
  );

  if (modelKey && priorities[modelKey] !== undefined) {
    return priorities[modelKey];
  }

  // Default score for unlisted models
  return 5;
}

// ============================================================================
// LISTING VALIDATOR
// ============================================================================

/**
 * Validate listing against all must-have criteria
 *
 * Must-have requirements:
 * - VIN present
 * - Price within range
 * - Year within range
 * - Clean title only
 * - Zero accidents
 * - 1-2 owners max
 * - Not rental/fleet
 * - No liens
 * - Mileage within acceptable range for age
 * - Toyota or Honda only
 *
 * @param listing - Vehicle or raw listing to validate
 * @param criteria - Filter criteria
 * @returns ValidationResult with errors and warnings
 *
 * @example
 * const result = validateListing(vehicle, DEFAULT_FILTER_CRITERIA);
 * if (!result.valid) {
 *   console.log('Errors:', result.errors);
 * }
 */
export function validateListing(
  listing: Partial<Vehicle> | RawListing,
  criteria: FilterCriteria = DEFAULT_FILTER_CRITERIA
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // VIN requirement
  if (criteria.requireVIN && !listing.vin) {
    errors.push('Missing VIN');
  }

  // Brand requirement
  if ('make' in listing && listing.make) {
    if (!criteria.allowedMakes.includes(listing.make as any)) {
      errors.push(
        `Make '${listing.make}' not allowed (must be Toyota or Honda)`
      );
    }
  } else {
    errors.push('Missing make');
  }

  // Price range
  if ('price' in listing && typeof listing.price === 'number') {
    if (listing.price < criteria.priceMin) {
      errors.push(
        `Price $${listing.price.toLocaleString()} below minimum $${criteria.priceMin.toLocaleString()}`
      );
    }
    if (listing.price > criteria.priceMax) {
      errors.push(
        `Price $${listing.price.toLocaleString()} above maximum $${criteria.priceMax.toLocaleString()}`
      );
    }
  } else {
    errors.push('Missing or invalid price');
  }

  // Year range
  if ('year' in listing && typeof listing.year === 'number') {
    const currentYear = new Date().getFullYear();
    const age = currentYear - listing.year;

    if (listing.year < criteria.yearMin) {
      errors.push(`Year ${listing.year} below minimum ${criteria.yearMin}`);
    }
    if (listing.year > criteria.yearMax) {
      errors.push(`Year ${listing.year} above maximum ${criteria.yearMax}`);
    }
    if (age > criteria.maxAgeYears) {
      errors.push(
        `Vehicle age ${age} years exceeds maximum ${criteria.maxAgeYears} years`
      );
    }

    // Age preference (warning, not error)
    if (age < criteria.idealAgeMin || age > criteria.idealAgeMax) {
      warnings.push(
        `Vehicle age ${age} years outside ideal range ${criteria.idealAgeMin}-${criteria.idealAgeMax} years`
      );
    }
  } else {
    errors.push('Missing or invalid year');
  }

  // Mileage validation
  if (
    'mileage' in listing &&
    typeof listing.mileage === 'number' &&
    'year' in listing &&
    typeof listing.year === 'number'
  ) {
    if (listing.mileage > criteria.mileageAbsoluteMax) {
      errors.push(
        `Mileage ${listing.mileage.toLocaleString()} exceeds absolute maximum ${criteria.mileageAbsoluteMax.toLocaleString()}`
      );
    }

    // Dynamic mileage check based on age
    const currentYear = new Date().getFullYear();
    const age = Math.max(1, currentYear - listing.year);
    const maxMileageForAge = age * criteria.mileagePerYearMax;

    if (listing.mileage > maxMileageForAge) {
      errors.push(
        `Mileage ${listing.mileage.toLocaleString()} exceeds maximum ${maxMileageForAge.toLocaleString()} for ${age}-year-old vehicle`
      );
    }
  } else if ('mileage' in listing) {
    errors.push('Missing or invalid mileage');
  }

  // Title status (if available)
  if ('title_status' in listing && listing.title_status) {
    if (listing.title_status !== criteria.titleStatus) {
      errors.push(`Title status '${listing.title_status}' must be 'clean'`);
    }
  }

  // Accident history (if available)
  if (
    'accident_count' in listing &&
    typeof listing.accident_count === 'number'
  ) {
    if (listing.accident_count > criteria.maxAccidents) {
      errors.push(
        `Accident count ${listing.accident_count} exceeds maximum ${criteria.maxAccidents}`
      );
    }
  }

  // Owner count (if available)
  if ('owner_count' in listing && typeof listing.owner_count === 'number') {
    if (listing.owner_count > criteria.maxOwners) {
      errors.push(
        `Owner count ${listing.owner_count} exceeds maximum ${criteria.maxOwners}`
      );
    }
  }

  // Rental/Fleet exclusion (if available)
  if ('is_rental' in listing && typeof listing.is_rental === 'boolean') {
    if (criteria.excludeRental && listing.is_rental) {
      errors.push('Rental vehicles excluded');
    }
  }

  if ('is_fleet' in listing && typeof listing.is_fleet === 'boolean') {
    if (criteria.excludeFleet && listing.is_fleet) {
      errors.push('Fleet vehicles excluded');
    }
  }

  // Lien check (if available)
  if ('has_lien' in listing && typeof listing.has_lien === 'boolean') {
    if (criteria.excludeLiens && listing.has_lien) {
      errors.push('Vehicles with liens excluded');
    }
  }

  // Flood damage check (if available)
  if ('flood_damage' in listing && typeof listing.flood_damage === 'boolean') {
    if (listing.flood_damage) {
      errors.push('Flood damage detected');
    }
  }

  // Geographic warning (rust belt)
  if (
    'state_of_origin' in listing &&
    typeof listing.state_of_origin === 'string'
  ) {
    const isRustBelt = checkRustBeltState(
      listing.state_of_origin,
      criteria.rustBeltStates
    );
    if (isRustBelt) {
      warnings.push(
        `Vehicle from rust belt state (${listing.state_of_origin})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// MAIN FILTER FUNCTION
// ============================================================================

/**
 * Apply all filters to a vehicle listing
 *
 * This is the main entry point for the filter engine. It validates
 * the listing against all criteria and returns a comprehensive result
 * with pass/fail status, reasons, and calculated metrics.
 *
 * Filter stages:
 * 1. Validate must-have criteria (price, year, title, accidents, etc.)
 * 2. Calculate mileage rating
 * 3. Calculate priority score
 * 4. Check rust belt concern
 * 5. Apply soft preferences (geographic, age ideal range)
 *
 * @param listing - Vehicle or raw listing to filter
 * @param criteria - Filter criteria (uses defaults if not provided)
 * @returns FilterResult with pass/fail and detailed reasons
 *
 * @example
 * const result = applyFilters(vehicle, DEFAULT_FILTER_CRITERIA);
 *
 * if (result.pass) {
 *   console.log('Vehicle passed all filters!');
 *   console.log('Mileage rating:', result.mileageRating);
 *   console.log('Priority score:', result.priorityScore);
 * } else {
 *   console.log('Vehicle failed:', result.reasons);
 * }
 */
export function applyFilters(
  listing: Partial<Vehicle> | RawListing,
  criteria: FilterCriteria = DEFAULT_FILTER_CRITERIA
): FilterResult {
  const reasons: string[] = [];
  let pass = true;

  // Stage 1: Validate must-have criteria
  const validation = validateListing(listing, criteria);

  if (!validation.valid) {
    pass = false;
    reasons.push(...validation.errors);
  }

  // Add warnings as informational reasons (don't fail the listing)
  if (validation.warnings.length > 0) {
    reasons.push(...validation.warnings.map((w) => `Warning: ${w}`));
  }

  // Stage 2: Calculate mileage rating
  let mileageRating: MileageRating | undefined;
  if (
    'mileage' in listing &&
    'year' in listing &&
    typeof listing.mileage === 'number' &&
    typeof listing.year === 'number'
  ) {
    const rating = calculateMileageRating(
      listing.mileage,
      listing.year,
      criteria
    );

    if (rating === null) {
      pass = false;
      reasons.push('Mileage exceeds acceptable threshold for vehicle age');
    } else {
      mileageRating = rating;
      reasons.push(`Mileage rating: ${rating}`);
    }
  }

  // Stage 3: Calculate priority score
  let priorityScore: number | undefined;
  if ('model' in listing && listing.model) {
    priorityScore = calculatePriorityScore(
      listing.model,
      criteria.modelPriorities
    );
    reasons.push(`Priority score: ${priorityScore}/10`);
  }

  // Stage 4: Check rust belt concern
  let isRustBeltConcern = false;
  if (
    'state_of_origin' in listing &&
    typeof listing.state_of_origin === 'string'
  ) {
    isRustBeltConcern = checkRustBeltState(
      listing.state_of_origin,
      criteria.rustBeltStates
    );

    if (isRustBeltConcern) {
      reasons.push(
        `Rust belt concern: vehicle from ${listing.state_of_origin}`
      );

      // If excludeRustBelt is true, fail the listing
      if (criteria.excludeRustBelt) {
        pass = false;
        reasons.push('Rust belt vehicles excluded by filter criteria');
      }
    }
  }

  // Success message if passed
  if (pass && reasons.length === 0) {
    reasons.push('Vehicle meets all filter criteria');
  }

  return {
    pass,
    reasons,
    mileageRating,
    priorityScore,
    isRustBeltConcern,
  };
}

// ============================================================================
// BATCH FILTERING UTILITIES
// ============================================================================

/**
 * Filter an array of listings and return only those that pass
 *
 * @param listings - Array of vehicles or raw listings
 * @param criteria - Filter criteria
 * @returns Array of passing listings with filter results
 *
 * @example
 * const passing = filterListings(allListings, DEFAULT_FILTER_CRITERIA);
 * console.log(`${passing.length} of ${allListings.length} listings passed`);
 */
export function filterListings(
  listings: (Partial<Vehicle> | RawListing)[],
  criteria: FilterCriteria = DEFAULT_FILTER_CRITERIA
): Array<{ listing: Partial<Vehicle> | RawListing; result: FilterResult }> {
  return listings
    .map((listing) => ({
      listing,
      result: applyFilters(listing, criteria),
    }))
    .filter(({ result }) => result.pass);
}

/**
 * Get filter statistics for an array of listings
 *
 * @param listings - Array of vehicles or raw listings
 * @param criteria - Filter criteria
 * @returns Statistics about filter results
 *
 * @example
 * const stats = getFilterStats(allListings, DEFAULT_FILTER_CRITERIA);
 * console.log(`Pass rate: ${stats.passRate}%`);
 * console.log('Common rejection reasons:', stats.rejectionReasons);
 */
export function getFilterStats(
  listings: (Partial<Vehicle> | RawListing)[],
  criteria: FilterCriteria = DEFAULT_FILTER_CRITERIA
): {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  rejectionReasons: Record<string, number>;
  mileageRatings: Record<MileageRating, number>;
  priorityScores: Record<number, number>;
} {
  const results = listings.map((listing) => applyFilters(listing, criteria));

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  // Count rejection reasons
  const rejectionReasons: Record<string, number> = {};
  results.forEach((result) => {
    if (!result.pass) {
      result.reasons.forEach((reason) => {
        // Skip warnings
        if (!reason.startsWith('Warning:')) {
          rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
        }
      });
    }
  });

  // Count mileage ratings
  const mileageRatings: Record<MileageRating, number> = {
    excellent: 0,
    good: 0,
    acceptable: 0,
  };
  results.forEach((result) => {
    if (result.mileageRating) {
      mileageRatings[result.mileageRating]++;
    }
  });

  // Count priority scores
  const priorityScores: Record<number, number> = {};
  results.forEach((result) => {
    if (result.priorityScore !== undefined) {
      priorityScores[result.priorityScore] =
        (priorityScores[result.priorityScore] || 0) + 1;
    }
  });

  return {
    total: listings.length,
    passed,
    failed,
    passRate:
      listings.length > 0 ? Math.round((passed / listings.length) * 100) : 0,
    rejectionReasons,
    mileageRatings,
    priorityScores,
  };
}
