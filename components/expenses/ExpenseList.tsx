"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { Expense, ExpenseFilters } from "@/types/expense";
import { ExpenseItem } from "./ExpenseItem";
import { ExpenseFiltersPanel } from "./ExpenseFilters";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  allExpenses: Expense[];
  filters: ExpenseFilters;
  onFilterChange: (f: ExpenseFilters) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({
  expenses,
  allExpenses,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  // Group by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, expense) => {
    if (!acc[expense.date]) acc[expense.date] = [];
    acc[expense.date].push(expense);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <Card>
        <ExpenseFiltersPanel
          filters={filters}
          onChange={onFilterChange}
          resultCount={expenses.length}
        />
      </Card>

      {expenses.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Receipt className="h-7 w-7 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">No expenses found</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {allExpenses.length === 0
                  ? "Add your first expense to get started"
                  : "Try adjusting your filters"}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          {sortedDates.map((date, dateIdx) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {formatDate(date)}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">
                  {grouped[date].length} {grouped[date].length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Expenses for this date */}
              <div className="divide-y divide-gray-50">
                {grouped[date].map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
