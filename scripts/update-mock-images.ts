#!/usr/bin/env ts-node
/**
 * Script to update all mock data images with real car images
 */

import fs from 'fs';
import path from 'path';

const mockDataPath = path.join(process.cwd(), 'lib', 'mock-data.ts');
let content = fs.readFileSync(mockDataPath, 'utf-8');

// Replace all placeholder image URLs with getCarImageGallery calls
const replacements: Array<[RegExp, string]> = [
  // Match: images_url: ['https://example.com/...'] or images_url: []
  // Replace with: images_url: getCarImageGallery({ make: 'X', model: 'Y', year: Z })
];

// Find all vehicle entries and extract make, model, year
const vehiclePattern = /make: '(\w+)',\s+model: '([^']+)',\s+year: (\d+),[\s\S]*?images_url: \[[^\]]*\]/g;

let match;
const updates: Array<{ original: string; replacement: string }> = [];

while ((match = vehiclePattern.exec(content)) !== null) {
  const [fullMatch, make, model, year] = match;
  const imagesPattern = /images_url: \[[^\]]*\]/;
  const imagesMatch = fullMatch.match(imagesPattern);

  if (imagesMatch) {
    const original = imagesMatch[0];
    const replacement = `images_url: getCarImageGallery({ make: '${make}', model: '${model}', year: ${year} })`;
    updates.push({ original, replacement });
  }
}

// Apply all replacements
updates.forEach(({ original, replacement }) => {
  content = content.replace(original, replacement);
});

// Write back to file
fs.writeFileSync(mockDataPath, content, 'utf-8');

console.log(`✅ Updated ${updates.length} vehicle image entries`);
console.log('✅ Mock data now uses real car images from IMAGIN.studio API');
