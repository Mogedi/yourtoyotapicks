# Archived Feature Documentation

This directory contains outdated or superseded feature documentation that is no longer actively maintained.

## Directory Structure

### `iterations/`
Old Marketcheck integration planning documents (multiple iterations):
- `MARKETCHECK_API_FINDINGS.md` - Initial API exploration
- `MARKETCHECK_API_STRATEGY.md` - First integration strategy
- `MARKETCHECK_DATA_FIRST_SUMMARY.md` - Data-first approach summary
- `MARKETCHECK_IMPLEMENTATION_PLAN.md` - Early implementation plan
- `MARKETCHECK_QUICK_START.md` - Quick start guide (outdated)
- `MARKETCHECK_READY_TO_IMPORT.md` - Import readiness assessment

**Superseded by**:
- `../MARKETCHECK_INTEGRATION_PLAN.md` (comprehensive integration plan)
- `../MARKETCHECK_INTEGRATION_STATUS.md` (current status)

### `completed/`
Features that have been fully implemented:
- `FEATURE_9_VEHICLE_DETAIL.md` - Vehicle detail page implementation (completed)

### `planned/`
Features that were planned but postponed or deprioritized:
- `FEATURE_11_CRON_JOB.md` - Automated daily searches (Phase 3)
- `FEATURE_12_EMAIL_NOTIFICATIONS.md` - Email digest system (Phase 3)
- `FEATURE_12_SUMMARY.md` - Email feature summary

## Current Active Documentation

For up-to-date feature documentation, see:
- [`../DASHBOARD_V2_IMPLEMENTATION_PLAN.md`](../DASHBOARD_V2_IMPLEMENTATION_PLAN.md) - Table view implementation
- [`../MARKETCHECK_INTEGRATION_PLAN.md`](../MARKETCHECK_INTEGRATION_PLAN.md) - Complete Marketcheck integration guide
- [`../MARKETCHECK_INTEGRATION_STATUS.md`](../MARKETCHECK_INTEGRATION_STATUS.md) - Current integration status

## Why These Were Archived

- **Iterations**: Multiple planning documents were created during the Marketcheck integration exploration phase. The final comprehensive plan supersedes all earlier iterations.
- **Completed**: Feature is done and documented in the main codebase/docs.
- **Planned**: Features moved to future phases (Phase 3+) and may be revisited later.

## Restoration

If you need to restore or reference any of these documents:
```bash
git log -- docs/features/_archive/
```

This will show the full history of these files before they were archived.
