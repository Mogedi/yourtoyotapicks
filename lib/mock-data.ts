// Mock data generator for YourToyotaPicks testing
// Contains realistic Toyota/Honda vehicle listings with a mix of passing and failing criteria

import type { VehicleInsert, QualityTier } from './types';
import { getCarImageGallery } from './car-images';

// Helper to calculate quality tier from priority score
function getQualityTier(score: number): QualityTier {
  if (score >= 80) return 'top_pick';
  if (score >= 65) return 'good_buy';
  return 'caution';
}

// Helper to generate AI summary based on vehicle attributes
function generateAISummary(vehicle: Partial<VehicleInsert>): string {
  const highlights: string[] = [];

  // Title & accident history
  if (vehicle.title_status === 'clean' && vehicle.accident_count === 0) {
    highlights.push('✅ Clean history');
  }

  // Owner count
  if (vehicle.owner_count === 1) {
    highlights.push('1-owner');
  }

  // Price context (simplified - in real implementation this would use market data)
  const score = vehicle.priority_score || 0;
  if (score >= 90) {
    highlights.push('📉 $1.8k below market');
  } else if (score >= 85) {
    highlights.push('📉 $1.2k below market');
  } else if (score >= 75) {
    highlights.push('💰 Below market');
  }

  // Mileage quality
  if (vehicle.mileage_rating === 'excellent') {
    highlights.push('📉 Low miles for age');
  }

  // Rust belt
  if (!vehicle.is_rust_belt_state) {
    highlights.push('🧊 No rust belt');
  }

  // Distance
  if (vehicle.distance_miles && vehicle.distance_miles <= 20) {
    highlights.push('📍 Very close');
  } else if (vehicle.distance_miles && vehicle.distance_miles <= 40) {
    highlights.push('📍 Nearby');
  }

  // Handle caution cases
  if (score < 65) {
    const warnings: string[] = [];
    if (vehicle.accident_count && vehicle.accident_count > 0) {
      warnings.push(`⚠️ ${vehicle.accident_count} accident${vehicle.accident_count > 1 ? 's' : ''}`);
    }
    if (vehicle.mileage && vehicle.mileage > 120000) {
      warnings.push('⚠️ High mileage');
    }
    if (vehicle.owner_count && vehicle.owner_count > 2) {
      warnings.push('⚠️ Multiple owners');
    }
    if (vehicle.is_rental) {
      warnings.push('⚠️ Former rental');
    }
    if (vehicle.is_fleet) {
      warnings.push('⚠️ Fleet vehicle');
    }
    if (warnings.length > 0) {
      return warnings.slice(0, 3).join(' • ');
    }
  }

  // Return top 5 highlights
  return highlights.slice(0, 5).join(' • ') || 'Clean vehicle';
}

// Helper to enrich vehicle with curator fields
function enrichVehicle(vehicle: VehicleInsert): VehicleInsert {
  return {
    ...vehicle,
    quality_tier: getQualityTier(vehicle.priority_score),
    ai_summary: generateAISummary(vehicle),
  };
}

// Rust belt states (from typical used car definitions)
const RUST_BELT_STATES = [
  'OH', 'MI', 'IL', 'IN', 'PA', 'NY', 'WI', 'MN', 'IA', 'MO'
];

// Non-rust belt states
const CLEAN_STATES = [
  'CA', 'TX', 'FL', 'AZ', 'NC', 'GA', 'TN', 'CO', 'NV', 'OR', 'WA'
];

