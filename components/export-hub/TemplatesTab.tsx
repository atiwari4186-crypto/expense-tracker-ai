"use client";

import { useState, useCallback } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ExportTemplate,
  ExportHistoryEntry,
  filterExpensesForTemplate,
  doExport,
  estimateFileSizeKB,
  FORMAT_COLORS,
  DATE_RANGE_LABELS,
} from "@/lib/exportCloud";
import { Expense } from "@/types/expense";
import { generateId } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

interface TemplatesTabProps {
  templates: ExportTemplate[];
  expenses: Expense[];
  onTemplateUsed: (templateId: string, entry: ExportHistoryEntry) => void;
}

export function TemplatesTab({ templates, expenses, onTemplateUsed }: TemplatesTabProps) {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [justExportedId, setJustExportedId] = useState<string | null>(null);

  const handleExport = useCallback(
    async (template: ExportTemplate) => {
      setExportingId(template.id);
      const filtered = filterExpensesForTemplate(expenses, template);
      await new Promise((r) => setTimeout(r, 500));

      const filename = template.name.toLowerCase().replace(/\s+/g, "-");
      doExport(filtered, template.format, filename);

      const entry: ExportHistoryEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        label: template.name,
        format: template.format,
        recordCount: filtered.length,
        destination: "download",
        status: "success",
        filename: `${filename}.${template.format}`,
        fileSizeKB: estimateFileSizeKB(filtered, template.format),
      };

      onTemplateUsed(template.id, entry);
      setExportingId(null);
      setJustExportedId(template.id);
      setTimeout(() => setJustExportedId(null), 2500);
    },
    [expenses, onTemplateUsed]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Export Templates</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            One-click exports pre-configured for common reporting needs
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {templates.length} templates
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const filtered = filterExpensesForTemplate(expenses, tpl);
          const fmtStyle = FORMAT_COLORS[tpl.format];
          const isExporting = exportingId === tpl.id;
          const justExported = justExportedId === tpl.id;

          return (
            <div
              key={tpl.id}
              className="group relative flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Color accent bar */}
              <div
                className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                style={{ backgroundColor: tpl.color }}
              />

              <div className="pl-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{tpl.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{tpl.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: fmtStyle.bg, color: fmtStyle.text }}
                  >
                    {fmtStyle.label}
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                    {DATE_RANGE_LABELS[tpl.dateRange]}
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                    {tpl.categories === "all"
                      ? "All categories"
                      : `${(tpl.categories as string[]).join(", ")}`}
                  </span>
                </div>

                {/* Stats row */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""} match
                  </span>
                  <span>
                    {tpl.lastUsed
                      ? `Last used ${timeAgo(tpl.lastUsed)}`
                      : "Never used"}
                    {tpl.usageCount > 0 && ` · ${tpl.usageCount}×`}
                  </span>
                </div>

                {/* Export button */}
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant={justExported ? "secondary" : "primary"}
                    className={cn(
                      "w-full transition-all",
                      justExported && "bg-green-100 text-green-700 border-green-200"
                    )}
                    onClick={() => handleExport(tpl)}
                    loading={isExporting}
                    disabled={filtered.length === 0 || isExporting}
                  >
                    {!isExporting && (
                      justExported
                        ? <Check className="h-3.5 w-3.5" />
                        : <Download className="h-3.5 w-3.5" />
                    )}
                    {isExporting
                      ? "Exporting…"
                      : justExported
                      ? "Exported!"
                      : filtered.length === 0
                      ? "No matching records"
                      : `Export ${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-gray-400">
        Templates use your current data — results update as you add expenses.
      </p>
    </div>
  );
}
