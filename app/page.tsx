import KpiCard from "@/components/KpiCard";
import NewsCard from "@/components/NewsCard";
import PortfolioChart from "@/components/charts/PortfolioChart";
import { Wallet, TrendingUp, ArrowUpRight, Newspaper } from "lucide-react";
import { getCurrentValue, getInvested, getProfitLoss, getProfitLossPercent, news, getTopMovers, getNewsCounts } from "@/lib/mockData";
import { formatINR, formatSignedINR, formatPercent, cn } from "@/lib/utils";

export default function OverviewPage() {
  const value = getCurrentValue();
  const invested = getInvested();
  const pl = getProfitLoss();
  const plPct = getProfitLossPercent();
  const counts = getNewsCounts();
  const movers = getTopMovers();
  const latestNews = news.slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Good evening, Mahantesh 👋</h1>
        <p className="mt-1 text-sm text-text-muted">Here&apos;s your portfolio intelligence summary</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Value"
          value={formatINR(value)}
          change={formatPercent(plPct)}
          positive
          icon={Wallet}
        />
        <KpiCard label="Invested" value={formatINR(invested)} icon={TrendingUp} />
        <KpiCard
          label="Total P/L"
          value={formatSignedINR(pl)}
          change={formatPercent(plPct)}
          positive
          icon={ArrowUpRight}
        />
        <KpiCard
          label="News Today"
          value={`${news.length} articles`}
          change={`${counts[0].count} positive, ${counts[1].count} neutral, ${counts[2].count} negative`}
          icon={Newspaper}
        />
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Portfolio Value — Last 30 Days</h3>
        <PortfolioChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Latest Relevant News</h3>
          <div className="space-y-4">
            {latestNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Top Movers</h3>
          <div className="rounded-xl border border-border bg-bg-card p-5">
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
                        m.changePercent >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {formatPercent(m.changePercent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
