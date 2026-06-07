import { useTransport } from "@/hooks/useTransport.ts";
import { PanelShell } from "./PanelShell.tsx";
import { LatencyBadge } from "@/components/metrics/LatencyBadge.tsx";
import { MetricRow } from "@/components/metrics/MetricRow.tsx";
import { Sparkline } from "@/components/metrics/Sparkline.tsx";
import { StatusPill } from "@/components/metrics/StatusPill.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Activity, Gauge, Layers } from "lucide-react";
import type { Snapshot } from "@/types";
import { TRANSPORT_META } from "./transport-meta.ts";

const primaryValue = (s: Snapshot) => {
  if (s.mode === "ticker") return s.value.toFixed(2);
  return s.cpu.toFixed(1);
};

const primaryUnit = (s: Snapshot) => {
  if (s.mode === "ticker") return "";
  return "%";
};

const SSEPanel = () => {
  const { snapshot, status, latency, updateCount, dataPoints } =
    useTransport("sse");

  return (
    <PanelShell
      kind="sse"
      status={<StatusPill status={status} />}
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {updateCount} updates received
          </span>
        </div>
      }
    >
      <div className="flex items-baseline gap-1 py-2">
        <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {snapshot ? primaryValue(snapshot) : "—"}
        </span>
        {snapshot && (
          <span className="text-sm font-medium text-muted-foreground">
            {primaryUnit(snapshot)}
          </span>
        )}
      </div>

      <Separator className="opacity-40" />

      <MetricRow label="Latency" value={<LatencyBadge latency={latency} />} icon={<Gauge className="size-3" />} />
      {latency !== null && latency >= 1500 && (
        <MetricRow
          label="Stale by"
          value={<span className="text-destructive text-xs font-mono">{latency}ms</span>}
          icon={<Activity className="size-3" />}
        />
      )}
      <MetricRow label="Data points" value={String(updateCount)} icon={<Layers className="size-3" />} />

      {dataPoints.length > 1 && (
        <div className="pt-1">
          <Sparkline
            data={dataPoints}
            strokeColor={TRANSPORT_META.sse.color}
            gradientId="sse-fill"
          />
        </div>
      )}
    </PanelShell>
  );
};

export { SSEPanel };
