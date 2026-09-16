"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { getPredictionSeries } from "@/lib/mockData";

export default function PredictionChart() {
  const data = getPredictionSeries();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2230" vertical={false} />
        <XAxis dataKey="date" stroke="#8B92A8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#8B92A8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `\u20B9${v.toFixed(0)}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12141C",
            border: "1px solid #1F2230",
            borderRadius: "0.75rem",
            color: "#F5F7FA",
          }}
          formatter={(v: number) => [`\u20B9${v.toFixed(2)}`, ""]}
        />
        <Legend wrapperStyle={{ fontSize: "12px", color: "#8B92A8" }} iconType="circle" />
        <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={false} name="Actual Price" />
        <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} dot={false} name="Predicted Price" strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}
