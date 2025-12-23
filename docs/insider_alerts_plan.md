# Insider Trading Alerts Implementation Plan

## Goal
Transform the generic `/alerts` page into a dedicated **Insider Trading Dashboard** matching the original site's functionality. This feature will track and display significant insider buying and selling activity.

## Design
- **Layout**: High-density table view (not cards) for efficient data scanning.
- **Columns**: Ticket, Company, Insider Name, Relation (CEO/CFO), Transaction Type (Buy/Sell), Value ($), Date.
- **Visuals**: 
  - Green rows/text for **BUYS**
  - Red/dim rows for **SELLS**
  - Highlighting "Cluster Buys" (multiple insiders buying same stock).

## Architecture

### 1. Data Model
Use existing `InsiderAlert` (or similar structure) but populated with realistic data:
- **Ticker/Company**: Linked to real tickers.
- **Transaction**: 
  - `Purchase` (Open Market)
  - `Sale` (Open Market)
  - `Grant` (Option Exercise - usually filtered out or separate)

### 2. Data Source
**Mock/Seed Strategy**:
- Generate ~50 recent realistic insider trades.
- Include famous examples/names for realism (e.g., "Elon Musk", "Tim Cook").
- Create utility `src/lib/insider/generateInsiderData.ts`.

### 3. API Route
`GET /api/insider-alerts`
- Returns paginated list of trades.
- Supports filtering by Ticker or Transaction Type.

### 4. UI Components
- **InsiderTable**: Sortable table component.
- **TradeRow**: Individual row component with conditional styling.
- **StatCards**: Summary stats at top (e.g., "Total Insider Buying (24h): $12.5M").

### 5. Integration
- Update `/alerts/page.tsx` to use the new components.
- Add "Insider" badge to navigation if needed.

## Steps
1.  **Generate Data**: Create robust mock generator for insider trades.
2.  **Build API**: Create endpoint to serve data.
3.  **Build UI**: Implement `InsiderTable` using Tailwind.
4.  **Integrate**: Connect page to API.
5.  **Verify**: Check filters and responsiveness.

## Estimated Effort
- Data Generation: 30m
- UI Implementation: 1h
- Integration & Polish: 30m
**Total**: ~2 hours
