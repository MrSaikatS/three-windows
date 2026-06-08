import { cn } from "@/lib/utils";

interface StaleByBadgeProps {
  latency: number | null;
}

const staleByColor = (ms: number) => {
  if (ms < 50) return "bg-emerald-500";
  if (ms < 500) return "bg-amber-500";
  return "bg-red-500";
};

const StaleByBadge = ({ latency }: StaleByBadgeProps) => {
  if (latency === null)
    return <span className="text-xs font-mono text-muted-foreground">—</span>;

  const pct = Math.min((latency / 2000) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            staleByColor(latency),
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums text-foreground">
        {latency}ms
      </span>
    </div>
  );
};

export { StaleByBadge };
