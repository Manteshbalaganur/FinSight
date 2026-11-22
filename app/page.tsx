"use client";

import KpiCard from "@/components/KpiCard";
import NewsCard from "@/components/NewsCard";
import PortfolioChart from "@/components/charts/PortfolioChart";
import { Loading, ErrorBox, Empty, Notice } from "@/components/DataState";
import { Wallet, TrendingUp, ArrowUpRight, Newspaper } from "lucide-react";
import { usePortfolio, usePortfolioNews, usePortfolioSeries } from "@/lib/hooks";
import { formatINR, formatSignedINR, formatPercent, cn } from "@/lib/utils";

export default function OverviewPage() {
  const pf = usePortfolio();
  const series = usePortfolioSeries();
  const news = usePortfolioNews();

  const t = pf.totals;
  const live = pf.hasData;
  const movers = pf.rows
    .filter((r) => r.dayChangePercent !== null)
    .sort((a, b) => (b.dayChangePercent as number) - (a.dayChangePercent as number));
  const latestNews = news.items.slice(0, 2);
  const analysed = news.items.filter((n) => n.analysis === "done");
  const count = (s: string) => analysed.filter((n) => n.sentiment === s).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Good evening, Mahantesh 👋</h1>
        <p className="mt-1 text-sm text-text-muted">Here&apos;s your portfolio intelligence summary</p>
      </div>

      {pf.error && <ErrorBox message={pf.error} onRetry={pf.reload} />}
      {live && t.partial && <Notice>Some holdings have no live price right now; totals exclude them.</Notice>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Value"
          value={live ? formatINR(t.value) : pf.loading ? "Loading..." : "Unavailable"}
          change={live ? formatPercent(t.plPercent) : undefined}
          positive={live ? t.pl >= 0 : undefined}
          icon={Wallet}
        />
        <KpiCard label="Invested" value={live ? formatINR(t.invested) : pf.loading ? "Loading..." : "Unavailable"} icon={TrendingUp} />
        <KpiCard
          label="Total P/L"
          value={live ? formatSignedINR(t.pl) : pf.loading ? "Loading..." : "Unavailable"}
          change={live ? formatPercent(t.plPercent) : undefined}
          positive={live ? t.pl >= 0 : undefined}
          icon={ArrowUpRight}
        />
        <KpiCard
          label="News Today"
          value={news.newsLoading ? "Loading..." : news.newsError ? "Unavailable" : `${news.items.length} articles`}
          change={
            news.sentimentState === "done" && analysed.length > 0
              ? `${count("positive")} positive, ${count("neutral")} neutral, ${count("negative")} negative`
              : news.sentimentState === "loading"
              ? "Sentiment analysis in progress..."
              : news.items.length > 0
              ? "Sentiment unavailable"
              : undefined
          }
          icon={Newspaper}
        />
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Portfolio Value — Last 30 Days</h3>
        {series.loading ? (
          <Loading label="Loading price history..." />
        ) : series.error ? (
          <ErrorBox message={series.error} onRetry={series.reload} />
        ) : series.data && series.data.length > 0 ? (
          <PortfolioChart data={series.data} />
        ) : (
          <Empty>No price history available.</Empty>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Latest Relevant News</h3>
          <div className="space-y-4">
            {news.newsLoading ? (
              <Loading label="Fetching latest news..." />
            ) : news.newsError ? (
              <ErrorBox message={`News unavailable: ${news.newsError}`} onRetry={news.reload} />
            ) : latestNews.length === 0 ? (
              <Empty>No recent news found for your holdings.</Empty>
            ) : (
              latestNews.map((item) => <NewsCard key={item.id} item={item} />)
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Top Movers (today)</h3>
          <div className="rounded-xl border border-border bg-bg-card p-5">
            {pf.loading ? (
              <p className="text-sm text-text-muted">Loading...</p>
            ) : movers.length === 0 ? (
              <p className="text-sm text-text-muted">Day-change data is unavailable.</p>
            ) : (
              <div className="space-y-4">
                {movers.map((m) => (
                  <div
                    key={m.symbol}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-semibold text-text-primary">{m.name}</div>
                      <div className="text-xs text-text-muted">{m.symbol}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          "text-lg font-bold tabular-nums",
                          (m.dayChangePercent as number) >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {formatPercent(m.dayChangePercent as number)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
