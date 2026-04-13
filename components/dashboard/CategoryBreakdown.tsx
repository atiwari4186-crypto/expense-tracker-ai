"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { CategorySummary, CATEGORY_COLORS } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";

interface CategoryBreakdownProps {
  summaries: CategorySummary[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percentage: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">{item.name}</p>
        <p className="text-base font-bold text-gray-900 mt-0.5">
          {formatCurrency(item.value)}
        </p>
        <p className="text-xs text-gray-500">{item.payload.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export function CategoryBreakdown({ summaries }: CategoryBreakdownProps) {
  const filtered = summaries.filter((s) => s.total > 0);

  return (
    <Card>
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">By Category</h3>
        <p className="text-sm text-gray-500 mt-0.5">All-time breakdown</p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No data yet
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Pie chart */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={filtered}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="category"
                >
                  {filtered.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2.5">
            {filtered.map((s) => (
              <div key={s.category} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[s.category] }}
                />
                <span className="text-sm text-gray-600 flex-1 truncate">{s.category}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(s.total)}
                  </span>
                  <span className="text-xs text-gray-400 ml-1.5">
                    {s.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
