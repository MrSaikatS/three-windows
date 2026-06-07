import { PollingPanel } from "@/components/panels/PollingPanel.tsx";
import { WebSocketPanel } from "@/components/panels/WebSocketPanel.tsx";
import { SSEPanel } from "@/components/panels/SSEPanel.tsx";

const Dashboard = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
    <PollingPanel />
    <WebSocketPanel />
    <SSEPanel />
  </div>
);

export { Dashboard };
