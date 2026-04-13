"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryCards } from "./SummaryCards";
import { SpendingChart } from "./SpendingChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { RecentExpenses } from "./RecentExpenses";
import { useExpenseContext } from "@/context/ExpenseContext";
import { ExportDrawer } from "@/components/export/ExportDrawer";
import { Button } from "@/components/ui/Button";

export function DashboardClient() {
  const { expenses, stats, isLoaded } = useExpenseContext();
  const [isExportOpen, setIsExportOpen] = useState(false);

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
    <>
      <ExportDrawer
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        expenses={expenses}
      />
    <AppShell title="Dashboard" subtitle="Your financial overview">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setIsExportOpen(true)}>
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
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
      </div>
    </AppShell>
    </>
  );
}
