"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Profile } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  Settings,
  LogOut,
  Plus,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { clearAuthSession } from "@/lib/backend-auth"

interface DashboardSidebarProps {
  profile: Profile
}

const studentLinks = [
  { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/student/explore", label: "Explore", icon: Search },
  { href: "/dashboard/student/applications", label: "My Applications", icon: FileText },
  { href: "/dashboard/student/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/student/settings", label: "Settings", icon: Settings },
]

const teacherLinks = [
  { href: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/teacher/opportunities", label: "My Opportunities", icon: FileText },
  { href: "/dashboard/teacher/applications", label: "Applications", icon: Users },
  { href: "/dashboard/teacher/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/teacher/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const links = profile.role === "teacher" ? teacherLinks : studentLinks

  async function handleSignOut() {
    clearAuthSession()
    router.push("/")
    router.refresh()
  }

  const initials = (profile.full_name || profile.name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-card border-r transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64"
      )}
    >
      {/* Sidebar Toggle & Branding */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/" className={cn("transition-opacity", collapsed && "opacity-0 w-0 overflow-hidden")}>
          <Logo size="sm" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {profile.role === "teacher" && (
          <Button
            asChild
            className={cn("w-full mb-4", collapsed ? "px-2" : "")}
          >
            <Link href="/dashboard/teacher/opportunities/new">
              <Plus className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Post Opportunity</span>}
            </Link>
          </Button>
        )}

        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className={cn("px-4 py-2 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <span className="text-xs font-medium text-muted-foreground">Appearance</span>}
        <ModeToggle />
      </div>

      {/* User Menu */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-2",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{profile.full_name || profile.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/${profile.role}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
