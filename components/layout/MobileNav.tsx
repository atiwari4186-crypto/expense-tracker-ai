"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onAddExpense: () => void;
}

export function MobileNav({ onAddExpense }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around py-2 px-4">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors",
            pathname === "/"
              ? "text-primary-600"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </Link>

        <button
          onClick={onAddExpense}
          className="flex flex-col items-center gap-0.5 bg-primary-600 text-white px-5 py-2 rounded-2xl shadow-lg"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="text-xs font-medium">Add</span>
        </button>

        <Link
          href="/expenses"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors",
            pathname === "/expenses"
              ? "text-primary-600"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Receipt className="h-5 w-5" />
          <span className="text-xs font-medium">Expenses</span>
        </Link>
      </div>
    </nav>
  );
}
