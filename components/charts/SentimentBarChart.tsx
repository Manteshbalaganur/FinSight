"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { getNewsCounts } from "@/lib/mockData";

export default function SentimentBarChart() {
  const data = getNewsCounts();
  const colors: Record<string, string> = {
    Positive: "#10B981",
    Neutral: "#F59E0B",
    Negative: "#EF4444",
  };
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2230" vertical={false} />
        <XAxis dataKey="sentiment" stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12141C",
            border: "1px solid #1F2230",
            borderRadius: "0.75rem",
            color: "#F5F7FA",
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
          {data.map((d) => (
            <Cell key={d.sentiment} fill={colors[d.sentiment]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
