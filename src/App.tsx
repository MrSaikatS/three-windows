import { Dashboard } from "@/components/Dashboard.tsx";
import { DataSourceToggle } from "@/components/controls/DataSourceToggle.tsx";
import { useDataSource } from "@/hooks/useDataSource.ts";
import { Activity } from "lucide-react";

const App = () => {
  const { mode, toggle } = useDataSource("ticker");

  return (
    <div className="min-h-screen bg-background">
      {/* Top header bar */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Activity className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight text-foreground">three-windows</h1>
              <p className="text-[11px] leading-tight text-muted-foreground">Real-time Transport Comparison</p>
            </div>
          </div>
          <DataSourceToggle mode={mode} onChange={toggle} />
        </div>
      </header>

      {/* Sub-header */}
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {mode === "ticker" ? "Random Walk" : "System Metrics"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "ticker"
                ? "Simulated ticker values updated every 250ms"
                : "Simulated CPU, RAM &amp; network metrics"}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard panels */}
      <main className="mx-auto max-w-6xl px-6 pb-12">
        <Dashboard />
      </main>
    </div>
  );
};

export { App };
export default App;
