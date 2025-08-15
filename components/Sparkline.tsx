"use client";
import * as React from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";

export type SparkPoint = { date: string; count: number };

export function Sparkline({ data, height = 80, color = "#284E4C" }: { data: SparkPoint[]; height?: number; color?: string }) {
  return (
    <div className="w-full h-[120px]">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide tickLine={false} axisLine={false} />
          <YAxis hide domain={[0, "dataMax+1"]} />
          <Tooltip formatter={(v: number) => [`${v} reviews`, "Count"]} labelFormatter={(l) => `${l}`} />
          <Area type="monotone" dataKey="count" stroke={color} fillOpacity={1} fill="url(#sparkGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
