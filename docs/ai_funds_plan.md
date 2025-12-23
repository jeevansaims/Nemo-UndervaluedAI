# AI Funds Implementation Plan

## Current State
- ✅ Basic `/funds` page exists with FundCard components
- ✅ Database models: Fund, Holding, Trade, FundSnapshot
- ✅ Mock data in`/lib/funds/mockFunds`
- ⚠️ Using hypothetical/mock performance data

## Goal
Build a functional AI Funds feature matching original undervalued.ai:
- Display multiple AI-managed funds
- Show live holdings for each fund
- Display performance charts (equity curve)
- Fund detail pages with holdings breakdown
- Match dark theme design

## Implementation Steps

### Phase 1: Database Setup ✅
Models already exist, just need data

### Phase 2: Seed Real Fund Data
1. Create seed script for 2-3 AI funds:
   - "AI Growth Fund"
   - "AI Value Fund"  
   - "AI Dividend Fund"

2. Add sample holdings (10-15 stocks each):
   - Ticker, name, weight %, rationale
   - Use real stock tickers (AAPL, MSFT, NVDA, etc.)

3. Generate performance snapshots:
   - Daily equity curve over 1+ year
   - Starting value: 100 (index style)
   - Realistic growth curve with volatility

### Phase 3: API Routes
1. `GET /api/funds` - List all funds
2. `GET /api/funds/[slug]` - Fund details + holdings
3. `GET /api/funds/[slug]/performance` - Time series data

### Phase 4: Update UI Components
1. **FundsPage** (`/funds/page.tsx`):
   - Grid of fund cards
   - Each shows: name, description, 1Y return, chart sparkline
   
2. **FundCard** component:
   - Fund name, description
   - Key metrics (return, Sharpe, max DD)
   - Mini chart preview
   - "View Details" link

3. **Fund Detail Page** (`/funds/[slug]/page.tsx`):
   - Full performance chart
   - Holdings table (ticker, name, weight %, P/L)
   - Strategy description
   - Fund metrics sidebar

### Phase 5: Charts
Use Recharts for:
- Equity curve (line chart)
- Holdings allocation (pie/donut chart)
- Performance vs benchmark

## Design Match
- Dark background `#232323`
- Pill-shaped buttons
- Cards with subtle borders
- Blue/purple accent colors
- Match existing analysis page style

## Data Strategy
**Option A**: Seed real historical data once
**Option B**: Generate realistic mock data programmatically
**Recommended**: Option B for demo - easier to maintain

## Success Criteria
- [ ] 2-3 funds displayed on `/funds`
- [ ] Each fund clickable to detail page
- [ ] Holdings table shows 10-15 stocks
- [ ] Performance chart renders correctly
- [ ] Matches original visual design
- [ ] Fast load times (<2s)

## Estimated Work
- Database seeding: 30min
- API routes: 30min  
- UI components: 1-2 hours
- Charts integration: 1 hour
- Styling & polish: 30min

**Total**: ~3-4 hours for full implementation

## Next Steps
1. Would you like me to generate realistic mock fund data?
2. Or seed with a simpler static dataset?
3. Which funds should we create? (names, strategies)
