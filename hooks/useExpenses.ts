"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import {
  Expense,
  ExpenseFilters,
  CategorySummary,
  MonthlySummary,
  CATEGORIES,
} from "@/types/expense";
import { generateId, getMonthLabel, getTodayString, getMonthStart } from "@/lib/utils";

const STORAGE_KEY = "expense-tracker-expenses";

const SEED_EXPENSES: Expense[] = [
  {
    id: "seed-1",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; })(),
    amount: 45.5,
    category: "Food",
    description: "Grocery shopping at Whole Foods",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 4); return d.toISOString().split("T")[0]; })(),
    amount: 120.0,
    category: "Bills",
    description: "Monthly electricity bill",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().split("T")[0]; })(),
    amount: 35.0,
    category: "Transportation",
    description: "Gas station fill-up",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-4",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 8); return d.toISOString().split("T")[0]; })(),
    amount: 60.0,
    category: "Entertainment",
    description: "Netflix & Spotify subscriptions",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-5",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 10); return d.toISOString().split("T")[0]; })(),
    amount: 89.99,
    category: "Shopping",
    description: "Amazon order - books",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-6",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 12); return d.toISOString().split("T")[0]; })(),
    amount: 22.75,
    category: "Food",
    description: "Lunch at local restaurant",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-7",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 20); return d.toISOString().split("T")[0]; })(),
    amount: 15.0,
    category: "Transportation",
    description: "Uber ride to airport",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-8",
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 25); return d.toISOString().split("T")[0]; })(),
    amount: 200.0,
    category: "Bills",
    description: "Internet & phone plan",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useExpenses() {
  const [expenses, setExpenses, isLoaded] = useLocalStorage<Expense[]>(
    STORAGE_KEY,
    SEED_EXPENSES
  );

  const addExpense = useCallback(
    (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newExpense: Expense = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    },
    [setExpenses]
  );

  const updateExpense = useCallback(
    (id: string, data: Partial<Omit<Expense, "id" | "createdAt">>) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
        )
      );
    },
    [setExpenses]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [setExpenses]
  );

  const getFilteredExpenses = useCallback(
    (filters: ExpenseFilters): Expense[] => {
      return expenses
        .filter((e) => {
          const matchesSearch =
            !filters.search ||
            e.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            e.category.toLowerCase().includes(filters.search.toLowerCase());

          const matchesCategory =
            filters.category === "All" || e.category === filters.category;

          const matchesDateFrom = !filters.dateFrom || e.date >= filters.dateFrom;
          const matchesDateTo = !filters.dateTo || e.date <= filters.dateTo;

          return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
        })
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },
    [expenses]
  );

  const stats = useMemo(() => {
    const today = getTodayString();
    const monthStart = getMonthStart();

    const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalThisMonth = expenses
      .filter((e) => e.date >= monthStart && e.date <= today)
      .reduce((sum, e) => sum + e.amount, 0);

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthStart = getMonthStart(lastMonthDate);
    const lastMonthEnd = new Date(
      lastMonthDate.getFullYear(),
      lastMonthDate.getMonth() + 1,
      0
    );
    const lastMonthEndStr = lastMonthEnd.toISOString().split("T")[0];
    const totalLastMonth = expenses
      .filter((e) => e.date >= lastMonthStart && e.date <= lastMonthEndStr)
      .reduce((sum, e) => sum + e.amount, 0);

    // Category summaries
    const categoryMap = new Map<string, { total: number; count: number }>();
    expenses.forEach((e) => {
      const existing = categoryMap.get(e.category) || { total: 0, count: 0 };
      categoryMap.set(e.category, {
        total: existing.total + e.amount,
        count: existing.count + 1,
      });
    });

    const categorySummaries: CategorySummary[] = CATEGORIES.map((cat) => {
      const data = categoryMap.get(cat) || { total: 0, count: 0 };
      return {
        category: cat,
        total: data.total,
        count: data.count,
        percentage: totalAll > 0 ? (data.total / totalAll) * 100 : 0,
      };
    }).sort((a, b) => b.total - a.total);

    // Monthly summaries for last 6 months
    const monthlyMap = new Map<string, number>();
    expenses.forEach((e) => {
      const label = getMonthLabel(e.date);
      monthlyMap.set(label, (monthlyMap.get(label) || 0) + e.amount);
    });

    const now = new Date();
    const monthlySummaries: MonthlySummary[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthlySummaries.push({
        month: label,
        total: monthlyMap.get(label) || 0,
      });
    }

    return {
      totalAll,
      totalThisMonth,
      totalLastMonth,
      monthOverMonthChange:
        totalLastMonth > 0
          ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
          : null,
      categorySummaries,
      monthlySummaries,
      expenseCount: expenses.length,
    };
  }, [expenses]);

  return {
    expenses,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    getFilteredExpenses,
    stats,
  };
}
