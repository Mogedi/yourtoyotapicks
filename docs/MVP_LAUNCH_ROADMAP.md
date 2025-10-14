# 🚀 MVP Launch Roadmap - Ranked by Priority

**Project:** YourToyotaPicks
**Status:** Pre-Launch
**Last Updated:** October 13, 2025

This document outlines the prioritized roadmap for launching the MVP and getting initial users.

---

## 🔴 CRITICAL - Must Do Before Launch (Week 1)

### 1. **Connect to Production Supabase Database** ⏱️ 2-3 hours

**Why First:** Can't have a real MVP with only mock data

**Tasks:**

- Create Supabase project at supabase.com
- Run database migrations (`lib/database/database.sql`)
- Add environment variables to `.env.local` and Vercel:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_key
  ```
- Seed with initial real data (can use mock data structure)
- Test database connection and fallback logic
- Verify queries work in production

**Success Criteria:**

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] App connects successfully
- [ ] Mock data can be imported

---

### 2. **Deploy to Vercel** ⏱️ 30 mins

**Why Second:** Get your app online immediately

**Tasks:**

- Connect GitHub repo to Vercel
- Add environment variables in Vercel dashboard
- Configure build settings (should work automatically)
- Deploy and verify build succeeds
- Test live site with Supabase connection
- Set up custom domain (optional)

**Success Criteria:**

- [ ] Site deployed to production URL
- [ ] Build succeeds without errors
- [ ] All environment variables configured
- [ ] Database connection works on live site
- [ ] All pages render correctly

---

### 3. **Set Up Basic Analytics** ⏱️ 1 hour

**Why Third:** Track if anyone is using it

**Tasks:**

- Add Vercel Analytics (free, already integrated)
- OR add Google Analytics 4
- Track key events:
  - Page views
  - Dashboard visits
  - Vehicle detail clicks
  - Filter usage
- Set up conversion events (viewing vehicle details = success)

**Success Criteria:**

- [ ] Analytics installed
- [ ] Tracking verified (test events show up)
- [ ] Key events configured
- [ ] Dashboard accessible

---

## 🟡 HIGH PRIORITY - Launch Week (Week 1-2)

### 4. **Add Real Vehicle Data** ⏱️ 2-4 hours

**Current:** 32 mock vehicles
**Goal:** Get 50-100 real listings

#### Option A - Quick Win (Recommended for MVP)

**Manual curation from public sites**

**Tasks:**

- Browse AutoTrader/Cars.com for your local area
- Filter by your criteria (Toyota/Honda, 2015+, $10-20K, etc.)
- Manually create 10-20 vehicle entries
- Focus on YOUR local area first (validate UX with real data)
- Use VIN decoder to verify information
- Take or find real vehicle photos

**Why This First:**

- Validates your filtering criteria work
- Shows you care about quality
- Faster than building API integration
- You'll learn what data matters most

#### Option B - API Integration (Phase 2)

**Automated data ingestion**

**Tasks:**

- Sign up for Auto.dev API (free tier: 1000 calls/month)
- Implement API integration in `lib/adapters/autodev.ts`
- Add Marketcheck API integration
- Build automated daily refresh
- Add rate limiting and error handling

**Recommendation:** Start with Option A for MVP, move to Option B after validation

**Success Criteria:**

- [ ] 20+ real vehicles in database
- [ ] All vehicles pass filter criteria
- [ ] Real photos available
- [ ] VIN data validated
- [ ] Local area represented

---

### 5. **Create Landing Page** ⏱️ 2-3 hours

**Current:** Basic landing page exists
**Goal:** Convert visitors to dashboard users

**Improvements Needed:**

- Compelling headline: "Stop wasting time on CarGurus. Find your perfect Toyota/Honda in minutes."
- Hero section with screenshot of "Top Pick" vs typical listing comparison
- Trust signals:
  - "32 vehicles curated"
  - "Zero accidents, clean titles only"
  - "Scored on 6 quality factors"
- Show your unique value proposition
- Add your story: "I was frustrated by spending hours on car sites..."
- Clear CTA button to dashboard
- Show example scoring breakdown
- Social proof (once you have testimonials)

**Success Criteria:**

- [ ] Compelling headline
- [ ] Clear value proposition
- [ ] Visual comparison/example
- [ ] Personal story added
- [ ] Strong CTA button
- [ ] Mobile responsive

---

### 6. **Add Email Capture** ⏱️ 1-2 hours

**Why:** Build audience before going viral

**Tasks:**

- Add email form to landing page
- Copy: "Get notified when new top picks arrive"
- Create `subscribers` table in Supabase:
  ```sql
  CREATE TABLE subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE
  );
  ```
- Create API route to store emails
- Add basic validation (email format)
- Add confirmation message
- NO need for Resend yet - just collect emails

**Success Criteria:**

- [ ] Email form on landing page
- [ ] Subscribers table created
- [ ] API route working
- [ ] Validation in place
- [ ] Success message displays

---

## 🟢 MEDIUM PRIORITY - Post-Launch Polish (Week 2-3)

### 7. **SEO Optimization** ⏱️ 2 hours

**Tasks:**

- Add proper meta tags to all pages:
  ```tsx
  export const metadata = {
    title: 'YourToyotaPicks - Curated Used Toyota & Honda Listings',
    description: 'Stop wasting time. Only clean-title, 1-2 owner Toyota & Honda vehicles scored by quality.',
    openGraph: { ... }
  }
  ```
- Create `sitemap.xml`
- Add `robots.txt`
- Submit to Google Search Console
- Target keywords:
  - "used Toyota RAV4"
  - "best used Honda CR-V"
  - "clean title used cars"
- Add structured data (schema.org)

**Success Criteria:**

- [ ] Meta tags on all pages
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Google Search Console verified
- [ ] Keywords targeted in content

---

### 8. **Add Share Functionality** ⏱️ 1 hour

**Tasks:**

- Add "Share this vehicle" button on detail pages
- Generate shareable links with OG preview
- Add Twitter/LinkedIn share buttons
- Track shares in analytics
- Create OG images for vehicles (can use vehicle photo)

**Success Criteria:**

- [ ] Share button on vehicle details
- [ ] OG tags render correctly
- [ ] Social media previews work
- [ ] Share events tracked

---

### 9. **Create "About" Page** ⏱️ 1 hour

**Content to Include:**

- Your story (why you built this)
- The problem: "I spent 10+ hours on CarGurus..."
- How the scoring algorithm works (transparency)
- What makes this different from other sites
- Trust and transparency
- Contact information
- Privacy policy (basic)

**Success Criteria:**

- [ ] About page created
- [ ] Personal story included
- [ ] Algorithm explained
- [ ] Contact info added

---

### 10. **Mobile Optimization Testing** ⏱️ 2 hours

**Tasks:**

- Test on real iOS devices
- Test on real Android devices
- Fix any mobile-specific issues:
  - Touch targets too small
  - Images loading slowly
  - Text too small/large
  - Buttons hard to tap
- Ensure images load fast on mobile (already using IMAGIN.studio API)
- Test swipe gestures for vehicle cards
- Verify filters work on mobile
- Test landscape mode

**Success Criteria:**

- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] All buttons easily tappable
- [ ] Images load quickly
- [ ] No horizontal scroll
- [ ] Filters work smoothly

---

## 🔵 NICE TO HAVE - Can Wait (Week 3+)

### 11. **Implement Cron Job** ⏱️ 2-3 hours

**Only if you go with API integration**

**Tasks:**

- Set up Vercel Cron or GitHub Actions
- Schedule daily update at 6 AM
- Fetch new listings from API
- Score them using existing algorithm
- Store in Supabase
- Remove stale listings (>7 days old)
- Send email digest to subscribers (if implemented)

**Success Criteria:**

- [ ] Cron job configured
- [ ] Runs daily without errors
- [ ] New listings appear automatically
- [ ] Old listings removed
- [ ] Logging implemented

---

### 12. **Add Email Notifications** ⏱️ 3-4 hours

**Only after you have 10+ email subscribers**

**Tasks:**

- Integrate Resend API (already in package.json)
- Add RESEND_API_KEY to environment
- Use existing email templates in `lib/email/templates/`
- Send weekly digest of new top picks
- Add unsubscribe functionality
- Track email open rates
- Implement preference center

**Success Criteria:**

- [ ] Resend configured
- [ ] Weekly digest sends
- [ ] Unsubscribe works
- [ ] Templates render correctly
- [ ] Open rates tracked

---

### 13. **User Authentication** ⏱️ 4-6 hours

**Skip for MVP** - you're the only user

**Tasks (for future):**

- Add Supabase Auth
- Create user profiles table
- Save favorites per user
- Custom search criteria per user
- Review history
- Email preferences per user

**Success Criteria:**

- [ ] Users can sign up
- [ ] Users can log in
- [ ] Favorites saved
- [ ] Custom filters saved
- [ ] Profile page created

---

### 14. **Advanced Filtering** ⏱️ 2-3 hours

**Skip for MVP** - your default criteria are good

**Tasks (for future):**

- User-customizable filters
- Save filter presets
- Compare vehicles side-by-side
- Price alerts
- Saved searches
- Filter history

**Success Criteria:**

- [ ] Custom filters work
- [ ] Presets can be saved
- [ ] Comparison view implemented
- [ ] Alerts configured

---

## 📊 Success Metrics to Track

### Week 1 Goals

- [ ] Deploy live on Vercel
- [ ] 10-20 real vehicle listings in database
- [ ] Share with 5 friends for feedback
- [ ] Track: page views, time on site, vehicles clicked
- [ ] Get initial feedback on UX

### Week 2-3 Goals

- [ ] Post on Reddit (r/UsedCars, r/Toyota, r/Honda)
- [ ] Post on HackerNews "Show HN"
- [ ] Get 50+ unique visitors
- [ ] Collect 5+ email signups
- [ ] Get detailed feedback from 10 people
- [ ] Iterate based on feedback

### Month 1 Goals

- [ ] 100+ unique visitors
- [ ] 20+ email subscribers
- [ ] 50+ vehicles in database
- [ ] Positive feedback from users
- [ ] Decision: manual curation vs automation

---

## 🎯 The Absolute Minimum MVP (This Weekend)

If you only have one weekend to launch:

### Saturday Morning (3 hours)

1. Create Supabase project
2. Deploy to Vercel
3. Verify everything works

### Saturday Afternoon (2 hours)

4. Manually add 10 real local vehicles from AutoTrader

### Sunday Morning (2 hours)

5. Improve landing page copy
6. Add email capture form

### Sunday Afternoon (1 hour)

7. Share on Twitter/LinkedIn
8. Post to r/UsedCars on Reddit

**Total Time:** ~8 hours to go live with real value

---

## 💡 Recommended Launch Plan

### This Week (10 hours total)

1. ✅ Connect Supabase + Deploy to Vercel - ~4 hours
2. ✅ Manually curate 20 real vehicles for your area - ~3 hours
3. ✅ Improve landing page + add email capture - ~2 hours
4. ✅ Share with friends + Reddit - ~1 hour

### Next Week (based on feedback)

5. Decide: Continue manual curation OR build API automation
6. Add features users actually request
7. Double down on what's working

---

## 🚫 What NOT to Do Yet

❌ **Don't build automation until you validate people want this**

- Manual curation shows quality
- Faster to launch
- Easier to iterate

❌ **Don't add authentication (you're the only user)**

- Adds complexity
- Slows launch
- Not needed for validation

❌ **Don't worry about scaling (you won't have traffic issues)**

- Vercel scales automatically
- Supabase free tier handles thousands of users
- Mock data works fine for hundreds of users

❌ **Don't build email notifications until you have subscribers**

- Waste of time if nobody signs up
- Build it when you have 10+ subscribers

❌ **Don't spend time on fancy features**

- Validate core value first
- Add features based on user feedback
- Ship fast, iterate faster

---

## 🎪 Launch Strategy

### Where to Share (ranked by expected ROI)

#### 1. Reddit (Highest ROI)

**Subreddits:**

- r/UsedCars (337K members)
- r/Toyota (89K members)
- r/Honda (52K members)
- r/PersonalFinance (18M members)
- r/Frugal (1.5M members)

**Post Template:**

```
Title: I got tired of wasting hours on CarGurus, so I built a curator for used car shopping

