"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { modelResults } from "@/lib/mockData";

export default function ModelComparisonChart() {
  const data = modelResults.map((m) => ({ name: m.name, accuracy: m.accuracy, best: m.best }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 50, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2230" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
        <YAxis type="category" dataKey="name" stroke="#8B92A8" fontSize={12} tickLine={false} axisLine={false} width={130} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12141C",
            border: "1px solid #1F2230",
            borderRadius: "0.75rem",
            color: "#F5F7FA",
          }}
          formatter={(v: number) => [`${v}%`, "Accuracy"]}
        />
        <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={28}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.best ? "#10B981" : "#3B82F6"} />
          ))}
          <LabelList dataKey="accuracy" position="right" formatter={(v: number) => `${v}%`} style={{ fill: "#8B92A8", fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
