import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: LucideIcon;
}

export default function KpiCard({ label, value, change, positive, icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 shadow-lg transition-colors duration-200 hover:border-border-hover">
      <div className="flex items-start justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        {Icon && (
          <div className="rounded-lg bg-bg-hover p-2">
            <Icon size={16} className="text-text-muted" />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-text-primary tabular-nums">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-1 text-sm font-medium tabular-nums",
            positive === undefined ? "text-text-muted" : positive ? "text-profit" : "text-loss"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
