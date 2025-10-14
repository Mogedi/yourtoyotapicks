#!/usr/bin/env ts-node
/**
 * Watch and Test Script
 *
 * Watches for file changes and automatically runs E2E tests.
 * Writes errors to .claude/errors.json for Claude to analyze.
 */

import chokidar from 'chokidar';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import {
  writeErrorLog,
  clearErrorLog,
  getErrorSummary,
  readErrorLog,
  type ErrorLogEntry,
} from '../lib/dev/claude-error-formatter';

// Configuration
const WATCH_PATHS = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
];

const IGNORE_PATHS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/*.test.ts',
  '**/tests/**',
];

const DEBOUNCE_DELAY = 1000; // ms to wait after last change
const TEST_TIMEOUT = 120000; // 2 minutes max per test run

let debounceTimer: NodeJS.Timeout | null = null;
let isRunningTests = false;
let testProcess: ChildProcess | null = null;

/**
 * Run E2E tests
 */
async function runTests(): Promise<void> {
  if (isRunningTests) {
    console.log('⏳ Tests already running, skipping...');
    return;
  }

  isRunningTests = true;
  console.log('\n🧪 Running E2E tests...\n');

  const startTime = Date.now();

  return new Promise<void>((resolve) => {
    // Run the test suite
    testProcess = spawn('npm', ['run', 'test:e2e'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });

    testProcess.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    // Timeout handling
    const timeout = setTimeout(() => {
      if (testProcess) {
        console.log('\n⏰ Test timeout - killing process...\n');
        testProcess.kill();
      }
    }, TEST_TIMEOUT);

    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      isRunningTests = false;

      const duration = Date.now() - startTime;
      console.log(
        `\n⏱️  Test run completed in ${(duration / 1000).toFixed(1)}s\n`
      );

      if (code === 0) {
        console.log('✅ All tests passed!\n');
        clearErrorLog();
        console.log('📝 Error log cleared\n');
      } else {
        console.log(`❌ Tests failed with exit code ${code}\n`);
        parseAndLogErrors(stdout, stderr);
      }

      resolve();
    });

    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      isRunningTests = false;
      console.error('❌ Failed to run tests:', error.message);
      resolve();
    });
  });
}

/**
 * Parse test output and extract errors
 */
function parseAndLogErrors(stdout: string, stderr: string): void {
  const errors: ErrorLogEntry[] = [];
  const timestamp = new Date().toISOString();

  // Parse stderr for errors
  const stderrLines = stderr.split('\n');
  for (const line of stderrLines) {
    if (
      line.includes('Error:') ||
      line.includes('error') ||
      line.includes('failed')
    ) {
      errors.push({
        timestamp,
        testName: 'unknown',
        errorType: 'test',
        message: line.trim(),
      });
    }
  }

  // Parse stdout for test failures
  const stdoutLines = stdout.split('\n');
  let currentTest = 'unknown';

  for (const line of stdoutLines) {
    // Detect test name
    if (line.includes('Test') && line.includes(':')) {
      const match = line.match(/Test.*?:\s*(.+)/);
      if (match) {
        currentTest = match[1].trim();
      }
    }

    // Detect errors
    if (
      line.includes('❌') ||
      line.includes('Error') ||
      line.includes('Failed')
    ) {
      errors.push({
        timestamp,
        testName: currentTest,
        errorType: 'test',
        message: line.trim(),
      });
    }

    // Extract file paths and line numbers
    const fileMatch = line.match(/([a-zA-Z0-9_\-./]+\.(ts|tsx|js|jsx)):(\d+)/);
    if (fileMatch && errors.length > 0) {
      const lastError = errors[errors.length - 1];
      lastError.file = fileMatch[1];
      lastError.line = parseInt(fileMatch[3], 10);
    }
  }

  // If no specific errors found but tests failed, add generic error
  if (errors.length === 0) {
    errors.push({
      timestamp,
      testName: 'test-suite',
      errorType: 'test',
      message:
        'Tests failed but no specific errors could be parsed. Check test output above.',
    });
  }

  // Write errors to log
  writeErrorLog(errors, Date.now().toString());

  // Display summary
  const errorLog = readErrorLog();
  if (errorLog) {
    console.log(getErrorSummary(errorLog));
    console.log('\n📝 Errors logged to .claude/errors.json');
    console.log("💬 Type '/fix-errors' in Claude to analyze and fix\n");
  }
}

/**
 * Handle file change
 */
function handleFileChange(filePath: string): void {
  console.log(`📝 Changed: ${path.relative(process.cwd(), filePath)}`);

  // Clear existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new debounce timer
  debounceTimer = setTimeout(() => {
    runTests();
  }, DEBOUNCE_DELAY);
}

/**
 * Start watching files
 */
function startWatching(): void {
  console.log('🚗 YourToyotaPicks - Watch & Test Mode\n');
  console.log('👀 Watching for changes in:');
  WATCH_PATHS.forEach((p) => console.log(`   - ${p}`));
  console.log('');

  // Clear error log on start
  clearErrorLog();
  console.log('📝 Error log cleared\n');

  // Initialize watcher
  const watcher = chokidar.watch(WATCH_PATHS, {
    ignored: IGNORE_PATHS,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  // Watch for changes
  watcher
    .on('change', handleFileChange)
    .on('add', handleFileChange)
    .on('ready', () => {
      console.log('✅ Ready! Make changes to trigger tests.\n');
      console.log(
        '💡 Tip: Save any file in app/, components/, or lib/ to run tests\n'
      );
      console.log('─'.repeat(60) + '\n');
    })
    .on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watch mode...');
    if (testProcess) {
      testProcess.kill();
    }
    watcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n👋 Stopping watch mode...');
    if (testProcess) {
      testProcess.kill();
    }
    watcher.close();
    process.exit(0);
  });
}

// Start the watcher
if (require.main === module) {
  // Check if dev server is running
  fetch('http://localhost:3001')
    .then(() => {
      console.log('✅ Dev server detected at http://localhost:3001\n');
      startWatching();
    })
    .catch(() => {
      console.error('❌ Dev server not running!');
      console.error('   Please start it first: npm run dev\n');
      process.exit(1);
    });
}

export { startWatching, runTests };
