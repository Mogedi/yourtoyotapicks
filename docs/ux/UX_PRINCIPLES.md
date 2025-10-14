# UX Principles - YourToyotaPicks

## Core Mission

**CRITICAL**: This project is NOT a data table — it's a **trustworthy curator**.

## The 5-Second Clarity Rule

When a user lands on the dashboard, within 5 seconds they should:

1. **Know which cars are the top picks** for them personally
2. **Understand why each one ranks highly**
3. **Be able to compare or act** (contact, save, hide) without hunting through noise

## Foundational Principle: "Signal over noise"

Every UX decision must answer three questions at a glance:

| Question                                    | Visual Cue                                                         | Implementation                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **"Which cars are top-tier picks for me?"** | Sorted by `priority_score`, color-coded badges, "Top Match" labels | Priority score ≥80 = Green, 65-79 = Yellow, <65 = Gray/hidden                            |
| **"Why are they good?"**                    | AI-generated 2-line summary directly below or on hover             | Short, fact-grounded explanations: "✅ 1-owner • 📉 $1.8k below market • 🧰 Clean title" |
| **"How do they compare?"**                  | Quick stat chips (price vs median, miles vs median, owner count)   | Contextual comparison data, not just raw numbers                                         |

## Design Philosophy

### Visual Hierarchy

- **Default sort**: ALWAYS by `priority_score` (descending)
- **Best cars should look special** without looking like ads
  - 🟩 **80+ "Top Pick"** - Soft green border/glow or badge
  - 🟨 **65-79 "Good Buy"** - Neutral highlight
  - 🟥 **<65 "Caution"** - Muted, maybe folded away by default

### Transparency

- **Show priority score breakdowns on hover** so users trust the algorithm
- Display scoring factors clearly (Title, Mileage, Price, Distance, Model, Condition)
- Make it clear why each vehicle ranks where it does

### Progressive Clarity

- **Maximum clarity upfront, details on demand**
- Use popovers/tooltips for additional context
- Don't hide important information, but layer it appropriately

## Quality Tiers

### Top Pick (Priority Score ≥ 80)

**Visual Treatment:**

- Soft green border or subtle glow
- Green badge: "Top Pick"
- Prominent placement (always first in list)

**User Expectation:**

- These are the best matches based on all criteria
- Should be ready to contact dealer immediately
- Minimal or no concerns

### Good Buy (Priority Score 65-79)

**Visual Treatment:**

- Yellow/amber badge: "Good Buy"
- Neutral highlight
- Standard card styling

**User Expectation:**

- Solid vehicles with minor trade-offs
- Worth investigating further
- May have acceptable compromises (e.g., slightly higher mileage, further away)

### Caution (Priority Score < 65)

**Visual Treatment:**

- Muted/desaturated appearance
- May be collapsed or hidden by default
- Gray or orange badge: "Review Carefully"

**User Expectation:**

- Significant concerns or compromises
- Requires careful review
- May not meet all criteria but included for completeness

## When Building Features

### ALWAYS Ask:

✅ **Does this help users find their best match faster?**
✅ **Does this reduce noise or add it?**
✅ **Can users understand this in <5 seconds?**

### NEVER Do:

❌ **Add features that make the interface more complex without clear value**
❌ **Show raw data without context** (always add "vs median" comparisons)
❌ **Hide the priority score** - it's the core value proposition

## AI-Generated Summaries

### Format

- **2-line maximum**
- **Fact-grounded** (no speculation)
- **Emoji-prefixed highlights** for scannability

### Example Good Summaries

**Top Pick:**
"✅ 1-owner • 📉 $1.8k below market • 🧰 Clean title • 📍 Very close"

**Good Buy:**
"✅ Clean history • 💰 Below market • 📍 Nearby • ⚠️ Slightly high miles for age"

**Caution:**
"⚠️ 2 accidents • ⚠️ High mileage • ⚠️ Multiple owners"

### Rules

1. **Always lead with positives** for Top Picks
2. **Balance positives and warnings** for Good Buys
3. **Lead with warnings** for Caution tier
4. **Use specific numbers** when available ("$1.8k below" not "below market")
5. **Keep it concise** - users scan, they don't read

## Contextual Comparisons

### Price Context

Instead of: "$18,500"
Show: "$18,500 ($1,200 below median)"

### Mileage Context

Instead of: "45,000 miles"
Show: "45,000 mi (Excellent for 2020)"

### Owner Context

Instead of: "2 owners"
Show: "2 owners (Typical)"

### Distance Context

Instead of: "15 miles"
Show: "15 mi away (Very close)"

## Priority Scoring Algorithm (Transparent)

Weighted factors (100-point scale):

- **Title & accident history**: 25% (Clean title = +25)
- **Mileage vs year**: 20% (Below average for age = +15)
- **Price vs comps**: 20% (Below median = +10)
- **Distance (locality)**: 15% (Within 50 mi = +10)
- **Model demand**: 10% (RAV4/CR-V = +5)
- **Condition signals**: 10% (Maintenance keywords = +3)

