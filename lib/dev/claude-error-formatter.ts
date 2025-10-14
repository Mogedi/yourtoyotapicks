/**
 * Claude Error Formatter
 *
 * Reads error logs and formats them for Claude to analyze and fix.
 * Used by the /fix-errors slash command.
 */

import fs from 'fs';
import path from 'path';

export interface ErrorLogEntry {
  timestamp: string;
  testName: string;
  errorType: 'console' | 'network' | 'visual' | 'javascript' | 'test';
  message: string;
  file?: string;
  line?: number;
  stackTrace?: string;
  url?: string;
  screenshot?: string;
}

export interface ErrorLog {
  lastUpdated: string;
  totalErrors: number;
  errors: ErrorLogEntry[];
  runId?: string;
}

/**
 * Read the error log file
 */
export function readErrorLog(): ErrorLog | null {
  const errorLogPath = path.join(process.cwd(), '.claude', 'errors.json');

  if (!fs.existsSync(errorLogPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(errorLogPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read error log:', error);
    return null;
  }
}

/**
 * Format errors for Claude to understand
 */
export function formatErrorsForClaude(errorLog: ErrorLog): string {
  if (!errorLog || errorLog.totalErrors === 0) {
    return '✅ No errors found! All tests are passing.';
  }

  let output = '# 🔍 Test Errors Detected\n\n';
  output += `**Last Updated**: ${errorLog.lastUpdated}\n`;
  output += `**Total Errors**: ${errorLog.totalErrors}\n\n`;

  // Group errors by test
  const errorsByTest = new Map<string, ErrorLogEntry[]>();
  for (const error of errorLog.errors) {
    const testErrors = errorsByTest.get(error.testName) || [];
    testErrors.push(error);
    errorsByTest.set(error.testName, testErrors);
  }

  // Format each test's errors
  for (const [testName, errors] of errorsByTest) {
    output += `## Test: ${testName}\n`;
    output += `**Errors**: ${errors.length}\n\n`;

    errors.forEach((error, index) => {
      output += `### Error ${index + 1}: ${error.errorType}\n`;
      output += `**Message**: ${error.message}\n`;

      if (error.file) {
        output += `**File**: [${error.file}${error.line ? `:${error.line}` : ''}](${error.file}${error.line ? `#L${error.line}` : ''})\n`;
      }

      if (error.url) {
        output += `**URL**: ${error.url}\n`;
      }

      if (error.stackTrace) {
        output += `\n**Stack Trace**:\n\`\`\`\n${error.stackTrace}\n\`\`\`\n`;
      }

      if (error.screenshot) {
        output += `**Screenshot**: [View](${error.screenshot})\n`;
      }

      output += '\n---\n\n';
    });
  }

  output += '\n## 🛠️ Next Steps\n\n';
  output += '1. Review the errors above\n';
  output += '2. Identify the root cause in the code\n';
  output += '3. Propose fixes for each error\n';
  output += '4. Apply fixes and re-run tests\n';

  return output;
}

/**
 * Get a summary of errors
 */
export function getErrorSummary(errorLog: ErrorLog): string {
  if (!errorLog || errorLog.totalErrors === 0) {
    return '✅ No errors detected';
  }

  const errorsByTest = new Map<string, number>();
  for (const error of errorLog.errors) {
    errorsByTest.set(
      error.testName,
      (errorsByTest.get(error.testName) || 0) + 1
    );
  }

  let summary = `❌ ${errorLog.totalErrors} error${errorLog.totalErrors > 1 ? 's' : ''} detected:\n`;
  for (const [testName, count] of errorsByTest) {
    summary += `   → ${testName}: ${count} error${count > 1 ? 's' : ''}\n`;
  }

  return summary;
}

/**
 * Clear the error log
 */
export function clearErrorLog(): void {
  const errorLogPath = path.join(process.cwd(), '.claude', 'errors.json');

  const emptyLog: ErrorLog = {
    lastUpdated: new Date().toISOString(),
    totalErrors: 0,
    errors: [],
  };

  fs.mkdirSync(path.dirname(errorLogPath), { recursive: true });
  fs.writeFileSync(errorLogPath, JSON.stringify(emptyLog, null, 2));
}

/**
 * Write errors to the log file
 */
export function writeErrorLog(errors: ErrorLogEntry[], runId?: string): void {
  const errorLogPath = path.join(process.cwd(), '.claude', 'errors.json');

  const errorLog: ErrorLog = {
    lastUpdated: new Date().toISOString(),
    totalErrors: errors.length,
    errors,
    runId,
  };

  fs.mkdirSync(path.dirname(errorLogPath), { recursive: true });
  fs.writeFileSync(errorLogPath, JSON.stringify(errorLog, null, 2));
}
