"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, ExpenseFilters as Filters } from "@/types/expense";
import { getMonthStart, getTodayString } from "@/lib/utils";

interface ExpenseFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
}

const categoryOptions = [
  { value: "All", label: "All Categories" },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function ExpenseFiltersPanel({ filters, onChange, resultCount }: ExpenseFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.category !== "All" ||
    filters.dateFrom ||
    filters.dateTo;

  const clearFilters = () => {
    onChange({
      search: "",
      category: "All",
      dateFrom: "",
      dateTo: "",
    });
  };

  const setThisMonth = () => {
    onChange({
      ...filters,
      dateFrom: getMonthStart(),
      dateTo: getTodayString(),
    });
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <Input
        placeholder="Search expenses..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[160px]">
          <Select
            options={categoryOptions}
            value={filters.category}
            onChange={(e) =>
              onChange({ ...filters, category: e.target.value as Filters["category"] })
            }
          />
        </div>
        <div className="flex-1 min-w-[130px]">
          <Input
            type="date"
            placeholder="From"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          />
        </div>
        <div className="flex-1 min-w-[130px]">
          <Input
            type="date"
            placeholder="To"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          />
        </div>
      </div>

      {/* Quick filters & result count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={setThisMonth}
            className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors font-medium"
          >
            This Month
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {resultCount} {resultCount === 1 ? "expense" : "expenses"}
        </p>
      </div>
    </div>
  );
}
