"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SentimentBadge from "./SentimentBadge";
import type { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  item: NewsItem;
}

const relevanceClasses: Record<string, string> = {
  High: "bg-primary/15 text-primary border-primary/30",
  Medium: "bg-text-muted/15 text-text-muted border-text-muted/30",
  Low: "bg-bg-hover text-text-muted border-border",
};

export default function NewsCard({ item }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 shadow-lg transition-colors duration-200 hover:border-border-hover">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/30">
          {item.company}
        </span>
        <span className="rounded-full bg-profit/15 px-2.5 py-0.5 text-xs font-semibold text-profit border border-profit/30">
          {item.sector}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-bold leading-snug text-text-primary">{item.headline}</h3>
      <p className="mb-4 text-sm leading-relaxed text-text-muted">{item.summary}</p>
      <div className="flex flex-wrap items-center gap-3">
        <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            relevanceClasses[item.relevance]
          )}
        >
          {item.relevance} relevance
        </span>
        <span className="text-xs text-text-muted">
          {item.source} · {item.date}
        </span>
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex w-full items-center gap-1 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80"
      >
        <ChevronDown
          className={cn("transition-transform duration-200", expanded && "rotate-180")}
          size={16}
        />
        Why is this relevant to my portfolio?
      </button>
      {expanded && (
        <div className="mt-3 rounded-lg border border-border bg-bg-base p-4 text-sm leading-relaxed text-text-muted">
          {item.whyRelevant}
        </div>
      )}
    </div>
  );
}
