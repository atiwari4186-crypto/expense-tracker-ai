"use client";

import { useState, useCallback } from "react";
import {
  Send,
  LayoutTemplate,
  Clock,
  History,
  Cloud,
  ArrowLeft,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useExpenseContext } from "@/context/ExpenseContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  ExportHistoryEntry,
  ExportSchedule,
  ExportTemplate,
  CloudIntegration,
  DEFAULT_HISTORY,
  DEFAULT_SCHEDULES,
  DEFAULT_TEMPLATES,
  DEFAULT_INTEGRATIONS,
} from "@/lib/exportCloud";
import { SendTab } from "./SendTab";
import { TemplatesTab } from "./TemplatesTab";
import { ScheduleTab } from "./ScheduleTab";
import { HistoryTab } from "./HistoryTab";
import { IntegrationsTab } from "./IntegrationsTab";

// ── Tab definition ────────────────────────────────────────────────────────────

type TabId = "send" | "templates" | "schedule" | "history" | "integrations";

const TABS: { id: TabId; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "send",
    label: "Send",
    icon: <Send className="h-4 w-4" />,
    description: "Email & shareable links",
  },
  {
    id: "templates",
    label: "Templates",
    icon: <LayoutTemplate className="h-4 w-4" />,
    description: "One-click report exports",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: <Clock className="h-4 w-4" />,
    description: "Recurring auto-exports",
  },
  {
    id: "history",
    label: "History",
    icon: <History className="h-4 w-4" />,
    description: "Past export log",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: <Cloud className="h-4 w-4" />,
    description: "Cloud service connectors",
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export function ExportHubClient() {
  const { expenses, isLoaded } = useExpenseContext();
  const [activeTab, setActiveTab] = useState<TabId>("templates");

  const [history, setHistory] = useLocalStorage<ExportHistoryEntry[]>(
    "spendwise-export-history",
    DEFAULT_HISTORY
  );
  const [schedules, setSchedules] = useLocalStorage<ExportSchedule[]>(
    "spendwise-export-schedules",
    DEFAULT_SCHEDULES
  );
  const [templates, setTemplates] = useLocalStorage<ExportTemplate[]>(
    "spendwise-export-templates",
    DEFAULT_TEMPLATES
  );
  const [integrations, setIntegrations] = useLocalStorage<CloudIntegration[]>(
    "spendwise-export-integrations",
    DEFAULT_INTEGRATIONS
  );

  const handleTemplateUsed = useCallback(
    (templateId: string, entry: ExportHistoryEntry) => {
      setHistory((prev) => [entry, ...prev]);
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
            : t
        )
      );
    },
    [setHistory, setTemplates]
  );

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const connectedCount = integrations.filter((i) => i.connected).length;
  const activeScheduleCount = schedules.filter((s) => s.enabled).length;

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav bar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex h-14 items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                <Share2 className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Export Hub</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              {connectedCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {connectedCount} connected
                </span>
              )}
              {activeScheduleCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 font-medium">
                  <Clock className="h-3 w-3" />
                  {activeScheduleCount} scheduled
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Left sidebar nav ────────────────────────────────────────── */}
          <aside className="hidden lg:flex w-52 flex-shrink-0 flex-col gap-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Export Options
            </p>
            {TABS.map((tab) => {
              const badge =
                tab.id === "history"
                  ? history.length || undefined
                  : tab.id === "integrations"
                  ? connectedCount || undefined
                  : tab.id === "schedule"
                  ? activeScheduleCount || undefined
                  : undefined;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  )}
                >
                  <span className={cn(
                    "flex-shrink-0 transition-colors",
                    activeTab === tab.id ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                  )}>
                    {tab.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm font-medium",
                      activeTab === tab.id ? "text-primary-700" : "text-gray-700"
                    )}>
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{tab.description}</div>
                  </div>
                  {badge !== undefined && badge > 0 && (
                    <span className={cn(
                      "flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-700"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Expenses count card */}
            <div className="mt-6 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-4 text-white">
              <p className="text-xs font-medium text-primary-200">Total expenses</p>
              <p className="mt-0.5 text-2xl font-bold">{expenses.length}</p>
              <p className="mt-2 text-xs text-primary-200">
                {history.filter((h) => h.status === "success").length} exports completed
              </p>
            </div>
          </aside>

          {/* ── Mobile tab strip ────────────────────────────────────────── */}
          <div className="lg:hidden -mx-4 mb-6 overflow-x-auto px-4">
            <div className="flex gap-1 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Content header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{currentTab.label}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{currentTab.description}</p>
            </div>

            {!isLoaded ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
              </div>
            ) : activeTab === "send" ? (
              <SendTab templates={templates} />
            ) : activeTab === "templates" ? (
              <TemplatesTab
                templates={templates}
                expenses={expenses}
                onTemplateUsed={handleTemplateUsed}
              />
            ) : activeTab === "schedule" ? (
              <ScheduleTab schedules={schedules} onUpdate={setSchedules} />
            ) : activeTab === "history" ? (
              <HistoryTab history={history} onClear={handleClearHistory} />
            ) : (
              <IntegrationsTab integrations={integrations} onUpdate={setIntegrations} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
