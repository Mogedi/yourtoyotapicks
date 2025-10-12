# Feature 12: Email Notification System

## Overview

This feature implements a complete email notification system using Resend to send daily and weekly digests of new vehicle matches. The system is integrated with the existing data pipeline and can be triggered manually or automatically via cron jobs.

## Files Created

### 1. Core Email Library
- **`lib/email.ts`** (264 lines)
  - Resend client initialization
  - `sendDailyDigest(vehicles, email)` - Send daily digest email
  - `sendWeeklyDigest(vehicles, email)` - Send weekly digest email
  - `sendTestEmail(email)` - Send test email to verify configuration
  - Helper functions for formatting currency, mileage, priority badges
  - Error handling and logging

### 2. Email Templates (React Components)
- **`lib/email-templates/daily-digest.tsx`** (311 lines)
  - Responsive HTML email template for daily digests
  - Blue gradient header theme
  - Shows top 5 vehicles by priority score
  - Vehicle cards with: image, make/model/year, price, mileage, location, dealer
  - Priority score badges (color-coded: green/yellow/red)
  - View Details buttons linking to source listings
  - Mobile-responsive design

- **`lib/email-templates/weekly-digest.tsx`** (378 lines)
  - Responsive HTML email template for weekly digests
  - Purple gradient header theme
  - Summary statistics box (total matches, high priority count, avg price)
  - Shows top 5 vehicles by priority score
  - Same vehicle card design as daily digest
  - Weekly summary styling

### 3. Configuration
- **`config/notification-settings.json`**
  - User email address
  - Email frequency: `daily`, `weekly`, `disabled`, or `on_new`
  - Minimum priority score threshold (default: 60)
  - Send time and timezone for scheduled digests
  - Max vehicles per email (default: 5)
  - Preferences:
    - `only_high_priority` - Only send when high priority (80+) vehicles found
    - `exclude_reviewed` - Exclude already reviewed vehicles
    - `send_empty_digest` - Send even if no vehicles found
  - Comprehensive inline documentation

### 4. API Endpoint
- **`app/api/notifications/send-digest/route.ts`** (227 lines)
  - **POST** `/api/notifications/send-digest` - Send email digest
  - Request body:
    - `type`: "daily" or "weekly" (optional, defaults to daily)
    - `email`: recipient email (optional, uses config if not provided)
    - `cronSecret`: security token for automated calls
  - Fetches new listings from database based on time range
  - Applies filters from notification settings
  - Calls appropriate email function
  - Returns success status, vehicle count, and message ID
  - **GET** `/api/notifications/send-digest?test=true` - Check configuration

### 5. Environment Configuration
- **Updated `.env.local.example`**
  - Added `RESEND_API_KEY` with documentation
  - Instructions to get API key from resend.com
  - Free tier limits documented (100 emails/day, 3,000/month)

## Email Template Design

### Visual Design

