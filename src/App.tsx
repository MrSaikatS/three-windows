import { ThemeProvider } from "next-themes";
import { useCallback, useState } from "react";

import { Dashboard } from "@/components/Dashboard.tsx";
import { DataSourceToggle } from "@/components/controls/DataSourceToggle.tsx";
import { KillServerButton } from "@/components/controls/KillServerButton.tsx";
import { ModeToggle } from "@/components/controls/ModeToggle.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { useDataSource } from "@/hooks/useDataSource.ts";
import { Activity } from "lucide-react";

const App = () => {
  const { mode, toggle } = useDataSource("ticker");
  const [killed, setKilled] = useState(false);
  const [killError, setKillError] = useState<string | null>(null);

  const handleKillToggle = useCallback(async () => {
    setKillError(null);
    const endpoint = killed ? "/api/respawn" : "/api/kill";
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        setKillError(`Server returned ${res.status}`);
        return;
      }
      setKilled(!killed);
    } catch (err) {
      setKillError(err instanceof Error ? err.message : "Network error");
    }
  }, [killed]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem>
      <TooltipProvider>
        <div className="min-h-[90dvh] bg-background space-y-2">
          {/* Top header bar */}
          <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl backdrop-saturate-150 pt-4">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Activity className="size-4" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold leading-tight text-foreground">
                    Three Windows
                  </h1>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    Real-time Transport Comparison
                  </p>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    (HTTP Polling vs WebSocket vs SSE)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DataSourceToggle
                  mode={mode}
                  onChange={toggle}
                />
                <KillServerButton
                  killed={killed}
                  onToggle={handleKillToggle}
                  errorMessage={killError}
                />
                <ModeToggle />
              </div>
            </div>
          </header>

          {/* Sub-header */}
          <div className="mx-auto max-w-7xl px-6 pt-6 pb-4">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {mode === "ticker" ? "Random Walk" : "System Metrics"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === "ticker" ?
                    "Simulated ticker values updated every 250ms"
                  : "Simulated CPU, RAM & network metrics"}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard panels */}
          <main className="mx-auto max-w-7xl px-6 pb-4">
            <Dashboard serverKilled={killed} />
          </main>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export { App };
export default App;
