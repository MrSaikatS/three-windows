import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils";

interface LatencyBadgeProps {
  latency: number | null;
}

const colorForLatency = (ms: number) => {
  if (ms < 250)
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
  if (ms < 1000)
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
  return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
};

const LatencyBadge = ({ latency }: LatencyBadgeProps) => {
  if (latency === null)
    return <Badge variant="outline" className="font-mono">—</Badge>;
  return (
    <Badge
      className={cn(
        "font-mono text-[11px] font-semibold tracking-tight px-1.5 py-0",
        colorForLatency(latency),
      )}
    >
      {latency}ms
    </Badge>
  );
};

export { LatencyBadge };