Body:
I was spending 10+ hours per week browsing CarGurus, Autotrader, and Cars.com trying to find a reliable used Toyota/Honda. 90% of listings were junk - salvage titles, 5 owners, rental vehicles, etc.

So I built YourToyotaPicks - it only shows clean-title, 1-2 owner vehicles and scores them on 6 quality factors. No more wading through garbage listings.

Right now it's just for Toyota/Honda in [your area], but I'd love feedback on the UX and scoring algorithm.

[your-url]

Not monetized, no ads, just trying to solve my own problem. What do you think?
```

#### 2. HackerNews (High Visibility)

**Post as "Show HN"**

**Title:** "Show HN: I built a curator for used car shopping (filtering out junk listings)"

**Template:**

```
I spent way too much time browsing used car sites, so I automated the filtering process.

YourToyotaPicks only shows:
- Clean titles only (no salvage/rebuilt)
- 1-2 owners max
- Zero accidents
- Below-market pricing
- Reasonable mileage for year

Each vehicle gets a quality score based on 6 factors. The UI is designed to show you the best matches first, with clear explanations why.

Currently curating Toyota/Honda vehicles, but the approach could work for any make.

Tech stack: Next.js 15, Supabase, Vercel, TypeScript

Would love feedback on the scoring algorithm and UX!

