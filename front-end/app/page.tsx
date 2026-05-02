'use client'

<<<<<<< HEAD
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OpportunityCard } from "@/components/opportunity-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Opportunity, OpportunityCategory } from "@/lib/types"
import {
  Search,
  GraduationCap,
  Briefcase,
  Trophy,
  Users,
  TrendingUp,
  Target,
} from "lucide-react"
import { getHomePageData } from "@/lib/backend-api"

const categories: { value: OpportunityCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Categories", icon: <Search className="h-4 w-4" /> },
  { value: "scholarship", label: "Scholarships", icon: <GraduationCap className="h-4 w-4" /> },
  { value: "internship", label: "Internships", icon: <Briefcase className="h-4 w-4" /> },
  { value: "job", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  { value: "competition", label: "Competitions", icon: <Trophy className="h-4 w-4" /> },
  { value: "workshop", label: "Workshops", icon: <Users className="h-4 w-4" /> },
  { value: "grant", label: "Grants", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "fellowship", label: "Fellowships", icon: <Target className="h-4 w-4" /> },
=======
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
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
]

export default function HomePage() {
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
<<<<<<< HEAD
=======
  const [popular, setPopular] = useState<Opportunity[]>([])
  const [maintainers, setMaintainers] = useState<Profile[]>([])
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | "all">("all")
  const [stats, setStats] = useState({
    active_opportunities: 0,
    registered_users: 0,
    applications_submitted: 0,
    success_rate: 0,
  })

<<<<<<< HEAD
  const handleRoleSelect = (role: "student" | "teacher") => {
    router.push(`/dashboard/${role}`)
  }

=======
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  useEffect(() => {
    setLoading(true)
    getHomePageData(selectedCategory)
      .then((payload) => {
        setOpportunities(payload.opportunities)
<<<<<<< HEAD
=======
        setPopular(payload.popular)
        setMaintainers(payload.maintainers)
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
        setStats(payload.stats)
      })
      .catch(() => {
        setOpportunities([])
<<<<<<< HEAD
=======
        setPopular([])
        setMaintainers([])
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
      })
      .finally(() => setLoading(false))
  }, [selectedCategory])

<<<<<<< HEAD
  const filteredOpportunities = opportunities.filter((opportunity) =>
    opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opportunity.description.toLowerCase().includes(searchQuery.toLowerCase())
=======
  const filteredOpportunities = useMemo(
    () =>
      opportunities.filter((opportunity) =>
        [opportunity.title, opportunity.organization, opportunity.description]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [opportunities, searchQuery]
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  )

  return (
    <>
<<<<<<< HEAD
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Discover Your Next Opportunity
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Track, Apply, and Land Your Dream Opportunities
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            TrackIt connects students with scholarships, internships, jobs, competitions, and more.
            Find opportunities tailored to your goals and track your applications in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => handleRoleSelect("student")}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#opportunities">Browse Opportunities</Link>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              label: stats.active_opportunities === 1 ? "Active Opportunity" : "Active Opportunities",
              value: loading ? "..." : stats.active_opportunities.toString()
            },
            {
              label: stats.registered_users === 1 ? "Student Registered" : "Students Registered",
              value: loading ? "..." : stats.registered_users.toString()
            },
            {
              label: stats.applications_submitted === 1 ? "Application Submitted" : "Applications Submitted",
              value: loading ? "..." : stats.applications_submitted.toString()
            },
            {
              label: "Success Rate",
              value: loading ? "..." : `${stats.success_rate}%`
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary min-h-[1.2em]">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Explore by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
=======
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
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
<<<<<<< HEAD
                className="flex items-center gap-2"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.icon}
=======
                onClick={() => setSelectedCategory(category.value)}
              >
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
                {category.label}
              </Button>
            ))}
          </div>
<<<<<<< HEAD
        </div>
      </section>

      <section id="opportunities" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold">Latest Opportunities</h2>
              <p className="text-muted-foreground">Find your next big opportunity</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as OpportunityCategory | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-72 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onApply={(opportunityId) => router.push(`/opportunities/${opportunityId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show sample opportunities when no data is available */}
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="h-72 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          )}

          {filteredOpportunities.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link href="/search">View All Opportunities</Link>
              </Button>
            </div>
          )}
=======

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
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
        </div>
      </section>
    </>
  )
}
