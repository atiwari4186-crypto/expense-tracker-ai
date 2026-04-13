"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  FileText,
  FileJson,
  FileType,
  Calendar,
  Tag,
  Download,
  Eye,
  ChevronRight,
  Check,
} from "lucide-react";
import { Expense, Category, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from "@/types/expense";
import { formatDate, formatCurrency } from "@/lib/utils";
import { exportCSV, exportJSON, exportPDF, ExportFormat } from "@/lib/exportAdvanced";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  ext: string;
}[] = [
  {
    id: "csv",
    label: "CSV",
    description: "Spreadsheet-compatible",
    icon: <FileText className="h-5 w-5" />,
    ext: ".csv",
  },
  {
    id: "json",
    label: "JSON",
    description: "Structured data",
    icon: <FileJson className="h-5 w-5" />,
    ext: ".json",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Print-ready report",
    icon: <FileType className="h-5 w-5" />,
    ext: ".pdf",
  },
];

type Tab = "options" | "preview";

export function ExportDrawer({ isOpen, onClose, expenses }: ExportDrawerProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(CATEGORIES)
  );
  const [filename, setFilename] = useState("expenses");
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("options");

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setFormat("csv");
      setStartDate("");
      setEndDate("");
      setSelectedCategories(new Set(CATEGORIES));
      setFilename("expenses");
      setIsExporting(false);
      setActiveTab("options");
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (startDate && e.date < startDate) return false;
        if (endDate && e.date > endDate) return false;
        if (!selectedCategories.has(e.category)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, startDate, endDate, selectedCategories]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const toggleAllCategories = useCallback(() => {
    setSelectedCategories((prev) =>
      prev.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES)
    );
  }, []);

  const handleExport = useCallback(async () => {
    if (filteredExpenses.length === 0) return;
    setIsExporting(true);
    // Small delay so the loading state renders before the browser download dialog
    await new Promise((r) => setTimeout(r, 300));
    const name = filename.trim() || "expenses";
    if (format === "csv") exportCSV(filteredExpenses, name);
    else if (format === "json") exportJSON(filteredExpenses, name);
    else exportPDF(filteredExpenses, name);
    setIsExporting(false);
  }, [filteredExpenses, format, filename]);

  const selectedExt = FORMAT_OPTIONS.find((f) => f.id === format)?.ext ?? "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Export Expenses</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure your export options</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {(["options", "preview"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative py-3 pr-6 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab === "options" ? "Options" : (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                  <span className={cn(
                    "ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                    filteredExpenses.length > 0
                      ? "bg-primary-100 text-primary-700"
                      : "bg-gray-100 text-gray-500"
                  )}>
                    {filteredExpenses.length}
                  </span>
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-6 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "options" ? (
            <div className="space-y-6 p-6">
              {/* Format */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Export Format
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFormat(opt.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-all",
                        format === opt.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {format === opt.id && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                      <span className={cn(
                        "transition-colors",
                        format === opt.id ? "text-primary-600" : "text-gray-400"
                      )}>
                        {opt.icon}
                      </span>
                      <div>
                        <div className={cn(
                          "text-sm font-semibold",
                          format === opt.id ? "text-primary-700" : "text-gray-700"
                        )}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-gray-400">{opt.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Date Range */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Date Range
                  <span className="ml-auto text-xs font-normal text-gray-400">
                    Leave blank for all dates
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="From"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="To"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </section>

              {/* Categories */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag className="h-4 w-4 text-gray-400" />
                  Categories
                  <button
                    onClick={toggleAllCategories}
                    className="ml-auto text-xs font-normal text-primary-600 hover:text-primary-700"
                  >
                    {selectedCategories.size === CATEGORIES.length ? "Deselect all" : "Select all"}
                  </button>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const color = CATEGORY_COLORS[cat];
                    const icon = CATEGORY_ICONS[cat];
                    const selected = selectedCategories.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                          selected
                            ? "border-transparent"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        )}
                        style={selected ? {
                          backgroundColor: `${color}12`,
                          borderColor: `${color}40`,
                        } : {}}
                      >
                        <span
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors"
                          style={selected ? { backgroundColor: color, borderColor: color } : { borderColor: "#d1d5db" }}
                        >
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <span className="text-sm">{icon}</span>
                        <span className={cn("font-medium", selected ? "text-gray-800" : "text-gray-500")}>
                          {cat}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Filename */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Filename</h3>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="File name"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="expenses"
                    />
                  </div>
                  <div className="mb-0.5 flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                    {selectedExt}
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <PreviewPanel expenses={filteredExpenses} totalAmount={totalAmount} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          {/* Summary strip */}
          <div className="mb-4 flex items-center justify-between rounded-lg bg-white border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">Records </span>
                <span className="font-semibold text-gray-900">{filteredExpenses.length}</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div>
                <span className="text-gray-500">Total </span>
                <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === "options" ? "preview" : "options")}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
            >
              {activeTab === "options" ? "Preview" : "Options"}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleExport}
              loading={isExporting}
              disabled={filteredExpenses.length === 0}
            >
              {!isExporting && <Download className="h-4 w-4" />}
              {isExporting
                ? "Exporting…"
                : `Export ${filteredExpenses.length} record${filteredExpenses.length !== 1 ? "s" : ""}`}
            </Button>
          </div>

          {filteredExpenses.length === 0 && (
            <p className="mt-2 text-center text-xs text-amber-600">
              No records match the selected filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ expenses, totalAmount }: { expenses: Expense[]; totalAmount: number }) {
  const PREVIEW_LIMIT = 50;
  const shown = expenses.slice(0, PREVIEW_LIMIT);
  const remaining = expenses.length - shown.length;

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 text-4xl">📭</div>
        <p className="text-sm font-medium text-gray-600">No records match your filters</p>
        <p className="mt-1 text-xs text-gray-400">Try adjusting the date range or categories</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats row */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Records" value={String(expenses.length)} />
        <StatCard label="Total" value={formatCurrency(totalAmount)} />
        <StatCard
          label="Avg / record"
          value={formatCurrency(expenses.length ? totalAmount / expenses.length : 0)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Amount
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shown.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(e.date)}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[e.category]}18`,
                      color: CATEGORY_COLORS[e.category],
                    }}
                  >
                    {CATEGORY_ICONS[e.category]} {e.category}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-semibold tabular-nums text-gray-900">
                  {formatCurrency(e.amount)}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[140px] truncate">
                  {e.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {remaining > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-3 py-2.5 text-center text-xs text-gray-500">
            + {remaining} more record{remaining !== 1 ? "s" : ""} not shown in preview
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-gray-900 truncate">{value}</div>
    </div>
  );
}
