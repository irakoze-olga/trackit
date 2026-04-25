"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"

export function Footer() {
  const pathname = usePathname()
  const isDashboardPage = pathname?.startsWith("/dashboard")

  if (isDashboardPage) return null

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover and track opportunities that match your goals. Never miss a deadline again.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/opportunities" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link href="/opportunities?category=scholarship" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/opportunities?category=internship" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/opportunities?category=job" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Jobs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About TrackIt
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up?role=teacher" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Post Opportunities
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} TrackIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
