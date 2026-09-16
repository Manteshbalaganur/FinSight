"use client";

import { useState, useMemo } from "react";
import NewsCard from "@/components/NewsCard";
import { news } from "@/lib/mockData";

export default function NewsPage() {
  const [company, setCompany] = useState("All");
  const [sector, setSector] = useState("All");
  const [sentiment, setSentiment] = useState("All");

  const companies = useMemo(() => ["All", ...Array.from(new Set(news.map((n) => n.company)))], []);
  const sectors = useMemo(() => ["All", ...Array.from(new Set(news.map((n) => n.sector)))], []);
  const sentiments = ["All", "positive", "neutral", "negative"];

  const filtered = useMemo(() => {
    return news.filter((n) => {
      if (company !== "All" && n.company !== company) return false;
      if (sector !== "All" && n.sector !== sector) return false;
      if (sentiment !== "All" && n.sentiment !== sentiment) return false;
      return true;
    });
  }, [company, sector, sentiment]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Personalized News Feed</h1>
        <p className="mt-1 text-sm text-text-muted">Filter and explore portfolio-relevant market stories</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors duration-200"
        >
          {companies.map((c) => (
            <option key={c} value={c} className="bg-bg-card">
              {c === "All" ? "All Companies" : c}
            </option>
          ))}
        </select>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors duration-200"
        >
          {sectors.map((s) => (
            <option key={s} value={s} className="bg-bg-card">
              {s === "All" ? "All Sectors" : s}
            </option>
          ))}
        </select>
        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors duration-200 capitalize"
        >
          {sentiments.map((s) => (
            <option key={s} value={s} className="bg-bg-card">
              {s === "All" ? "All Sentiments" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <p className="text-text-muted">No news articles match your filters. Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
