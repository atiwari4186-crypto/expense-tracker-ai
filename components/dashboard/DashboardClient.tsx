"use client";

import Link from "next/link";
import { Share2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryCards } from "./SummaryCards";
import { SpendingChart } from "./SpendingChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { RecentExpenses } from "./RecentExpenses";
import { useExpenseContext } from "@/context/ExpenseContext";

export function DashboardClient() {
  const { expenses, stats, isLoaded } = useExpenseContext();

  if (!isLoaded) {
    return (
      <AppShell title="Dashboard" subtitle="Your financial overview">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-500">Loading your expenses...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard" subtitle="Your financial overview">
      <div className="space-y-6">
        {/* Summary cards */}
        <SummaryCards
          totalAll={stats.totalAll}
          totalThisMonth={stats.totalThisMonth}
          totalLastMonth={stats.totalLastMonth}
          monthOverMonthChange={stats.monthOverMonthChange}
          expenseCount={stats.expenseCount}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpendingChart data={stats.monthlySummaries} />
          </div>
          <div>
            <CategoryBreakdown summaries={stats.categorySummaries} />
          </div>
        </div>

        {/* Recent expenses */}
        <RecentExpenses expenses={expenses} />

        {/* Export Hub callout */}
        <Link
          href="/export"
          className="group flex items-center gap-4 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-violet-50 p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
            <Share2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Export Hub</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Email reports, sync to Google Sheets, schedule backups, and more
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </AppShell>
  );
}
