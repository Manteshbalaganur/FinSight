"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import KpiCard from "@/components/KpiCard";
import NewsCard from "@/components/NewsCard";
import StockPriceChart from "@/components/charts/StockPriceChart";
import { Loading, ErrorBox, Empty, Notice } from "@/components/DataState";
import { Wallet, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { NewsItem } from "@/lib/types";
import { cn, formatMoney, formatPercent } from "@/lib/utils";

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

export default function StockDetailPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = decodeURIComponent(params?.symbol ?? "");
  const [period, setPeriod] = useState("1M");

  const quote = useAsync(() => api.quote(symbol), [symbol]);
  const hist = useAsync(() => api.history(symbol, period), [symbol, period]);
  const news = useAsync(() => api.news(symbol, 8), [symbol]);
  const sentiment = useAsync(
    () => api.sentiment(symbol, news.data?.company ?? null, news.data!.articles),
    [news.data],
    !!news.data && news.data.articles.length > 0
  );

  const q = quote.data;
  const items: NewsItem[] = useMemo(() => {
    if (!news.data) return [];
    return news.data.articles.map((a, i) => {
      const s = sentiment.data?.articles[i];
      const done = !!s && s.analyzed && s.title === a.title;
      return {
        id: i + 1,
        headline: a.title,
        summary: a.description,
        company: news.data!.company ?? symbol,
        sector: symbol,
        ticker: symbol,
        source: a.source,
        date: (a.published ?? "").slice(0, 10),
        url: a.url,
        analysis: done ? "done" : sentiment.loading ? "pending" : "unavailable",
        sentiment: done ? (s!.sentiment as NewsItem["sentiment"]) : undefined,
        sentimentScore: done ? (s!.score as number) : undefined,
        relevance: done ? s!.relevance : undefined,
        whyRelevant: done ? `${s!.explanation} ${s!.impact}`.trim() : undefined,
      };
    });
  }, [news.data, sentiment.data, sentiment.loading, symbol]);

  const sum = sentiment.data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{q ? q.name : symbol}</h1>
        <p className="mt-1 text-sm text-text-muted">
          {symbol}
          {q?.exchange ? ` · ${q.exchange}` : ""}
        </p>
      </div>

      {quote.loading ? (
        <Loading label="Fetching latest market data..." />
      ) : quote.error ? (
        <ErrorBox message={quote.error} onRetry={quote.reload} />
      ) : q ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Latest Price"
              value={formatMoney(q.price, q.currency)}
              change={`${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)} (${formatPercent(q.change_percent)})`}
              positive={q.change >= 0}
              icon={Wallet}
            />
            <KpiCard
              label="Day Range"
              value={`${q.day_low} – ${q.day_high}`}
              change={`Open ${q.open} · Prev close ${q.previous_close}`}
              icon={Activity}
            />
            <KpiCard
              label="52-Week Range"
              value={`${q.fifty_two_week_low} – ${q.fifty_two_week_high}`}
              icon={TrendingUp}
            />
            <KpiCard
              label="Volume"
              value={q.volume !== null ? q.volume.toLocaleString("en-IN") : "n/a"}
              icon={BarChart3}
            />
          </div>
          <Notice>
            {q.market_status_note} Data as of {q.data_as_of.replace("T", " ").slice(0, 16)}. Source: Yahoo Finance
            (may be delayed, not tick-by-tick).
          </Notice>
        </>
      ) : null}

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-primary">Price History</h3>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-semibold transition-colors duration-200",
                  p === period ? "bg-primary/15 text-primary" : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {hist.loading ? (
          <Loading label="Loading chart..." />
        ) : hist.error ? (
          <ErrorBox message={hist.error} onRetry={hist.reload} />
        ) : hist.data && hist.data.points.length > 0 ? (
          <StockPriceChart history={hist.data} />
        ) : (
          <Empty>No price data for this period.</Empty>
        )}
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">News Sentiment (OpenAI)</h3>
        {news.loading || sentiment.loading ? (
          <Loading label="Analysing news sentiment..." />
        ) : sentiment.error ? (
          <ErrorBox message={`Sentiment unavailable: ${sentiment.error}`} onRetry={sentiment.reload} />
        ) : sum ? (
          <div className="space-y-3 text-sm text-text-muted">
            <p>
              <span className="font-semibold text-text-primary">
                {sum.overall_sentiment} ({sum.overall_score >= 0 ? "+" : ""}
                {sum.overall_score.toFixed(2)})
              </span>{" "}
              · {sum.positive_pct}% positive · {sum.neutral_pct}% neutral · {sum.negative_pct}% negative
            </p>
            <p>{sum.interpretation}</p>
            {sum.positive_factors.length > 0 && (
              <p>
                <span className="font-semibold text-profit">Positive factors: </span>
                {sum.positive_factors.join("; ")}
              </p>
            )}
            {sum.negative_factors.length > 0 && (
              <p>
                <span className="font-semibold text-loss">Negative factors: </span>
                {sum.negative_factors.join("; ")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No news to analyse.</p>
        )}
        <Link href="/prediction" className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary/80">
          See the experimental price prediction →
        </Link>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Latest News</h3>
        {news.loading ? (
          <Loading label="Fetching news..." />
        ) : news.error ? (
          <ErrorBox message={`News unavailable: ${news.error}`} onRetry={news.reload} />
        ) : items.length === 0 ? (
          <Empty>No recent relevant news found.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
