# 🔍 Automated Error Detection & Fix System

## Overview

Semi-automated system that watches for file changes, runs E2E tests, and helps Claude fix errors automatically.

**No copy-paste needed** - Just type `/fix-errors` when tests fail!

---

## Quick Start

### 1. Start Watch Mode

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start error watch mode
npm run watch:errors
```

### 2. Make Code Changes

Watch mode automatically:

- ✅ Detects file changes in `app/`, `components/`, `lib/`
- ✅ Runs E2E tests after 1-second debounce
- ✅ Logs errors to `.claude/errors.json`
- ✅ Shows terminal message to trigger Claude

### 3. Fix Errors with Claude

```bash
# When you see errors in terminal:
❌ 3 errors detected
   → dashboard-filtering: 2 errors
   → vehicle-details: 1 error

📝 Errors logged to .claude/errors.json
💬 Type '/fix-errors' in Claude to fix

# In Claude interface, type:
/fix-errors

# Claude will:
# 1. Read .claude/errors.json
# 2. Analyze each error
# 3. Propose fixes
# 4. Apply fixes (with your approval)
# 5. Tests re-run automatically
```

---

## Commands

### `npm run watch:errors`

Starts file watcher that runs tests on changes

**What it does:**

- Watches `app/`, `components/`, `lib/` for changes
- Debounces changes (1 second delay)
- Runs all E2E tests (`npm run test:e2e`)
- On pass: Clears error log
- On fail: Writes errors to `.claude/errors.json`

**Terminal output:**

```bash
🚗 YourToyotaPicks - Watch & Test Mode

👀 Watching for changes in:
   - app/**/*.{ts,tsx,js,jsx}
   - components/**/*.{ts,tsx,js,jsx}
   - lib/**/*.{ts,tsx,js,jsx}

✅ Ready! Make changes to trigger tests.

📝 Changed: components/VehicleCard.tsx

🧪 Running E2E tests...
[test output...]

❌ Tests failed with exit code 1
❌ 2 errors detected:
   → dashboard-filtering: 2 errors

📝 Errors logged to .claude/errors.json
💬 Type '/fix-errors' in Claude to analyze and fix
```

### `npm run show:errors`

Display current errors in terminal (optional)

**Usage:**

```bash
npm run show:errors
```

**Output:**

```
# 🔍 Test Errors Detected

**Last Updated**: 2025-10-12T14:30:45.000Z
**Total Errors**: 2

## Test: dashboard-filtering

### Error 1: test
**Message**: ❌ Failed to filter vehicles by make
**File**: components/FilterBar.tsx:45

### Error 2: test
**Message**: Timeout waiting for selector
```

### `/fix-errors` (Claude Slash Command)

Let Claude read and fix errors automatically

**What it does:**

1. Reads `.claude/errors.json`
2. Shows formatted error report
3. Analyzes root cause for each error
4. Proposes specific fixes
5. Asks for approval
6. Applies fixes using Edit tool
7. Suggests re-running tests

**Example session:**

```
You: /fix-errors

Claude: I found 2 errors in the dashboard-filtering test:

### Error 1: Missing await statement
**File**: components/FilterBar.tsx:45
**Issue**: Async function called without await
**Fix**: Add await to page.click() call

### Error 2: Incorrect selector
**File**: tests/e2e/flows/02-dashboard-filtering.test.ts:67
**Issue**: Selector '[data-make="toyota"]' not found
**Fix**: Update selector to '[data-testid="filter-make-toyota"]'

Should I apply these fixes? [y/n]

You: y

Claude: [applies both fixes]

Done! Both fixes applied. Run `npm run test:e2e` to verify.
```

---

## File Structure

```
.claude/
├── commands/
│   └── fix-errors.md          # Slash command definition
└── errors.json                 # Auto-generated error log

lib/
└── claude-error-formatter.ts   # Error formatting utilities

