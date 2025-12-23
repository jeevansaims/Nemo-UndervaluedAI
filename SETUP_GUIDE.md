# AI Stock Analysis - Setup Guide

## Overview

I've successfully built the AI-powered stock analysis feature for your undervalued.ai clone! Here's what has been implemented:

### Features Implemented

1. **Multi-Agent AI System** (TypeScript) - **All agents use Claude (Anthropic)**
   - Valuation Agent (Claude Sonnet 4) - Deep value analysis
   - Sentiment Agent (Claude Sonnet 4) - Market sentiment analysis
   - Fundamental Agent (Claude Sonnet 4) - Financial health assessment
   - Risk Agent (Claude Sonnet 4) - Comprehensive risk analysis
   - Portfolio Manager (Claude Sonnet 4) - Final synthesis and recommendation

2. **Database Schema**
   - StockAnalysis model for storing analyses
   - User fields for usage tracking (analysisCount, isPro)
   - Support for PENDING, PROCESSING, COMPLETED, FAILED statuses

3. **API Routes**
   - `POST /api/ai-analysis/[ticker]` - Request new analysis
   - `GET /api/ai-analysis/[ticker]` - Retrieve latest analysis

4. **Freemium System**
   - Free users: 5 analyses per month
   - Pro users: Unlimited analyses
   - Usage tracking and limit enforcement

5. **User Interface**
   - `/ai-analysis` page for requesting and viewing analyses
   - Tabbed interface showing all agent analyses
   - BUY/HOLD/SELL recommendations with confidence scores
   - Real-time processing with loading states

---

## Setup Instructions

### 1. Get Your Anthropic API Key

**All agents now use Claude (Anthropic)** - you only need ONE API key!

1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-`)

### 2. Configure Environment Variable

Add your Anthropic API key to the `.env` file:

```bash
ANTHROPIC_API_KEY="sk-ant-your-actual-anthropic-key"
```

**Note:** The system previously used both OpenAI and Anthropic, but has been simplified to use only Claude for all agents.

### 3. Run Database Migration

The database migration has already been applied, but if you need to reset:

```bash
npx prisma migrate dev
```

### 4. Install Dependencies (Already Done)

Dependencies have been installed:
- `@anthropic-ai/sdk` - Anthropic Claude SDK
- `ai` - Vercel AI SDK (for future streaming support)
- `openai` - ~~Not used anymore~~ (can be removed)

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Test the Feature

1. Navigate to http://localhost:3000/ai-analysis
2. Enter a stock ticker (e.g., AAPL, MSFT, TSLA)
3. Click "Analyze Stock"
4. Wait for the multi-agent analysis to complete (typically 15-30 seconds)
5. View the comprehensive analysis across 5 tabs

---

## Architecture

### Data Flow

```
User Request (Ticker)
    ↓
Auth & Usage Check
    ↓
Fetch Market Data (Finnhub)
    ↓
Run 4 Agents in Parallel (All Claude Sonnet 4)
    ├─ Valuation Agent
    ├─ Sentiment Agent
    ├─ Fundamental Agent
    └─ Risk Agent
    ↓
Portfolio Manager Synthesis (Claude Sonnet 4)
    ↓
Save to Database & Return Result
```

### File Structure

```
/src/lib/ai/
  ├── types.ts                    # TypeScript interfaces
  ├── orchestrator.ts             # Coordinates all agents
  └── agents/
      ├── valuation-agent.ts      # Value investing analysis
      ├── sentiment-agent.ts      # Market sentiment
      ├── fundamental-agent.ts    # Financial health
      ├── risk-agent.ts           # Risk assessment
      └── portfolio-manager.ts    # Final synthesis

/src/app/api/ai-analysis/[ticker]/
  └── route.ts                    # API endpoints

/src/app/(platform)/ai-analysis/
  └── page.tsx                    # User interface

/prisma/
  └── schema.prisma               # Database schema
