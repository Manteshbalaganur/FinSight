import StockTable from "@/components/StockTable";
import AllocationPie from "@/components/charts/AllocationPie";
import { getStockAllocation, getSectorAllocation, getInvested, getCurrentValue, getProfitLoss } from "@/lib/mockData";
import { formatINR, formatPercent } from "@/lib/utils";

export default function PortfolioPage() {
  const stockData = getStockAllocation();
  const sectorData = getSectorAllocation();
  const invested = getInvested();
  const value = getCurrentValue();
  const pl = getProfitLoss();
  const plPct = (pl / invested) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Portfolio Holdings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Total value {formatINR(value)} · Invested {formatINR(invested)} · P/L {formatPercent(plPct)}
        </p>
      </div>

      <StockTable />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AllocationPie data={stockData} title="Stock-wise Allocation" />
        <AllocationPie data={sectorData} title="Sector-wise Allocation" />
      </div>
    </div>
  );
}
