# Growth OS — Claude Code Guide

## Project Overview
Growth OS is a performance marketing analytics dashboard for D2C brands.
It ingests channel-level CSV data (Blinkit, Zepto, Meta, Google) and provides:
- **Dashboard** — KPIs, trend charts, channel breakdown, AI insights
- **Budget Allocator** — diminishing returns model for realistic spend planning
- **Forecasting** — weighted linear regression with confidence bands and scenario simulation

## Current State
Static HTML front-end only. All code lives in `index.html` (1459 lines):
- React 18 loaded via CDN (unpkg)
- JSX compiled in-browser by Babel Standalone
- Inline `<style>` block for all CSS
- All components, logic, and utilities in one `<script>` block
- No build system, no package manager, no TypeScript

## Target Architecture
### Phase 1 — Next.js UI (current goal)
Refactor the monolith into a proper Next.js 14 project (App Router) with TypeScript.
All business logic stays client-side for now.

### Phase 2 — UI + API split (future)
Move computation, CSV parsing, forecasting, and AI calls to a NestJS API.
Next.js becomes a thin UI layer that fetches from the API.

---

## Phase 1 File Structure
```
growth-os/
├── app/
│   ├── layout.tsx               # Root layout, fonts, metadata
│   ├── page.tsx                 # Upload screen (entry point)
│   ├── dashboard/page.tsx       # Dashboard tab
│   ├── allocator/page.tsx       # Budget Allocator tab
│   └── forecasting/page.tsx     # Forecasting tab
├── components/
│   ├── ui/                      # Generic reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── KPICard.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Modal.tsx
│   │   └── Pill.tsx
│   ├── charts/                  # Custom SVG chart components
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   └── PieChart.tsx
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── MetricsGrid.tsx
│   │   ├── OpportunityCards.tsx
│   │   ├── ChannelTable.tsx
│   │   ├── ChannelFilter.tsx
│   │   ├── DateFilter.tsx
│   │   └── AIInsight.tsx
│   ├── allocator/               # Allocator-specific components
│   │   ├── BudgetBar.tsx
│   │   ├── AllocationSliders.tsx
│   │   ├── SpendDistribution.tsx
│   │   └── AIRationale.tsx
│   ├── forecasting/             # Forecasting-specific components
│   │   ├── ForecastChart.tsx
│   │   ├── ScenarioControls.tsx
│   │   └── ForecastWarnings.tsx
│   ├── upload/
│   │   └── UploadScreen.tsx
│   └── layout/
│       ├── Header.tsx
│       └── ResetModal.tsx
├── lib/                         # Pure business logic, no React
│   ├── csv.ts                   # parseCSV, validateCSV, parseDate
│   ├── metrics.ts               # compute(), types, opportunity detection
│   ├── allocator.ts             # buildCurves(), projectChannel(), diminishing returns
│   ├── forecasting.ts           # regression, confidence bands, scenario sim
│   └── claude.ts                # Claude API wrapper
├── store/
│   └── useGrowthStore.ts        # Zustand — global rows, metrics, filters
├── types/
│   └── index.ts                 # All shared TypeScript interfaces
└── styles/
    └── globals.css              # Design tokens, base styles, utility classes
```

## Phase 2 File Structure (NestJS API)
```
growth-os-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── csv/
│   │   ├── csv.controller.ts    # POST /csv/parse  (multipart upload)
│   │   └── csv.service.ts       # parseCSV, validateCSV, parseDate
│   ├── metrics/
│   │   ├── metrics.controller.ts # POST /metrics/compute
│   │   └── metrics.service.ts    # compute(), opportunity detection
│   ├── allocator/
│   │   ├── allocator.controller.ts # POST /allocator/project
│   │   └── allocator.service.ts    # buildCurves(), projectChannel()
│   ├── forecast/
│   │   ├── forecast.controller.ts  # POST /forecast
│   │   └── forecast.service.ts     # regression, confidence bands
│   └── insights/
│       ├── insights.controller.ts  # POST /insights/generate
│       └── insights.service.ts     # Claude API proxy (keeps key server-side)
```

---

## Design System

### Colours (from existing palette)
```
ink:      #0F0F0F   — primary text
slate:    #4A5568   — secondary text
mist:     #8896AA   — labels, placeholders
paper:    #F8F7F4   — page background
white:    #FFFFFF   — card background
rule:     #E8E4DE   — borders, dividers
accent:   #1A6B4A   — green, positive, primary actions
accentLt: #E8F3EE   — green tint backgrounds
amber:    #D97706   — warning, neutral
amberLt:  #FEF3C7
red:      #C53030   — negative, error
redLt:    #FFF5F5
blue:     #1E4EAD   — info, secondary
blueLt:   #EBF0FF
channels: [#1A6B4A, #1E4EAD, #D97706, #9333EA]
```

