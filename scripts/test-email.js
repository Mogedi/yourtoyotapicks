// Test script for email notification system
// Usage: node scripts/test-email.js [daily|weekly|test] [email@example.com]

const http = require('http');

// Parse command line arguments
const args = process.argv.slice(2);
const type = args[0] || 'daily'; // daily, weekly, or test
const email = args[1]; // optional email address

// Configuration
const PORT = 3000;
const HOST = 'localhost';

// Main test function
async function testEmailNotification() {
  console.log('\n=== YourToyotaPicks Email Notification Test ===\n');

  // Step 1: Check if server is running
  console.log('Step 1: Checking if Next.js server is running...');
  const isServerRunning = await checkServer();

  if (!isServerRunning) {
    console.error('❌ Error: Next.js server is not running on http://localhost:3000');
    console.log('\nPlease start the server first:');
    console.log('  npm run dev\n');
    process.exit(1);
  }

  console.log('✓ Server is running\n');

  // Step 2: Check configuration
  console.log('Step 2: Checking API configuration...');
  const configCheck = await checkConfiguration();

  if (!configCheck.success) {
    console.error('❌ Configuration check failed:', configCheck.error);
    process.exit(1);
  }

  console.log('✓ Configuration looks good');
  console.log(`  - Email enabled: ${configCheck.config.email_enabled}`);
  console.log(`  - Recipient: ${configCheck.config.recipient_email}`);
  console.log(`  - Frequency: ${configCheck.config.email_frequency}`);
  console.log(`  - Min priority: ${configCheck.config.min_priority_score}`);
  console.log(`  - Resend configured: ${configCheck.config.resend_configured}\n`);

  if (!configCheck.config.resend_configured) {
    console.error('❌ Error: RESEND_API_KEY not configured');
    console.log('\nPlease set your Resend API key in .env.local:');
    console.log('  RESEND_API_KEY=re_your_api_key_here\n');
    process.exit(1);
  }

  if (configCheck.config.recipient_email === 'your_email@example.com') {
    console.warn('⚠️  Warning: Default email address detected');
    console.log('Please update config/notification-settings.json with your email\n');
  }

  // Step 3: Send test email
  if (type === 'test') {
    console.log('Step 3: Sending test email...');
    console.log('(This will send a simple test email to verify Resend is working)\n');
  } else {
    console.log(`Step 3: Sending ${type} digest email...`);
    console.log('(This will fetch recent vehicles from database and send digest)\n');
  }

  const result = await sendEmail(type, email);

  if (!result.success) {
    console.error('❌ Email sending failed:', result.error);

    if (result.error && result.error.includes('No new vehicles')) {
      console.log('\nThis is expected if there are no vehicles in the database.');
      console.log('Try adding some test vehicles first:');
      console.log('  1. Go to http://localhost:3000/dashboard');
      console.log('  2. Use the seed API: POST /api/listings/seed\n');
    }

    process.exit(1);
  }

  console.log('✓ Email sent successfully!\n');
  console.log('Result:', JSON.stringify(result, null, 2));

  console.log('\n=== Test Complete ===');
  console.log('\nCheck your email inbox for the digest.');
  console.log('(Don\'t forget to check spam/junk folder)\n');
}

// Check if server is running
function checkServer() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Check API configuration
function checkConfiguration() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/notifications/send-digest?test=true',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          resolve({ success: false, error: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.end();
  });
}

// Send email via API
function sendEmail(type, email) {
  return new Promise((resolve) => {
    const requestData = JSON.stringify({
      type: type === 'test' ? 'daily' : type,
      ...(email && { email })
    });

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/notifications/send-digest',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          resolve({ success: false, error: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(requestData);
    req.end();
  });
}

// Show usage
function showUsage() {
  console.log('\nUsage: node scripts/test-email.js [type] [email]');
  console.log('\nArguments:');
  console.log('  type   - Type of email to send: daily, weekly, or test (default: daily)');
  console.log('  email  - Email address to send to (optional, uses config if not provided)');
  console.log('\nExamples:');
  console.log('  node scripts/test-email.js');
  console.log('  node scripts/test-email.js daily');
  console.log('  node scripts/test-email.js weekly');
  console.log('  node scripts/test-email.js daily your.email@example.com');
  console.log('  node scripts/test-email.js weekly your.email@example.com\n');
}

// Run the test
if (args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

testEmailNotification().catch((error) => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});
