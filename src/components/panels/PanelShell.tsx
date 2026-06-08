import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils";
import { Radio, RefreshCw, Zap } from "lucide-react";
import type { ReactNode } from "react";
import type { TransportKind } from "./transport-meta.ts";
import { TRANSPORT_META } from "./transport-meta.ts";

interface PanelShellProps {
  kind: TransportKind;
  children: ReactNode;
  status?: ReactNode;
  footer?: ReactNode;
}

const ICONS: Record<TransportKind, ReactNode> = {
  polling: <RefreshCw className="size-4" />,
  websocket: <Zap className="size-4" />,
  sse: <Radio className="size-4" />,
};

const PanelShell = ({ kind, children, status, footer }: PanelShellProps) => {
  const meta = TRANSPORT_META[kind];
  return (
    <Card
      className={cn(
        "group flex flex-col border-0 shadow-sm ring-1 ring-foreground/5",
      )}
      style={
        {
          "--accent": meta.color,
          "--accent-dark": meta.darkColor,
        } as React.CSSProperties
      }>
      {/* Accent bar */}
      <div
        className="h-1 w-full rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, var(--accent), transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-8 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `color-mix(in oklch, var(--accent), transparent 88%)`,
              color: `var(--accent)`,
            }}>
            {ICONS[kind]}
          </span>
          <div>
            <h3 className="text-sm font-semibold leading-tight text-foreground">
              {meta.label}
            </h3>
            <p className="text-[11px] leading-tight text-muted-foreground">
              {meta.description}
            </p>
          </div>
        </div>
        {status}
      </div>

      <CardContent className="flex-1 space-y-2.5 px-5 py-0 pb-3">
        {children}
      </CardContent>

      {footer && <CardFooter className="px-5 py-2.5">{footer}</CardFooter>}
    </Card>
  );
};

export { PanelShell };
