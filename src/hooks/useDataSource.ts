import type { Mode } from "@/types";
import { useCallback, useState } from "react";

export const useDataSource = (initial: Mode = "ticker") => {
  const [mode, setMode] = useState<Mode>(initial);

  const toggle = useCallback(async (next: Mode) => {
    setMode(next);
    await fetch("/api/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: next }),
    });
  }, []);

  return { mode, toggle } as const;
};
