"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { History } from "@/lib/types";

function label(date: string, intraday: boolean, period: string): string {
  if (intraday) {
    // keep the exchange-local clock time that Yahoo returned (e.g. 2026-11-20T09:15:00+05:30)
    return period === "1D" ? date.slice(11, 16) : `${date.slice(5, 10)} ${date.slice(11, 16)}`;
  }
  return period === "5Y" ? date.slice(0, 7) : date.slice(5);
}

export default function StockPriceChart({ history }: { history: History }) {
  const data = history.points.map((p) => ({ date: label(p.date, history.intraday, history.period), close: p.close }));
  const sym = history.currency === "INR" ? "\u20B9" : "$";
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2230" vertical={false} />
        <XAxis dataKey="date" stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} minTickGap={40} />
        <YAxis stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(v) => `${sym}${v}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12141C",
            border: "1px solid #1F2230",
            borderRadius: "0.75rem",
            color: "#F5F7FA",
          }}
          formatter={(v: number) => [`${sym}${v.toLocaleString("en-IN")}`, "Close"]}
        />
        <Area type="monotone" dataKey="close" stroke="#3B82F6" strokeWidth={2} fill="url(#stockGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
