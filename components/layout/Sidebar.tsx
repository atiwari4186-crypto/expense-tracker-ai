"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PlusCircle, Download, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
];

interface SidebarProps {
  onAddExpense: () => void;
  onExport: () => void;
}

export function Sidebar({ onAddExpense, onExport }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-gray-950 text-white fixed left-0 top-0 bottom-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">SpendWise</p>
          <p className="text-xs text-gray-400">Expense Tracker</p>
        </div>
      </div>

      {/* Add Expense CTA */}
      <div className="px-4 pt-5">
        <button
          onClick={onAddExpense}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4">
        <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
              pathname === href
                ? "bg-primary-600/20 text-primary-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Export */}
      <div className="px-4 pb-6">
        <button
          onClick={onExport}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
    </aside>
  );
}
