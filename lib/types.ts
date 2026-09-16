export type Sentiment = "positive" | "negative" | "neutral";
export type Relevance = "High" | "Medium" | "Low";

export interface Holding {
  name: string;
  symbol: string;
  qty: number;
  buyPrice: number;
  currentPrice: number;
  sector: string;
}

export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  company: string;
  sector: string;
  sentiment: Sentiment;
  sentimentScore: number;
  relevance: Relevance;
  source: string;
  date: string;
  url: string;
  whyRelevant: string;
}

export interface SentimentPoint {
  date: string;
  sentiment: number;
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

export interface PresetQA {
  question: string;
  answer: string;
  keywords: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
