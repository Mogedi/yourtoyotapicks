YourToyotaPicks — Product Overview & Implementation

🧩 Overview

YourToyotaPicks is a regional SaaS tool that curates high-quality used Toyota listings from online marketplaces and filters them to highlight only the most trustworthy, affordable, and relevant vehicles for buyers in a local area.

The product is SEO-first, designed for lean operations, and intended to generate revenue through affiliate leads, subscriptions, and premium concierge offerings.

⸻

🔍 Problem

Finding a trustworthy used Toyota is time-consuming and stressful for everyday buyers. Existing listing platforms (CarGurus, Craigslist, FB Marketplace) are:
	•	Overloaded with irrelevant or poor-quality listings
	•	Lacking proper filters for accident history, rust-prone state origin, or title status
	•	Not personalized to a buyer’s region or reliability preferences

Buyers want:
	•	A shortlist of already-vetted, high-quality used Toyotas
	•	Vehicles that have clean titles, low mileage, and no accident or rust history
	•	Simplicity, speed, and trust in the search process

⸻

💡 Solution

YourToyotaPicks solves this by curating Toyota listings and applying a strict quality filter, surfacing only the top cars weekly. The listings are localized, quality-checked, and optionally linked to VIN history tools.

Buyers save hours, avoid scams, and get peace of mind knowing only the best cars are shown.

⸻

🎯 Audience
	•	Regional buyers (starting in DMV, Atlanta, etc.)
	•	First-time buyers, students, commuters
	•	Toyota loyalists looking for reliability

⸻

🛠 MVP Features

These are the features required to launch with revenue potential:

1. Curated Listings Feed
	•	Scrape or import Toyota listings from CarGurus, Craigslist, etc.
	•	Filter logic:
	•	Price: <$15K
	•	Mileage: <120K
	•	Clean title only
	•	No reported accidents (if VIN available)
	•	Exclude cars from rust-prone states (e.g., Ohio, Michigan)
	•	Output: JSON or DB entries of curated cars

2. Basic Listing UI
	•	Card-based layout (image, model, price, miles, flags)
	•	CTA: “View Listing” → links to source
	•	Optional: “Get CarFax” link (deep-linked with VIN)

3. Email Capture + Weekly Drop
	•	Landing page headline: “Get the 5 Best Used Toyotas Near You — Every Friday”
	•	Email integration: Resend / ConvertKit / MailerLite
	•	Weekly batch listing of 5–10 cars per region

4. SEO-Optimized Landing Pages
	•	Auto-generated pages per region + model
	•	Example: /atlanta/camry-under-15k
	•	H1, Meta tags, Schema markup

⸻

✨ Nice-to-Haves

Once the core product gains traction, add:
	•	VIN API integration (Carfax, VinAudit) with summary output
	•	SMS alerts for new matches
	•	Buyer favorites + save feature
	•	Featured dealer listings (paid promotion)
	•	Inspection scheduling via partner mechanics
	•	Concierge add-on ($49–$99) — 3 hand-picked options per buyer

⸻

🧱 Tech Stack (Lean)

Layer	Tool
Frontend	Next.js (Vercel) or Flutter Web (for app experience)
Styling	Tailwind CSS or shadcn/ui
Backend	Supabase (Postgres + Auth) or Firebase
Scraping	Puppeteer + Node or Playwright + Python
Email	Resend / MailerLite / ConvertKit
Hosting	Vercel (free tier initially)
SEO	Static pages w/ dynamic path generation + schema tags


⸻

🔌 Implementation & APIs

🧪 Data Ingestion Pipeline

Input sources:
	•	CarGurus (via Carapis)
	•	Craigslist (web scraping)
	•	FB Marketplace (manual / optional)

Steps:
	1.	Run a scheduled job every 12–24h
	2.	Pull listings for Toyota models: camry, corolla, prius, rav4, highlander
	3.	Apply filtering logic:

if (mileage < 120000 && price < 15000 && !accidentHistory && !rustProneState) {
  // Save to DB
}


	4.	Save curated listings to Supabase table curated_listings

🧾 VIN History Linking
	•	Pull vin_number from listing
	•	Generate Carfax or VinAudit link:

const vinLink = `https://www.vinaudit.com/report?id=${vin}`;


	•	Display link in listing card (optional badge: “Report Available”)

📥 Email Campaign
	•	Supabase trigger on new_listing → generate plaintext + HTML email
	•	Resend or MailerLite campaign: “Top 5 Picks This Week in [Region]”
	•	CTA: “View Listing” → link to external site

⸻

💸 Monetization Options

Path	Description
Referral	$25–100 per closed lead from dealer/marketplace
Subscription	$5–$15/mo for alerts, favorites, concierge access
Featured listings	Dealers pay to boost visibility
Concierge	Paid manual search and curation
Inspection affiliate	Partner with mechanics for $ or trust


⸻

🧭 GTM / Growth Plan
	1.	Launch in 1 region (e.g. DMV / Atlanta)
	2.	Weekly drop of cars + newsletter list
	3.	Post to local Reddit / Facebook car groups
	4.	Run $50–$100 ad tests on Instagram/FB
	5.	Partner with local used-car Facebook pages
	6.	Add referral codes & email sharing tools

⸻

📌 Next Steps
	•	Finalize scraper / import flow for CarGurus (via Carapis)
	•	Deploy first landing page (e.g. yourtoyotapicks.com/atlanta)
	•	Set up email capture and weekly send-out
	•	Run validation ads (e.g. “Want help finding the best used Toyota near you?”)
	•	Track clicks and measure conversions / interest

⸻