// Helper to generate realistic VIN numbers
// Format: WMI (3) + VDS (6) + VIS (8) = 17 characters
function generateVIN(make: 'Toyota' | 'Honda', year: number): string {
  // Toyota WMI codes: 4T1, 5TD, JTM, 2T1, etc.
  // Honda WMI codes: 1HG, 2HG, JHM, 3HG, etc.
  const toyotaWMI = ['4T1', '5TD', 'JTM', '2T1', '5TF', '4T3'];
  const hondaWMI = ['1HG', '2HG', 'JHM', '3HG', '5J6', '19X'];

  const wmi = make === 'Toyota'
    ? toyotaWMI[Math.floor(Math.random() * toyotaWMI.length)]
    : hondaWMI[Math.floor(Math.random() * hondaWMI.length)];

  // Generate VDS (6 chars) + VIS (8 chars) = 14 more characters
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; // Excludes I, O, Q
  let vin = wmi;
  for (let i = 0; i < 14; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return vin;
}

// Helper to get random element from array
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to get random int in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Base vehicle listings (without curator fields)
const baseListings: VehicleInsert[] = [
  // ============================================================================
  // EXCELLENT LISTINGS (12 listings) - Pass all filters
  // ============================================================================

  // 1. Toyota RAV4 - Excellent condition
  {
    vin: '4T1K61AK0MU123456', // Static VIN for consistent navigation
    make: 'Toyota',
    model: 'RAV4',
    year: 2021,
    body_type: 'SUV',
    price: 26500,
    mileage: 28000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'CA',
    is_rust_belt_state: false,
    current_location: 'San Francisco, CA',
    distance_miles: 15,
    dealer_name: 'Bay Area Auto Sales',
    priority_score: 95,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/1',
    source_listing_id: 'MC-RAV4-001',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'RAV4', year: 2021 }),
    reviewed_by_user: false,
  },

  // 2. Honda CR-V - Great commuter
  {
    vin: '2HKRM4H75KH334455',
    make: 'Honda',
    model: 'CR-V',
    year: 2020,
    body_type: 'SUV',
    price: 24800,
    mileage: 32000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'TX',
    is_rust_belt_state: false,
    current_location: 'Austin, TX',
    distance_miles: 45,
    dealer_name: 'Austin Honda Center',
    priority_score: 92,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/2',
    source_listing_id: 'AD-CRV-002',
    images_url: getCarImageGallery({ make: 'Honda', model: 'CR-V', year: 2020 }),
    reviewed_by_user: false,
  },

  // 3. Toyota Camry - Low mileage sedan
  {
    vin: '5TDDZ3DC7MS234567',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    body_type: 'Sedan',
    price: 25900,
    mileage: 18000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'FL',
    is_rust_belt_state: false,
    current_location: 'Miami, FL',
    distance_miles: 30,
    dealer_name: 'Sunshine Toyota',
    priority_score: 96,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/3',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'RAV4', year: 2021 }),
    reviewed_by_user: false,
  },

  // 4. Honda Accord - Reliable sedan
  {
    vin: '4T1B11HK9JU345678',
    make: 'Honda',
    model: 'Accord',
    year: 2021,
    body_type: 'Sedan',
    price: 24500,
    mileage: 25000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'NC',
    is_rust_belt_state: false,
    current_location: 'Charlotte, NC',
    distance_miles: 20,
    dealer_name: 'Carolina Auto Group',
    priority_score: 93,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/4',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Accord', year: 2021 }),
    reviewed_by_user: false,
  },

  // 5. Toyota Corolla - Budget friendly
  {
    vin: '5TDYZ3DC8NS456789',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    body_type: 'Sedan',
    price: 18500,
    mileage: 35000,
    mileage_rating: 'good',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'AZ',
    is_rust_belt_state: false,
    current_location: 'Phoenix, AZ',
    distance_miles: 40,
    dealer_name: 'Desert Motors',
    priority_score: 88,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/5',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Corolla', year: 2020 }),
    reviewed_by_user: false,
  },

  // 6. Honda Civic - Popular compact
  {
    vin: '4T3ZA3BB2MU567890',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    body_type: 'Sedan',
    price: 21500,
    mileage: 22000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'GA',
    is_rust_belt_state: false,
    current_location: 'Atlanta, GA',
    distance_miles: 25,
    dealer_name: 'Atlanta Honda Depot',
    priority_score: 91,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/6',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Civic', year: 2021 }),
    reviewed_by_user: false,
  },

  // 7. Toyota Highlander - Family SUV
  {
    vin: '5TFAW5F14NX678901',
    make: 'Toyota',
    model: 'Highlander',
    year: 2020,
    body_type: 'SUV',
    price: 32500,
    mileage: 38000,
    mileage_rating: 'good',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'CO',
    is_rust_belt_state: false,
    current_location: 'Denver, CO',
    distance_miles: 35,
    dealer_name: 'Mountain View Auto',
    priority_score: 90,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/7',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Highlander', year: 2020 }),
    reviewed_by_user: false,
  },

  // 8. Honda Pilot - Three-row SUV
  {
    vin: '4T1B11HK1JU789012',
    make: 'Honda',
    model: 'Pilot',
    year: 2021,
    body_type: 'SUV',
    price: 34500,
    mileage: 27000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'TN',
    is_rust_belt_state: false,
    current_location: 'Nashville, TN',
    distance_miles: 50,
    dealer_name: 'Music City Motors',
    priority_score: 89,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/8',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Pilot', year: 2021 }),
    reviewed_by_user: false,
  },

  // 9. Toyota 4Runner - Adventure ready
  {
    vin: '5TDJZ3DC0NS890123',
    make: 'Toyota',
    model: '4Runner',
    year: 2019,
    body_type: 'SUV',
    price: 34000,
    mileage: 42000,
    mileage_rating: 'good',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'OR',
    is_rust_belt_state: false,
    current_location: 'Portland, OR',
    distance_miles: 60,
    dealer_name: 'Pacific Northwest Auto',
    priority_score: 87,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/9',
    images_url: getCarImageGallery({ make: 'Toyota', model: '4Runner', year: 2019 }),
    reviewed_by_user: false,
  },

  // 10. Honda HR-V - Compact SUV
  {
    vin: '4T3ZW3BB4NU901234',
    make: 'Honda',
    model: 'HR-V',
    year: 2022,
    body_type: 'SUV',
    price: 23500,
    mileage: 15000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'WA',
    is_rust_belt_state: false,
    current_location: 'Seattle, WA',
    distance_miles: 28,
    dealer_name: 'Emerald City Honda',
    priority_score: 94,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/10',
    images_url: getCarImageGallery({ make: 'Honda', model: 'HR-V', year: 2022 }),
    reviewed_by_user: false,
  },

  // 11. Toyota C-HR - Stylish crossover
  {
    vin: '2T1BURHE9JC012345',
    make: 'Toyota',
    model: 'C-HR',
    year: 2021,
    body_type: 'SUV',
    price: 22800,
    mileage: 24000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'NV',
    is_rust_belt_state: false,
    current_location: 'Las Vegas, NV',
    distance_miles: 42,
    dealer_name: 'Vegas Valley Toyota',
    priority_score: 90,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/11',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'C-HR', year: 2021 }),
    reviewed_by_user: false,
  },

  // 12. Toyota RAV4 - Another great option
  {
    vin: '4T1BG22K0VU112233',
    make: 'Toyota',
    model: 'RAV4',
    year: 2020,
    body_type: 'SUV',
    price: 25200,
    mileage: 36000,
    mileage_rating: 'good',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'TX',
    is_rust_belt_state: false,
    current_location: 'Dallas, TX',
    distance_miles: 38,
    dealer_name: 'Lone Star Motors',
    priority_score: 88,
    flag_rust_concern: false,
    overall_rating: 'high',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/12',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'RAV4', year: 2020 }),
    reviewed_by_user: false,
  },

  // ============================================================================
  // PRICE FAILURES (6 listings) - Over $35,000
  // ============================================================================

  // 13. Toyota Highlander - Too expensive
  {
    vin: '5TDYZ3DC1PS223344',
    make: 'Toyota',
    model: 'Highlander',
    year: 2022,
    body_type: 'SUV',
    price: 42500,
    mileage: 22000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'CA',
    is_rust_belt_state: false,
    current_location: 'Los Angeles, CA',
    distance_miles: 18,
    dealer_name: 'LA Premium Auto',
    priority_score: 65,
    flag_rust_concern: false,
    overall_rating: 'medium',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/13',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Highlander', year: 2022 }),
    reviewed_by_user: false,
  },

  // 14. Honda Pilot - Overpriced
  {
    vin: '5J6RM4H78KL889900',
    make: 'Honda',
    model: 'Pilot',
    year: 2023,
    body_type: 'SUV',
    price: 45800,
    mileage: 8000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'FL',
    is_rust_belt_state: false,
    current_location: 'Tampa, FL',
    distance_miles: 55,
    dealer_name: 'Tampa Bay Honda',
    priority_score: 62,
    flag_rust_concern: false,
    overall_rating: 'medium',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/14',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Pilot', year: 2023 }),
    reviewed_by_user: false,
  },

  // 15. Toyota 4Runner - High price
  {
    vin: '5J6RM4H33KL445566',
    make: 'Toyota',
    model: '4Runner',
    year: 2021,
    body_type: 'SUV',
    price: 39900,
    mileage: 28000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'CO',
    is_rust_belt_state: false,
    current_location: 'Boulder, CO',
    distance_miles: 48,
    dealer_name: 'Rocky Mountain Toyota',
    priority_score: 68,
    flag_rust_concern: false,
    overall_rating: 'medium',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/15',
    images_url: getCarImageGallery({ make: 'Toyota', model: '4Runner', year: 2021 }),
    reviewed_by_user: false,
  },

  // 16. Honda Accord - Premium trim, too expensive
  {
    vin: '2HGFC2F50KH556677',
    make: 'Honda',
    model: 'Accord',
    year: 2023,
    body_type: 'Sedan',
    price: 38500,
    mileage: 12000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'GA',
    is_rust_belt_state: false,
    current_location: 'Savannah, GA',
    distance_miles: 65,
    dealer_name: 'Coastal Honda',
    priority_score: 64,
    flag_rust_concern: false,
    overall_rating: 'medium',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/16',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Accord', year: 2023 }),
    reviewed_by_user: false,
  },

  // 17. Toyota Camry - Too pricey
  {
    vin: '1HGCV1F36NA667788',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    body_type: 'Sedan',
    price: 36200,
    mileage: 9000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'AZ',
    is_rust_belt_state: false,
    current_location: 'Scottsdale, AZ',
    distance_miles: 52,
    dealer_name: 'Desert Luxury Motors',
    priority_score: 66,
    flag_rust_concern: false,
    overall_rating: 'medium',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/17',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Camry', year: 2023 }),
    reviewed_by_user: false,
  },

  // 18. Toyota RAV4 - Overpriced
  {
    vin: '3CZRU6H52KM778899',
    make: 'Toyota',
    model: 'RAV4',
    year: 2022,
    body_type: 'SUV',
    price: 37500,
    mileage: 18000,
    mileage_rating: 'excellent',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'WA',
    is_rust_belt_state: false,
    current_location: 'Bellevue, WA',
    distance_miles: 35,
    dealer_name: 'Eastside Toyota',
    priority_score: 63,
    flag_rust_concern: false,
    overall_rating: 'medium',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/18',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'RAV4', year: 2022 }),
    reviewed_by_user: false,
  },

  // ============================================================================
  // MILEAGE FAILURES (4 listings) - Over 120,000 miles
  // ============================================================================

  // 19. Honda CR-V - High mileage
  {
    vin: '2HKRM4H37JH990011',
    make: 'Honda',
    model: 'CR-V',
    year: 2017,
    body_type: 'SUV',
    price: 18500,
    mileage: 135000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'TX',
    is_rust_belt_state: false,
    current_location: 'Houston, TX',
    distance_miles: 42,
    dealer_name: 'Houston Auto Mall',
    priority_score: 45,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/19',
    images_url: getCarImageGallery({ make: 'Honda', model: 'CR-V', year: 2017 }),
    reviewed_by_user: false,
  },

  // 20. Toyota Camry - Too many miles
  {
    vin: '4T1B11HK7KU456789',
    make: 'Toyota',
    model: 'Camry',
    year: 2016,
    body_type: 'Sedan',
    price: 14500,
    mileage: 148000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'FL',
    is_rust_belt_state: false,
    current_location: 'Orlando, FL',
    distance_miles: 68,
    dealer_name: 'Central Florida Auto',
    priority_score: 42,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/20',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Camry', year: 2016 }),
    reviewed_by_user: false,
  },

  // 21. Honda Civic - Heavy use
  {
    vin: '1HGCV1F38LA001122',
    make: 'Honda',
    model: 'Civic',
    year: 2018,
    body_type: 'Sedan',
    price: 16200,
    mileage: 125000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'CA',
    is_rust_belt_state: false,
    current_location: 'San Diego, CA',
    distance_miles: 58,
    dealer_name: 'San Diego Motors',
    priority_score: 48,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/21',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Civic', year: 2018 }),
    reviewed_by_user: false,
  },

  // 22. Toyota Corolla - Excessive mileage
  {
    vin: '3CZRU6H74LM112233',
    make: 'Toyota',
    model: 'Corolla',
    year: 2017,
    body_type: 'Sedan',
    price: 12800,
    mileage: 152000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 1,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'NC',
    is_rust_belt_state: false,
    current_location: 'Raleigh, NC',
    distance_miles: 72,
    dealer_name: 'Triangle Auto Sales',
    priority_score: 38,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/22',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Corolla', year: 2017 }),
    reviewed_by_user: false,
  },

  // ============================================================================
  // ACCIDENT HISTORY FAILURES (3 listings) - 2+ accidents
  // ============================================================================

  // 23. Honda Accord - Multiple accidents
  {
    vin: '5J6RM4H30ML223344',
    make: 'Honda',
    model: 'Accord',
    year: 2019,
    body_type: 'Sedan',
    price: 19500,
    mileage: 52000,
    mileage_rating: 'good',
    title_status: 'clean',
    accident_count: 2,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'GA',
    is_rust_belt_state: false,
    current_location: 'Augusta, GA',
    distance_miles: 45,
    dealer_name: 'Garden City Auto',
    priority_score: 35,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/23',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Accord', year: 2019 }),
    reviewed_by_user: false,
  },

  // 24. Toyota RAV4 - Accident history
  {
    vin: '2HGFC2F58MH334455',
    make: 'Toyota',
    model: 'RAV4',
    year: 2018,
    body_type: 'SUV',
    price: 21200,
    mileage: 68000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 3,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'AZ',
    is_rust_belt_state: false,
    current_location: 'Tucson, AZ',
    distance_miles: 52,
    dealer_name: 'Desert Valley Motors',
    priority_score: 28,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/24',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'RAV4', year: 2018 }),
    reviewed_by_user: false,
  },

  // 25. Honda CR-V - Poor accident record
  {
    vin: '1HGCV2F38MA445566',
    make: 'Honda',
    model: 'CR-V',
    year: 2019,
    body_type: 'SUV',
    price: 22800,
    mileage: 58000,
    mileage_rating: 'good',
    title_status: 'clean',
    accident_count: 2,
    owner_count: 1,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'TN',
    is_rust_belt_state: false,
    current_location: 'Memphis, TN',
    distance_miles: 62,
    dealer_name: 'Memphis Motor Co',
    priority_score: 32,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/25',
    images_url: getCarImageGallery({ make: 'Honda', model: 'CR-V', year: 2019 }),
    reviewed_by_user: false,
  },

  // ============================================================================
  // MULTIPLE OWNER FAILURES (3 listings) - 3+ owners
  // ============================================================================

  // 26. Toyota Camry - Too many owners
  {
    vin: '4T1BG22K8UU556677',
    make: 'Toyota',
    model: 'Camry',
    year: 2018,
    body_type: 'Sedan',
    price: 18900,
    mileage: 72000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 4,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'FL',
    is_rust_belt_state: false,
    current_location: 'Jacksonville, FL',
    distance_miles: 48,
    dealer_name: 'First Coast Auto',
    priority_score: 40,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/26',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Camry', year: 2018 }),
    reviewed_by_user: false,
  },

  // 27. Honda Civic - High turnover
  {
    vin: '2HKRM4H59HH667788',
    make: 'Honda',
    model: 'Civic',
    year: 2017,
    body_type: 'Sedan',
    price: 15500,
    mileage: 88000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 1,
    owner_count: 3,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'CA',
    is_rust_belt_state: false,
    current_location: 'Sacramento, CA',
    distance_miles: 55,
    dealer_name: 'Capital City Motors',
    priority_score: 42,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/27',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Civic', year: 2017 }),
    reviewed_by_user: false,
  },

  // 28. Toyota Corolla - Multiple owners
  {
    vin: '5TDYZ3DC9KS778899',
    make: 'Toyota',
    model: 'Corolla',
    year: 2019,
    body_type: 'Sedan',
    price: 17200,
    mileage: 65000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 3,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'TX',
    is_rust_belt_state: false,
    current_location: 'San Antonio, TX',
    distance_miles: 38,
    dealer_name: 'Alamo Auto Sales',
    priority_score: 44,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/28',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Corolla', year: 2019 }),
    reviewed_by_user: false,
  },

  // ============================================================================
  // RENTAL/FLEET FAILURES (2 listings)
  // ============================================================================

  // 29. Honda Accord - Former rental
  {
    vin: '1HGCV1F30JA889900',
    make: 'Honda',
    model: 'Accord',
    year: 2020,
    body_type: 'Sedan',
    price: 20500,
    mileage: 62000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: true,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'FL',
    is_rust_belt_state: false,
    current_location: 'Fort Lauderdale, FL',
    distance_miles: 45,
    dealer_name: 'Sunshine State Auto',
    priority_score: 30,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/29',
    images_url: getCarImageGallery({ make: 'Honda', model: 'Accord', year: 2020 }),
    reviewed_by_user: false,
  },

  // 30. Toyota Camry - Fleet vehicle
  {
    vin: '4T3ZA3BB6LU990011',
    make: 'Toyota',
    model: 'Camry',
    year: 2019,
    body_type: 'Sedan',
    price: 19800,
    mileage: 78000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 1,
    is_rental: false,
    is_fleet: true,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'CA',
    is_rust_belt_state: false,
    current_location: 'Fresno, CA',
    distance_miles: 62,
    dealer_name: 'Valley Auto Center',
    priority_score: 32,
    flag_rust_concern: false,
    overall_rating: 'low',
    source_platform: 'Carapis',
    source_url: 'https://example.com/listing/30',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'Camry', year: 2019 }),
    reviewed_by_user: false,
  },

  // ============================================================================
  // RUST BELT FAILURES (2 listings)
  // ============================================================================

  // 31. Honda CR-V - Rust belt origin
  {
    vin: '2HGFC2F52GH001122',
    make: 'Honda',
    model: 'CR-V',
    year: 2018,
    body_type: 'SUV',
    price: 19500,
    mileage: 68000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 0,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'OH',
    is_rust_belt_state: true,
    current_location: 'Cleveland, OH',
    distance_miles: 75,
    dealer_name: 'Lake Erie Auto',
    priority_score: 38,
    flag_rust_concern: true,
    overall_rating: 'low',
    source_platform: 'Marketcheck',
    source_url: 'https://example.com/listing/31',
    images_url: getCarImageGallery({ make: 'Honda', model: 'CR-V', year: 2018 }),
    reviewed_by_user: false,
  },

  // 32. Toyota RAV4 - Michigan origin
  {
    vin: '5TDJZ3DC4HS112233',
    make: 'Toyota',
    model: 'RAV4',
    year: 2017,
    body_type: 'SUV',
    price: 18200,
    mileage: 82000,
    mileage_rating: 'acceptable',
    title_status: 'clean',
    accident_count: 1,
    owner_count: 2,
    is_rental: false,
    is_fleet: false,
    has_lien: false,
    flood_damage: false,
    state_of_origin: 'MI',
    is_rust_belt_state: true,
    current_location: 'Detroit, MI',
    distance_miles: 88,
    dealer_name: 'Motor City Auto',
    priority_score: 35,
    flag_rust_concern: true,
    overall_rating: 'low',
    source_platform: 'Auto.dev',
    source_url: 'https://example.com/listing/32',
    images_url: getCarImageGallery({ make: 'Toyota', model: 'RAV4', year: 2017 }),
    reviewed_by_user: false,
  },
];

// Enrich all listings with curator fields (quality_tier, ai_summary)
export const mockListings: VehicleInsert[] = baseListings.map(enrichVehicle);

// Export summary statistics
export const mockDataStats = {
  total: mockListings.length,
  passing: 12,
  failing: {
    price: 6,
    mileage: 4,
    accidents: 3,
    owners: 3,
    rental_fleet: 2,
    rust_belt: 2,
  },
  byMake: {
    Toyota: mockListings.filter(l => l.make === 'Toyota').length,
    Honda: mockListings.filter(l => l.make === 'Honda').length,
  },
  byModel: mockListings.reduce((acc, l) => {
    acc[l.model] = (acc[l.model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
};
