import { Power, PowerOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KillServerButtonProps {
  killed: boolean;
  onToggle: () => void;
}

const KillServerButton = ({ killed, onToggle }: KillServerButtonProps) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <Button
          variant={killed ? "outline" : "destructive"}
          size="icon"
          onClick={onToggle}
        />
      }
    >
      {killed ? <Power className="size-4" /> : <PowerOff className="size-4" />}
      <span className="sr-only">{killed ? "Respawn server" : "Kill server"}</span>
    </TooltipTrigger>
    <TooltipContent>
      {killed ? "Respawn server ticker" : "Kill server (stop ticker, close WS/SSE)"}
    </TooltipContent>
  </Tooltip>
);

export { KillServerButton };
