"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Newspaper, BarChart3, BrainCircuit, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Portfolio", href: "/portfolio", icon: TrendingUp },
  { label: "News Feed", href: "/news", icon: Newspaper },
  { label: "Sentiment", href: "/sentiment", icon: BarChart3 },
  { label: "Prediction", href: "/prediction", icon: BrainCircuit },
  { label: "AI Assistant", href: "/assistant", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border bg-bg-base">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="text-xl">📊</span>
        <span className="text-lg font-bold text-text-primary">PortfolioAI</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <p className="text-xs text-text-muted">
          Demo data — for academic review only. Not financial advice.
        </p>
      </div>
    </aside>
  );
}