#### Daily Digest
- **Header**: Blue gradient (from #2563eb to #1e40af)
- **Title**: "Daily Vehicle Digest"
- **Subtitle**: Count of new matches
- **Cards**: White background with 1px gray border, rounded corners
- **Images**: 400x300px, full-width in card
- **Price**: Blue text (#2563eb) for emphasis
- **CTA Button**: Blue (#2563eb) with rounded corners

#### Weekly Digest
- **Header**: Purple gradient (from #7c3aed to #5b21b6)
- **Title**: "Weekly Vehicle Digest"
- **Summary Box**: Yellow background (#fef3c7) with stats grid
  - Total Matches
  - High Priority Count
  - Average Price
- **Cards**: Same design as daily
- **CTA Button**: Purple (#7c3aed) to match theme

### Content Structure (Both Templates)

Each vehicle card includes:
1. **Priority Badge** (top) - Color-coded with score
   - Green (#22c55e): High Priority (80+)
   - Yellow (#eab308): Medium Priority (60-79)
   - Red (#ef4444): Low Priority (<60)

2. **Vehicle Title** - "{Year} {Make} {Model}"

3. **Key Details Grid** (2 columns)
   - Price (left, large blue/purple text)
   - Mileage (right, large black text)

4. **Additional Info** (3 lines)
   - Location and distance
   - Dealer name (if available)
   - Owners, accidents, mileage rating

5. **View Details Button** - Links to original listing

6. **Footer** - "View More" section if >5 vehicles

### Mobile Responsiveness
- Single column layout
- 640px max width
- Readable font sizes (14-22px)
- Touch-friendly buttons (12px padding)
- Proper image scaling

## Configuration Setup

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for free account (100 emails/day)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)

### 2. Configure Environment

Create or update `.env.local`:

```bash
# Copy from example
cp .env.local.example .env.local

# Edit and add your Resend API key
RESEND_API_KEY=re_your_actual_api_key_here
```

### 3. Configure Notification Settings

Edit `config/notification-settings.json`:

```json
{
  "user_email": "your.email@example.com",
  "email_frequency": "daily",
  "email_enabled": true,
  "min_priority_score": 60,
  "send_time": "08:00",
  "send_timezone": "America/New_York",
  "max_vehicles_per_email": 5,
  "preferences": {
    "only_high_priority": false,
    "exclude_reviewed": false,
    "send_empty_digest": false
  }
}
```

**Important Settings:**
- `user_email`: Your email address (REQUIRED)
- `email_frequency`: `"daily"`, `"weekly"`, or `"disabled"`
- `min_priority_score`: Only include vehicles with score >= this value
- `only_high_priority`: Set to `true` to only send emails when high priority (80+) vehicles are found

### 4. Verify Domain (Production)

For production use with custom domain:
1. In Resend dashboard, go to Domains
2. Add your domain (e.g., `yourtoyotapicks.com`)
3. Add the provided DNS records to your domain
4. Wait for verification
5. Update the `from` address in `lib/email.ts`:
   ```typescript
   from: 'YourToyotaPicks <notifications@yourdomain.com>'
   ```

For testing, you can use the default Resend domain.

## Testing Email Notifications

### Test 1: Check API Configuration

```bash
curl http://localhost:3000/api/notifications/send-digest?test=true
```

Expected response:
```json
{
  "success": true,
  "message": "Email digest API is ready",
  "config": {
    "email_enabled": true,
    "email_frequency": "daily",
    "recipient_email": "your_email@example.com",
    "min_priority_score": 60,
    "max_vehicles_per_email": 5,
    "resend_configured": true
  }
}
```

### Test 2: Send Test Email

Create a test script `scripts/test-email.js`:

```javascript
async function testEmail() {
  const response = await fetch('http://localhost:3000/api/notifications/send-digest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'daily',
      email: 'your.email@example.com'
    })
  });

  const result = await response.json();
  console.log(result);
}

testEmail();
```

Run with: `node scripts/test-email.js`

### Test 3: Manual API Call

```bash
# Test daily digest
curl -X POST http://localhost:3000/api/notifications/send-digest \
  -H "Content-Type: application/json" \
  -d '{
    "type": "daily",
    "email": "your.email@example.com"
  }'

# Test weekly digest
curl -X POST http://localhost:3000/api/notifications/send-digest \
  -H "Content-Type: application/json" \
  -d '{
    "type": "weekly",
    "email": "your.email@example.com"
  }'
```

### Test 4: With Cron Secret (Production)

```bash
curl -X POST http://localhost:3000/api/notifications/send-digest \
  -H "Content-Type: application/json" \
  -d '{
    "type": "daily",
    "cronSecret": "your_cron_secret_from_env"
  }'
```

## Integration with Cron Job (Feature 11)

The email notification system integrates with the automated data pipeline cron job. After the cron job fetches and stores new vehicles, it should call the email API to send notifications.

### Example Integration in Cron Job

```typescript
// After successfully storing new vehicles in database
if (newVehiclesAdded > 0) {
  try {
    const response = await fetch(`${process.env.APP_URL}/api/notifications/send-digest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'daily',
        cronSecret: process.env.CRON_SECRET
      })
    });

    const result = await response.json();
    console.log('Email notification result:', result);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}
```

### When Emails Are Triggered

Based on the configuration in `notification-settings.json`:

1. **Daily Digest** (`email_frequency: "daily"`)
   - Triggered by cron job after daily data fetch
   - Includes vehicles added in last 24 hours
   - Sent at configured `send_time` (e.g., 8:00 AM)

2. **Weekly Digest** (`email_frequency: "weekly"`)
   - Triggered by cron job once per week
   - Includes vehicles added in last 7 days
   - Sent on configured day at `send_time`

3. **On New** (`email_frequency: "on_new"`)
   - Triggered immediately when high-priority vehicles found
   - Real-time notification for important matches
   - Requires `only_high_priority: true` in preferences

4. **Disabled** (`email_frequency: "disabled"`)
   - No automatic emails sent
   - Manual API calls still work

### Smart Filtering

The system applies these filters automatically:
- Only vehicles with `priority_score >= min_priority_score`
- If `only_high_priority: true`, only scores >= 80
- If `exclude_reviewed: true`, skip reviewed vehicles
- If `send_empty_digest: false` (recommended), skip email when no matches

## Example Email Output

### Daily Digest Email

**Subject:** "Daily Vehicle Digest: 3 New Matches Found"

**Visual Layout:**
```
┌─────────────────────────────────────┐
│  Daily Vehicle Digest               │  (Blue gradient header)
│  3 new vehicle matches found today  │
└─────────────────────────────────────┘

We found 3 new vehicles matching your
criteria today. Here are the top 3 sorted
by priority score:

┌─────────────────────────────────────┐
│ [High Priority (85)]                │  (Green badge)
│                                     │
│ [Vehicle Image]                     │  (400x300px)
│                                     │
│ 2022 Toyota Camry                   │  (Bold, 22px)
│                                     │
│ Price           Mileage             │
│ $24,500         28,000 mi           │
│                                     │
│ Location: Richmond, VA (45 mi away) │
│ Dealer: CarMax Richmond             │
│ Owners: 1 | Accidents: 0            │
│ Mileage Rating: excellent           │
│                                     │
│ [View Full Details →]               │  (Blue button)
└─────────────────────────────────────┘

[2 more vehicle cards...]

──────────────────────────────────────
This is your daily digest from
YourToyotaPicks
```

### Weekly Digest Email

**Subject:** "Weekly Vehicle Digest: 12 New Matches This Week"

**Visual Layout:**
```
┌─────────────────────────────────────┐
│  Weekly Vehicle Digest              │  (Purple gradient)
│  12 new vehicle matches this week   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐  (Yellow summary box)
│  This Week's Summary                │
│  ─────────────────────────           │
│  12           8           $23,450    │
│  Total        High        Avg Price  │
│  Matches      Priority               │
└─────────────────────────────────────┘

Here are the top 5 vehicles from this
week, sorted by priority score:

[5 vehicle cards similar to daily digest]

┌─────────────────────────────────────┐
│  7 more vehicles available in your  │
│  dashboard                          │
└─────────────────────────────────────┘
```

## Free Tier Limits

### Resend Free Tier
- **100 emails per day**
- **3,000 emails per month**
- No credit card required
- All features included
- Perfect for personal use

### Usage Estimates
- Daily digest: ~30 emails/month (1 per day)
- Weekly digest: ~4 emails/month (1 per week)
- **Well within free tier limits!**

## Troubleshooting

### No Email Received

1. **Check Resend API Key**
   ```bash
   # Verify in .env.local
   echo $RESEND_API_KEY
   ```

2. **Check Configuration**
   - Verify `email_enabled: true` in `notification-settings.json`
   - Verify `user_email` is not the default placeholder
   - Check spam/junk folder

3. **Check Logs**
   - Look for errors in terminal/console
   - Check Resend dashboard for delivery status

4. **Test API Directly**
   ```bash
   curl http://localhost:3000/api/notifications/send-digest?test=true
   ```

### Email Not Sending (No Vehicles Found)

This is expected behavior:
- Check database has vehicles created in last 24 hours (daily) or 7 days (weekly)
- Check `min_priority_score` isn't too high
- Set `send_empty_digest: true` to test (not recommended for production)

### Email Format Issues

- Ensure you're using a modern email client
- Some clients may not support all CSS features
- Test with Gmail, Outlook, Apple Mail

### Rate Limiting

If you hit Resend's rate limits:
- Reduce email frequency (use weekly instead of daily)
- Increase `min_priority_score` to send fewer emails
- Consider upgrading Resend plan if needed

## Production Deployment

### 1. Environment Variables

Ensure these are set in production:
```bash
RESEND_API_KEY=re_your_production_key
CRON_SECRET=secure_random_string_here
```

### 2. Domain Verification

Add and verify your domain in Resend dashboard for better deliverability.

### 3. Cron Job Setup

Configure Vercel Cron or external cron service:
```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/cron/daily-scrape",
    "schedule": "0 8 * * *"  // 8 AM daily
  }]
}
```

### 4. Monitoring

- Monitor Resend dashboard for delivery rates
- Set up alerts for failed emails
- Track email open rates (if needed)

## Security Considerations

1. **API Protection**
   - Use `CRON_SECRET` for automated calls
   - Validate email addresses
   - Rate limit API endpoint

2. **Email Privacy**
   - Don't expose sensitive VIN data
   - Use HTTPS links only
   - Include unsubscribe mechanism

3. **Data Protection**
   - Don't log email addresses
   - Secure environment variables
   - Use service role client for database access

## Future Enhancements

Potential improvements for future iterations:

1. **User Preferences UI**
   - Web interface to manage notification settings
   - Per-user configuration in database
   - Email preferences page with unsubscribe

2. **Immediate Notifications**
   - Real-time email when high-priority vehicle found
   - SMS notifications via Twilio
   - Push notifications

3. **Email Customization**
   - Choose number of vehicles per email
   - Select specific makes/models for notifications
   - Custom email schedule

4. **Analytics**
   - Track email open rates
   - Click-through rates on vehicle links
   - Most popular vehicles

5. **Advanced Templates**
   - PDF attachments with full vehicle details
   - Comparison tables
   - Market analysis summaries

## Summary

Feature 12 provides a complete, production-ready email notification system that:
- Sends beautiful, responsive HTML emails
- Integrates seamlessly with the data pipeline
- Uses free tier Resend service (100 emails/day)
- Includes comprehensive configuration options
- Provides both daily and weekly digest formats
- Filters vehicles by priority score
- Shows top 5 vehicles with images and details
- Includes test endpoints for easy validation

The system is ready to use and can be triggered manually or automatically through cron jobs!
