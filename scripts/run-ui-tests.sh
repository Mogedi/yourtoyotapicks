#!/bin/bash

# YourToyotaPicks - UI Test Runner
# Runs all E2E tests and generates HTML report

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚗 YourToyotaPicks - UI Test Suite${NC}"
echo -e "${BLUE}══════════════════════════════════${NC}"
echo ""

# Check if dev server is running
echo -e "${YELLOW}→${NC} Checking if dev server is running..."
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Dev server is not running on port 3001"
    echo -e "${YELLOW}→${NC} Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓${NC} Dev server is running"
echo ""

# Run tests
echo -e "${YELLOW}→${NC} Running UI tests..."
echo ""

if npx ts-node tests/e2e/run-all-tests.ts "$@"; then
    echo ""
    echo -e "${GREEN}✓${NC} All tests completed!"

    # Find latest screenshot directory
    LATEST_DIR=$(ls -td tests/screenshots/*/ 2>/dev/null | head -1)

    if [ -n "$LATEST_DIR" ]; then
        REPORT="${LATEST_DIR}test-report.html"
        if [ -f "$REPORT" ]; then
            echo ""
            echo -e "${BLUE}📊 Test Report:${NC} $REPORT"
            echo -e "${YELLOW}→${NC} Opening report in browser..."

            # Open in default browser (cross-platform)
            if command -v open &> /dev/null; then
                open "$REPORT"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$REPORT"
            elif command -v start &> /dev/null; then
                start "$REPORT"
            else
                echo -e "${YELLOW}⚠${NC} Could not open browser automatically"
                echo -e "${YELLOW}→${NC} Please open: $REPORT"
            fi
        fi

        echo ""
        echo -e "${BLUE}📸 Screenshots:${NC} $LATEST_DIR"
    fi

    exit 0
else
    echo ""
    echo -e "${RED}✗${NC} Some tests failed"
    echo -e "${YELLOW}→${NC} Check the output above for details"
    exit 1
fi
