import { Expense } from "@/types/expense";
import { formatDate, formatCurrency } from "./utils";

export type ExportFormat = "csv" | "json" | "pdf";

function buildCSV(expenses: Expense[]): string {
  const headers = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(expenses: Expense[], filename: string) {
  triggerDownload(buildCSV(expenses), `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportJSON(expenses: Expense[], filename: string) {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  triggerDownload(
    JSON.stringify(data, null, 2),
    `${filename}.json`,
    "application/json"
  );
}

export function exportPDF(expenses: Expense[], filename: string) {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const rows = expenses
    .map(
      (e) => `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.category}</td>
        <td style="text-align:right">${formatCurrency(e.amount)}</td>
        <td>${e.description}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #111; padding: 32px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; color: #1a1a1a; }
    .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; border-bottom: 2px solid #e5e7eb; }
    th:nth-child(3) { text-align: right; }
    td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #374151; }
    td:nth-child(3) { text-align: right; font-variant-numeric: tabular-nums; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 20px; padding-top: 12px; border-top: 2px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 24px; }
    .footer .label { font-size: 12px; color: #6b7280; }
    .footer .value { font-weight: 700; font-size: 15px; color: #111; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>SpendWise — Expense Report</h1>
  <p class="meta">Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} · ${expenses.length} record${expenses.length !== 1 ? "s" : ""}</p>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Category</th><th>Amount</th><th>Description</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <div>
      <div class="label">Records</div>
      <div class="value">${expenses.length}</div>
    </div>
    <div>
      <div class="label">Total</div>
      <div class="value">${formatCurrency(totalAmount)}</div>
    </div>
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
