"use client";

import { useState, useCallback } from "react";
import { Clock, Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  ExportSchedule,
  ExportFormat,
  ExportDestination,
  ScheduleFrequency,
  FORMAT_COLORS,
  FREQUENCY_LABELS,
  DESTINATION_ICONS,
  DESTINATION_LABELS,
} from "@/lib/exportCloud";
import { generateId } from "@/lib/utils";

function formatNextRun(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLastRun(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function computeNextRun(freq: ScheduleFrequency): string {
  const d = new Date();
  if (freq === "daily") {
    d.setDate(d.getDate() + 1);
  } else if (freq === "weekly") {
    const daysUntil = (7 - d.getDay() + 1) % 7 || 7;
    d.setDate(d.getDate() + daysUntil);
  } else {
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
  }
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

// ── New schedule form ─────────────────────────────────────────────────────────

interface NewScheduleFormProps {
  onAdd: (schedule: ExportSchedule) => void;
  onCancel: () => void;
}

function NewScheduleForm({ onAdd, onCancel }: NewScheduleFormProps) {
  const [label, setLabel] = useState("");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("monthly");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [destination, setDestination] = useState<ExportDestination>("email");
  const [email, setEmail] = useState("");

  const handleAdd = useCallback(() => {
    const schedule: ExportSchedule = {
      id: generateId(),
      enabled: true,
      label: label.trim() || `${FREQUENCY_LABELS[frequency]} Export`,
      frequency,
      format,
      destination,
      email: destination === "email" ? email : undefined,
      nextRun: computeNextRun(frequency),
    };
    onAdd(schedule);
  }, [label, frequency, format, destination, email, onAdd]);

  const FREQ_OPTIONS: ScheduleFrequency[] = ["daily", "weekly", "monthly"];
  const FORMAT_OPTIONS: ExportFormat[] = ["csv", "json", "pdf"];
  const DEST_OPTIONS: { value: ExportDestination; label: string }[] = [
    { value: "email", label: "Email" },
    { value: "google-drive", label: "Google Drive" },
    { value: "dropbox", label: "Dropbox" },
    { value: "download", label: "Auto-download" },
  ];

  return (
    <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">New Schedule</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Input
        label="Schedule name"
        placeholder="e.g. Monthly Backup to Email"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Frequency</label>
        <div className="grid grid-cols-3 gap-2">
          {FREQ_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                frequency === f
                  ? "border-primary-400 bg-primary-100 text-primary-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {FREQUENCY_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Format</label>
          <div className="flex flex-col gap-1.5">
            {FORMAT_OPTIONS.map((f) => {
              const style = FORMAT_COLORS[f];
              return (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition-all",
                    format === f ? "border-transparent" : "border-gray-200 hover:border-gray-300"
                  )}
                  style={format === f ? { backgroundColor: style.bg, borderColor: style.text + "40", color: style.text } : {}}
                >
                  <span className="font-semibold uppercase">{f}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Send to</label>
          <div className="flex flex-col gap-1.5">
            {DEST_OPTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDestination(d.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition-all",
                  destination === d.value
                    ? "border-primary-300 bg-primary-50 text-primary-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {DESTINATION_ICONS[d.value]} {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {destination === "email" && (
        <Input
          label="Send to email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="flex-1" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add Schedule
        </Button>
      </div>
    </div>
  );
}

// ── Schedule card ─────────────────────────────────────────────────────────────

interface ScheduleCardProps {
  schedule: ExportSchedule;
  onToggle: () => void;
  onDelete: () => void;
}

function ScheduleCard({ schedule, onToggle, onDelete }: ScheduleCardProps) {
  const fmtStyle = FORMAT_COLORS[schedule.format];

  return (
    <div className={cn(
      "rounded-2xl border bg-white p-4 transition-all",
      schedule.enabled ? "border-gray-200" : "border-gray-100 opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex-shrink-0 transition-colors",
            schedule.enabled ? "text-primary-600" : "text-gray-300"
          )}
        >
          {schedule.enabled
            ? <ToggleRight className="h-6 w-6" />
            : <ToggleLeft className="h-6 w-6" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">{schedule.label}</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-xs font-semibold uppercase"
              style={{ backgroundColor: fmtStyle.bg, color: fmtStyle.text }}
            >
              {schedule.format}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>
              <Clock className="inline h-3 w-3 mr-0.5" />
              {FREQUENCY_LABELS[schedule.frequency]}
            </span>
            <span>
              {DESTINATION_ICONS[schedule.destination]} {DESTINATION_LABELS[schedule.destination]}
              {schedule.email && ` (${schedule.email})`}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3 text-xs">
            {schedule.enabled && (
              <span className="text-gray-500">
                Next run:{" "}
                <span className="font-medium text-gray-700">{formatNextRun(schedule.nextRun)}</span>
              </span>
            )}
            {schedule.lastRun && (
              <span className="text-gray-400">
                Last: {formatLastRun(schedule.lastRun)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onDelete}
          className="flex-shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

interface ScheduleTabProps {
  schedules: ExportSchedule[];
  onUpdate: (schedules: ExportSchedule[]) => void;
}

export function ScheduleTab({ schedules, onUpdate }: ScheduleTabProps) {
  const [showForm, setShowForm] = useState(false);

  const toggle = useCallback(
    (id: string) => {
      onUpdate(schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
    },
    [schedules, onUpdate]
  );

  const remove = useCallback(
    (id: string) => {
      onUpdate(schedules.filter((s) => s.id !== id));
    },
    [schedules, onUpdate]
  );

  const add = useCallback(
    (schedule: ExportSchedule) => {
      onUpdate([...schedules, schedule]);
      setShowForm(false);
    },
    [schedules, onUpdate]
  );

  const enabled = schedules.filter((s) => s.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Scheduled Exports</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {enabled} of {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} active
          </p>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Schedule
          </Button>
        )}
      </div>

      {showForm && (
        <NewScheduleForm onAdd={add} onCancel={() => setShowForm(false)} />
      )}

      {schedules.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-14 text-center">
          <div className="text-3xl">⏰</div>
          <div>
            <p className="text-sm font-medium text-gray-600">No schedules yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Set up recurring exports so your data is always ready
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add your first schedule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onToggle={() => toggle(s.id)}
              onDelete={() => remove(s.id)}
            />
          ))}
        </div>
      )}

      {schedules.length > 0 && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
          <p className="text-xs text-gray-500 text-center">
            Schedules run automatically in the background when SpendWise is open.
            Cloud destinations require an active integration.
          </p>
        </div>
      )}
    </div>
  );
}