### Typography
- Headings: DM Serif Display (italic for hero text)
- Body: DM Sans 300/400/500/600

### Component Conventions
- Cards: `border-radius: 14px`, `border: 1px solid rule`, `padding: 24px`
- Small cards: `border-radius: 12px`, `padding: 18px 20px`
- Buttons: `border-radius: 9px`
- KPI chips: `border-radius: 20px`, small caps label above, serif number below

---

## Key Business Logic (do not change behaviour during refactor)

### CSV Parsing (`lib/csv.ts`)
- Normalise line endings: `\r\n` → `\n` before splitting (Excel compat)
- Accept any date format; normalise to `YYYY-MM-DD` internally
- Validate all numeric columns with `parseFloat`, guard NaN and negatives
- Fail loudly with per-row error messages — never silently drop data

### Metrics (`lib/metrics.ts`)
- CTR = clicks/impressions×100 (guard: impressions > 0)
- CVR = orders/clicks×100 (guard: clicks > 0)
- ROAS = revenue/spend (guard: spend > 0)
- CPC = spend/clicks (guard: clicks > 0)
- All divisions return 0 on zero denominator, never NaN/Infinity
- Opportunity detection runs automatically after compute — no user trigger

### Diminishing Returns (`lib/allocator.ts`)
- Power curve: `Revenue = baseRevenue × (spend/baseSpend)^α`
- α is channel-type specific: Search ~0.76, Quick Commerce ~0.70-0.72, Social ~0.65
- Saturation point = baseSpend × satMultiplier (channel-specific)
- Beyond satPoint: apply additional penalty (max -55% at extreme over-allocation)
- Efficiency score 0-100 visualises proximity to saturation

### Forecasting (`lib/forecasting.ts`)
- Weighted linear regression (recent data weighted higher)
- Spike suppression: cap values > mean + 1.5σ before fitting
- Confidence bands widen with forecast horizon: ±1.96 × stdError × √(1 + step/n)
- Scenario simulation: multiply regression slope by growth assumption

---

## State Management (Phase 1)
Use **Zustand** for global state. Key slices:
```ts
interface GrowthStore {
  rows: Row[] | null
  fileName: string
  metrics: Metrics | null
  visibleChannels: Set<string>
  dateFilter: '4w' | '8w' | '12w' | 'all' | 'custom'
  selectedDates: Set<string>
  setData: (rows: Row[], fileName: string) => void
  reset: () => void
}
```
Filtered metrics are derived inside components using `useMemo` — not stored.

---

## API Contract (Phase 2)

### POST /csv/parse
```
Request:  multipart/form-data { file: File }
Response: { rows: Row[], warnings: string[] }
```

### POST /metrics/compute
```
Request:  { rows: Row[], dateRange?: string[] }
Response: { byChannel: ChannelMetrics[], byDate: DateMetrics[], total: TotalMetrics, opps: Opportunity[] }
```

### POST /allocator/project
```
Request:  { byChannel: ChannelMetrics[], budget: number, allocation: Record<string, number> }
Response: { projectedRevenue: number, projectedROAS: number, channels: ProjectedChannel[] }
```

### POST /forecast
```
Request:  { byDate: DateMetrics[], metric: string, horizon: number, weightPower: number, growthAdj: number }
Response: { historical: Point[], forecast: Point[], upper: Point[], lower: Point[], warnings: Warning[] }
```

### POST /insights/generate
```
Request:  { type: 'dashboard' | 'allocator', data: string }
Response: { text: string }
```

---

## Development Commands (Phase 1 — after scaffold)
```bash
npm run dev      # Next.js dev server on :3000
npm run build    # Production build
npm run lint     # ESLint
npm run typecheck # tsc --noEmit
```

## Development Commands (Phase 2 — after scaffold)
```bash
# UI
npm run dev      # :3000

# API
npm run start:dev   # NestJS dev server on :4000
npm run build       # Compile NestJS
```

## Environment Variables
```
# Phase 1 (client-side, temporary)
NEXT_PUBLIC_ANTHROPIC_API_KEY=

# Phase 2 (server-side only — key never leaves API)
ANTHROPIC_API_KEY=
PORT=4000
```

---

## Conventions
- All lib/ functions are pure — no React imports, no side effects
- Components are named exports, pages are default exports
- TypeScript strict mode on
- No `any` types
- CSS Modules for component styles, globals.css for design tokens only
- Chart components stay as custom SVG (no Recharts) — they work offline and have no CDN dependency
