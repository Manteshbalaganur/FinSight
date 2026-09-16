"use client";

import { Search, Bell } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-base/80 px-6 backdrop-blur-md">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          size={16}
        />
        <input
          type="text"
          placeholder="Search stocks, news, sectors..."
          className="w-full rounded-lg border border-border bg-bg-card py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors duration-200"
        />
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
