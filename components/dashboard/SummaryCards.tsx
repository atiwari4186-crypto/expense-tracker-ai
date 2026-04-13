import { TrendingUp, TrendingDown, Wallet, CalendarDays, Hash } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  totalAll: number;
  totalThisMonth: number;
  totalLastMonth: number;
  monthOverMonthChange: number | null;
  expenseCount: number;
}

export function SummaryCards({
  totalAll,
  totalThisMonth,
  totalLastMonth,
  monthOverMonthChange,
  expenseCount,
}: SummaryCardsProps) {
  const isPositiveChange = monthOverMonthChange !== null && monthOverMonthChange > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Spent */}
      <Card className="col-span-2 lg:col-span-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Spent
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1.5">
              {formatCurrency(totalAll)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Wallet className="h-5 w-5 text-primary-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">All time</p>
      </Card>

      {/* This Month */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              This Month
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1.5">
              {formatCurrency(totalThisMonth)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        {monthOverMonthChange !== null ? (
          <div className="flex items-center gap-1 mt-2">
            {isPositiveChange ? (
              <TrendingUp className="h-3 w-3 text-red-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-green-500" />
            )}
            <p
              className={`text-xs font-medium ${
                isPositiveChange ? "text-red-500" : "text-green-600"
              }`}
            >
              {Math.abs(monthOverMonthChange).toFixed(1)}% vs last month
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mt-2">No prior month data</p>
        )}
      </Card>

      {/* Last Month */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Last Month
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1.5">
              {formatCurrency(totalLastMonth)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Previous month</p>
      </Card>

      {/* Total Transactions */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Transactions
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1.5">{expenseCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Hash className="h-5 w-5 text-orange-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">All time</p>
      </Card>
    </div>
  );
}
