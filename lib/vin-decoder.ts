/**
 * NHTSA VIN Decoder Integration
 * Uses the free NHTSA vPIC API to decode VINs and extract vehicle information
 * API Docs: https://vpic.nhtsa.dot.gov/api/
 */

export interface VINDecodeResult {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  bodyClass?: string;
  trim?: string;
  engineType?: string;
  fuelType?: string;
  driveType?: string;
  manufacturer?: string;
  plantCountry?: string;
  vehicleType?: string;
  valid: boolean;
  errorMessage?: string;
  rawResponse?: NHTSAVariable[];
}

interface NHTSAVariable {
  Variable: string;
  Value: string | null;
  ValueId: string | null;
  VariableId: number;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAVariable[];
}

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Decode a VIN using the NHTSA vPIC API
 * @param vin - Vehicle Identification Number (17 characters)
 * @returns Decoded VIN data
 */
export async function decodeVIN(vin: string): Promise<VINDecodeResult> {
  // Validate VIN format
  if (!vin || typeof vin !== 'string') {
    return {
      vin: vin || '',
      valid: false,
      errorMessage: 'VIN is required',
    };
  }

  // Clean VIN (remove spaces, convert to uppercase)
  const cleanVIN = vin.trim().toUpperCase().replace(/\s/g, '');

  // Check VIN length (should be 17 characters)
  if (cleanVIN.length !== 17) {
    return {
      vin: cleanVIN,
      valid: false,
      errorMessage: `Invalid VIN length: ${cleanVIN.length} characters (expected 17)`,
    };
  }

  // Check for invalid characters (VINs don't use I, O, Q)
  if (/[IOQ]/.test(cleanVIN)) {
    return {
      vin: cleanVIN,
      valid: false,
      errorMessage: 'VIN contains invalid characters (I, O, or Q)',
    };
  }

  try {
    const url = `${NHTSA_API_BASE}/DecodeVin/${cleanVIN}?format=json`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 24 hours (VIN data doesn't change)
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return {
        vin: cleanVIN,
        valid: false,
        errorMessage: `NHTSA API error: ${response.status} ${response.statusText}`,
      };
    }

    const data: NHTSAResponse = await response.json();

    if (!data.Results || data.Results.length === 0) {
      return {
        vin: cleanVIN,
        valid: false,
        errorMessage: 'No data returned from NHTSA API',
      };
    }

    // Extract values from the response
    const getValue = (variableName: string): string | undefined => {
      const variable = data.Results.find((r) => r.Variable === variableName);
      return variable?.Value || undefined;
    };

    const getNumberValue = (variableName: string): number | undefined => {
      const value = getValue(variableName);
      return value ? parseInt(value, 10) : undefined;
    };

    // Check if VIN is valid according to NHTSA
    const errorCode = getValue('Error Code');
    const errorText = getValue('Error Text');

    if (errorCode && errorCode !== '0') {
      return {
        vin: cleanVIN,
        valid: false,
        errorMessage: errorText || 'Invalid VIN according to NHTSA',
        rawResponse: data.Results,
      };
    }

    // Extract vehicle information
    const make = getValue('Make');
    const model = getValue('Model');
    const year = getNumberValue('Model Year');

    // VIN is only valid if we got basic info
    const isValid = !!(make && model && year);

    return {
      vin: cleanVIN,
      make,
      model,
      year,
      bodyClass: getValue('Body Class'),
      trim: getValue('Trim'),
      engineType: getValue('Engine Model'),
      fuelType: getValue('Fuel Type - Primary'),
      driveType: getValue('Drive Type'),
      manufacturer: getValue('Manufacturer Name'),
      plantCountry: getValue('Plant Country'),
      vehicleType: getValue('Vehicle Type'),
      valid: isValid,
      errorMessage: isValid ? undefined : 'Incomplete vehicle data from NHTSA',
      rawResponse: data.Results,
    };
  } catch (error) {
    console.error('Error decoding VIN:', error);
    return {
      vin: cleanVIN,
      valid: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error decoding VIN',
    };
  }
}

/**
 * Verify that a VIN matches the expected make, model, and year
 * @param vin - Vehicle Identification Number
 * @param expectedMake - Expected make (e.g., "Toyota")
 * @param expectedModel - Expected model (e.g., "RAV4")
 * @param expectedYear - Expected year (e.g., 2018)
 * @returns Verification result
 */
export async function verifyVIN(
  vin: string,
  expectedMake: string,
  expectedModel: string,
  expectedYear: number
): Promise<{ matches: boolean; issues: string[]; decoded: VINDecodeResult }> {
  const decoded = await decodeVIN(vin);
  const issues: string[] = [];

  if (!decoded.valid) {
    issues.push(decoded.errorMessage || 'Invalid VIN');
    return { matches: false, issues, decoded };
  }

  // Check make
  if (decoded.make?.toLowerCase() !== expectedMake.toLowerCase()) {
    issues.push(
      `Make mismatch: VIN shows "${decoded.make}", listing shows "${expectedMake}"`
    );
  }

  // Check model (case-insensitive, allow partial matches)
  const decodedModel = decoded.model?.toLowerCase() || '';
  const listingModel = expectedModel.toLowerCase();

  if (!decodedModel.includes(listingModel) && !listingModel.includes(decodedModel)) {
    issues.push(
      `Model mismatch: VIN shows "${decoded.model}", listing shows "${expectedModel}"`
    );
  }

  // Check year
  if (decoded.year !== expectedYear) {
    issues.push(
      `Year mismatch: VIN shows ${decoded.year}, listing shows ${expectedYear}`
    );
  }

  return {
    matches: issues.length === 0,
    issues,
    decoded,
  };
}

/**
 * Batch decode multiple VINs (use sparingly to avoid rate limiting)
 * @param vins - Array of VINs to decode
 * @returns Array of decoded results
 */
export async function batchDecodeVINs(vins: string[]): Promise<VINDecodeResult[]> {
  // Decode sequentially with a small delay to be nice to NHTSA API
  const results: VINDecodeResult[] = [];

  for (const vin of vins) {
    const result = await decodeVIN(vin);
    results.push(result);

    // Small delay between requests (250ms)
    if (vins.indexOf(vin) < vins.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  return results;
}

/**
 * Check if a VIN is for a Toyota or Honda vehicle
 * @param vin - Vehicle Identification Number
 * @returns True if Toyota or Honda
 */
export async function isToyotaOrHonda(vin: string): Promise<boolean> {
  const decoded = await decodeVIN(vin);
  if (!decoded.valid || !decoded.make) return false;

  const make = decoded.make.toLowerCase();
  return make === 'toyota' || make === 'honda';
}

/**
 * Extract just the basic info from a VIN (make, model, year)
 * @param vin - Vehicle Identification Number
 * @returns Basic vehicle info or null if invalid
 */
export async function getBasicVINInfo(
  vin: string
): Promise<{ make: string; model: string; year: number } | null> {
  const decoded = await decodeVIN(vin);

  if (!decoded.valid || !decoded.make || !decoded.model || !decoded.year) {
    return null;
  }

  return {
    make: decoded.make,
    model: decoded.model,
    year: decoded.year,
  };
}
