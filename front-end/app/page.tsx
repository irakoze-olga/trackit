'use client'

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OpportunityCard } from "@/components/opportunity-card"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Opportunity, OpportunityCategory, Profile } from "@/lib/types"
import { Github, Linkedin, Search, Sparkles, Users, ShieldCheck, Bell } from "lucide-react"
import { getHomePageData } from "@/lib/backend-api"

const categories: { value: OpportunityCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scholarship", label: "Scholarships" },
  { value: "internship", label: "Internships" },
  { value: "competition", label: "Competitions" },
  { value: "workshop", label: "Workshops" },
  { value: "fellowship", label: "Fellowships" },
]

export default function HomePage() {
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [popular, setPopular] = useState<Opportunity[]>([])
  const [maintainers, setMaintainers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | "all">("all")
  const [stats, setStats] = useState({
    active_opportunities: 0,
    registered_users: 0,
    applications_submitted: 0,
    success_rate: 0,
  })

  useEffect(() => {
    setLoading(true)
    getHomePageData(selectedCategory)
      .then((payload) => {
        setOpportunities(payload.opportunities)
        setPopular(payload.popular)
        setMaintainers(payload.maintainers)
        setStats(payload.stats)
      })
      .catch(() => {
        setOpportunities([])
        setPopular([])
        setMaintainers([])
      })
      .finally(() => setLoading(false))
  }, [selectedCategory])

  const filteredOpportunities = useMemo(
    () =>
      opportunities.filter((opportunity) =>
        [opportunity.title, opportunity.organization, opportunity.description]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [opportunities, searchQuery]
  )

  return (
    <>
      <section className="relative overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.14),transparent_34%),linear-gradient(120deg,rgba(15,23,42,0.05),transparent)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 pt-5 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-5 gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Built for Rwanda Coding Academy
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-normal text-foreground md:text-6xl">
              RCA TrackIt
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              A focused opportunity hub where RCA students discover deadlines, teachers and
              maintainers share useful openings, and administrators approve every post before it
              reaches the academy community.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => router.push("/auth/login")}>
                Sign in
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#popular">See popular opportunities</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Open", stats.active_opportunities],
                ["Students", stats.registered_users],
                ["Applications", stats.applications_submitted],
                ["Success", `${stats.success_rate}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-card/70 p-4">
                  <div className="text-2xl font-bold">{loading ? "..." : value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] border bg-card/30" />
            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b p-4">
                <Logo size="sm" />
                <Badge variant="outline">Admin approved</Badge>
              </div>
              <div className="relative aspect-[4/3] bg-muted">
                <Image src="/icon.svg" alt="TrackIt" fill className="object-contain p-10" priority />
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-3">
                {[
                  [ShieldCheck, "Approval portal"],
                  [Bell, "Email and Slack reminders"],
                  [Users, "Maintainer credits"],
                ].map(([Icon, label]) => (
                  <div key={String(label)} className="rounded-lg border bg-background p-3 text-sm">
                    <Icon className="mb-2 h-4 w-4 text-primary" />
                    {label as string}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="popular" className="px-4 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge variant="outline">Recommended by activity</Badge>
              <h2 className="mt-3 text-3xl font-bold">Most popular right now</h2>
              <p className="text-muted-foreground">
                Ranked by RCA student applications, interest toggles, and ratings.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search opportunities"
                className="pl-10"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(filteredOpportunities.length ? filteredOpportunities : popular).slice(0, 9).map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onApply={(opportunityId) => router.push(`/opportunities/${opportunityId}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Maintainers</h2>
              <p className="text-muted-foreground">Honoring the RCA developers who keep TrackIt moving.</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {maintainers.map((maintainer) => (
              <div key={maintainer.id} className="min-w-64 rounded-lg border bg-background p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={maintainer.avatar_url || undefined} />
                    <AvatarFallback>{maintainer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{maintainer.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{maintainer.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {maintainer.githubUsername && (
                    <Button size="icon" variant="outline" asChild>
                      <a href={`https://github.com/${maintainer.githubUsername}`} target="_blank" rel="noreferrer" aria-label="GitHub">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {maintainer.linkedinUrl && (
                    <Button size="icon" variant="outline" asChild>
                      <a href={maintainer.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
