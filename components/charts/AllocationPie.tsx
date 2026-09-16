"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AllocationPieProps {
  data: { name: string; value: number }[];
  title: string;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function AllocationPie({ data, title }: AllocationPieProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#12141C" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#12141C",
              border: "1px solid #1F2230",
              borderRadius: "0.75rem",
              color: "#F5F7FA",
            }}
            formatter={(v: number) => [`\u20B9${v.toLocaleString("en-IN")}`, "Value"]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#8B92A8" }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
