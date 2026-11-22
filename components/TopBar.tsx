"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { api } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export default function TopBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  // Debounced search against the backend.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      api
        .search(q)
        .then((r) => setResults(r))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function select(symbol: string) {
    setOpen(false);
    setQuery("");
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-base/80 px-6 backdrop-blur-md">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          size={16}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) select(results[0].symbol);
          }}
          placeholder="Search stocks, news, sectors..."
          className="w-full rounded-lg border border-border bg-bg-card py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors duration-200"
        />
        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg border border-border bg-bg-card shadow-lg">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted">
                {searching ? "Searching..." : "No matching stocks found."}
              </div>
            ) : (
              results.map((r) => (
                <button
                  key={r.symbol}
                  onMouseDown={() => select(r.symbol)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-bg-hover"
                >
                  <span>
                    <span className="font-semibold text-text-primary">{r.symbol}</span>
                    <span className="ml-2 text-text-muted">{r.name}</span>
                  </span>
                  <span className="text-xs text-text-muted">{r.market}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-profit" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          M
        </div>
      </div>
    </header>
  );
}
