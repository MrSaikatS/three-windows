import { useCallback, useState } from "react";
import { Power, PowerOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const KillServerButton = () => {
  const [killed, setKilled] = useState(false);

  const handleClick = useCallback(async () => {
    const endpoint = killed ? "/api/respawn" : "/api/kill";
    const res = await fetch(endpoint, { method: "POST" });
    if (res.ok) setKilled(!killed);
  }, [killed]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={killed ? "outline" : "destructive"}
            size="icon"
            onClick={handleClick}
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
};

export { KillServerButton };
