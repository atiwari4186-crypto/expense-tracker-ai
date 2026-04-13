import { Expense } from "@/types/expense";
import { formatDate } from "./utils";

export function exportToCSV(expenses: Expense[], filename = "expenses.csv"): void {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
