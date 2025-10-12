#!/bin/bash

# Test script for daily cron job
# Tests both local development and production endpoints

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== YourToyotaPicks Cron Job Test ===${NC}\n"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    echo "Please copy .env.local.example to .env.local and configure it"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Check required variables
if [ -z "$CRON_SECRET" ]; then
    echo -e "${RED}Error: CRON_SECRET not set in .env.local${NC}"
    echo "Generate one with: openssl rand -base64 32"
    exit 1
fi

# Default to localhost if no URL provided
BASE_URL=${1:-"http://localhost:3000"}

echo -e "${YELLOW}Testing endpoint: ${BASE_URL}/api/cron/daily-search${NC}\n"

# Test 1: GET request (status check)
echo -e "${GREEN}Test 1: Status Check (GET)${NC}"
echo "Request: GET ${BASE_URL}/api/cron/daily-search"
echo ""

RESPONSE=$(curl -s "${BASE_URL}/api/cron/daily-search")
echo "$RESPONSE" | jq '.'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Status check passed${NC}\n"
else
    echo -e "${RED}✗ Status check failed${NC}\n"
    exit 1
fi

# Test 2: POST without auth (should fail)
echo -e "${GREEN}Test 2: Unauthorized Request (should fail)${NC}"
echo "Request: POST ${BASE_URL}/api/cron/daily-search (no auth)"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/cron/daily-search")

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Correctly rejected unauthorized request (HTTP $HTTP_CODE)${NC}\n"
else
    echo -e "${RED}✗ Expected HTTP 401, got HTTP $HTTP_CODE${NC}\n"
    exit 1
fi

# Test 3: POST with auth (should succeed)
echo -e "${GREEN}Test 3: Authorized Request (Pipeline Execution)${NC}"
echo "Request: POST ${BASE_URL}/api/cron/daily-search"
echo "Authorization: Bearer ***"
echo ""
echo "This may take a few seconds..."
echo ""

RESPONSE=$(curl -s -X POST "${BASE_URL}/api/cron/daily-search" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Content-Type: application/json")

echo "$RESPONSE" | jq '.'

# Check if successful
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo ""
    echo -e "${GREEN}✓ Pipeline executed successfully${NC}\n"

    # Extract stats
    TOTAL=$(echo "$RESPONSE" | jq -r '.stats.totalFetched')
    FILTERED=$(echo "$RESPONSE" | jq -r '.stats.afterBasicFilter')
    VALIDATED=$(echo "$RESPONSE" | jq -r '.stats.afterVinValidation')
    STORED=$(echo "$RESPONSE" | jq -r '.stats.newListingsStored')
    DUPLICATES=$(echo "$RESPONSE" | jq -r '.stats.duplicatesSkipped')
    ERRORS=$(echo "$RESPONSE" | jq -r '.stats.errors')
    TIME=$(echo "$RESPONSE" | jq -r '.executionTimeMs')

    echo -e "${YELLOW}Pipeline Statistics:${NC}"
    echo "  Total Fetched:     $TOTAL"
    echo "  After Filters:     $FILTERED"
    echo "  After Validation:  $VALIDATED"
    echo "  Stored:            $STORED"
    echo "  Duplicates:        $DUPLICATES"
    echo "  Errors:            $ERRORS"
    echo "  Execution Time:    ${TIME}ms"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Pipeline execution failed${NC}\n"

    # Show errors if present
    ERRORS=$(echo "$RESPONSE" | jq -r '.errors // []')
    if [ "$ERRORS" != "[]" ]; then
        echo -e "${YELLOW}Errors:${NC}"
        echo "$ERRORS" | jq '.'
    fi
    echo ""
    exit 1
fi

# Summary
echo -e "${GREEN}=== All Tests Passed ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Check database: SELECT * FROM curated_listings ORDER BY created_at DESC LIMIT 10;"
echo "  2. Check logs: SELECT * FROM search_logs ORDER BY created_at DESC LIMIT 5;"
echo "  3. Deploy to Vercel: vercel --prod"
echo ""