[your-url]
```

#### 3. Twitter/X (Medium ROI)

**Hashtags:** #UsedCars #CarShopping #Toyota #Honda #CarBuying

**Tweet Template:**

```
I was frustrated by how much time I wasted on CarGurus filtering through junk listings.

So I built an automated curator that only shows top-tier picks:
✅ Clean titles
✅ 1-2 owners
✅ Zero accidents
✅ Quality scored

Check it out: [your-url]

[screenshot of dashboard]
```

#### 4. ProductHunt (Launch After Traction)

- Wait until you have 10+ users and testimonials
- Prepare high-quality screenshots
- Write compelling launch post
- Schedule for Tuesday-Thursday (highest traffic)

#### 5. Your Personal Network (Immediate)

**Reach out to:**

- Friends currently shopping for cars
- People who bought cars recently
- Car enthusiast groups
- Local community groups

**Message Template:**

```
Hey! I know you were/are shopping for a used car. I built a tool that might help - it filters out all the junk listings (salvage titles, rental vehicles, etc.) and only shows quality picks.

Would love your feedback if you have 5 minutes: [your-url]

Not trying to sell anything, just validating if this is useful!
```

---

## 🎯 Success Metrics

### Key Metrics to Track

**Acquisition:**

- Unique visitors
- Traffic sources (Reddit, HN, direct, etc.)
- Bounce rate

**Engagement:**

- Time on site
- Pages per session
- % who click to vehicle details
- % who use filters

**Conversion:**

- Email signups
- Vehicle detail views
- External link clicks (to dealer sites)

**Retention:**

- Return visitors
- Email open rates (if implemented)

### What Success Looks Like

**Week 1:**

- 50+ unique visitors
- 5+ engaged users (detailed feedback)
- 2+ email signups

**Week 2:**

- 200+ unique visitors
- 15+ email signups
- Viral post on Reddit or HN

**Month 1:**

- 500+ unique visitors
- 50+ email signups
- Clear signal: manual curation vs automation
- Feature roadmap based on user feedback

---

## 📝 Next Steps

1. **Review this roadmap** - Adjust based on your schedule
2. **Block time on calendar** - Schedule the critical tasks
3. **Set up Supabase** - This is the first blocker
4. **Deploy to Vercel** - Get online ASAP
5. **Share with 5 friends** - Get initial feedback

---

## 🤝 Getting Help

If you need assistance with any of these tasks:

- Supabase setup: See `docs/setup/DATABASE_SETUP.md`
- Vercel deployment: See `docs/setup/DEPLOYMENT.md`
- Adding features: See `docs/guides/IMPLEMENTATION_PLAN.md`

---

**Remember:** Ship fast, get feedback, iterate. Don't build features nobody wants!

Good luck with your launch! 🚀
