"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExpenseList } from "./ExpenseList";
import { useExpenseContext } from "@/context/ExpenseContext";
import { ExpenseFilters } from "@/types/expense";
import { getTodayString } from "@/lib/utils";

const DEFAULT_FILTERS: ExpenseFilters = {
  search: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
};

export function ExpensesClient() {
  const { expenses, isLoaded, deleteExpense, getFilteredExpenses, openEditModal } =
    useExpenseContext();
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => getFilteredExpenses(filters),
    [getFilteredExpenses, filters]
  );

  if (!isLoaded) {
    return (
      <AppShell title="Expenses" subtitle="Manage your transactions" showExport>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Expenses" subtitle="Manage your transactions" showExport>
      <ExpenseList
        expenses={filtered}
        allExpenses={expenses}
        filters={filters}
        onFilterChange={setFilters}
        onEdit={openEditModal}
        onDelete={deleteExpense}
      />
    </AppShell>
  );
}
