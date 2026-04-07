# Post Analytics Dashboard Redesign

This dashboard was redesigned for **enterprise SaaS analytics workflows** with a focus on scannability, comparison, and modular UI architecture.

## What Was Preserved
- Website + date range filtering
- KPI reporting (`total articles`, `authors`, `last updated`)
- Posts-over-time chart
- Top authors analysis
- Recent articles list
- CSV export reporting
- Author performance evaluation and filtering

No API contract, endpoint, or business logic was changed.

## New Layout Structure

### 1. Sticky Top Bar
- `FilterBar` combines website selector, date presets, custom date input, and compact export actions
- Keeps controls always accessible while scrolling

### 2. Insight Strip (Above the Fold)
- 3 prominent KPI cards with trend context
- Improved hierarchy and immediate numeric emphasis

### 3. Primary Analytics
- Main chart: posts published over time
- Side comparison: platform contribution + momentum table

### 4. Secondary Insights
- Top authors chart (selectable)
- Ranked author performance list with contribution quality tags

### 5. Content Section
- Structured article table for fast scanning:
  - Title
  - Author
  - Platform
  - Date
  - Performance label
  - Action link

### 6. Actions Section
- Full export action panel integrated into flow
- Compact export also available in sticky top bar

## Component System (Reusable)

Implemented in `src/components/dashboard` and `src/components/ui`:

- `FilterBar`
- `DashboardSection`
- `KpiCard`
- `AnalyticsChartCard`
- `ComparisonTable`
- `AuthorPerformanceItem`
- `ArticleRow`
- `ExportActionBar`

Supporting UI primitives (shadcn-style architecture):
- `ui/card.jsx`
- `ui/button.jsx`
- `ui/badge.jsx`
- `ui/table.jsx`
- `ui/skeleton.jsx`
- `ui/state-block.jsx`

## State Handling Standard

Each major dashboard component supports:
- `Loading` state (skeleton/placeholder)
- `Empty` state (contextual guidance)
- `Error` state (local fallback message)

## Design System

### Color
- Neutral base: cool grays and white surfaces
- Primary brand: blue (`--brand-600`)
- Semantic colors:
  - Positive: green
  - Negative: red
  - Warning: amber

### Typography
- Page title: strongest visual weight
- Section title: medium-emphasis anchors
- KPI value: largest numeric type
- Labels/meta: subtle utility text

### Spacing
- 8px scale foundation (`8 / 12 / 16 / 24 / 32`)
- Increased section spacing for cleaner zone separation
- Responsive CSS grid for mobile-first behavior

## Before vs After

### Before
- Flat hierarchy and equal visual weight
- Stacked layout with weak grouping
- Comparison insights buried
- Noisy author cards
- Recent articles felt like a raw list
- Export tools detached from workflow

### After
- Zone-based information architecture
- High-contrast KPI strip for immediate scan
- Explicit platform and author comparison views
- Ranked author performance rows with quality tags
- Structured article table for decision-making speed
- Export integrated in both top workflow and actions section

## Key Files Updated
- `src/App.jsx`
- `src/index.css`
- `src/components/PostsPerDayChart.jsx`
- `src/components/TopAuthorsChart.jsx`
- `src/components/dashboard/*`
- `src/components/ui/*`

## Tailwind + shadcn/ui Component Examples

These examples mirror the implemented components in Tailwind + shadcn form.

### KPI Card Example
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

export function KpiCardExample() {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Articles</p>
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            <TrendingUp className="mr-1 h-3.5 w-3.5" /> +8.4%
          </Badge>
        </div>
        <p className="text-3xl font-bold tracking-tight text-slate-900">1,284</p>
        <p className="mt-1 text-xs text-slate-500">vs previous period</p>
      </CardContent>
    </Card>
  )
}
```

### Author Performance Row Example
```tsx
import { Badge } from "@/components/ui/badge"

export function AuthorPerformanceItemExample() {
  return (
    <button className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-semibold text-slate-900">Jane Smith</p>
        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">Strong</Badge>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>16 posts</span>
        <span>22% share</span>
      </div>
    </button>
  )
}
```

### Article Table Row Example
```tsx
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export function ArticleRowExample() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-3 font-medium text-slate-900">Retail Trends in Q2</td>
      <td className="px-3 py-3 text-slate-600">Jane Smith</td>
      <td className="px-3 py-3 text-slate-600">amg.biz</td>
      <td className="px-3 py-3 text-slate-600">Apr 7, 2026</td>
      <td className="px-3 py-3"><Badge className="bg-emerald-50 text-emerald-700">High</Badge></td>
      <td className="px-3 py-3">
        <a href="#" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-800">
          <ExternalLink className="h-3.5 w-3.5" /> View
        </a>
      </td>
    </tr>
  )
}
```

## Run
```bash
npm install
npm run dev
```

Build verification:
```bash
npm run build
```
