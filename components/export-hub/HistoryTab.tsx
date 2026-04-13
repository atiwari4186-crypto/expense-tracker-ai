"use client";

import { useCallback } from "react";
import { Download, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ExportHistoryEntry,
  FORMAT_COLORS,
  DESTINATION_ICONS,
  DESTINATION_LABELS,
} from "@/lib/exportCloud";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface HistoryTabProps {
  history: ExportHistoryEntry[];
  onClear: () => void;
}

export function HistoryTab({ history, onClear }: HistoryTabProps) {
  const successCount = history.filter((h) => h.status === "success").length;

  const handleRedownload = useCallback((entry: ExportHistoryEntry) => {
    // Simulate a re-download notification — in a real app this would re-fetch
    const link = document.createElement("a");
    link.href = "#";
    link.download = entry.filename;
    // We can't actually re-download without the original data, so we just notify the user
    alert(`Re-download initiated for "${entry.filename}"\n\nIn a production app, this would regenerate the export from your stored data.`);
  }, []);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="text-4xl">📭</div>
        <div>
          <p className="text-sm font-medium text-gray-600">No export history yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your exports will appear here after you run them
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Export History</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {successCount} successful · {history.length - successCount} failed
          </p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear history
        </button>
      </div>

      {/* Timeline list */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-100" />

        <div className="space-y-3">
          {history.map((entry) => {
            const fmtStyle = FORMAT_COLORS[entry.format];
            const isSuccess = entry.status === "success";

            return (
              <div key={entry.id} className="flex gap-4">
                {/* Timeline dot */}
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  <div
                    className={`h-[30px] w-[30px] rounded-full border-2 flex items-center justify-center text-xs
                      ${isSuccess
                        ? "border-green-300 bg-green-50 text-green-600"
                        : "border-red-200 bg-red-50 text-red-500"
                      }`}
                  >
                    {isSuccess ? "✓" : "✗"}
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{entry.label}</span>
                        <span
                          className="rounded-full px-1.5 py-0.5 text-xs font-bold uppercase"
                          style={{ backgroundColor: fmtStyle.bg, color: fmtStyle.text }}
                        >
                          {entry.format}
                        </span>
                        {!isSuccess && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                            Failed
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        <span>
                          {DESTINATION_ICONS[entry.destination]}{" "}
                          {DESTINATION_LABELS[entry.destination]}
                        </span>
                        <span>{entry.recordCount} records</span>
                        {entry.fileSizeKB > 0 && <span>{entry.fileSizeKB} KB</span>}
                        <span className="text-gray-400">{entry.filename}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{timeAgo(entry.timestamp)}</span>
                      {isSuccess && (
                        <button
                          onClick={() => handleRedownload(entry)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Re-run
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary footer */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {(["csv", "json", "pdf"] as const).map((fmt) => {
          const count = history.filter((h) => h.format === fmt && h.status === "success").length;
          const style = FORMAT_COLORS[fmt];
          return (
            <div
              key={fmt}
              className="rounded-xl border border-gray-200 bg-white p-3 text-center"
            >
              <div
                className="text-lg font-bold"
                style={{ color: style.text }}
              >
                {count}
              </div>
              <div className="text-xs text-gray-500 uppercase font-medium">{fmt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
