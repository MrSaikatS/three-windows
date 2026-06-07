import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricRowProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  align?: "default" | "center";
}

const MetricRow = ({ label, value, icon, align = "default" }: MetricRowProps) => (
  <div
    className={cn(
      "flex items-center justify-between gap-2",
      align === "default" ? "py-1" : "py-0.5",
    )}
  >
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon && <span className="size-3 opacity-60">{icon}</span>}
      {label}
    </span>
    <span className="flex items-center gap-2 text-sm font-semibold tabular-nums tracking-tight text-foreground">
      {value}
    </span>
  </div>
);

export { MetricRow };
