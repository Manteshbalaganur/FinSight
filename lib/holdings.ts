import type { Holding } from "./types";

/**
 * The user's portfolio POSITIONS (what they own and at what price they bought).
 * This is user input, not market data. All prices, P/L, news, sentiment and
 * predictions are fetched live from the backend. Edit this list to match your own holdings.
 */
export const holdings: Holding[] = [
  { name: "Reliance Industries", symbol: "RELIANCE", ticker: "RELIANCE.NS", qty: 20, buyPrice: 2400, sector: "Energy" },
  { name: "HDFC Bank", symbol: "HDFCBANK", ticker: "HDFCBANK.NS", qty: 10, buyPrice: 1550, sector: "Banking" },
  { name: "Tata Motors", symbol: "TATAMOTORS", ticker: "TMPV.NS", qty: 15, buyPrice: 620, sector: "Automotive" },
  { name: "TCS", symbol: "TCS", ticker: "TCS.NS", qty: 12, buyPrice: 3600, sector: "IT" },
  { name: "Infosys", symbol: "INFY", ticker: "INFY.NS", qty: 18, buyPrice: 1420, sector: "IT" },
];