```

---

## Usage Limits

### Free Tier
- 5 analyses per month
- Full access to all 5 agents
- Complete analysis history

### Pro Tier (To Implement)
- Unlimited analyses
- Priority processing
- Advanced features (coming soon)

To upgrade a user to Pro manually:

```sql
UPDATE "User" SET "isPro" = true WHERE email = 'user@example.com';
```

Or reset usage count:

```sql
UPDATE "User" SET "analysisCount" = 0 WHERE email = 'user@example.com';
```

---

## Customization

### Adjust Analysis Depth

Edit the agent files to modify:
- Temperature (creativity vs consistency)
- Max tokens (length of analysis)
- System prompts (analysis style and focus)

### Change Usage Limits

In `/src/app/api/ai-analysis/[ticker]/route.ts`:

```typescript
const FREE_ANALYSIS_LIMIT = 5; // Change this number
```

### Add More Agents

1. Create new agent in `/src/lib/ai/agents/`
2. Add type definition in `/src/lib/ai/types.ts`
3. Update orchestrator to run the new agent
4. Add UI tab in the page component

---

## Cost Estimates

### Per Analysis (Approximate)

All agents use **Claude Sonnet 4** (Anthropic pricing):

- **Valuation Agent**: ~$0.02-0.04
- **Sentiment Agent**: ~$0.02-0.04
- **Fundamental Agent**: ~$0.02-0.04
- **Risk Agent**: ~$0.02-0.04
- **Portfolio Manager**: ~$0.03-0.06

**Total per analysis**: ~$0.11-0.22 (cheaper than before!)

With 5 free analyses per user, expect ~$0.55-1.10 per free user.

### Cost Optimization Tips

1. Switch to Claude Haiku for some agents (even cheaper than Sonnet 4)
2. Reduce max_tokens for shorter responses
3. Cache market data to avoid re-fetching
4. Implement rate limiting
5. Use prompt caching for repeated prompts (Anthropic feature)

---

## Next Steps

### Recommended Improvements

1. **Analysis History Page** - Let users view past analyses
2. **Share Analyses** - Public URLs for sharing reports
3. **Email Notifications** - Send completed analyses via email
4. **Batch Analysis** - Analyze multiple stocks at once
5. **Scheduled Updates** - Daily refreshes for watched stocks
6. **PDF Export** - Download analysis as PDF
7. **Comparison Mode** - Compare 2-3 stocks side-by-side
8. **Alerts Integration** - Set alerts based on AI recommendations

### Additional Features

- **Daily Brief** (like undervalued.ai)
- **Insider Trading Alerts**
- **Sector Analysis**
- **Portfolio Optimization**
- **Backtesting** (using historical data)

---

## Troubleshooting

### "API keys not configured" Error

Make sure your `.env` file has valid keys and restart the dev server.

### Analysis Takes Too Long

- Agents run in parallel, but each LLM call takes 3-8 seconds
- Total time: 15-30 seconds is normal
- Consider adding a progress indicator

### Rate Limiting from OpenAI/Anthropic

- Implement retry logic with exponential backoff
- Use tier limits appropriately
- Consider queueing system for high traffic

### Database Errors

```bash
npx prisma generate
npx prisma migrate dev
```

---

## Testing

### Manual Test

1. Go to `/ai-analysis`
2. Enter ticker: `AAPL`
3. Verify all 5 tabs load with analysis
4. Check database:

```bash
npx prisma studio
```

Look for new `StockAnalysis` record.

### Test Usage Limits

1. Request 5 analyses (should work)
2. Request 6th analysis (should fail with limit message)
3. Set `isPro = true` in database
4. Request should work again

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs for API errors
3. Verify API keys are valid
4. Check Prisma studio for database state
5. Review agent prompts for clarity

---

## Credits

Built with:
- **Anthropic Claude Sonnet 4** - All AI agents (simplified from mixed OpenAI/Anthropic)
- **Finnhub API** - Real-time market data
- **Next.js 16** - Full-stack framework
- **Prisma** - Database ORM
- **PostgreSQL (Neon)** - Database

Inspired by:
- undervalued.ai
- AI Hedge Fund projects
- Multi-agent AI systems

---

## License

This is a custom implementation for your project. Use responsibly and in compliance with all API provider terms of service.
