"use client";

import { Download, PlusCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onAddExpense: () => void;
  onExport?: () => void;
}

export function TopBar({ title, subtitle, onAddExpense, onExport }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">SpendWise</span>
        </div>

        {/* Desktop title */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="hidden sm:flex">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          <Button size="sm" onClick={onAddExpense}>
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
