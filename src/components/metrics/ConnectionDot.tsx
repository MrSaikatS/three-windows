import type { TransportStatus } from "@/lib/transports/types.ts";

interface ConnectionDotProps {
  status: TransportStatus;
}

const dotClass: Record<TransportStatus, string> = {
  connected: "bg-green-500",
  connecting: "bg-yellow-400 animate-pulse",
  disconnected: "bg-red-500",
};

const ConnectionDot = ({ status }: ConnectionDotProps) => (
  <span
    className={`inline-block size-2 rounded-full ${dotClass[status]}`}
    title={status}
  />
);

export { ConnectionDot };
