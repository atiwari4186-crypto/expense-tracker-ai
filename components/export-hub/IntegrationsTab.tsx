"use client";

import { useState, useCallback } from "react";
import { Check, Unplug } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CloudIntegration } from "@/lib/exportCloud";

const FAKE_ACCOUNTS: Record<string, string> = {
  "google-sheets": "user@gmail.com",
  "google-drive": "user@gmail.com",
  dropbox: "user@dropbox.com",
  onedrive: "user@outlook.com",
  notion: "workspace.notion.so",
  airtable: "My Workspace",
};

function timeSinceConnect(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  return "recently";
}

interface IntegrationCardProps {
  integration: CloudIntegration;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
}

function IntegrationCard({ integration, onConnect, onDisconnect, isConnecting }: IntegrationCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-5 transition-all",
        integration.connected
          ? "border-green-200 bg-green-50/30"
          : "border-gray-200 bg-white hover:shadow-sm"
      )}
    >
      {/* Connected badge */}
      {integration.connected && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Connected
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl shadow-sm"
          style={{ backgroundColor: integration.bgColor, border: `1px solid ${integration.color}20` }}
        >
          {integration.icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{integration.name}</h4>
          <p className="text-xs text-gray-500">{integration.tagline}</p>
        </div>
      </div>

      {/* Status details */}
      {integration.connected && integration.connectedAt ? (
        <div className="mb-3 rounded-lg bg-white border border-green-100 px-3 py-2 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Check className="h-3 w-3 text-green-500" />
            <span className="font-medium">{integration.accountEmail}</span>
          </div>
          <p className="text-xs text-gray-400">
            Connected {timeSinceConnect(integration.connectedAt)}
          </p>
          <p className="text-xs text-gray-400">
            Synced automatically on every export
          </p>
        </div>
      ) : (
        <div className="mb-3 text-xs text-gray-400">
          Not connected — exports will not sync to {integration.name}
        </div>
      )}

      {/* Action button */}
      {integration.connected ? (
        <button
          onClick={onDisconnect}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Unplug className="h-3.5 w-3.5" />
          Disconnect
        </button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={onConnect}
          loading={isConnecting}
        >
          {!isConnecting && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded text-xs"
              style={{ backgroundColor: integration.bgColor, color: integration.color }}
            >
              {integration.icon}
            </span>
          )}
          {isConnecting ? `Connecting to ${integration.name}…` : `Connect ${integration.name}`}
        </Button>
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

interface IntegrationsTabProps {
  integrations: CloudIntegration[];
  onUpdate: (integrations: CloudIntegration[]) => void;
}

export function IntegrationsTab({ integrations, onUpdate }: IntegrationsTabProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const connect = useCallback(
    async (id: string) => {
      setConnectingId(id);
      // Simulate OAuth redirect + callback
      await new Promise((r) => setTimeout(r, 1800));
      onUpdate(
        integrations.map((i) =>
          i.id === id
            ? {
                ...i,
                connected: true,
                connectedAt: new Date().toISOString(),
                accountEmail: FAKE_ACCOUNTS[id] ?? "user@example.com",
              }
            : i
        )
      );
      setConnectingId(null);
    },
    [integrations, onUpdate]
  );

  const disconnect = useCallback(
    (id: string) => {
      onUpdate(
        integrations.map((i) =>
          i.id === id ? { ...i, connected: false, connectedAt: undefined, accountEmail: undefined } : i
        )
      );
    },
    [integrations, onUpdate]
  );

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Cloud Integrations</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {connectedCount === 0
              ? "Connect a service to enable cloud sync"
              : `${connectedCount} service${connectedCount !== 1 ? "s" : ""} connected`}
          </p>
        </div>
        {connectedCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {connectedCount} active
          </div>
        )}
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => connect(integration.id)}
            onDisconnect={() => disconnect(integration.id)}
            isConnecting={connectingId === integration.id}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-700 text-center">
          Integrations use OAuth — your credentials are never stored by SpendWise.
          Clicking Connect opens a secure authorization window.
        </p>
      </div>
    </div>
  );
}
