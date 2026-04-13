# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (also runs type check)
npm run type-check   # TypeScript check only, no emit
npm run lint         # ESLint via next lint
```

## Architecture

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS · Recharts · React Hook Form + Zod · localStorage

**Data flow:** All expense data lives in `localStorage` via `useLocalStorage` hook → `useExpenses` hook computes derived stats (monthly/category summaries) via `useMemo` → `ExpenseProvider` context wraps the entire app and exposes data + modal state to all pages.

**Key directories:**

- `app/` — Next.js App Router pages (thin, just import client components)
- `components/dashboard/` — Summary cards, spending area chart, category pie chart, recent list
- `components/expenses/` — Expense list (grouped by date), item row, filter panel, add/edit form
- `components/layout/` — `AppShell` (wraps every page with sidebar + modals), `Sidebar` (desktop), `MobileNav` (bottom tab bar), `TopBar`
- `components/ui/` — Reusable primitives: `Button`, `Input`, `Select`, `Card`, `Badge`, `Modal`
- `context/ExpenseContext.tsx` — Single context providing all expense data and modal open/close controls
- `hooks/useExpenses.ts` — CRUD operations + computed stats; seeded with sample data on first load
- `lib/` — `utils.ts` (currency/date formatting, ID generation), `export.ts` (CSV download)
- `types/expense.ts` — All TypeScript types plus category constants, colors, and icons

**Modal pattern:** Edit and Add modals live in `AppShell`. Any child component triggers them via `useExpenseContext().openEditModal(expense)` or `openAddModal()` — no prop drilling required.

**Adding a new category:** Update `CATEGORIES`, `CATEGORY_COLORS`, and `CATEGORY_ICONS` in `types/expense.ts` — everything else picks up the change automatically.
