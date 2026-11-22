import type { BatchQuote, Holding } from "./types";

export interface HoldingRow extends Holding {
  currentPrice: number | null;
  dayChangePercent: number | null;
  invested: number;
  currentValue: number | null;
  pl: number | null;
  plPercent: number | null;
}

export interface PortfolioTotals {
  invested: number;
  value: number;
  pl: number;
  plPercent: number;
  qty: number;
  /** True when at least one holding has no live price (totals then exclude it). */
  partial: boolean;
}

export function buildRows(holdings: Holding[], quotes: BatchQuote[]): HoldingRow[] {
  const bySymbol = new Map(quotes.map((q) => [q.symbol, q]));
  return holdings.map((h) => {
    const q = bySymbol.get(h.ticker);
    const invested = h.qty * h.buyPrice;
    if (!q || !q.available || q.price === undefined) {
      return { ...h, currentPrice: null, dayChangePercent: null, invested, currentValue: null, pl: null, plPercent: null };
    }
    const currentValue = h.qty * q.price;
    return {
      ...h,
      currentPrice: q.price,
      dayChangePercent: q.change_percent ?? null,
      invested,
      currentValue,
      pl: currentValue - invested,
      plPercent: ((currentValue - invested) / invested) * 100,
    };
  });
}

export function totals(rows: HoldingRow[]): PortfolioTotals {
  const live = rows.filter((r) => r.currentValue !== null);
  const invested = live.reduce((s, r) => s + r.invested, 0);
  const value = live.reduce((s, r) => s + (r.currentValue ?? 0), 0);
  return {
    invested,
    value,
    pl: value - invested,
    plPercent: invested ? ((value - invested) / invested) * 100 : 0,
    qty: rows.reduce((s, r) => s + r.qty, 0),
    partial: live.length !== rows.length,
  };
}

export function sectorAllocation(rows: HoldingRow[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.currentValue === null) continue;
    map.set(r.sector, (map.get(r.sector) || 0) + r.currentValue);
  }
  return Array.from(map, ([name, value]) => ({ name, value }));
}

export function stockAllocation(rows: HoldingRow[]): { name: string; value: number }[] {
  return rows.filter((r) => r.currentValue !== null).map((r) => ({ name: r.symbol, value: r.currentValue as number }));
}
