import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const INTERVALS = [100, 250, 1000, 5000] as const;

interface PollingIntervalSelectProps {
  value: number;
  onChange: (ms: number) => void;
}

const PollingIntervalSelect = ({ value, onChange }: PollingIntervalSelectProps) => (
  <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
    <SelectTrigger className="w-24">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {INTERVALS.map((ms) => (
        <SelectItem key={ms} value={String(ms)}>{ms}ms</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export { PollingIntervalSelect };
