"use client";

import StockTable from "@/components/StockTable";
import AllocationPie from "@/components/charts/AllocationPie";
import { Loading, ErrorBox, Notice } from "@/components/DataState";
import { usePortfolio } from "@/lib/hooks";
import { sectorAllocation, stockAllocation } from "@/lib/portfolio";
import { formatINR, formatPercent } from "@/lib/utils";

export default function PortfolioPage() {
  const pf = usePortfolio();
  const t = pf.totals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Portfolio Holdings</h1>
        <p className="mt-1 text-sm text-text-muted">
          {pf.hasData
            ? `Total value ${formatINR(t.value)} · Invested ${formatINR(t.invested)} · P/L ${formatPercent(t.plPercent)}`
            : "Live prices via Yahoo Finance (may be delayed)"}
        </p>
      </div>
      {pf.loading && <Loading label="Fetching latest prices..." />}
      {pf.error && <ErrorBox message={pf.error} onRetry={pf.reload} />}
      {pf.hasData && (
        <>
          {t.partial && <Notice>Some holdings have no live price right now; totals and charts exclude them.</Notice>}
          <StockTable rows={pf.rows} totals={t} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AllocationPie data={stockAllocation(pf.rows)} title="Stock-wise Allocation" />
            <AllocationPie data={sectorAllocation(pf.rows)} title="Sector-wise Allocation" />
          </div>
        </>
      )}
    </div>
  );
}