scripts/
└── watch-and-test.ts           # File watcher + test runner
```

---

## Error Log Format

`.claude/errors.json` structure:

```json
{
  "lastUpdated": "2025-10-12T14:30:45.000Z",
  "totalErrors": 2,
  "runId": "1697123445000",
  "errors": [
    {
      "timestamp": "2025-10-12T14:30:45.000Z",
      "testName": "dashboard-filtering",
      "errorType": "test",
      "message": "Failed to filter vehicles by make",
      "file": "components/FilterBar.tsx",
      "line": 45,
      "stackTrace": "Error: ...",
      "screenshot": "tests/screenshots/2025-10-12_14-30-45/error-state.png"
    }
  ]
}
```

---

## Configuration

### Watch Paths

Edit `scripts/watch-and-test.ts`:

```typescript
const WATCH_PATHS = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  // Add more paths...
];
```

### Debounce Delay

Adjust delay before running tests:

```typescript
const DEBOUNCE_DELAY = 1000; // milliseconds
```

### Test Timeout

Max time for test run:

```typescript
const TEST_TIMEOUT = 120000; // 2 minutes
```

---

## How It Works

### Watch Flow

```
File Change
  ↓
Debounce (1s)
  ↓
Run E2E Tests
  ↓
Parse Output
  ↓
Tests Pass? → Clear errors.json
  ↓
Tests Fail? → Write to errors.json
  ↓
Show terminal message
```

### Fix Flow

```
User types: /fix-errors
  ↓
Claude reads: .claude/errors.json
  ↓
Claude analyzes errors
  ↓
Claude proposes fixes
  ↓
User approves
  ↓
Claude applies fixes
  ↓
Tests re-run (via watch mode)
```

---

## Tips

### Best Practices

1. **Keep watch mode running** - Leave it in a terminal tab
2. **Wait for debounce** - Save once, wait 1 second
3. **Review Claude's fixes** - Always check proposed changes
4. **Commit working code** - Before major refactors

### Troubleshooting

**Watch mode not starting?**

- Check dev server is running: `npm run dev`
- Verify port 3001 is accessible

**No errors logged?**

- Check `.claude/errors.json` exists
- Verify file permissions
- Look for parsing errors in terminal

**Claude can't read errors?**

- Ensure `.claude/errors.json` is created
- Run `npm run show:errors` to verify format
- Check file path in slash command

**Tests timing out?**

- Increase `TEST_TIMEOUT` in `scripts/watch-and-test.ts`
- Check if dev server is slow
- Run individual tests: `npm run test:e2e:01`

---

## Advanced Usage

### Manual Error Check

```bash
# View errors without Claude
npm run show:errors

# Or read the file directly
cat .claude/errors.json | jq .
```

### Run Specific Tests

```bash
# Watch mode runs all tests, but you can run specific ones:
npm run test:e2e:01  # Landing page
npm run test:e2e:02  # Dashboard filtering
npm run test:e2e:03  # Vehicle details
```

### Clear Error Log

```typescript
// In Node.js or TypeScript file:
import { clearErrorLog } from './lib/claude-error-formatter';
clearErrorLog();
```

---

## Workflow Example

### Complete Development Session

```bash
# 1. Start dev server
npm run dev

# 2. Start watch mode (separate terminal)
npm run watch:errors

# 3. Make code changes
# → Edit components/VehicleCard.tsx
# → Save file

# 4. Watch mode detects change
📝 Changed: components/VehicleCard.tsx
🧪 Running E2E tests...

# 5. Tests fail
❌ Tests failed
   → dashboard-filtering: 1 error
💬 Type '/fix-errors' in Claude

# 6. Open Claude Code, type:
/fix-errors

# 7. Claude analyzes and fixes
# 8. Tests re-run automatically
# 9. All passing! ✅
```

---

## Future Enhancements

Potential improvements (not yet implemented):

- **Intelligent test selection** - Only run affected tests
- **Error deduplication** - Group similar errors
- **Screenshot diff** - Visual regression detection
- **Performance tracking** - Trend analysis
- **API integration** - Full automation (Phase 2)

---

## Summary

✅ **Automated**: Watch mode detects changes & runs tests
✅ **Logged**: Errors written to `.claude/errors.json`
✅ **Claude-ready**: `/fix-errors` command for instant analysis
✅ **No copy-paste**: Everything automated
✅ **Fast feedback**: 1-second debounce, instant error reporting

**Time saved**: ~5-10 minutes per error debugging session!

---

## Related Documentation

- [UI Testing System](./testing/UI_TESTING_README.md)
- [E2E Test Plan](./testing/UI_TESTING_PLAN.md)
- [Project Overview](./CLAUDE.md)
