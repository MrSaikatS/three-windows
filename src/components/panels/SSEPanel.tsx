import { LatencyBadge } from "@/components/metrics/LatencyBadge.tsx";
import { MetricRow } from "@/components/metrics/MetricRow.tsx";
import { Sparkline } from "@/components/metrics/Sparkline.tsx";
import { StaleByBadge } from "@/components/metrics/StaleByBadge.tsx";
import { StatusPill } from "@/components/metrics/StatusPill.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useTransport } from "@/hooks/useTransport.ts";
import { formatBytes } from "@/lib/utils";
import type { Snapshot } from "@/types";
import { Gauge, HardDrive, Layers } from "lucide-react";
import { PanelShell } from "./PanelShell.tsx";
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
  const {
    snapshot,
    status,
    latency,
    updateCount,
    bytesTransferred,
    dataPoints,
  } = useTransport("sse");

  return (
    <PanelShell
      kind="sse"
      status={<StatusPill status={status} />}>
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

      <MetricRow
        label="Latency"
        value={<LatencyBadge latency={latency} />}
        icon={<Gauge className="size-3" />}
      />
      <MetricRow
        label="Stale by"
        value={<StaleByBadge latency={latency} />}
        icon={<Gauge className="size-3" />}
      />
      <MetricRow
        label="Data points"
        value={String(updateCount)}
        icon={<Layers className="size-3" />}
      />
      <MetricRow
        label="Bytes transferred"
        value={formatBytes(bytesTransferred)}
        icon={<HardDrive className="size-3" />}
      />

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
