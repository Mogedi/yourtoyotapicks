# 🐛 Error Capture Guide

Complete guide for capturing all types of errors in YourToyotaPicks.

---

## Error Types & How to Capture Them

### 1. Browser Console Errors (DevTools)

**What they are**: Errors that appear in the browser's DevTools Console (like the screenshot you shared)

**How to capture**:

#### Option A: Check During Development

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for red error messages
4. Copy error message and stack trace
5. Share with Claude: "Fix this console error: [paste error]"

#### Option B: Add Error Boundary (Automatic Capture)

```typescript
// app/error.tsx - Next.js Error Boundary
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console
    console.error('Application error:', error);

    // Optional: Send to error tracking service
    // reportError(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

#### Option C: Global Error Handler

```typescript
// app/layout.tsx - Add global error handler
'use client';

import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error);

      // Write to localStorage for Claude to read
      const errors = JSON.parse(localStorage.getItem('app-errors') || '[]');
      errors.push({
        type: 'unhandled',
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('app-errors', JSON.stringify(errors.slice(-10))); // Keep last 10
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);

      const errors = JSON.parse(localStorage.getItem('app-errors') || '[]');
      errors.push({
        type: 'promise-rejection',
        message: event.reason?.message || String(event.reason),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('app-errors', JSON.stringify(errors.slice(-10)));
    });
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

Then Claude can read these errors:

```bash
# In browser console, run:
JSON.parse(localStorage.getItem('app-errors'))

# Or create a slash command to read them
```

---

### 2. E2E Test Errors (Puppeteer)

**What they are**: Errors caught during automated testing

**How to capture**: Already implemented!

```bash
# Run tests - errors logged automatically
npm run test:e2e

# Errors written to .claude/errors.json
# Then use Claude:
/fix-errors
```

**Status**: ✅ Working!

---

### 3. Watch Mode Errors (File Changes)

**What they are**: Errors that occur when you save files during development

**How to capture**: Already implemented!

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Watch mode
npm run watch:errors

# Make code changes → Tests run → Errors logged → Type /fix-errors
```

**Status**: ✅ Working!

---

### 4. Build-Time Errors

**What they are**: TypeScript errors, linting errors, build failures

**How to capture**:

```bash
# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Lint
npm run lint

# Copy errors and share with Claude
```

---

### 5. Server-Side Errors (Next.js Server Components)

**What they are**: Errors in server components, API routes, server actions

**How to capture**:

#### Check Terminal Output

Look in the terminal where `npm run dev` is running:

```bash
npm run dev

# Server errors appear here:
# ⨯ Error: Something went wrong
#   at getListings (lib/supabase.ts:156:17)
```

#### Add Server Error Logging

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  try {
    const data = await getListings();
    return <Dashboard data={data} />;
  } catch (error) {
    console.error('[Server Error]', error);
    // Error will appear in terminal
    throw error;
  }
}
```

---

### 6. Network Errors (API Calls)

**What they are**: Failed fetch requests, 404s, 500s, timeouts

**How to capture**:

#### Browser DevTools Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Look for red/failed requests
5. Click on failed request → see details
6. Share with Claude: "Fix this API error: [details]"

#### Add Network Interceptor

```typescript
// lib/api-client.ts
export async function fetchWithLogging(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      console.error('Network error:', {
        url,
        status: response.status,
        statusText: response.statusText,
      });
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', { url, error });
    throw error;
  }
}
```

---

### 7. Runtime Errors (Production)

**What they are**: Errors that happen in production with real users

**How to capture**: Use error monitoring service

#### Option A: Sentry (Recommended)

```bash
npm install @sentry/nextjs

# Run setup wizard
npx @sentry/wizard@latest -i nextjs
```

Benefits:

- Captures all errors automatically
- Stack traces + user context
- Source maps for minified code
- Email alerts
- Error trends

#### Option B: LogRocket

```bash
npm install logrocket
```

Benefits:

- Session replay (video of what user did)
- Network logs
- Console logs
- DOM snapshots

---

## Quick Reference

### Error Priority

1. **🔴 Critical**: App crashes, can't load
   - Check browser console (DevTools)
   - Check terminal output
   - Run `npm run build` to catch build errors

2. **🟡 Important**: Features broken, tests failing
   - Run `npm run test:e2e`
   - Type `/fix-errors` in Claude
   - Check Network tab for API failures

3. **🟢 Minor**: Console warnings, dev-only issues
   - Check browser console
   - Fix when convenient

---

## Automated Error Capture Setup

### Complete Setup (5 minutes)

1. **E2E Tests** (Already done ✅)

   ```bash
   npm run test:e2e
   ```

2. **Watch Mode** (Already done ✅)

   ```bash
   npm run watch:errors
   ```

3. **Error Boundary** (Add to app/error.tsx)

   ```typescript
   // See "Option B" above
   ```

4. **Global Handler** (Add to app/layout.tsx)

   ```typescript
   // See "Option C" above
   ```

5. **Sentry** (Optional, for production)
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

---

## Claude Integration

### Manual Error Reporting

```bash
# 1. Copy error from DevTools console
# 2. In Claude, type:

Fix this error:
```

Error fetching listings: TypeError: fetch failed
at getListings (lib/supabase.ts:156:17)
at fetchVehicles (app/dashboard/page.tsx:38:28)

```

```

### Automated Error Reporting

```bash
# Errors automatically logged to .claude/errors.json

# In Claude, type:
/fix-errors

# Claude reads errors.json and fixes them
```

---

## Best Practices

### During Development

✅ Keep browser DevTools Console open
✅ Watch terminal output for server errors
✅ Run `npm run watch:errors` in background
✅ Check Network tab for API issues

### Before Committing

✅ Run `npm run test:e2e` - fix all test failures
✅ Run `npm run build` - fix all build errors
✅ Run `npx tsc --noEmit` - fix TypeScript errors
✅ Check browser console - no red errors

### In Production

✅ Use Sentry or similar service
✅ Monitor error rates
✅ Set up alerts for critical errors
✅ Review errors weekly

---

## Common Errors & Fixes

### "Error fetching listings"

**Cause**: Supabase not configured (expected)
**Fix**: Already handled - app falls back to mock data
**Action**: No fix needed (unless you want to configure Supabase)

### "Failed to load resource: 404"

**Cause**: Asset not found, API route missing
**Fix**: Check URL, verify file exists
**Action**: Use DevTools Network tab to see which resource

### "Cannot read property 'X' of undefined"

**Cause**: Accessing property on null/undefined object
**Fix**: Add optional chaining (`?.`) or null check
**Action**: Check stack trace for line number

### "Maximum update depth exceeded"

**Cause**: setState called in render without dependency
**Fix**: Move to useEffect or add dependency array
**Action**: Check React component mentioned in error

---

## Tools Summary

| Tool             | Captures           | When        | Auto? |
| ---------------- | ------------------ | ----------- | ----- |
| Browser DevTools | Console errors     | Manual      | No    |
| E2E Tests        | Test failures      | On test run | Yes   |
| Watch Mode       | File change errors | On save     | Yes   |
| Error Boundary   | React errors       | On render   | Yes   |
| Sentry           | All production     | Always      | Yes   |
| Terminal         | Server errors      | Always      | No    |

---

## Next Steps

1. ✅ Fix the console error you saw (already done - removed console.error)
2. Add error boundary to app/error.tsx
3. Add global error handler to app/layout.tsx
4. (Optional) Set up Sentry for production monitoring

The error you captured is now fixed! Refresh your browser and the console should be clean.
