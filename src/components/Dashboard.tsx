import { TransportPanel } from "@/components/panels/TransportPanel.tsx";

interface DashboardProps {
  serverKilled?: boolean;
}

const Dashboard = ({ serverKilled }: DashboardProps) => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
    <TransportPanel kind="polling" initialInterval={1000} serverKilled={serverKilled} />
    <TransportPanel kind="websocket" serverKilled={serverKilled} />
    <TransportPanel kind="sse" serverKilled={serverKilled} />
  </div>
);

export { Dashboard };
