import { Expense, Category, CATEGORY_COLORS } from "@/types/expense";
import { formatDate, formatCurrency, getTodayString } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "json" | "pdf";
export type ExportDestination =
  | "download"
  | "email"
  | "google-drive"
  | "dropbox"
  | "onedrive"
  | "notion";
export type ScheduleFrequency = "daily" | "weekly" | "monthly";
export type DateRangePreset =
  | "current-month"
  | "last-month"
  | "ytd"
  | "last-year"
  | "all-time";

export interface ExportHistoryEntry {
  id: string;
  timestamp: string; // ISO
  label: string;
  format: ExportFormat;
  recordCount: number;
  destination: ExportDestination;
  status: "success" | "failed";
  filename: string;
  fileSizeKB: number;
}

export interface ExportSchedule {
  id: string;
  enabled: boolean;
  label: string;
  frequency: ScheduleFrequency;
  format: ExportFormat;
  destination: ExportDestination;
  email?: string;
  nextRun: string; // ISO
  lastRun?: string; // ISO
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  format: ExportFormat;
  categories: Category[] | "all";
  dateRange: DateRangePreset;
  color: string;
  usageCount: number;
  lastUsed?: string; // ISO
}

export interface CloudIntegration {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  bgColor: string;
  connected: boolean;
  connectedAt?: string; // ISO
  accountEmail?: string;
}

// ── Date range helpers ────────────────────────────────────────────────────────

export function resolveDateRange(preset: DateRangePreset): { from: string; to: string } {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth();

  switch (preset) {
    case "current-month":
      return {
        from: `${yyyy}-${String(mm + 1).padStart(2, "0")}-01`,
        to: getTodayString(),
      };
    case "last-month": {
      const first = new Date(yyyy, mm - 1, 1);
      const last = new Date(yyyy, mm, 0);
      return {
        from: first.toISOString().split("T")[0],
        to: last.toISOString().split("T")[0],
      };
    }
    case "ytd":
      return { from: `${yyyy}-01-01`, to: getTodayString() };
    case "last-year":
      return { from: `${yyyy - 1}-01-01`, to: `${yyyy - 1}-12-31` };
    case "all-time":
    default:
      return { from: "", to: "" };
  }
}

export const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  "current-month": "This month",
  "last-month": "Last month",
  ytd: "Year to date",
  "last-year": "Last year",
  "all-time": "All time",
};

