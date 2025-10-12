#!/bin/bash

# Script to seed the database with mock data
# Usage: ./scripts/seed-database.sh [--keep-existing]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default: clear existing data
CLEAR_EXISTING=true

# Parse arguments
if [ "$1" = "--keep-existing" ]; then
  CLEAR_EXISTING=false
fi

# API endpoint
API_URL="http://localhost:3000/api/listings/seed"

echo -e "${YELLOW}Seeding database with mock data...${NC}"
echo ""

# Check if server is running
if ! curl -s "$API_URL" > /dev/null 2>&1; then
  echo -e "${RED}Error: Cannot reach API endpoint at $API_URL${NC}"
  echo -e "${YELLOW}Make sure your Next.js dev server is running:${NC}"
  echo "  npm run dev"
  exit 1
fi

# Make the POST request
if [ "$CLEAR_EXISTING" = true ]; then
  echo "Clearing existing listings and inserting mock data..."
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d '{"clearExisting": true}')
else
  echo "Keeping existing listings and adding mock data..."
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d '{"clearExisting": false}')
fi

# Parse response
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | cut -d: -f2)

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}Success!${NC}"
  echo ""
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
  echo -e "${RED}Failed to seed database${NC}"
  echo ""
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo ""
echo -e "${GREEN}Database seeded successfully!${NC}"
echo "You can now view the listings at: http://localhost:3000"
