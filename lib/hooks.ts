"use client";

import { useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "./api";
import { holdings } from "./holdings";
import { buildRows, totals, type HoldingRow, type PortfolioTotals } from "./portfolio";
import type { History, NewsItem, PortfolioPoint, SentimentResult } from "./types";

/** Run an async loader and expose { data, loading, error, reload }. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], enabled = true) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: enabled,
  });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((e) => !cancelled && setState({ data: null, error: errorMessage(e), loading: false }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

const tickers = holdings.map((h) => h.ticker);

export function usePortfolio() {
  const q = useAsync(() => api.quotes(tickers), []);
  const rows: HoldingRow[] = useMemo(() => buildRows(holdings, q.data ?? []), [q.data]);
  const sums: PortfolioTotals = useMemo(() => totals(rows), [rows]);
  return { rows, totals: sums, loading: q.loading, error: q.error, hasData: !!q.data, reload: q.reload };
}

/** Portfolio value per day = sum(qty x close) across holdings, from real 1-month histories. */
export function usePortfolioSeries() {
  return useAsync<PortfolioPoint[]>(async () => {
    const results = await Promise.allSettled(holdings.map((h) => api.history(h.ticker, "1M")));
    const ok: { h: (typeof holdings)[number]; hist: History }[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") ok.push({ h: holdings[i], hist: r.value });
    });
    if (ok.length === 0) throw new Error("Price history is unavailable for all holdings.");
    const dates = Array.from(new Set(ok.flatMap(({ hist }) => hist.points.map((p) => p.date)))).sort();
    const last = new Map<string, number>();
    const closeByDate = ok.map(({ hist }) => new Map(hist.points.map((p) => [p.date, p.close])));
    const series: PortfolioPoint[] = [];
    for (const d of dates) {
      let total = 0;
      ok.forEach(({ h }, i) => {
        const c = closeByDate[i].get(d);
        if (c !== undefined) last.set(h.ticker, c);
        total += h.qty * (last.get(h.ticker) ?? 0);
      });
      series.push({ date: d.slice(5), value: Math.round(total) });
    }
    // Drop leading days where some holding had no price yet (would understate the value).
    return series.filter((_, i) => i >= dates.findIndex((d) => ok.every((_, k) => closeByDate[k].has(d))));
  }, []);
}

export type SentimentState = "idle" | "loading" | "done" | "error";

/** News for every holding, then OpenAI sentiment per holding (one batched call each). */
export function usePortfolioNews() {
  const news = useAsync(async () => {
    const results = await Promise.allSettled(holdings.map((h) => api.news(h.ticker, 8)));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === results.length) {
      const first = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
      throw first.reason;
    }
    return results.map((r) => (r.status === "fulfilled" ? r.value : null));
  }, []);

  const [analyses, setAnalyses] = useState<Record<string, SentimentResult>>({});
  const [sentimentState, setSentimentState] = useState<SentimentState>("idle");
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  useEffect(() => {
    if (!news.data) return;
    let cancelled = false;
    setSentimentState("loading");
    setSentimentError(null);
    Promise.allSettled(
      holdings.map((h, i) => {
        const res = news.data![i];
        if (!res || res.articles.length === 0) return Promise.reject(new Error("no articles"));
        return api.sentiment(h.ticker, h.name, res.articles);
      })
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, SentimentResult> = {};
      let firstError: string | null = null;
      results.forEach((r, i) => {
        if (r.status === "fulfilled") next[holdings[i].ticker] = r.value;
        else if (!firstError && (r.reason as Error).message !== "no articles") firstError = errorMessage(r.reason);
      });
      setAnalyses(next);
      setSentimentError(firstError);
      setSentimentState(Object.keys(next).length > 0 ? "done" : firstError ? "error" : "done");
    });
    return () => {
      cancelled = true;
    };
  }, [news.data]);

  const items: NewsItem[] = useMemo(() => {
    if (!news.data) return [];
    const out: NewsItem[] = [];
    holdings.forEach((h, i) => {
      const res = news.data![i];
      if (!res) return;
      const analysis = analyses[h.ticker];
      res.articles.forEach((a, idx) => {
        const s = analysis?.articles[idx];
        const analyzed = !!s && s.analyzed && s.title === a.title;
        out.push({
          id: out.length + 1,
          headline: a.title,
          summary: a.description,
          company: h.name,
          sector: h.sector,
          ticker: h.ticker,
          source: a.source,
          date: (a.published ?? "").slice(0, 10),
          url: a.url,
          analysis: analyzed ? "done" : sentimentState === "loading" || sentimentState === "idle" ? "pending" : "unavailable",
          sentiment: analyzed ? (s!.sentiment as NewsItem["sentiment"]) : undefined,
          sentimentScore: analyzed ? (s!.score as number) : undefined,
          relevance: analyzed ? s!.relevance : undefined,
          whyRelevant: analyzed ? `${s!.explanation} ${s!.impact}`.trim() : undefined,
        });
      });
    });
    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [news.data, analyses, sentimentState]);

  return {
    items,
    analyses,
    newsLoading: news.loading,
    newsError: news.error,
    sentimentState,
    sentimentError,
    reload: news.reload,
  };
}