export function filterExpensesForTemplate(
  expenses: Expense[],
  template: ExportTemplate
): Expense[] {
  const { from, to } = resolveDateRange(template.dateRange);
  return expenses
    .filter((e) => {
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      if (template.categories !== "all" && !(template.categories as Category[]).includes(e.category))
        return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ── Actual file export functions ──────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function doExportCSV(expenses: Expense[], filename: string) {
  const headers = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const content = [headers, ...rows].map((r) => r.join(",")).join("\n");
  triggerDownload(content, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function doExportJSON(expenses: Expense[], filename: string) {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  triggerDownload(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
}

export function doExportPDF(expenses: Expense[], label: string) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const rows = expenses
    .map(
      (e) => `<tr>
      <td>${formatDate(e.date)}</td>
      <td><span style="color:${CATEGORY_COLORS[e.category]};font-weight:600">${e.category}</span></td>
      <td style="text-align:right">${formatCurrency(e.amount)}</td>
      <td>${e.description}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${label}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#111;padding:40px}
  h1{font-size:20px;font-weight:700;margin-bottom:4px}
  .meta{font-size:12px;color:#888;margin-bottom:28px}
  table{width:100%;border-collapse:collapse}
  th{background:#f9fafb;text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;border-bottom:2px solid #e5e7eb}
  th:nth-child(3){text-align:right}
  td{padding:9px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top}
  td:nth-child(3){text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
  .total{margin-top:16px;padding-top:12px;border-top:2px solid #e5e7eb;display:flex;justify-content:flex-end;gap:20px}
  .total-label{font-size:12px;color:#6b7280;text-align:right}
  .total-value{font-weight:700;font-size:16px}
  @media print{body{padding:0}}
</style></head><body>
<h1>SpendWise — ${label}</h1>
<p class="meta">Generated on ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} &nbsp;·&nbsp; ${expenses.length} record${expenses.length !== 1 ? "s" : ""}</p>
<table>
  <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="total">
  <div><div class="total-label">Records</div><div class="total-value">${expenses.length}</div></div>
  <div><div class="total-label">Total</div><div class="total-value">${formatCurrency(total)}</div></div>
</div>
<script>window.onload=()=>window.print()<\/script>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export function doExport(expenses: Expense[], format: ExportFormat, filename: string) {
  if (format === "csv") doExportCSV(expenses, filename);
  else if (format === "json") doExportJSON(expenses, filename);
  else doExportPDF(expenses, filename);
}

export function estimateFileSizeKB(expenses: Expense[], format: ExportFormat): number {
  const base = expenses.length;
  if (format === "csv") return Math.max(1, Math.round(base * 0.08));
  if (format === "json") return Math.max(1, Math.round(base * 0.25));
  return Math.max(5, Math.round(base * 0.6));
}

// ── Seed helpers ──────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function nextRun(freq: ScheduleFrequency): string {
  const d = new Date();
  if (freq === "daily") {
    d.setDate(d.getDate() + 1);
  } else if (freq === "weekly") {
    const daysUntilMonday = (7 - d.getDay() + 1) % 7 || 7;
    d.setDate(d.getDate() + daysUntilMonday);
  } else {
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
  }
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

// ── Default data ──────────────────────────────────────────────────────────────

export const DEFAULT_TEMPLATES: ExportTemplate[] = [
  {
    id: "tpl-tax",
    name: "Tax Report",
    description: "Full year expenses — ready for your accountant or tax software.",
    icon: "📋",
    format: "pdf",
    categories: "all",
    dateRange: "ytd",
    color: "#ef4444",
    usageCount: 3,
    lastUsed: daysAgo(14),
  },
  {
    id: "tpl-monthly",
    name: "Monthly Summary",
    description: "This month's spending across all categories in spreadsheet format.",
    icon: "📅",
    format: "csv",
    categories: "all",
    dateRange: "current-month",
    color: "#3b82f6",
    usageCount: 7,
    lastUsed: daysAgo(3),
  },
  {
    id: "tpl-analysis",
    name: "Category Analysis",
    description: "All expenses with full metadata — ideal for data pipelines.",
    icon: "📊",
    format: "json",
    categories: "all",
    dateRange: "all-time",
    color: "#8b5cf6",
    usageCount: 2,
    lastUsed: daysAgo(30),
  },
  {
    id: "tpl-commute",
    name: "Food & Transport",
    description: "Daily spending on food and getting around, last month.",
    icon: "🚗",
    format: "csv",
    categories: ["Food", "Transportation"],
    dateRange: "last-month",
    color: "#f97316",
    usageCount: 1,
  },
];

export const DEFAULT_HISTORY: ExportHistoryEntry[] = [
  {
    id: "h1",
    timestamp: daysAgo(1),
    label: "Monthly Summary",
    format: "csv",
    recordCount: 12,
    destination: "download",
    status: "success",
    filename: "monthly-summary.csv",
    fileSizeKB: 3,
  },
  {
    id: "h2",
    timestamp: daysAgo(3),
    label: "Tax Report",
    format: "pdf",
    recordCount: 47,
    destination: "email",
    status: "success",
    filename: "tax-report.pdf",
    fileSizeKB: 28,
  },
  {
    id: "h3",
    timestamp: daysAgo(5),
    label: "Category Analysis",
    format: "json",
    recordCount: 47,
    destination: "google-drive",
    status: "success",
    filename: "category-analysis.json",
    fileSizeKB: 12,
  },
  {
    id: "h4",
    timestamp: daysAgo(8),
    label: "Manual Export",
    format: "csv",
    recordCount: 47,
    destination: "download",
    status: "success",
    filename: "expenses.csv",
    fileSizeKB: 8,
  },
  {
    id: "h5",
    timestamp: daysAgo(12),
    label: "Monthly Summary",
    format: "csv",
    recordCount: 9,
    destination: "dropbox",
    status: "failed",
    filename: "monthly-summary.csv",
    fileSizeKB: 0,
  },
  {
    id: "h6",
    timestamp: daysAgo(15),
    label: "Food & Transport",
    format: "csv",
    recordCount: 18,
    destination: "download",
    status: "success",
    filename: "food-transport.csv",
    fileSizeKB: 4,
  },
];

export const DEFAULT_SCHEDULES: ExportSchedule[] = [
  {
    id: "sch-1",
    enabled: true,
    label: "Monthly Summary → Email",
    frequency: "monthly",
    format: "csv",
    destination: "email",
    email: "me@example.com",
    nextRun: nextRun("monthly"),
    lastRun: daysAgo(30),
  },
  {
    id: "sch-2",
    enabled: false,
    label: "Weekly Backup → Google Drive",
    frequency: "weekly",
    format: "json",
    destination: "google-drive",
    nextRun: nextRun("weekly"),
  },
];

export const DEFAULT_INTEGRATIONS: CloudIntegration[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    tagline: "Sync expenses to a live spreadsheet in real time",
    icon: "📊",
    color: "#34a853",
    bgColor: "#f0fdf4",
    connected: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    tagline: "Auto-backup every export directly to your Drive",
    icon: "🗂️",
    color: "#4285f4",
    bgColor: "#eff6ff",
    connected: false,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    tagline: "Save exports to a dedicated Dropbox folder",
    icon: "📦",
    color: "#0061ff",
    bgColor: "#eff6ff",
    connected: false,
  },
  {
    id: "onedrive",
    name: "OneDrive",
    tagline: "Sync exports with Microsoft OneDrive automatically",
    icon: "☁️",
    color: "#0078d4",
    bgColor: "#f0f9ff",
    connected: false,
  },
  {
    id: "notion",
    name: "Notion",
    tagline: "Push new expenses to a Notion database page",
    icon: "🗒️",
    color: "#374151",
    bgColor: "#f9fafb",
    connected: false,
  },
  {
    id: "airtable",
    name: "Airtable",
    tagline: "Append expenses as rows in an Airtable base",
    icon: "🔶",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    connected: false,
  },
];

export const FORMAT_COLORS: Record<ExportFormat, { bg: string; text: string; label: string }> = {
  csv: { bg: "#dcfce7", text: "#15803d", label: "CSV" },
  json: { bg: "#dbeafe", text: "#1d4ed8", label: "JSON" },
  pdf: { bg: "#fee2e2", text: "#b91c1c", label: "PDF" },
};

export const DESTINATION_LABELS: Record<ExportDestination, string> = {
  download: "Downloaded",
  email: "Emailed",
  "google-drive": "Google Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
  notion: "Notion",
};

export const DESTINATION_ICONS: Record<ExportDestination, string> = {
  download: "⬇️",
  email: "✉️",
  "google-drive": "🗂️",
  dropbox: "📦",
  onedrive: "☁️",
  notion: "🗒️",
};

export const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
};
