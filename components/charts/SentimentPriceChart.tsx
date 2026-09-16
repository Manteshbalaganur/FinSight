"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { getSentimentPriceSeries } from "@/lib/mockData";

export default function SentimentPriceChart() {
  const data = getSentimentPriceSeries();
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2230" vertical={false} />
        <XAxis dataKey="date" stroke="#8B92A8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="sentiment"
          domain={[-1, 1]}
          stroke="#10B981"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="price"
          orientation="right"
          stroke="#3B82F6"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12141C",
            border: "1px solid #1F2230",
            borderRadius: "0.75rem",
            color: "#F5F7FA",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", color: "#8B92A8" }} iconType="circle" />
        <Line yAxisId="sentiment" type="monotone" dataKey="sentiment" stroke="#10B981" strokeWidth={2} dot={false} name="Sentiment Score" />
        <Line yAxisId="price" type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} dot={false} name="Stock Price" />
      </LineChart>
    </ResponsiveContainer>
  );
}
