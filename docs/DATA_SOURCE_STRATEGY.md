# Data Source Strategy: Marketcheck vs Auto.dev

**Date**: October 2025
**Purpose**: Define the optimal data source strategy for YourToyotaPicks

---

## Executive Summary

**TL;DR Recommendation**:

- **Phase 1 (MVP)**: Mock data (current - perfect for UI development)
- **Phase 2 (Testing)**: Auto.dev free tier (1K calls/month - validate pipeline)
- **Phase 3 (Production)**: Marketcheck API (industry standard - highest quality)

**Why This Matters**: Your curator philosophy requires **high-quality, reliable data**. The better your data source, the better your curated picks.

---

## Head-to-Head Comparison

| Factor                | Marketcheck API                                                 | Auto.dev API                                | Winner             |
| --------------------- | --------------------------------------------------------------- | ------------------------------------------- | ------------------ |
| **Coverage**          | 675K+ listings, 11K+ dealers, US + Canada                       | US dealers only (no public numbers)         | 🏆 **Marketcheck** |
| **Market Share**      | Industry standard, 60M+ API calls/month, 130+ subscribers       | Newer player, smaller footprint             | 🏆 **Marketcheck** |
| **Data Quality**      | Daily refresh, data cleaning/normalization, 99% market coverage | Good quality (no independent verification)  | 🏆 **Marketcheck** |
| **Reliability**       | 99.9% uptime SLA                                                | No public SLA                               | 🏆 **Marketcheck** |
| **API Maturity**      | Established, comprehensive docs, proven at scale                | Modern API, good docs                       | 🏆 **Marketcheck** |
| **Cost (Free Tier)**  | None - must pay from day 1                                      | 1,000 calls/month free                      | 🏆 **Auto.dev**    |
| **Cost (Production)** | $0.20-$8 per 100 calls (~$100-300/mo estimate)                  | Free tier then usage-based (likely cheaper) | 🏆 **Auto.dev**    |
| **Best For**          | Production, enterprise, high-volume                             | Testing, MVP, low-volume personal use       | Depends            |

---

## Detailed Breakdown

### Marketcheck API 🏆 (Industry Leader)

**What It Is:**

- The **industry standard** for automotive listing data in North America
- Crawls 11,000+ dealer websites daily
- Aggregates data from 10,000+ dealers
- 675,000+ active car listings tracked
- 99% market coverage (US + Canada)

**Data Quality:**

- ✅ **Daily refresh** - Inventory updated every 24 hours
- ✅ **Data cleaning** - Normalized, standardized formats
- ✅ **Comprehensive** - Includes VIN, pricing, mileage, location, images
- ✅ **Proven accuracy** - Claims to have "baked off" against every competitor
- ✅ **Historical data** - Track price changes over time

**Reliability:**

- ✅ **99.9% uptime SLA**
- ✅ **60M+ API calls/month** served (proven at scale)
- ✅ **130+ subscribers** including major automotive companies

**Pricing:**

- 💰 **$0.20 - $8.00 per 100 API calls**
- 💰 **Estimated ~$100-300/month** for personal use (depends on volume)
- 💰 **No free tier** - Must pay from day 1
- 💰 **Tiered pricing** - Higher tiers add more features (VIN history, comparables, etc.)

**Use Case for Your Project:**

- ✅ **Production phase** - When you want the absolute best data
- ✅ **High accuracy** - Curator needs reliable data to make good recommendations
- ✅ **Daily automation** - Proven reliability for cron jobs
- ✅ **Comprehensive coverage** - See every available vehicle in your area

**Downsides:**

- ❌ **Cost** - Not free, ongoing monthly expense
- ❌ **Overkill for testing** - Too expensive to test/prototype with
- ❌ **No free tier** - Can't try before you buy (though they offer samples)

---

### Auto.dev API 🆓 (Budget-Friendly)

**What It Is:**

- Newer vehicle listings API focused on US dealers
- Provides access to dealer inventory
- Modern API with good documentation
- Part of growing automotive API ecosystem

