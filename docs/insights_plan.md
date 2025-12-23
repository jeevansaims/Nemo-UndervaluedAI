# Weekly Insights Implementation Plan

## Goal
Create a premium, blog-style research section for "Weekly Market Analysis". This mimics the original site's "Insights" section, focusing on readability and high-quality typography.

## Features

### 1. Main Feed (`/insights`)
- **Layout**: Grid of `InsightCard`s (already exists, will polish).
- **Styling**: Enhance typography, add "Reading Time" estimate, improve tag visuals.
- **Filtering**: Filter by tag (Macro, Rotation, Liquidity).

### 2. Post Editor (`/insights/new`)
- **Access**: Protected route (admin/user only).
- **Functionality**:
    - Title input
    - Markdown editor (simple textarea or rich text)
    - Ticker tagging (e.g., related stocks)
    - "Publish" vs "Draft" status.

### 3. Detail View (`/insights/[slug]`)
- **Typography**: Optimize line-height and font-size for long-form reading.
- **Components**: Render markdown content cleanly.
- **Related**: Show related tickers/funds.

## Architecture
- **Database**: Uses existing `InsightPost` schema (implied by `useInsights.ts`).
- **State**: `useInsights` hook manages local vs DB state.
- **Markdown**: Use `react-markdown` (if available) or simple line splitting (current mock implementation).

## Steps
1.  **Editor**: Create `src/app/insights/new/page.tsx`.
2.  **List Polish**: Update `InsightCard` to look deeper/richer.
3.  **Detail Polish**: Enhance typography on `[slug]/page.tsx`.
4.  **Verify**: creating a post and reading it.

## Visual Reference
Targeting a "Financial Times" or "Substack" dark mode internet aesthetic.
