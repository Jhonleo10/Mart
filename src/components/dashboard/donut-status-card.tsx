"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const PALETTE = ["#0076df", "#00c367", "#94a3b8", "#60a5fa", "#cbd5e1"];

interface DonutStatusCardProps {
  title: string;
  data: { name: string; value: number }[];
}

export function DonutStatusCard({ title, data }: DonutStatusCardProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = total > 0 ? data : [{ name: "Empty", value: 1 }];

  return (
    <div className="dash-panel">
      <h3 className="font-heading text-sm font-semibold text-slate-800">{title}</h3>
      <div className="relative mt-3 h-48 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={total > 0 ? PALETTE[i % PALETTE.length] : "#e2e8f0"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Total</span>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="truncate">
                {item.name} <span className="text-slate-400">{pct}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
