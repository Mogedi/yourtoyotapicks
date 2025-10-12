# Email Notifications - Quick Start Guide

Get your email notifications up and running in 5 minutes!

## Step 1: Get Resend API Key (2 minutes)

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Click "API Keys" in the sidebar
4. Click "Create API Key"
5. Copy the key (starts with `re_`)

**Free Tier:** 100 emails/day, 3,000/month - Perfect for personal use!

## Step 2: Configure Environment (1 minute)

1. Open (or create) `.env.local` in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Resend API key:
   ```bash
   RESEND_API_KEY=re_your_actual_key_here
   ```

## Step 3: Configure Email Settings (1 minute)

Edit `config/notification-settings.json`:

```json
{
  "user_email": "your.email@example.com",
  "email_frequency": "daily",
  "email_enabled": true,
  "min_priority_score": 60
}
```

**Important:** Replace `your.email@example.com` with your actual email!

## Step 4: Test It! (1 minute)

### Start the development server:
```bash
npm run dev
```

### Run the test script:
```bash
node scripts/test-email.js daily your.email@example.com
```

**Expected Output:**
```
=== YourToyotaPicks Email Notification Test ===

Step 1: Checking if Next.js server is running...
✓ Server is running

Step 2: Checking API configuration...
✓ Configuration looks good
  - Email enabled: true
  - Recipient: your.email@example.com
  - Frequency: daily
  - Min priority: 60
  - Resend configured: true

Step 3: Sending daily digest email...
✓ Email sent successfully!

=== Test Complete ===

Check your email inbox for the digest.
```

### Check your email!
- Look for subject: "Daily Vehicle Digest: X New Matches Found"
- Check spam folder if not in inbox
- Email should have nice images and vehicle details

## Troubleshooting

### "No new vehicles found"
This is expected if your database is empty. Add some test data:

```bash
# Seed the database with test vehicles
curl -X POST http://localhost:3000/api/listings/seed
```

Then try the email test again.

### "RESEND_API_KEY not configured"
- Make sure you created `.env.local` (not just `.env.local.example`)
- Make sure the API key is on a line without `#` at the start
- Restart the dev server after changing `.env.local`

### Email not in inbox
- Check spam/junk folder
- Verify email address in config is correct
- Check Resend dashboard for delivery status

## What You Get

### Daily Digest Email
- **Subject:** "Daily Vehicle Digest: 3 New Matches Found"
- **Content:** Top 5 vehicles from last 24 hours
- **Design:** Blue theme, responsive, mobile-friendly
- **Includes:** Images, prices, mileage, location, priority scores

### Weekly Digest Email
- **Subject:** "Weekly Vehicle Digest: 12 New Matches This Week"
- **Content:** Top 5 vehicles from last 7 days + summary stats
- **Design:** Purple theme, summary box with stats
- **Includes:** Same details as daily + weekly averages

## Schedule Options

Edit `email_frequency` in `config/notification-settings.json`:

- **`"daily"`** - Daily digest at 8 AM
- **`"weekly"`** - Weekly digest every Monday at 8 AM
- **`"on_new"`** - Immediate email when high-priority vehicles found
- **`"disabled"`** - No automatic emails (manual API calls only)

## Advanced Configuration

### Only send high-priority vehicles:
```json
{
  "min_priority_score": 80,
  "preferences": {
    "only_high_priority": true
  }
}
```

### Change email time:
```json
{
  "send_time": "17:00",
  "send_timezone": "America/Los_Angeles"
}
```

### Include more vehicles:
```json
{
  "max_vehicles_per_email": 10,
  "include_all_vehicles": false
}
```

## Manual Testing

### Test via API:
```bash
# Daily digest
curl -X POST http://localhost:3000/api/notifications/send-digest \
  -H "Content-Type: application/json" \
  -d '{"type": "daily", "email": "your.email@example.com"}'

# Weekly digest
curl -X POST http://localhost:3000/api/notifications/send-digest \
  -H "Content-Type: application/json" \
  -d '{"type": "weekly", "email": "your.email@example.com"}'
```

### Check configuration:
```bash
curl http://localhost:3000/api/notifications/send-digest?test=true
```

## Production Setup

### 1. Add to .env (Vercel/Production):
```
RESEND_API_KEY=re_your_production_key
CRON_SECRET=random_secure_string_here
```

### 2. Verify domain (optional):
- In Resend dashboard, add your domain
- Add DNS records
- Update `from` address in `lib/email.ts`

### 3. Set up cron job:
The cron job from Feature 11 will automatically trigger emails after fetching new vehicles.

## Next Steps

1. **Test with real data** - Run the data pipeline to fetch actual listings
2. **Adjust filters** - Fine-tune `min_priority_score` to your preferences
3. **Set schedule** - Choose daily or weekly digest
4. **Monitor** - Check Resend dashboard for delivery stats

## Need Help?

- Read full documentation: `FEATURE_12_EMAIL_NOTIFICATIONS.md`
- Check API status: `GET /api/notifications/send-digest?test=true`
- View Resend logs: [resend.com/emails](https://resend.com/emails)

---

**You're all set!** Enjoy automated email notifications for your vehicle matches.
