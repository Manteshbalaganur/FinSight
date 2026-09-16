import SentimentBarChart from "@/components/charts/SentimentBarChart";
import SentimentPriceChart from "@/components/charts/SentimentPriceChart";
import { getSentimentHeatmap } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function SentimentPage() {
  const heatmap = getSentimentHeatmap();

  function cellColor(count: number): string {
    if (count === 0) return "bg-bg-hover text-text-muted";
    if (count === 1) return "bg-profit/20 text-profit";
    if (count === 2) return "bg-profit/40 text-profit";
    return "bg-profit/60 text-text-primary";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Sentiment Analysis &amp; Market Impact</h1>
        <p className="mt-1 text-sm text-text-muted">Track sentiment signals and their simulated relationship with stock prices</p>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">News Count by Sentiment</h3>
        <SentimentBarChart />
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Sentiment Score vs Stock Price — 30 Days</h3>
        <SentimentPriceChart />
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Sentiment Heatmap by Stock</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-semibold">Symbol</th>
                <th className="px-4 py-3 text-center font-semibold">Positive</th>
                <th className="px-4 py-3 text-center font-semibold">Neutral</th>
                <th className="px-4 py-3 text-center font-semibold">Negative</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row) => (
                <tr key={row.symbol} className="border-b border-border transition-colors duration-200 hover:bg-bg-hover">
                  <td className="px-4 py-3 font-semibold text-text-primary">{row.symbol}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg font-bold tabular-nums", cellColor(row.positive))}>
                      {row.positive}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg font-bold tabular-nums", row.neutral > 0 ? "bg-neutral/20 text-neutral" : "bg-bg-hover text-text-muted")}>
                      {row.neutral}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg font-bold tabular-nums", row.negative > 0 ? "bg-loss/20 text-loss" : "bg-bg-hover text-text-muted")}>
                      {row.negative}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-4">
        <p className="text-sm text-text-muted">
          In Phase 2, this module will connect to live news APIs and FinBERT for real-time scoring.
        </p>
      </div>
    </div>
  );
}
