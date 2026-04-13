"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense, ExpenseFilters } from "@/types/expense";

interface ExpenseContextValue {
  // Data
  expenses: Expense[];
  isLoaded: boolean;
  stats: ReturnType<typeof useExpenses>["stats"];
  // Actions
  addExpense: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Expense;
  updateExpense: (id: string, data: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  deleteExpense: (id: string) => void;
  getFilteredExpenses: (filters: ExpenseFilters) => Expense[];
  // Modal controls
  openAddModal: () => void;
  openEditModal: (expense: Expense) => void;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  editingExpense: Expense | null;
  closeAddModal: () => void;
  closeEditModal: () => void;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const expenseHook = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const openAddModal = useCallback(() => setIsAddModalOpen(true), []);
  const closeAddModal = useCallback(() => setIsAddModalOpen(false), []);
  const openEditModal = useCallback((expense: Expense) => setEditingExpense(expense), []);
  const closeEditModal = useCallback(() => setEditingExpense(null), []);

  return (
    <ExpenseContext.Provider
      value={{
        ...expenseHook,
        isAddModalOpen,
        isEditModalOpen: !!editingExpense,
        editingExpense,
        openAddModal,
        closeAddModal,
        openEditModal,
        closeEditModal,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenseContext must be used within ExpenseProvider");
  return ctx;
}
