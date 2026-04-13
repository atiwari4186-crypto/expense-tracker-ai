"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Expense } from "@/types/expense";
import { CategoryBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(expense.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
      {/* Date */}
      <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase leading-none">
          {formatDate(expense.date).split(" ")[0]}
        </span>
        <span className="text-lg font-bold text-gray-800 leading-tight">
          {formatDate(expense.date).split(" ")[1].replace(",", "")}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <CategoryBadge category={expense.category} />
          <span className="text-xs text-gray-400 sm:hidden">{formatDate(expense.date)}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-base font-bold text-gray-900">
          {formatCurrency(expense.amount)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit expense"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-lg transition-colors ${
              confirmDelete
                ? "text-white bg-red-500 hover:bg-red-600"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            }`}
            title={confirmDelete ? "Click again to confirm" : "Delete expense"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
