#!/usr/bin/env ts-node
/**
 * Replace random VIN generation with static VINs
 */

import fs from 'fs';
import path from 'path';

const mockDataPath = path.join(process.cwd(), 'lib', 'mock-data.ts');
let content = fs.readFileSync(mockDataPath, 'utf-8');

// Static VINs for each vehicle (17 characters, valid format)
const staticVINs = [
  // Toyota VINs (start with 4T, 5T, JT, or 2T)
  '4T1K61AK0MU123456', // RAV4
  '5TDDZ3DC7MS234567', // CR-V
  '4T1B11HK9JU345678', // Camry
  '5TDYZ3DC8NS456789', // Highlander
  '4T3ZA3BB2MU567890', // C-HR
  '5TFAW5F14NX678901', // Tundra
  '4T1B11HK1JU789012', // Corolla
  '5TDJZ3DC0NS890123', // 4Runner
  '4T3ZW3BB4NU901234', // Venza
  '2T1BURHE9JC012345', // RAV4 Hybrid
  '4T1BG22K0VU112233', // Avalon
  '5TDYZ3DC1PS223344', // Highlander Hybrid

  // Honda VINs (start with 1HG, 2HG, JHM, or 5J6)
  '2HKRM4H75KH334455', // CR-V
  '5J6RM4H33KL445566', // Pilot
  '2HGFC2F50KH556677', // Civic
  '1HGCV1F36NA667788', // Accord
  '3CZRU6H52KM778899', // HR-V
  '5J6RM4H78KL889900', // Pilot
  '2HKRM4H37JH990011', // CR-V EX
  '1HGCV1F38LA001122', // Accord Sport
  '3CZRU6H74LM112233', // HR-V EX
  '5J6RM4H30ML223344', // Pilot Elite
  '2HGFC2F58MH334455', // Civic Touring
  '1HGCV2F38MA445566', // Accord Hybrid

  // Poor condition vehicles (for testing filters)
  '4T1BG22K8UU556677', // Toyota - High mileage
  '2HKRM4H59HH667788', // Honda - Accident history
  '5TDYZ3DC9KS778899', // Toyota - Multiple owners
  '1HGCV1F30JA889900', // Honda - Rust belt
  '4T3ZA3BB6LU990011', // Toyota - High price
  '2HGFC2F52GH001122', // Honda - Older year
  '5TDJZ3DC4HS112233', // Toyota - Title issue
  '1HGCV2F36GA223344', // Honda - Flood damage
];

// Replace all generateVIN() calls with static VINs
let vinIndex = 0;
content = content.replace(/vin: generateVIN\([^)]+\),/g, () => {
  if (vinIndex >= staticVINs.length) {
    console.warn(`Warning: Not enough static VINs defined (needed ${vinIndex + 1})`);
    return `vin: 'VIN${vinIndex++}PLACEHOLDER',`;
  }
  const vin = staticVINs[vinIndex++];
  return `vin: '${vin}',`;
});

// Write back
fs.writeFileSync(mockDataPath, content, 'utf-8');

console.log(`✅ Replaced ${vinIndex} random VINs with static VINs`);
console.log('✅ Vehicle links will now work consistently!');
