import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/ui/Badge";
import { Expense } from "@/types/expense";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recent = expenses.slice(0, 5);

  return (
    <Card padding="none">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900">Recent Expenses</h3>
          <p className="text-sm text-gray-500 mt-0.5">Latest transactions</p>
        </div>
        <Link
          href="/expenses"
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No expenses yet</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {recent.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <CategoryBadge category={expense.category} showIcon={false} />
                  <span className="text-xs text-gray-400">{formatDateShort(expense.date)}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
