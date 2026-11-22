export type Sentiment = "positive" | "negative" | "neutral";
export type Relevance = "High" | "Medium" | "Low";

/** A position the user entered (quantity and buy price). Live prices come from the backend. */
export interface Holding {
  name: string;
  symbol: string;
  ticker: string; // Yahoo Finance symbol, e.g. TCS.NS
  qty: number;
  buyPrice: number;
  sector: string;
}

export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  company: string;
  sector: string;
  /** Undefined until the OpenAI analysis for this article is available. */
  sentiment?: Sentiment;
  sentimentScore?: number;
  relevance?: Relevance;
  analysis: "done" | "pending" | "unavailable";
  source: string;
  date: string;
  url: string;
  whyRelevant?: string;
  ticker: string;
}

export interface SentimentPoint {
  date: string;
  sentiment: number | null;
  price: number;
}

export interface PortfolioPoint {
  date: string;
  value: number;
}

export interface ModelResult {
  name: string;
  accuracy: number;
  rmse: number;
  best?: boolean;
}

export interface PredictionPoint {
  date: string;
  actual: number;
  predicted: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

// ---- Backend API response shapes ----
export interface Quote {
  symbol: string;
  name: string;
  currency: string;
  exchange?: string;
  price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  open: number;
  day_high: number;
  day_low: number;
  volume: number | null;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  latest_bar_date: string;
  data_as_of: string;
  data_source: string;
  market_open: boolean | null;
  market_status_note: string;
}

export interface BatchQuote {
  symbol: string;
  name: string;
  price?: number;
  previous_close?: number;
  change?: number;
  change_percent?: number;
  latest_bar_date?: string;
  available: boolean;
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface History {
  symbol: string;
  period: string;
  interval: string;
  currency: string;
  intraday: boolean;
  count: number;
  points: HistoryPoint[];
}

export interface SearchResult {
  symbol: string;
  name: string;
  market: string;
  supported: boolean;
}

export interface ApiArticle {
  title: string;
  description: string;
  source: string;
  published: string | null;
  url: string;
  symbol: string | null;
  company: string | null;
}

export interface NewsResponse {
  symbol: string | null;
  company: string | null;
  count: number;
  stale: boolean;
  articles: ApiArticle[];
}

export interface SentimentArticle {
  title: string;
  analyzed: boolean;
  sentiment: Sentiment | null;
  score: number | null;
  explanation: string;
  impact: string;
  relevance: Relevance;
}

export interface SentimentSummary {
  overall_sentiment: "Positive" | "Negative" | "Neutral";
  overall_score: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_factors: string[];
  negative_factors: string[];
  interpretation: string;
}

export interface SentimentResult {
  symbol: string;
  articles_analyzed: number;
  articles_total: number;
  summary: SentimentSummary;
  articles: SentimentArticle[];
}

export interface PredictionResult {
  symbol: string;
  currency: string;
  horizon_days: number;
  horizon_label: string;
  current_price: number;
  price_as_of: string;
  predicted_price: number;
  expected_change_pct: number;
  technical_component_pct: number;
  direction: "UP" | "DOWN" | "NEUTRAL";
  model_name: string;
  backtest_directional_accuracy: number;
  sentiment: {
    used: boolean;
    score: number;
    articles_analyzed: number;
    overall_sentiment: string | null;
    adjustment_pct: number;
    note: string;
  };
  technical_indicators: {
    rsi_14: number;
    rsi_signal: string;
    sma_20: number;
    sma_50: number | null;
    trend: string;
    return_10d_pct: number | null;
    volatility_10d_pct: number;
  };
  model_comparison: ModelResult[];
  backtest: PredictionPoint[];
  training: { train_rows: number; test_rows: number; features: string[]; data_until: string };
  disclaimer: string;
}

export interface ChatResponse {
  reply: string;
  symbols: string[];
  sources: string[];
}

export interface StockOption {
  symbol: string;
  name: string;
  market: string;
}
