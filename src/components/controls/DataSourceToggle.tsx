import type { Mode } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";

interface DataSourceToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const DataSourceToggle = ({ mode, onChange }: DataSourceToggleProps) => {
  const handleChange = (v: string[]) => {
    const next = v[0];
    if (next !== undefined && (next === "ticker" || next === "system")) onChange(next);
  };
  return (
    <ToggleGroup value={[mode]} onValueChange={handleChange}>
      <ToggleGroupItem value="ticker">Ticker</ToggleGroupItem>
      <ToggleGroupItem value="system">System</ToggleGroupItem>
    </ToggleGroup>
  );
};

export { DataSourceToggle };
