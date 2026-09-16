import type {
  Holding,
  NewsItem,
  SentimentPoint,
  PortfolioPoint,
  ModelResult,
  PredictionPoint,
  PresetQA,
} from "./types";

export const holdings: Holding[] = [
  { name: "Reliance Industries", symbol: "RELIANCE", qty: 20, buyPrice: 2400, currentPrice: 2850, sector: "Energy" },
  { name: "HDFC Bank", symbol: "HDFCBANK", qty: 10, buyPrice: 1550, currentPrice: 1680, sector: "Banking" },
  { name: "Tata Motors", symbol: "TATAMOTORS", qty: 15, buyPrice: 620, currentPrice: 780, sector: "Automotive" },
  { name: "TCS", symbol: "TCS", qty: 12, buyPrice: 3600, currentPrice: 4100, sector: "IT" },
  { name: "Infosys", symbol: "INFY", qty: 18, buyPrice: 1420, currentPrice: 1590, sector: "IT" },
];

export function getInvested(): number {
  return holdings.reduce((sum, h) => sum + h.qty * h.buyPrice, 0);
}

export function getCurrentValue(): number {
  return holdings.reduce((sum, h) => sum + h.qty * h.currentPrice, 0);
}

export function getProfitLoss(): number {
  return getCurrentValue() - getInvested();
}

export function getProfitLossPercent(): number {
  return (getProfitLoss() / getInvested()) * 100;
}

export interface HoldingRow extends Holding {
  invested: number;
  currentValue: number;
  pl: number;
  plPercent: number;
}

export function getHoldingRows(): HoldingRow[] {
  return holdings.map((h) => {
    const invested = h.qty * h.buyPrice;
    const currentValue = h.qty * h.currentPrice;
    return {
      ...h,
      invested,
      currentValue,
      pl: currentValue - invested,
      plPercent: ((currentValue - invested) / invested) * 100,
    };
  });
}

export function getSectorAllocation(): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const h of holdings) {
    const val = h.qty * h.currentPrice;
    map.set(h.sector, (map.get(h.sector) || 0) + val);
  }
  return Array.from(map, ([name, value]) => ({ name, value }));
}

export function getStockAllocation(): { name: string; value: number }[] {
  return holdings.map((h) => ({ name: h.symbol, value: h.qty * h.currentPrice }));
}

export function getTopMovers(): { symbol: string; name: string; changePercent: number }[] {
  return getHoldingRows()
    .map((r) => ({ symbol: r.symbol, name: r.name, changePercent: r.plPercent }))
    .sort((a, b) => b.changePercent - a.changePercent);
}

export const news: NewsItem[] = [
  {
    id: 1,
    headline: "TCS announces new AI partnership with Microsoft for enterprise cloud",
    summary:
      "The partnership will integrate Azure OpenAI into TCS's enterprise offerings, strengthening its cloud and AI service portfolio.",
    company: "TCS",
    sector: "IT",
    sentiment: "positive",
    sentimentScore: 0.78,
    relevance: "High",
    source: "Business Standard",
    date: "2026-09-16",
    url: "#",
    whyRelevant:
      "You hold 12 shares of TCS. The new AI partnership with Microsoft strengthens TCS's cloud & AI service offerings \u2014 positive for the IT sector. IT is ~40% of your portfolio, so this directly impacts your holdings.",
  },
  {
    id: 2,
    headline: "Government announces \u20B910,000 Cr semiconductor manufacturing policy",
    summary:
      "The policy offers PLI-style incentives for domestic semiconductor fabrication, indirectly benefiting IT service exporters.",
    company: "Sector-wide",
    sector: "IT / Electronics",
    sentiment: "positive",
    sentimentScore: 0.65,
    relevance: "High",
    source: "Economic Times",
    date: "2026-09-15",
    url: "#",
    whyRelevant:
      "The government's \u20B910,000 Cr semiconductor push could benefit IT companies like TCS and Infosys indirectly, since they serve semiconductor clients globally.",
  },
  {
    id: 3,
    headline: "HDFC Bank reports 12% YoY growth in Q3 net profit",
    summary:
      "Strong NIM expansion and lower NPAs drove the profit beat. Management guides for double-digit growth ahead.",
    company: "HDFC Bank",
    sector: "Banking",
    sentiment: "positive",
    sentimentScore: 0.72,
    relevance: "High",
    source: "Mint",
    date: "2026-09-14",
    url: "#",
    whyRelevant:
      "You hold 10 shares of HDFC Bank. Strong quarterly results support the banking sector outlook and your holding's fundamental case.",
  },
  {
    id: 4,
    headline: "Tata Motors EV sales cross 50,000 units milestone",
    summary:
      "Tata continues to lead India's EV passenger vehicle segment with 62% market share. New Punch EV launch expected next quarter.",
    company: "Tata Motors",
    sector: "Automotive",
    sentiment: "positive",
    sentimentScore: 0.81,
    relevance: "High",
    source: "Moneycontrol",
    date: "2026-09-13",
    url: "#",
    whyRelevant:
      "You hold 15 shares of Tata Motors. The EV sales milestone confirms the growth narrative for your top-performing holding (+25.8%).",
  },
  {
    id: 5,
    headline: "RBI holds repo rate steady at 6.5%, banking sector reacts",
    summary:
      "Status quo on rates was expected. Banking stocks showed muted reaction. Focus shifts to Q4 credit growth data.",
    company: "Sector-wide",
    sector: "Banking",
    sentiment: "neutral",
    sentimentScore: -0.05,
    relevance: "Medium",
    source: "Reuters",
    date: "2026-09-12",
    url: "#",
    whyRelevant:
      "A steady repo rate provides stability for your HDFC Bank holding, though it does not create a strong directional catalyst.",
  },
  {
    id: 6,
    headline: "Reliance Retail expands into quick-commerce with new app launch",
    summary:
      "The new app will compete with Blinkit, Zepto, and Instamart. Analysts see 18-24 month path to profitability.",
    company: "Reliance",
    sector: "Retail",
    sentiment: "positive",
    sentimentScore: 0.58,
    relevance: "Medium",
    source: "The Hindu BusinessLine",
    date: "2026-09-11",
    url: "#",
    whyRelevant:
      "You hold 20 shares of Reliance Industries. The quick-commerce expansion adds a new growth option for the consumer business within your largest holding.",
  },
];

