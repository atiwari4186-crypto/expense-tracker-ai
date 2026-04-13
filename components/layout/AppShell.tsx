"use client";

import { useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TopBar } from "./TopBar";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { useExpenseContext } from "@/context/ExpenseContext";
import { Expense } from "@/types/expense";
import { exportToCSV } from "@/lib/export";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showExport?: boolean;
}

export function AppShell({ children, title, subtitle, showExport }: AppShellProps) {
  const {
    expenses,
    addExpense,
    updateExpense,
    isAddModalOpen,
    isEditModalOpen,
    editingExpense,
    openAddModal,
    closeAddModal,
    closeEditModal,
  } = useExpenseContext();

  const handleAddExpense = useCallback(
    (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      addExpense(data);
      closeAddModal();
    },
    [addExpense, closeAddModal]
  );

  const handleEditExpense = useCallback(
    (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      if (editingExpense) {
        updateExpense(editingExpense.id, data);
        closeEditModal();
      }
    },
    [editingExpense, updateExpense, closeEditModal]
  );

  const handleExport = useCallback(() => {
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
    exportToCSV(sorted, "spendwise-expenses.csv");
  }, [expenses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onAddExpense={openAddModal} onExport={handleExport} />

      {/* Main content */}
      <div className="lg:pl-60">
        <TopBar
          title={title}
          subtitle={subtitle}
          onAddExpense={openAddModal}
          onExport={showExport ? handleExport : undefined}
        />
        <main className="px-4 lg:px-8 py-6 pb-24 lg:pb-8">{children}</main>
      </div>

      <MobileNav onAddExpense={openAddModal} />

      {/* Add Expense Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add Expense">
        <ExpenseForm onSubmit={handleAddExpense} onCancel={closeAddModal} />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            onSubmit={handleEditExpense}
            onCancel={closeEditModal}
            initialValues={editingExpense}
            isEditing
          />
        )}
      </Modal>
    </div>
  );
}
