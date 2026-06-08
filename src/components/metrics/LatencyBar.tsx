interface LatencyBarProps {
  buckets: [number, number, number, number];
}

const SEGMENTS = [
  { key: "fast", color: "bg-emerald-500", label: "<10ms" },
  { key: "ok", color: "bg-sky-500", label: "<50ms" },
  { key: "slow", color: "bg-amber-500", label: "<250ms" },
  { key: "stale", color: "bg-red-500", label: ">=250ms" },
];

const LatencyBar = ({ buckets }: LatencyBarProps) => {
  const total = buckets.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return <span className="text-xs font-mono text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-full min-w-14 max-w-20 overflow-hidden rounded-full bg-muted">
        {SEGMENTS.map((seg, i) => (
          <div
            key={seg.key}
            className={seg.color}
            style={{ width: `${buckets[i] || 0}%` }}
          />
        ))}
      </div>
      <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
        {buckets[0] !== undefined ? `${buckets[0]}%<10` : ""}
      </span>
    </div>
  );
};

export { LatencyBar };
