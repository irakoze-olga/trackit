"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, LayoutDashboard, Menu, GraduationCap, BookOpen } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import type { Profile } from "@/lib/types"
import { clearAuthSession, getStoredUser } from "@/lib/backend-auth"
import { getCurrentUserProfile } from "@/lib/backend-api"

interface HeaderProps {
  user?: Profile | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Profile | null>(user || null)

  useEffect(() => {
    if (user) {
      setCurrentUser(user)
      return
    }

    const storedUser = getStoredUser()
    if (!storedUser) {
      setCurrentUser(null)
      return
    }

    getCurrentUserProfile()
      .then(setCurrentUser)
      .catch(() => {
        clearAuthSession()
        setCurrentUser(null)
      })
  }, [user])

  const handleRoleSelect = (role: "student" | "teacher") => {
    setRoleDialogOpen(false)
    router.push(`/dashboard/${role}`)
  }

  const navLinks = [
    { href: "/search", label: "Browse Opportunities" },
    { href: "/about", label: "About" },
  ]

  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex"
                asChild
              >
                <Link href={`/dashboard/${currentUser.role}`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex flex-col gap-1 p-2">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {currentUser.role}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/${currentUser.role}`} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/${currentUser.role}/settings`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => {
                      clearAuthSession()
                      setCurrentUser(null)
                      router.push("/")
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/search">Browse</Link>
              </Button>
              <Button size="sm" onClick={() => setRoleDialogOpen(true)}>
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 mt-6">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === link.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {currentUser && (
                    <Link
                      href={`/dashboard/${currentUser.role}`}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/dashboard"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                </nav>
                {!currentUser && (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/search">Browse</Link>
                    </Button>
                    <Button onClick={() => setRoleDialogOpen(true)}>
                      Get Started
                    </Button>
                  </div>
                )}
                {currentUser && (
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      clearAuthSession()
                      setCurrentUser(null)
                      router.push("/")
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Role Selection Dialog */}
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">Choose Your Role</DialogTitle>
                <DialogDescription className="text-center">
                  Select how you want to use TrackIt
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-6">
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Student</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Find and apply to opportunities
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("teacher")}
                  className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Teacher</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Post and manage opportunities
                    </p>
                  </div>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