export function getNewsCounts(): { sentiment: string; count: number }[] {
  const counts = { positive: 0, negative: 0, neutral: 0 };
  for (const n of news) counts[n.sentiment]++;
  return [
    { sentiment: "Positive", count: counts.positive },
    { sentiment: "Neutral", count: counts.neutral },
    { sentiment: "Negative", count: counts.negative },
  ];
}

export function getSentimentHeatmap(): {
  symbol: string;
  positive: number;
  neutral: number;
  negative: number;
}[] {
  return holdings.map((h) => {
    const related = news.filter(
      (n) =>
        n.company === h.name ||
        n.company === h.symbol ||
        (n.company === "Sector-wide" && n.sector.includes(h.sector))
    );
    return {
      symbol: h.symbol,
      positive: related.filter((n) => n.sentiment === "positive").length,
      neutral: related.filter((n) => n.sentiment === "neutral").length,
      negative: related.filter((n) => n.sentiment === "negative").length,
    };
  });
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function getSentimentPriceSeries(): SentimentPoint[] {
  const rng = seededRandom(42);
  const points: SentimentPoint[] = [];
  let price = 100;
  let sentiment = 0.2;
  const today = new Date("2026-09-16");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    sentiment = Math.max(-1, Math.min(1, sentiment + (rng() - 0.45) * 0.3));
    price = price * (1 + (rng() - 0.48) * 0.04);
    points.push({
      date: d.toISOString().slice(5, 10),
      sentiment: Math.round(sentiment * 100) / 100,
      price: Math.round(price * 100) / 100,
    });
  }
  return points;
}

export function getPortfolioSeries(): PortfolioPoint[] {
  const rng = seededRandom(7);
  const points: PortfolioPoint[] = [];
  let value = 161700;
  const today = new Date("2026-09-16");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    value = value * (1 + (rng() - 0.42) * 0.015);
    points.push({
      date: d.toISOString().slice(5, 10),
      value: Math.round(value),
    });
  }
  points[points.length - 1].value = 184650;
  return points;
}

export const modelResults: ModelResult[] = [
  { name: "Linear Regression", accuracy: 68.2, rmse: 4.31 },
  { name: "Random Forest", accuracy: 74.5, rmse: 3.12 },
  { name: "LSTM", accuracy: 81.3, rmse: 2.04, best: true },
];

export function getPredictionSeries(): PredictionPoint[] {
  const rng = seededRandom(99);
  const points: PredictionPoint[] = [];
  let actual = 4100;
  const today = new Date("2026-09-16");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    actual = actual * (1 + (rng() - 0.48) * 0.02);
    const predicted = actual * (1 + (rng() - 0.5) * 0.012);
    points.push({
      date: d.toISOString().slice(5, 10),
      actual: Math.round(actual * 100) / 100,
      predicted: Math.round(predicted * 100) / 100,
    });
  }
  return points;
}

export const prediction = {
  stock: "TCS",
  direction: "UP" as const,
  confidence: 78,
  basedOn: "47 positive news items, sentiment score +0.72",
};

export const presetQA: PresetQA[] = [
  {
    question: "Why is the TCS news relevant to my portfolio?",
    answer:
      "You hold 12 shares of TCS. The new AI partnership with Microsoft strengthens TCS's cloud & AI service offerings \u2014 positive for the IT sector. IT is ~40% of your portfolio, so this directly impacts your holdings.",
    keywords: ["tcs", "news", "relevant"],
  },
  {
    question: "What sectors are in my portfolio?",
    answer:
      "Your portfolio spans 4 sectors: Energy (Reliance), Banking (HDFC), Automotive (Tata Motors), and IT (TCS + Infosys). IT has the highest allocation at ~40%.",
    keywords: ["sectors", "portfolio"],
  },
  {
    question: "Explain the semiconductor policy news.",
    answer:
      "The government's \u20B910,000 Cr semiconductor push could benefit IT companies like TCS and Infosys indirectly, since they serve semiconductor clients globally.",
    keywords: ["semiconductor", "policy"],
  },
  {
    question: "What are the major risks?",
    answer:
      "1) High IT concentration (~40%), 2) Reliance exposure to crude volatility, 3) Tata Motors depends on EV policy continuity.",
    keywords: ["risks", "risk", "major"],
  },
  {
    question: "How is my portfolio performing?",
    answer:
      "Your portfolio is up ~14.2% overall. Top gainer: Tata Motors (+25.8%). Only laggard: HDFC Bank (+8.4%).",
    keywords: ["performing", "performance", "how"],
  },
  {
    question: "Should I buy more TCS?",
    answer:
      "This is an academic prototype and not financial advice. Based on available news sentiment, TCS shows positive momentum, but actual decisions should factor in valuation, risk tolerance, and personal goals.",
    keywords: ["buy", "more", "should"],
  },
];

export const FALLBACK_RESPONSE =
  "I don't have that specific information in this prototype. Try one of the suggested questions.";
