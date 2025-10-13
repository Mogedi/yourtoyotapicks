// Test configuration - accepts port from command line or environment variable

/**
 * Get the base URL for tests
 * Priority:
 * 1. --port command line argument
 * 2. TEST_PORT environment variable
 * 3. PORT environment variable
 * 4. Default to 3000
 */
export function getBaseUrl(): string {
  // Check command line arguments for --port
  const args = process.argv.slice(2);
  const portArgIndex = args.findIndex(arg => arg === '--port');
  if (portArgIndex !== -1 && args[portArgIndex + 1]) {
    const port = args[portArgIndex + 1];
    console.log(`✓ Using port ${port} from command line`);
    return `http://localhost:${port}`;
  }

  // Check TEST_PORT environment variable
  if (process.env.TEST_PORT) {
    console.log(`✓ Using port ${process.env.TEST_PORT} from TEST_PORT env var`);
    return `http://localhost:${process.env.TEST_PORT}`;
  }

  // Check PORT environment variable
  if (process.env.PORT) {
    console.log(`✓ Using port ${process.env.PORT} from PORT env var`);
    return `http://localhost:${process.env.PORT}`;
  }

  // Default to 3000
  console.log('ℹ Using default port 3000 (use --port <number> to specify)');
  return 'http://localhost:3000';
}

/**
 * Get test timeout in milliseconds
 */
export function getTestTimeout(): number {
  return parseInt(process.env.TEST_TIMEOUT || '60000', 10);
}

/**
 * Get screenshot directory
 */
export function getScreenshotDir(): string {
  return process.env.SCREENSHOT_DIR || 'tests/screenshots';
}

/**
 * Check if verbose logging is enabled
 */
export function isVerbose(): boolean {
  return process.env.VERBOSE === 'true' || process.env.DEBUG === 'true';
}

// Export singleton
export const testConfig = {
  baseUrl: getBaseUrl(),
  timeout: getTestTimeout(),
  screenshotDir: getScreenshotDir(),
  verbose: isVerbose(),
};

// Log configuration on import
if (isVerbose()) {
  console.log('Test Configuration:');
  console.log(`  Base URL: ${testConfig.baseUrl}`);
  console.log(`  Timeout: ${testConfig.timeout}ms`);
  console.log(`  Screenshot Dir: ${testConfig.screenshotDir}`);
}
