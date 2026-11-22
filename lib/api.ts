import type {
  ApiArticle,
  BatchQuote,
  ChatMessage,
  ChatResponse,
  History,
  NewsResponse,
  PredictionResult,
  Quote,
  SearchResult,
  SentimentResult,
  StockOption,
} from "./types";

// Backend URL comes from .env.local (NEXT_PUBLIC_API_BASE_URL). The OpenAI key never reaches the browser.
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(`Cannot reach the backend at ${BASE}. Is it running (uvicorn app.main:app --port 8000)?`, "network");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    let detail = `Request failed (${res.status}).`;
    if (typeof body?.detail === "string") detail = body.detail;
    else if (Array.isArray(body?.detail)) detail = body.detail.map((d: { msg: string }) => d.msg).join("; ");
    throw new ApiError(detail, body?.code, res.status);
  }
  return body as T;
}

// Small in-memory cache so navigating between pages does not re-download or re-analyse everything.
const memoStore = new Map<string, { expires: number; value: Promise<unknown> }>();
function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = memoStore.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;
  const value = fn().catch((e) => {
    memoStore.delete(key); // never cache failures
    throw e;
  });
  memoStore.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}

const enc = encodeURIComponent;

export const api = {
  quote: (symbol: string) => memo(`quote:${symbol}`, 60_000, () => request<Quote>(`/stocks/${enc(symbol)}`)),
  quotes: (symbols: string[]) =>
    memo(`quotes:${symbols.join(",")}`, 60_000, () =>
      request<{ quotes: BatchQuote[] }>(`/stocks/quotes?symbols=${enc(symbols.join(","))}`).then((r) => r.quotes)
    ),
  history: (symbol: string, period: string) =>
    memo(`history:${symbol}:${period}`, 300_000, () => request<History>(`/stocks/${enc(symbol)}/history?period=${period}`)),
  search: (q: string) =>
    request<{ results: SearchResult[] }>(`/stocks/search?q=${enc(q)}`).then((r) => r.results),
  supported: () =>
    memo("supported", 3_600_000, () => request<{ stocks: StockOption[] }>("/stocks/supported").then((r) => r.stocks)),
  news: (symbol: string, limit = 8) =>
    memo(`news:${symbol}:${limit}`, 300_000, () =>
      request<NewsResponse>(`/news?symbol=${enc(symbol)}&limit=${limit}`)
    ),
  sentiment: (symbol: string, company: string | null, articles: ApiArticle[]) =>
    memo(`sentiment:${symbol}:${articles.map((a) => a.title).join("|")}`, 600_000, () =>
      request<SentimentResult>("/sentiment/analyze", {
        method: "POST",
        body: JSON.stringify({ symbol, company, articles }),
      })
    ),
  predict: (symbol: string, horizonDays: number) =>
    memo(`predict:${symbol}:${horizonDays}`, 600_000, () =>
      request<PredictionResult>(`/predictions/${enc(symbol)}`, {
        method: "POST",
        body: JSON.stringify({ horizon_days: horizonDays }),
      })
    ),
  chat: (
    message: string,
    history: ChatMessage[],
    portfolio: { symbol: string; qty: number; buy_price: number }[]
  ) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        history: history.filter((m) => !m.error).map(({ role, content }) => ({ role, content })),
        portfolio,
      }),
    }),
};
