import { PollingPanel } from "@/components/panels/PollingPanel.tsx";
import { SSEPanel } from "@/components/panels/SSEPanel.tsx";
import { WebSocketPanel } from "@/components/panels/WebSocketPanel.tsx";

const Dashboard = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
    <PollingPanel />

    <SSEPanel />

    <WebSocketPanel />
  </div>
);

export { Dashboard };
