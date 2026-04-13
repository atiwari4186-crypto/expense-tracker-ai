"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { MonthlySummary } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";

interface SpendingChartProps {
  data: MonthlySummary[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-lg font-bold text-primary-600 mt-0.5">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Spending Over Time</h3>
          <p className="text-sm text-gray-500 mt-0.5">Last 6 months</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#spendGradient)"
            dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
