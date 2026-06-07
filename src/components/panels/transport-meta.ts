export type TransportKind = "polling" | "websocket" | "sse";

interface TransportMeta {
  readonly label: string;
  readonly description: string;
  readonly icon: "refresh" | "zap" | "radio";
  readonly color: string;
  readonly darkColor: string;
}

const color = (hue: number) => ({
  light: `oklch(0.62 0.18 ${hue})`,
  dark: `oklch(0.78 0.16 ${hue})`,
});

const amber = color(75);
const violet = color(295);
const teal = color(195);

export const TRANSPORT_META: Record<TransportKind, TransportMeta> = {
  polling: {
    label: "Polling",
    description: "HTTP requests on a fixed interval",
    icon: "refresh",
    color: amber.light,
    darkColor: amber.dark,
  },
  websocket: {
    label: "WebSocket",
    description: "Full-duplex stream over a single TCP connection",
    icon: "zap",
    color: violet.light,
    darkColor: violet.dark,
  },
  sse: {
    label: "SSE",
    description: "Server-sent events over a one-way HTTP stream",
    icon: "radio",
    color: teal.light,
    darkColor: teal.dark,
  },
};