**Data Quality:**

- ✅ **Good quality** - Professional API, clean data
- ⚠️ **No independent verification** - Less proven than Marketcheck
- ⚠️ **Coverage unclear** - No public stats on dealer/listing count
- ✅ **Includes essentials** - VIN, pricing, mileage, location, specs

**Reliability:**

- ⚠️ **No public SLA** - Unknown uptime guarantees
- ⚠️ **Smaller scale** - Less proven at high volume
- ⚠️ **Less established** - Newer player in the market

**Pricing:**

- 🎉 **FREE tier: 1,000 API calls/month**
- 💰 **Usage-based after free tier** (pricing not publicly listed)
- 💰 **Likely cheaper than Marketcheck** for low-volume use

**Use Case for Your Project:**

- ✅ **Testing phase** - Perfect for validating your pipeline
- ✅ **MVP/prototyping** - Free tier lets you test with real data
- ✅ **Personal use** - 1K calls/month might be enough for daily searches
- ✅ **Budget-conscious** - Start free, scale as needed

**Downsides:**

- ❌ **Less comprehensive** - Likely smaller dealer network
- ❌ **Less proven** - No track record at enterprise scale
- ❌ **Unknown coverage** - Hard to know if you're seeing all available vehicles
- ❌ **Risky for production** - What if they shut down or change pricing?

---

## The Vision: Recommended Strategy

### 🎯 **Three-Phase Approach**

```
Phase 1: MVP          Phase 2: Testing       Phase 3: Production
(Current)             (Next 1-2 months)      (Long-term)
    ↓                      ↓                       ↓
Mock Data            Auto.dev Free         Marketcheck API
$0/month             $0/month              $100-300/month
Perfect for UI       Validate pipeline     Best data quality
```

---

### Phase 1: MVP (CURRENT) ✅

**Status**: In progress
**Data Source**: Mock data (32 curated vehicles)
**Cost**: $0/month

**Why This Is Perfect:**

- ✅ You're building the **UI and curator logic** - don't need real data yet
- ✅ Mock data has all the fields you need for testing
- ✅ Zero cost, zero API limits
- ✅ Fast iteration - no API delays or rate limits
- ✅ Predictable test data - same 32 vehicles every time

**What You're Accomplishing:**

- Building the dashboard interface ✅
- Implementing filtering/sorting logic ✅
- Creating the priority scoring algorithm ✅
- Testing user experience flows ✅
- Refining the curator UX ✅

**When to Move to Phase 2:**

- When you want to see **real** listings instead of test data
- When you want to validate that your filters work on diverse real-world data
- When you're ready to test the full pipeline end-to-end

---

### Phase 2: Testing & Validation (NEXT)

**Timeline**: 1-2 months after UI is complete
**Data Source**: Auto.dev API (free tier)
**Cost**: $0/month (1,000 API calls free)

**Why Auto.dev for Testing:**

- 🎉 **Free tier** - Perfect for testing without financial commitment
- ✅ **Real data** - Validate your pipeline with actual listings
- ✅ **Low risk** - If it doesn't work out, switch to Marketcheck
- ✅ **Sufficient volume** - 1K calls/month = ~33 calls/day (enough for daily searches)

**What You'll Accomplish:**

1. **Validate your pipeline**:
   - Does your filter logic work on real diverse data?
   - Are your priority scores accurate?
   - Do your quality tiers make sense?

