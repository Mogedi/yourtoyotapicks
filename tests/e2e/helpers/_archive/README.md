# Archived E2E Test Helpers

This directory contains example and summary files that are no longer actively maintained.

## Archived Files

- `example-usage.ts` - Example usage of E2E test helpers (learning material)
- `SUMMARY.md` - Summary of test helper implementation (completed feature doc)

## Current Active Helpers

For current, production test helpers, see:
- `../browser.ts` - Browser automation utilities
- `../error-detector.ts` - Console error detection
- `../logger.ts` - Test logging utilities
- `../screenshot.ts` - Screenshot capture utilities
- `../test-utils.ts` - General test utilities
- `../types.ts` - TypeScript type definitions
- `../index.ts` - Barrel exports
- `../README.md` - Test helpers documentation

## Why These Were Archived

- **example-usage.ts**: Learning material created during initial implementation. The actual usage is now demonstrated in the test flows (`tests/e2e/flows/`).
- **SUMMARY.md**: Implementation summary for a completed feature. The helpers are now documented in the main README.

## Usage

These archived files can be referenced for:
- Understanding the evolution of test helpers
- Learning examples for new test patterns
- Historical context for implementation decisions

They should not be imported or used in active test code.

## Active Test Flows

See `tests/e2e/flows/` for actual E2E tests:
- `01-landing-to-dashboard.test.ts`
- `02-dashboard-filtering.test.ts`
- `03-vehicle-details.test.ts`
- `04-review-system.test.ts`
- `05-vin-decoder.test.ts`
- `06-error-states.test.ts`
