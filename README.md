# AI-Powered Stock Price Prediction & Portfolio Intelligence Dashboard

A frontend-only demo for a final-year college project review. All data is hardcoded — no backend, no API calls, no database.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — custom dark fintech theme
- **Recharts** — all charts
- **lucide-react** — icons
- **Inter** font via next/font

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Overview — KPIs, portfolio chart, latest news, top movers |
| `/portfolio` | Holdings table + stock/sector allocation pies |
| `/news` | Filterable news feed with sentiment badges |
| `/sentiment` | Sentiment bar chart, dual-axis price chart, heatmap |
| `/prediction` | Mock ML predictions, model comparison, predicted vs actual |
| `/assistant` | AI chat with scripted Q&A and suggested questions |

## Structure

```
app/
  layout.tsx          # Root layout with sidebar + topbar
  globals.css         # Tailwind + theme
  page.tsx            # Overview
  portfolio/page.tsx
  news/page.tsx
  sentiment/page.tsx
  prediction/page.tsx
  assistant/page.tsx
components/
  Sidebar.tsx
  TopBar.tsx
  KpiCard.tsx
  NewsCard.tsx
  SentimentBadge.tsx
  StockTable.tsx
  charts/
    PortfolioChart.tsx
    AllocationPie.tsx
    SentimentBarChart.tsx
    SentimentPriceChart.tsx
    ModelComparisonChart.tsx
    PredictionChart.tsx
lib/
  types.ts
  mockData.ts         # All hardcoded data
  utils.ts            # cn() + formatters
```

## Notes

- All data is simulated and seeded for reproducibility.
- Demo data — for academic review only. Not financial advice.
