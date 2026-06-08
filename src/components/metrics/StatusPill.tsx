import type { TransportStatus } from "@/lib/transports/types.ts";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: TransportStatus;
  className?: string;
}

const STYLES: Record<
  TransportStatus,
  { dot: string; bg: string; text: string; label: string }
> = {
  connected: {
    dot: "bg-emerald-500 shadow-[0_0_0_3px_oklch(0.98_0.05_155)] dark:shadow-[0_0_0_3px_oklch(0.28_0.06_155)]",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Live",
  },
  connecting: {
    dot: "bg-amber-400 animate-pulse shadow-[0_0_0_3px_oklch(0.98_0.05_85)] dark:shadow-[0_0_0_3px_oklch(0.3_0.06_85)]",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    label: "Connecting",
  },
  disconnected: {
    dot: "bg-red-500 shadow-[0_0_0_3px_oklch(0.98_0.05_25)] dark:shadow-[0_0_0_3px_oklch(0.3_0.08_25)]",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
    label: "Offline",
  },
};

const StatusPill = ({ status, className }: StatusPillProps) => {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        s.bg,
        s.text,
        className,
      )}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
};

export { StatusPill };
