import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const themeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
}

const nextTheme: Record<string, string> = {
  light: "dark",
  dark: "system",
  system: "light",
}

const ModeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="size-4" />
      </Button>
    )
  }

  const currentTheme = theme ?? "system"
  const next = nextTheme[currentTheme]!

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(next)}
          />
        }
      >
        {resolvedTheme === "dark" ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </TooltipTrigger>
      <TooltipContent>
        {themeLabels[currentTheme]} — click for {themeLabels[next]}
      </TooltipContent>
    </Tooltip>
  )
}

export { ModeToggle }
