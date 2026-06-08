import { useTransport } from "@/hooks/useTransport.ts";
import { PanelShell } from "./PanelShell.tsx";
import { LatencyBadge } from "@/components/metrics/LatencyBadge.tsx";
import { StaleByBadge } from "@/components/metrics/StaleByBadge.tsx";
import { MetricRow } from "@/components/metrics/MetricRow.tsx";
import { Sparkline } from "@/components/metrics/Sparkline.tsx";
import { StatusPill } from "@/components/metrics/StatusPill.tsx";
import { PollingIntervalSelect } from "@/components/controls/PollingIntervalSelect.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Send, Layers, Gauge, HardDrive } from "lucide-react";
import type { Snapshot } from "@/types";
import { TRANSPORT_META } from "./transport-meta.ts";
import { formatBytes } from "@/lib/utils";

const primaryValue = (s: Snapshot) => {
  if (s.mode === "ticker") return s.value.toFixed(2);
  return s.cpu.toFixed(1);
};

const primaryUnit = (s: Snapshot) => {
  if (s.mode === "ticker") return "";
  return "%";
};

const PollingPanel = ({ initialInterval = 1000 }: { initialInterval?: number }) => {
  const { snapshot, status, latency, updateCount, requestsSent, bytesTransferred, dataPoints, currentInterval, setPollingInterval } =
    useTransport("polling", initialInterval);

  return (
    <PanelShell
      kind="polling"
      status={<StatusPill status={status} />}
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {updateCount} updates received
          </span>
          <PollingIntervalSelect value={currentInterval} onChange={setPollingInterval} />
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
      <MetricRow label="Stale by" value={<StaleByBadge latency={latency} />} icon={<Gauge className="size-3" />} />
      <MetricRow label="Requests sent" value={String(requestsSent)} icon={<Send className="size-3" />} />
      <MetricRow label="Bytes transferred" value={formatBytes(bytesTransferred)} icon={<HardDrive className="size-3" />} />
      <MetricRow label="Data points" value={String(updateCount)} icon={<Layers className="size-3" />} />

      {dataPoints.length > 1 && (
        <div className="pt-1">
          <Sparkline
            data={dataPoints}
            strokeColor={TRANSPORT_META.polling.color}
            gradientId="polling-fill"
          />
        </div>
      )}
    </PanelShell>
  );
};

export { PollingPanel };
