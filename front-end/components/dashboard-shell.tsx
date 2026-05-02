"use client"

import { useMemo, useState } from "react"
import { Bell, Menu, Search } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Profile } from "@/lib/types"

type DashboardShellProps = {
  profile: Profile
  title: string
  children: React.ReactNode
}

export function DashboardShell({ profile, title, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = useMemo(() => (collapsed ? 70 : 256), [collapsed])
  const initials = (profile.name || profile.full_name || profile.email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div
        className="hidden lg:block fixed left-0 top-0 h-screen overflow-hidden border-r bg-card"
        style={{ width: sidebarWidth }}
      >
        <DashboardSidebar
          profile={profile}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>

      <div className="flex h-screen min-w-0 flex-col lg:ml-0" style={{ marginLeft: sidebarWidth }}>
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <DashboardSidebar profile={profile} collapsed={false} />
              </SheetContent>
            </Sheet>

            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>

            <div className="ml-auto hidden max-w-md flex-1 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-9 pl-9 text-sm" placeholder="Search" readOnly />
              </div>
            </div>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <ModeToggle />
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
