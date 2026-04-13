"use client";

import { useState, useCallback } from "react";
import { Mail, Link2, Copy, Check, Send, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { ExportTemplate } from "@/lib/exportCloud";

// ── QR Code visual (decorative SVG with real finder-pattern structure) ──────

function QRCodeVisual() {
  // 21×21 grid: 1 = dark module, 0 = light module
  // Has correct 7×7 finder patterns in three corners + timing strips
  const grid: number[][] = [
    [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,0,1,1,0,0,1,1,1,0,1,1,1,1,0,1,0,1,1],
    [0,1,1,0,1,0,0,0,1,0,0,0,1,1,0,0,0,0,1,1,0,0,1],
    [1,1,0,1,0,1,1,0,0,1,1,0,0,1,1,0,1,0,0,0,1,0,0],
    [0,0,1,0,1,1,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,0],
    [1,0,0,1,0,0,1,0,1,0,1,1,1,0,0,1,1,0,1,0,0,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,1,0,0,1,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,0,0,1,1,0,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,1,0,1,0,0,1,1,0,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,0,0,1,0,1,1,0,0,1,1,0,1,1,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,1,0,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,0,0,1,0,1,1,1,0,0],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,0,0,1,1,1,0,1,0,1,0,0,1,0,0,1],
  ];

  const SIZE = 120;
  const CELL = SIZE / 21;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border-2 border-gray-200 bg-white p-2.5 shadow-sm">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} shapeRendering="crispEdges">
          {grid.map((row, y) =>
            row.map((cell, x) =>
              cell ? (
                <rect
                  key={`${x}-${y}`}
                  x={x * CELL}
                  y={y * CELL}
                  width={CELL}
                  height={CELL}
                  fill="#111827"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <p className="text-xs text-gray-400">Scan to open</p>
    </div>
  );
}

// ── Share Link section ────────────────────────────────────────────────────────

const EXPIRY_OPTIONS = [
  { value: "1d", label: "Expires in 24 hours" },
  { value: "7d", label: "Expires in 7 days" },
  { value: "30d", label: "Expires in 30 days" },
  { value: "never", label: "Never expires" },
];

function ShareSection() {
  const [expiry, setExpiry] = useState("7d");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    const token = Math.random().toString(36).substring(2, 10);
    setGeneratedLink(`https://spendwise.app/shared/${token}`);
    setIsGenerating(false);
  }, []);

  const copyLink = useCallback(async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedLink]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
          <Link2 className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Shareable Link</h3>
          <p className="text-xs text-gray-500">Anyone with the link can view a read-only snapshot</p>
        </div>
      </div>

      {!generatedLink ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Link expiry</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setExpiry(opt.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs transition-all",
                    expiry === opt.value
                      ? "border-violet-400 bg-violet-50 text-violet-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  <Clock className="mb-0.5 inline h-3 w-3 mr-1" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={generateLink}
            loading={isGenerating}
          >
            {!isGenerating && <Link2 className="h-4 w-4" />}
            {isGenerating ? "Generating link…" : "Generate Link"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2">
            <span className="flex-1 truncate text-sm font-mono text-violet-700">{generatedLink}</span>
            <button
              onClick={copyLink}
              className={cn(
                "flex-shrink-0 rounded-lg p-1.5 transition-all",
                copied
                  ? "bg-green-100 text-green-600"
                  : "text-violet-500 hover:bg-violet-100"
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-start gap-6">
            <QRCodeVisual />
            <div className="flex-1 space-y-2 pt-1">
              <p className="text-xs font-medium text-gray-700">Share via</p>
              <div className="flex flex-wrap gap-2">
                {["Twitter/X", "Email", "Slack", "WhatsApp"].map((platform) => (
                  <button
                    key={platform}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {platform}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs text-amber-700">
                  <span className="font-medium">Note:</span> Shared snapshots are read-only and include expenses up to the moment of generation.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setGeneratedLink(null); setCopied(false); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Generate new link
          </button>
        </div>
      )}
    </div>
  );
}

// ── Email section ─────────────────────────────────────────────────────────────

type EmailState = "idle" | "sending" | "sent" | "error";

interface SendTabProps {
  templates: ExportTemplate[];
}

export function SendTab({ templates }: SendTabProps) {
  const [email, setEmail] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [emailState, setEmailState] = useState<EmailState>("idle");

  const handleSend = useCallback(async () => {
    if (!email.trim()) return;
    setEmailState("sending");
    await new Promise((r) => setTimeout(r, 1400));
    setEmailState("sent");
  }, [email]);

  const templateLabel = templates.find((t) => t.id === selectedTemplate)?.name ?? "";

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Email Export</h3>
            <p className="text-xs text-gray-500">Send an export directly to any email address</p>
          </div>
        </div>

        {emailState === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Report sent!</p>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">{templateLabel}</span> was emailed to{" "}
                <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>
            <button
              onClick={() => { setEmailState("idle"); setEmail(""); setMessage(""); }}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Send another
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Recipient email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Export template</label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all",
                      selectedTemplate === tpl.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <span className="text-base">{tpl.icon}</span>
                    <div className="min-w-0">
                      <div className={cn(
                        "text-xs font-medium truncate",
                        selectedTemplate === tpl.id ? "text-blue-700" : "text-gray-700"
                      )}>
                        {tpl.name}
                      </div>
                      <div className="text-xs text-gray-400 uppercase font-medium">{tpl.format}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, please find the expense report attached…"
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 resize-none"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSend}
              loading={emailState === "sending"}
              disabled={!email.trim()}
            >
              {emailState !== "sending" && <Send className="h-4 w-4" />}
              {emailState === "sending" ? "Sending report…" : "Send Report"}
            </Button>
          </div>
        )}
      </div>

      {/* Share link */}
      <ShareSection />
    </div>
  );
}
