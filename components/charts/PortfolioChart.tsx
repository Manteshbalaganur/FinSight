"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getPortfolioSeries } from "@/lib/mockData";

export default function PortfolioChart() {
  const data = getPortfolioSeries();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2230" vertical={false} />
        <XAxis dataKey="date" stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `\u20B9${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12141C",
            border: "1px solid #1F2230",
            borderRadius: "0.75rem",
            color: "#F5F7FA",
          }}
          formatter={(v: number) => [`\u20B9${v.toLocaleString("en-IN")}`, "Value"]}
        />
        <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#portfolioGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
