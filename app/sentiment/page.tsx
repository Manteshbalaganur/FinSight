"use client";

import { useMemo, useState } from "react";
import SentimentBarChart from "@/components/charts/SentimentBarChart";
import SentimentPriceChart from "@/components/charts/SentimentPriceChart";
import { Loading, ErrorBox, Empty, Notice } from "@/components/DataState";
import { api } from "@/lib/api";
import { holdings } from "@/lib/holdings";
import { useAsync, usePortfolioNews } from "@/lib/hooks";
import type { SentimentPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SentimentPage() {
  const pn = usePortfolioNews();
  const [ticker, setTicker] = useState(holdings[0].ticker);
  const hist = useAsync(() => api.history(ticker, "1M"), [ticker]);

  const analysedAll = Object.values(pn.analyses);
  const barData = [
    { sentiment: "Positive", count: analysedAll.reduce((s, a) => s + a.summary.positive_count, 0) },
    { sentiment: "Neutral", count: analysedAll.reduce((s, a) => s + a.summary.neutral_count, 0) },
    { sentiment: "Negative", count: analysedAll.reduce((s, a) => s + a.summary.negative_count, 0) },
  ];

  const heatmap = holdings.map((h) => {
    const a = pn.analyses[h.ticker];
    return {
      symbol: h.symbol,
      available: !!a,
      positive: a?.summary.positive_count ?? 0,
      neutral: a?.summary.neutral_count ?? 0,
      negative: a?.summary.negative_count ?? 0,
    };
  });

  // Daily average sentiment of the selected stock's analysed articles, aligned to trading days.
  const chartData: SentimentPoint[] = useMemo(() => {
    if (!hist.data) return [];
    const points = hist.data.points;
    const byDay = new Map<string, number[]>();
    pn.items
      .filter((n) => n.ticker === ticker && n.analysis === "done" && n.sentimentScore !== undefined)
      .forEach((n) => {
        const day = points.find((p) => p.date >= n.date)?.date ?? points[points.length - 1]?.date;
        if (day) byDay.set(day, [...(byDay.get(day) ?? []), n.sentimentScore as number]);
      });
    return points.map((p) => {
      const scores = byDay.get(p.date);
      return {
        date: p.date.slice(5),
        price: p.close,
        sentiment: scores ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null,
      };
    });
  }, [hist.data, pn.items, ticker]);

  function cellColor(count: number): string {
    if (count === 0) return "bg-bg-hover text-text-muted";
    if (count === 1) return "bg-profit/20 text-profit";
    if (count === 2) return "bg-profit/40 text-profit";
    return "bg-profit/60 text-text-primary";
  }

  const selectedSummary = pn.analyses[ticker]?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Sentiment Analysis &amp; Market Impact</h1>
        <p className="mt-1 text-sm text-text-muted">Track OpenAI-derived news sentiment signals next to the stock price</p>
      </div>

      {pn.sentimentState === "loading" && <Notice>OpenAI sentiment analysis in progress...</Notice>}
      {pn.newsError && <ErrorBox message={`News unavailable: ${pn.newsError}`} onRetry={pn.reload} />}
      {pn.sentimentState === "error" && pn.sentimentError && (
        <ErrorBox message={`Sentiment analysis unavailable: ${pn.sentimentError}`} />
      )}

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">News Count by Sentiment</h3>
        {pn.newsLoading || pn.sentimentState === "loading" ? (
          <Loading label="Analysing news..." />
        ) : analysedAll.length === 0 ? (
          <Empty>No analysed articles yet.</Empty>
        ) : (
          <SentimentBarChart data={barData} />
        )}
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-primary">Sentiment Score vs Stock Price — Last Month</h3>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="rounded-lg border border-border bg-bg-base px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors duration-200"
          >
            {holdings.map((h) => (
              <option key={h.ticker} value={h.ticker} className="bg-bg-card">
                {h.name}
              </option>
            ))}
          </select>
        </div>
        {hist.loading ? (
          <Loading label="Loading price history..." />
        ) : hist.error ? (
          <ErrorBox message={hist.error} onRetry={hist.reload} />
        ) : (
          <>
            <SentimentPriceChart data={chartData} />
            <p className="mt-3 text-xs text-text-muted">
              {selectedSummary
                ? `Overall: ${selectedSummary.overall_sentiment} (${selectedSummary.overall_score >= 0 ? "+" : ""}${selectedSummary.overall_score.toFixed(2)}). ${selectedSummary.interpretation}`
                : "No sentiment points yet. Points appear on the dates of analysed news articles."}
            </p>
          </>
        )}
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
                  {row.available ? (
                    <>
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
                    </>
                  ) : (
                    <td colSpan={3} className="px-4 py-3 text-center text-xs text-text-muted">
                      {pn.sentimentState === "loading" || pn.newsLoading ? "Analysing..." : "Unavailable"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-4">
        <p className="text-sm text-text-muted">
          Sentiment is classified by OpenAI from recent Google News headlines (positive = +1, neutral = 0, negative = −1).
          History is limited to what the news feed currently returns, so older days have no sentiment point.
        </p>
      </div>
    </div>
  );
}
