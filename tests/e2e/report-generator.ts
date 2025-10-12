/**
 * HTML Report Generator for UI Tests
 * Generates beautiful visual reports with screenshots
 */

import fs from 'fs';
import path from 'path';
import type { TestResult, TestError } from './helpers/types';

interface ReportData {
  testResults: TestResult[];
  timestamp: string;
  totalDuration: number;
  screenshotDir: string;
}

export async function generateHTMLReport(data: ReportData): Promise<string> {
  const { testResults, timestamp, totalDuration, screenshotDir } = data;

  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YourToyotaPicks - UI Test Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .timestamp {
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 2rem;
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .stat {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat.passed .stat-value { color: #10b981; }
    .stat.failed .stat-value { color: #ef4444; }
    .stat.total .stat-value { color: #3b82f6; }
    .stat.duration .stat-value { color: #8b5cf6; }

    .tests {
      padding: 2rem;
    }

    .test {
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      overflow: hidden;
      border: 2px solid #e2e8f0;
    }

    .test.passed {
      border-color: #10b981;
    }

    .test.failed {
      border-color: #ef4444;
    }

    .test-header {
      padding: 1.5rem;
      background: white;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .test-header:hover {
      background: #f1f5f9;
    }

    .test-title {
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .test-status {
      font-size: 1.5rem;
    }

    .test-details {
      padding: 1.5rem;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    .test-meta {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .screenshot {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .screenshot img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .screenshot img:hover {
      transform: scale(1.05);
    }

    .screenshot-caption {
      padding: 0.75rem;
      font-size: 0.875rem;
      color: #475569;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .errors {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .error-title {
      color: #dc2626;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .error-item {
      background: white;
      padding: 0.75rem;
      margin-top: 0.5rem;
      border-radius: 4px;
      border-left: 3px solid #ef4444;
    }

    .error-type {
      font-weight: 600;
      color: #991b1b;
      font-size: 0.875rem;
    }

    .error-message {
      color: #475569;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-family: 'Courier New', monospace;
    }

    footer {
      background: #1e293b;
      color: white;
      padding: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 1rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      transition: width 0.3s ease;
    }

    @media (max-width: 768px) {
      .summary {
        grid-template-columns: 1fr;
      }

      .screenshots {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚗 YourToyotaPicks - UI Test Report</h1>
      <p class="timestamp">${timestamp}</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${passRate}%"></div>
      </div>
    </header>

    <div class="summary">
      <div class="stat passed">
        <div class="stat-value">${passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat failed">
        <div class="stat-value">${failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat total">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat duration">
        <div class="stat-value">${(totalDuration / 1000).toFixed(1)}s</div>
        <div class="stat-label">Duration</div>
      </div>
    </div>

    <div class="tests">
      ${testResults.map(result => generateTestSection(result, screenshotDir)).join('\n')}
    </div>

    <footer>
      Generated by YourToyotaPicks UI Test Suite • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
    </footer>
  </div>
</body>
</html>
  `;

  return html;
}

function generateTestSection(result: TestResult, screenshotDir: string): string {
  const statusIcon = result.success ? '✅' : '❌';
  const statusClass = result.success ? 'passed' : 'failed';

  return `
    <div class="test ${statusClass}">
      <div class="test-header">
        <div class="test-title">
          <span class="test-status">${statusIcon}</span>
          <span>${result.testName}</span>
        </div>
        <div>${result.duration}ms</div>
      </div>
      <div class="test-details">
        <div class="test-meta">
          <span>📸 ${result.screenshots.length} screenshots</span>
          <span>📋 ${result.steps} steps</span>
          ${result.errors.length > 0 ? `<span>⚠️ ${result.errors.length} errors</span>` : ''}
        </div>

        ${result.screenshots.length > 0 ? `
          <div class="screenshots">
            ${result.screenshots.map(s => `
              <div class="screenshot">
                <img src="${path.relative(path.dirname(screenshotDir), s.path)}"
                     alt="${s.name}"
                     onclick="window.open(this.src, '_blank')">
                <div class="screenshot-caption">${s.name}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${result.errors.length > 0 ? `
          <div class="errors">
            <div class="error-title">⚠️ Errors Detected</div>
            ${result.errors.map(e => `
              <div class="error-item">
                <div class="error-type">${e.type}</div>
                <div class="error-message">${escapeHtml(e.message)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function saveHTMLReport(
  html: string,
  screenshotDir: string
): Promise<string> {
  const reportPath = path.join(screenshotDir, 'test-report.html');
  await fs.promises.writeFile(reportPath, html, 'utf-8');
  return reportPath;
}