2. **Test the full automation**:
   - Daily cron job → Auto.dev → Filter → Score → Store
   - NHTSA VIN validation on real VINs
   - VinAudit history checks (when you're ready to pay)

3. **Refine your algorithm**:
   - See if you're getting 0-5 quality picks per day (target)
   - Adjust scoring weights based on real results
   - Identify edge cases in your filtering logic

4. **Prove the concept**:
   - Does this actually save you time?
   - Are the curated picks genuinely good?
   - Is the data quality sufficient?

**Usage Estimate:**

```
Daily search: 1 API call to Auto.dev (fetch listings within 30 miles)
30 days × 1 call = 30 calls/month

You have 1,000 calls/month, so you could even:
- Run searches multiple times per day
- Test different search parameters
- Fetch historical data
- Build up a dataset for analysis
```

**Exit Criteria for Phase 2:**

- ✅ Pipeline runs reliably for 30+ days
- ✅ You're getting 0-5 quality picks per day
- ✅ Scoring algorithm is tuned and accurate
- ✅ You trust the data quality
- ⚠️ OR: You hit free tier limits
- ⚠️ OR: You need more comprehensive coverage

**When to Move to Phase 3:**

- You're using this daily and it's valuable
- You want better coverage (seeing all available vehicles)
- You need enterprise-grade reliability (99.9% uptime)
- You're willing to pay for the best data quality

---

### Phase 3: Production (LONG-TERM)

**Timeline**: 3-6+ months, when fully committed
**Data Source**: Marketcheck API
**Cost**: ~$100-300/month

**Why Marketcheck for Production:**

- 🏆 **Best data quality** - Industry standard, proven accuracy
- 🏆 **Comprehensive coverage** - 99% market coverage, 675K+ listings
- 🏆 **Enterprise reliability** - 99.9% uptime SLA
- 🏆 **Daily updates** - Fresh data every 24 hours
- 🏆 **Future-proof** - Track price changes, historical trends

**What You'll Get:**

1. **Maximum confidence**:
   - You're seeing **every** available vehicle in your area
   - Data is cleaned, normalized, and accurate
   - No gaps or missing dealers

2. **Advanced features** (higher tiers):
   - VIN history data (if bundled)
   - Price comparisons to market median
   - Historical price tracking
   - Dealer reputation scores

3. **Professional reliability**:
   - 99.9% uptime guarantee
   - Proven at scale (60M+ calls/month)
   - Enterprise support

4. **Scalability**:
   - If you ever expand to SaaS (multi-user)
   - If you want to cover multiple cities
   - If you need historical data analysis

**Cost Justification:**

```
Current manual search time: 30-60 min/day = 15-30 hours/month
Your hourly rate: $50/hour (conservative)
Time saved value: $750-1,500/month

Marketcheck cost: $100-300/month
ROI: $450-1,200/month saved

Conclusion: Pays for itself if it saves you just 2-6 hours/month
```

**When to Commit:**

- ✅ You've been using Auto.dev for 30+ days successfully
- ✅ You're checking the dashboard daily
- ✅ The curator is genuinely helping you find cars
- ✅ You're willing to pay $100-300/month for better data
- ✅ You want the absolute best coverage and reliability

---

## Why Not Use Auto.dev as Main Source?

**You Asked:** _"Would Auto.dev be my main source of data?"_

**Answer**: It **could** be, but probably **shouldn't** be for long-term production use.

**Reasons:**

### 1. **Unknown Coverage** 🤷‍♂️

- Auto.dev doesn't publish dealer/listing counts
- You won't know if you're missing vehicles
- For a **curator**, incomplete data = bad recommendations

**Example Risk:**

```
Auto.dev shows: 3 Toyota RAV4s in your area
Reality: 8 Toyota RAV4s available (5 missing from Auto.dev)

Your curator says: "Here are the 3 best options"
But you missed: A perfect RAV4 that wasn't in Auto.dev's data

Result: Your curator failed you
```

### 2. **Unproven Reliability** ⚠️

- No public SLA (what if it's down during your daily cron?)
- Smaller company (what if they pivot or shut down?)
- Less battle-tested at scale

**Risk:**

- Your daily automation depends on this API
- If Auto.dev has issues, your pipeline breaks
- Marketcheck is proven reliable (99.9% uptime)

### 3. **Curator Philosophy Conflict** 🎯

- Your core mission: **Trustworthy curator**
- Trust requires **comprehensive, accurate data**
- Using a less-proven API undermines trust

**Your UX Principle:**

> "Users should know their best matches in <5 seconds"

If your data source is incomplete, users can't trust those matches are truly "the best."

### 4. **Cost Savings Might Not Matter** 💰

- Auto.dev might save $50-150/month vs Marketcheck
- But if it causes you to miss a great car deal...
- Or waste time on manual searches to supplement...
- The savings evaporate

**Cost Analysis:**

```
Scenario 1: Use Auto.dev (cheaper)
- Cost: $0-50/month
- Coverage: Unknown (maybe 60-80% of market?)
- Risk: Miss good vehicles, need manual backup

Scenario 2: Use Marketcheck (premium)
- Cost: $100-300/month
- Coverage: 99% of market
- Risk: Minimal, comprehensive coverage

If you miss ONE good car deal worth $1000s because of incomplete data,
the $100-200/month difference is irrelevant.
```

---

## Recommended Decision Framework

### Use **Mock Data** If:

- ✅ You're building the UI
- ✅ You're testing features
- ✅ You haven't launched yet

**Status**: ✅ **CURRENT PHASE** (correct choice)

---

### Use **Auto.dev** If:

- ✅ You want to test with real data (free)
- ✅ You're validating your pipeline
- ✅ Personal use only (low volume)
- ✅ You're okay with potentially incomplete coverage
- ✅ Budget is a primary constraint

**When**: Phase 2 (next 1-2 months)
**Duration**: 30-90 days testing

---

### Use **Marketcheck** If:

- ✅ You're using this daily and it's valuable
- ✅ You want comprehensive coverage (99% market)
- ✅ You need enterprise reliability (99.9% uptime)
- ✅ Your curator must be trustworthy (complete data)
- ✅ You're willing to pay for quality
- ✅ This is a long-term tool for you

**When**: Phase 3 (production)
**Duration**: Indefinite (ongoing)

---

## Direct Answer to Your Questions

### Q: "How is Auto.dev different from Marketcheck?"

**A**: Think of them like this:

| Aspect          | Auto.dev          | Marketcheck              |
| --------------- | ----------------- | ------------------------ |
| **Analogy**     | Local classifieds | Major national newspaper |
| **Coverage**    | Some dealers      | Almost all dealers       |
| **Reliability** | Unknown           | Proven (99.9% uptime)    |
| **Cost**        | Free tier         | Premium pricing          |
| **Best for**    | Testing/MVP       | Production               |

**Auto.dev** is like searching Craigslist - you'll find cars, but you don't know if you're seeing everything.

**Marketcheck** is like searching Cars.com + Autotrader + dealer sites all at once - comprehensive view.

---

### Q: "Would Auto.dev be my main source of data?"

**A**: **It could be for Phase 2 (testing), but shouldn't be for Phase 3 (production).**

**Reason**: Your curator philosophy requires comprehensive, reliable data. Auto.dev is unproven compared to Marketcheck's 99% market coverage.

**Recommended Path**:

```
Phase 1 → Phase 2 → Phase 3
Mock     Auto.dev   Marketcheck
(now)    (test)     (production)
```

---

### Q: "Is Auto.dev just as reliable or more reliable?"

**A**: **Less reliable (probably).**

**Evidence**:

- Marketcheck: 99.9% uptime SLA, 60M calls/month, 130+ enterprise customers
- Auto.dev: No public SLA, newer player, smaller scale

**BUT**: Auto.dev is probably "reliable enough" for testing. You won't know until you try.

---

### Q: "Provide a breakdown on the vision you foresee"

**A**: See three-phase strategy above. Here's the summary:

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: MVP (Current)                              │
│ ────────────────────────────────────────────────    │
│ Data: Mock (32 vehicles)                            │
│ Cost: $0/month                                      │
│ Goal: Build UI, refine curator UX                   │
│ Duration: 1-2 months                                │
│ Status: ✅ IN PROGRESS                              │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 2: Testing (Next)                             │
│ ────────────────────────────────────────────────    │
│ Data: Auto.dev API (free tier)                      │
│ Cost: $0/month (1K calls free)                      │
│ Goal: Validate pipeline, tune scoring algorithm     │
│ Duration: 1-3 months                                │
│ Success metric: 0-5 quality picks/day consistently  │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 3: Production (Future)                        │
│ ────────────────────────────────────────────────    │
│ Data: Marketcheck API (industry standard)           │
│ Cost: $100-300/month                                │
│ Goal: Best possible data quality & coverage         │
│ Duration: Ongoing (as long as valuable)             │
│ Value: Saves 15-30 hours/month of manual searching  │
└─────────────────────────────────────────────────────┘
```

---

## My Recommendation (Strong Opinion)

### For YOUR Specific Use Case:

**Phase 1 (Now)**: ✅ **Keep using mock data** - You're building UI, this is perfect.

**Phase 2 (1-2 months)**: ✅ **Start with Auto.dev free tier**

- Validate your pipeline works end-to-end
- Test with real data without spending money
- Tune your scoring algorithm
- Prove the concept for 30-90 days

**Phase 3 (3-6 months)**: ✅ **Upgrade to Marketcheck**

- Once you're using it daily and finding it valuable
- When you want the absolute best data quality
- When $100-300/month is justified by time saved

**Why This Path:**

1. **Low risk** - Start free, upgrade when proven valuable
2. **Learn as you go** - Validate assumptions before spending money
3. **Future-proof** - Marketcheck is enterprise-grade for long-term
4. **Financially smart** - Don't pay until you know it's valuable

---

## What About Other Options?

### CarGurus (Carapis)?

- **Status**: Possible, but less comprehensive than Marketcheck
- **Cost**: Unknown (contact for pricing)
- **Use case**: If you specifically want CarGurus listings
- **Verdict**: ⚠️ Probably not worth it vs Marketcheck

### Multiple Sources?

- **Idea**: Use Auto.dev + Marketcheck together
- **Problem**: Duplicates, complexity, more cost
- **Verdict**: ❌ Just use the best single source (Marketcheck)

### Web Scraping?

- **Idea**: Scrape CarGurus, Autotrader, etc. yourself
- **Problem**: Legal issues, fragile, high maintenance
- **Verdict**: ❌ Not worth it vs paying for clean API

---

## Action Items

### Immediate (This Week):

- ✅ Continue with mock data
- ✅ Finish UI development
- ✅ Don't worry about real data sources yet

### Phase 2 Prep (Next 1-2 Months):

1. Sign up for Auto.dev free tier account
2. Get API key (store in `.env.local`)
3. Implement Auto.dev integration in `lib/data-pipeline.ts`
4. Test with real data
5. Run daily for 30+ days

### Phase 3 Prep (3-6 Months):

1. Request Marketcheck pricing quote
2. Compare actual Auto.dev coverage to needs
3. Decide if upgrade is worth it
4. If yes: Get Marketcheck API key
5. Swap in `lib/data-pipeline.ts` (same interface)

---

## Bottom Line

### TL;DR:

**Right now**: Mock data is perfect. ✅

**Next phase**: Try Auto.dev free tier to test with real data. ✅

**Production**: Upgrade to Marketcheck for best quality. ✅

**Why this matters**: Your curator philosophy demands trustworthy data. Marketcheck is the industry standard for reliability and coverage. Auto.dev is a great free testing ground, but Marketcheck is the long-term winner.

---

## Questions to Ask Yourself

Before committing to a paid data source, answer these:

1. **Am I using this daily?**
   - If no → Stay with free tier
   - If yes → Consider paying

2. **Is it saving me significant time?**
   - If no → Not worth paying for
   - If yes (>5 hours/month) → Pays for itself

3. **Do I trust the curated picks?**
   - If no → Fix the algorithm first
   - If yes → Good data source can only improve it

4. **Can I afford $100-300/month?**
   - If no → Stay with Auto.dev
   - If yes → Marketcheck is worth it for quality

5. **Is this a long-term tool or experiment?**
   - Experiment → Auto.dev is fine
   - Long-term → Marketcheck is the move

---

**Last Updated**: October 13, 2025
**Next Review**: After Phase 2 testing (1-3 months)
