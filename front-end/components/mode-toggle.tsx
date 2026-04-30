"use client"

import * as React from "react"
import { Clock, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const preferenceKey = "trackit-theme-preference"

export function ModeToggle() {
  const { setTheme } = useTheme()

  function applyPreference(preference: "auto" | "light" | "dark") {
    window.localStorage.setItem(preferenceKey, preference)
    if (preference === "auto") {
      const now = new Date()
      const minutes = now.getHours() * 60 + now.getMinutes()
      setTheme(minutes >= 18 * 60 + 30 || minutes < 6 * 60 + 30 ? "dark" : "light")
      return
    }
    setTheme(preference)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => applyPreference("auto")}>
          <Clock className="mr-2 h-4 w-4" />
          Automatic
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyPreference("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyPreference("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
