"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ExternalLink } from "lucide-react"

const featuredOpportunities = [
  {
    id: "1",
    title: "Tech Innovation Scholarship 2026",
    description: "Full scholarship for students pursuing technology and innovation degrees",
    category: "scholarship",
    organization: "Rwanda ICT Chamber",
    deadline: "2026-06-15",
    location: "Kigali, Rwanda",
    image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=200&fit=crop",
    application_url: "https://scholarships.rwandaictchamber.rw/apply"
  },
  {
    id: "2",
    title: "Digital Marketing Internship",
    description: "Join our dynamic marketing team and gain hands-on experience",
    category: "internship",
    organization: "Kigali Digital Agency",
    deadline: "2026-04-25",
    location: "Kigali, Rwanda",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
    application_url: "https://kigalidigital.rw/internship-application"
  },
  {
    id: "3",
    title: "Rwanda Coding Competition 2026",
    description: "Showcase your coding skills and compete for prizes",
    category: "competition",
    organization: "Rwanda Coding Academy",
    deadline: "2026-05-10",
    location: "Online",
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
    application_url: "https://competition.rwandacoding.ac.rw/register"
  }
]

export function Footer() {
  const pathname = usePathname()
  const isDashboardPage = pathname?.startsWith("/dashboard")

  if (isDashboardPage) return null

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Featured Opportunities Section */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">Featured Opportunities</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="group relative overflow-hidden rounded-lg border bg-background hover:shadow-md transition-shadow">
                {/* Cover Image */}
                <div className="relative h-32 w-full">
                  <Image
                    src={opportunity.image_url}
                    alt={opportunity.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-white/90 text-black hover:bg-white">
                      {opportunity.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/opportunities/${opportunity.id}`}>
                      {opportunity.title}
                    </Link>
                  </h4>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {opportunity.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{opportunity.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/opportunities/${opportunity.id}`} className="flex-1">
                      <div className="w-full text-xs bg-primary text-primary-foreground rounded px-2 py-1.5 text-center hover:bg-primary/90 transition-colors">
                        View Details
                      </div>
                    </Link>
                    {opportunity.application_url && (
                      <a
                        href={opportunity.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded px-2 py-1.5 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Apply
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link href="/opportunities">
              <div className="inline-flex items-center text-sm text-primary hover:underline">
                View all opportunities
                <ExternalLink className="h-3 w-3 ml-1" />
              </div>
            </Link>
          </div>
        </div>

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
              <li>
                <Link href="/opportunities?category=competition" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Competitions
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
