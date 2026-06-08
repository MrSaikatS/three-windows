import { LatencyBadge } from "@/components/metrics/LatencyBadge.tsx";
import { MetricRow } from "@/components/metrics/MetricRow.tsx";
import { Sparkline } from "@/components/metrics/Sparkline.tsx";
import { StaleByBadge } from "@/components/metrics/StaleByBadge.tsx";
import { StatusPill } from "@/components/metrics/StatusPill.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useTransport } from "@/hooks/useTransport.ts";
import { formatBytes, primaryValue, primaryUnit } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Gauge, HardDrive, Layers, Cpu, Download, RotateCw, Upload, Wifi } from "lucide-react";
import { PanelShell } from "./PanelShell.tsx";
import { TRANSPORT_META, type TransportKind } from "./transport-meta.ts";

interface TransportPanelProps {
  kind: TransportKind;
  initialInterval?: number;
  serverKilled?: boolean;
}

const TransportPanel = ({ kind, initialInterval, serverKilled }: TransportPanelProps) => {
  const {
    snapshot,
    status,
    latency,
    updateCount,
    bytesTransferred,
    dataPoints,
  } = useTransport(kind, initialInterval);

  return (
    <PanelShell
      kind={kind}
      status={
        <div className="flex items-center gap-2">
          {serverKilled && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Killed
            </span>
          )}
          <StatusPill status={status} />
        </div>
      }>
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

      <MetricRow
        label="Direction"
        value={TRANSPORT_META[kind].directionLabel}
        icon={<ArrowLeftRight className="size-3" />}
      />
      <MetricRow
        label="Reconnect"
        value={TRANSPORT_META[kind].reconnectLabel}
        icon={<RotateCw className="size-3" />}
      />
      <MetricRow
        label="Protocol"
        value={TRANSPORT_META[kind].protocolLabel}
        icon={<Wifi className="size-3" />}
      />

      {snapshot?.mode === "system" && (
        <>
          <Separator className="opacity-40" />
          <MetricRow
            label="CPU"
            value={`${snapshot.cpu.toFixed(1)} %`}
            icon={<Cpu className="size-3" />}
          />
          <MetricRow
            label="RAM"
            value={`${snapshot.ram.toFixed(1)} %`}
            icon={<HardDrive className="size-3" />}
          />
          <MetricRow
            label="Net In"
            value={`${snapshot.netIn.toFixed(0)} KB/s`}
            icon={<Download className="size-3" />}
          />
          <MetricRow
            label="Net Out"
            value={`${snapshot.netOut.toFixed(0)} KB/s`}
            icon={<Upload className="size-3" />}
          />
        </>
      )}

      {dataPoints.length > 1 && (
        <div className="pt-1">
          <Sparkline
            data={dataPoints}
            strokeColor={TRANSPORT_META[kind].color}
            gradientId={`${kind}-fill`}
          />
        </div>
      )}
    </PanelShell>
  );
};

export { TransportPanel };
