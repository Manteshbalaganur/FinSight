import { cn } from "@/lib/utils";
import { formatINR, formatPercent } from "@/lib/utils";
import { getHoldingRows, getInvested, getCurrentValue, getProfitLoss } from "@/lib/mockData";

export default function StockTable() {
  const rows = getHoldingRows();
  const totalInvested = getInvested();
  const totalValue = getCurrentValue();
  const totalPL = getProfitLoss();
  const totalPLPct = (totalPL / totalInvested) * 100;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
            <th className="px-4 py-3 font-semibold">Stock</th>
            <th className="px-4 py-3 text-right font-semibold">Qty</th>
            <th className="px-4 py-3 text-right font-semibold">Buy Price</th>
            <th className="px-4 py-3 text-right font-semibold">Current</th>
            <th className="px-4 py-3 text-right font-semibold">Invested</th>
            <th className="px-4 py-3 text-right font-semibold">Value</th>
            <th className="px-4 py-3 text-right font-semibold">P/L</th>
            <th className="px-4 py-3 text-right font-semibold">P/L %</th>
            <th className="px-4 py-3 font-semibold">Sector</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.symbol}
              className="border-b border-border transition-colors duration-200 hover:bg-bg-hover"
            >
              <td className="px-4 py-3">
                <div className="font-semibold text-text-primary">{r.name}</div>
                <div className="text-xs text-text-muted">{r.symbol}</div>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-text-primary">{r.qty}</td>
              <td className="px-4 py-3 text-right tabular-nums text-text-muted">{formatINR(r.buyPrice)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(r.currentPrice)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-text-muted">{formatINR(r.invested)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(r.currentValue)}</td>
              <td className={cn("px-4 py-3 text-right font-semibold tabular-nums", r.pl >= 0 ? "text-profit" : "text-loss")}>
                {r.pl >= 0 ? "+" : "\u2212"}{formatINR(Math.abs(r.pl))}
              </td>
              <td className={cn("px-4 py-3 text-right font-semibold tabular-nums", r.plPercent >= 0 ? "text-profit" : "text-loss")}>
                {formatPercent(r.plPercent)}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-bg-hover px-2.5 py-0.5 text-xs font-medium text-text-muted">
                  {r.sector}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-bg-base font-bold">
            <td className="px-4 py-3 text-text-primary">Total</td>
            <td className="px-4 py-3 text-right tabular-nums text-text-muted">75</td>
            <td className="px-4 py-3"></td>
            <td className="px-4 py-3"></td>
            <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(totalInvested)}</td>
            <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(totalValue)}</td>
            <td className="px-4 py-3 text-right tabular-nums text-profit">
              +{formatINR(totalPL)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-profit">{formatPercent(totalPLPct)}</td>
            <td className="px-4 py-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
