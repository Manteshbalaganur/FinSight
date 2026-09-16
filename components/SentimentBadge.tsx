import { cn } from "@/lib/utils";
import type { Sentiment } from "@/lib/types";

interface SentimentBadgeProps {
  sentiment: Sentiment;
  score?: number;
}

const config: Record<Sentiment, { label: string; classes: string }> = {
  positive: {
    label: "Positive",
    classes: "bg-profit/15 text-profit border-profit/30",
  },
  negative: {
    label: "Negative",
    classes: "bg-loss/15 text-loss border-loss/30",
  },
  neutral: {
    label: "Neutral",
    classes: "bg-neutral/15 text-neutral border-neutral/30",
  },
};

export default function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  const c = config[sentiment];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        c.classes
      )}
    >
      {sentiment === "positive" ? "🟢" : sentiment === "negative" ? "🔴" : "🟡"}
      {c.label}
      {score !== undefined && (
        <span className="opacity-70 tabular-nums">({score > 0 ? "+" : ""}{score.toFixed(2)})</span>
      )}
    </span>
  );
}