**Must be transparent**: Show score breakdown on hover/click so users trust the algorithm.

## Progressive Disclosure

### Card View (Default)

- Vehicle image (primary angle)
- Year, Make, Model
- Priority score badge
- Price with context
- AI summary (2 lines)
- Key stats (mileage, owners, distance)
- Quick actions (View Details, Contact Dealer)

### Hover State

- Priority score breakdown (tooltip)
- Additional context
- More detailed stats

### Detail View (On Click)

- 5-angle image gallery
- Full vehicle specifications
- Complete history
- Mileage analysis
- VIN decode information
- User reviews
- Full dealer information

## Color Coding Best Practices

### Use Color for Meaning, Not Decoration

- **Green**: Positive indicators (Top Pick, Clean title, Low mileage)
- **Yellow/Amber**: Neutral or minor concerns (Good Buy, Acceptable mileage)
- **Red/Orange**: Warnings (Caution, Accidents, High mileage)
- **Gray**: Neutral or informational

### Accessibility

- Never use color alone to convey information
- Always pair with text labels, icons, or badges
- Ensure sufficient contrast (WCAG AA minimum)
- Test with color blindness simulators

## Mobile Considerations

### Responsive Breakpoints

- **Desktop** (1024px+): Full feature set, side-by-side comparisons
- **Tablet** (768px-1023px): Streamlined layout, stacked sections
- **Mobile** (< 768px): Single column, simplified actions

### Mobile-First Features

- **Swipeable cards** for quick triage
- **Call dealer button** (one-tap calling)
- **Save for later** (quick bookmark)
- **Share listing** (native share sheet)

### Mobile Simplifications

- Collapsed filters (drawer/modal)
- Simplified sort options
- Prioritize top 3 stats only
- Hide advanced features until requested

## Performance & Loading States

### Perceived Performance

- **Optimistic UI updates** (instant feedback)
- **Skeleton screens** while loading (never spinners)
- **Progressive image loading** (blur-up technique)
- **Prefetch** next vehicle details on hover

### Loading Priorities

1. **Priority scores and badges** (critical for triage)
2. **Primary vehicle info** (make, model, year, price)
3. **Primary image** (hero shot)
4. **AI summary** (context)
5. **Additional images** (lazy load)
6. **Detailed specs** (on demand)

## Error States & Edge Cases

### No Results

**Show:**

- Clear message: "No vehicles match your criteria"
- Specific reason (e.g., "No Toyota RAV4s available in your price range")
- Suggestions to adjust filters
- "Show all vehicles" option

**Don't:**

- Show empty state with no context
- Dead ends with no next action

### Data Issues

**Missing images:**

- Show placeholder with make/model
- Don't leave blank space

**Missing specs:**

- Show "Not available" inline
- Don't hide entire sections

**Stale data:**

- Show "Last updated" timestamp
- Warn if > 7 days old

## Consistency Principles

### Terminology

Use consistent terms throughout:

- **"Top Pick"** not "Best Match" or "Recommended"
- **"Good Buy"** not "Solid Choice" or "Worth Considering"
- **"Priority Score"** not "Ranking" or "Rating"
- **"AI Summary"** not "Quick Take" or "Overview"

### Interaction Patterns

- **Primary action**: Always on the right (desktop) or bottom (mobile)
- **Destructive actions**: Always require confirmation
- **Filters**: Always on the left sidebar (desktop) or drawer (mobile)
- **Sort**: Always in the top-right toolbar

### Spacing & Rhythm

- **Consistent card spacing**: 16px between cards
- **Consistent padding**: 24px inside cards (desktop), 16px (mobile)
- **Visual rhythm**: Group related information, separate distinct sections

## Accessibility Requirements

### Keyboard Navigation

- **Tab order**: Logical, left-to-right, top-to-bottom
- **Focus indicators**: Clearly visible (2px outline)
- **Skip links**: Allow skipping repetitive navigation
- **Keyboard shortcuts**: Optional but helpful (document them)

### Screen Readers

- **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3)
- **ARIA labels**: For interactive elements
- **Alt text**: Descriptive image descriptions
- **Live regions**: Announce dynamic updates

### Testing

- Test with screen readers (NVDA, VoiceOver)
- Test keyboard-only navigation
- Test with browser zoom (up to 200%)
- Test color contrast (WCAG AA minimum)

## Success Metrics

### Primary Metrics

- **Time to first match**: How long until user identifies a top pick
- **Filter usage**: Are users filtering or is default sort sufficient?
- **Detail view rate**: % of vehicles clicked for more info
- **Contact rate**: % of vehicles that lead to dealer contact

### UX Quality Metrics

- **Clarity score**: User survey - "How clear was the ranking?"
- **Trust score**: User survey - "How much do you trust these recommendations?"
- **Satisfaction**: User survey - "Did this save you time?"

---

**For implementation details**, see:

- [Technical Specification](../architecture/TECHNICAL_SPECIFICATION.md)
- [Dashboard V2 Documentation](../features/DASHBOARD_V2.md)
