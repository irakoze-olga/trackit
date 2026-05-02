"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { format } from "date-fns"
import {
  Search,
  MapPin,
  Calendar,
  Building2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
  Filter,
  GraduationCap,
  Briefcase,
  Trophy,
  Users,
  TrendingUp,
  Target,
} from "lucide-react"
import { toast } from "sonner"
import { listPublicOpportunities, saveOpportunity, unsaveOpportunity } from "@/lib/backend-api"

interface OpportunitiesPageProps {
  opportunities: Opportunity[]
  savedIds: string[]
  appliedIds: string[]
  userId?: string
  initialCategory?: string
  initialSearch?: string
}

const categories: { value: OpportunityCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Categories", icon: <Search className="h-4 w-4" /> },
  { value: "scholarship", label: "Scholarships", icon: <GraduationCap className="h-4 w-4" /> },
  { value: "internship", label: "Internships", icon: <Briefcase className="h-4 w-4" /> },
  { value: "job", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  { value: "competition", label: "Competitions", icon: <Trophy className="h-4 w-4" /> },
  { value: "workshop", label: "Workshops", icon: <Users className="h-4 w-4" /> },
  { value: "grant", label: "Grants", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "fellowship", label: "Fellowships", icon: <Target className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <Search className="h-4 w-4" /> },
]

export function OpportunitiesPage({
  opportunities: initialOpportunities,
  savedIds: initialSavedIds,
  appliedIds,
  userId,
  initialCategory,
  initialSearch,
}: OpportunitiesPageProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [searchQuery, setSearchQuery] = useState(initialSearch || "")
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | "all">(
    (initialCategory as OpportunityCategory | "all") || "all"
  )
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchOpportunities()
  }, [selectedCategory, initialSearch])

  async function fetchOpportunities() {
    setLoading(true)
    try {
      const data = await listPublicOpportunities({
        category: selectedCategory,
        search: initialSearch,
        authAware: true,
      })
      setOpportunities(data.opportunities)
      setSavedIds(data.savedIds)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load opportunities")
    } finally {
      setLoading(false)
    }
  }

  async function toggleSave(opportunityId: string) {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    setSavingId(opportunityId)
    const isSaved = savedIds.includes(opportunityId)

    try {
      if (isSaved) {
        await unsaveOpportunity(opportunityId)
        setSavedIds(savedIds.filter((id) => id !== opportunityId))
        toast.success("Removed from saved")
      } else {
        await saveOpportunity(opportunityId)
        setSavedIds([...savedIds, opportunityId])
        toast.success("Saved opportunity")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update saved opportunities")
    }
    setSavingId(null)
  }

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Opportunities</h1>
        <p className="text-muted-foreground text-lg">
          Discover scholarships, internships, jobs, and more opportunities
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as OpportunityCategory | "all")}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  {cat.icon}
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            className="flex items-center gap-1"
          >
            {cat.icon}
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Results */}
      <div className="mb-4 text-muted-foreground">
        {filteredOpportunities.length} opportunities found
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => {
            const isSaved = savedIds.includes(opportunity.id)
            const hasApplied = appliedIds.includes(opportunity.id)
            const daysUntilDeadline = Math.ceil(
              (new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Card key={opportunity.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary" className="capitalize">
                          {opportunity.category}
                        </Badge>
                        {hasApplied && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            Applied
                          </Badge>
                        )}
                        {daysUntilDeadline <= 7 && (
                          <Badge variant="destructive">
                            {daysUntilDeadline <= 0 ? "Closing soon" : `${daysUntilDeadline}d left`}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{opportunity.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3" />
                        {opportunity.organization}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSave(opportunity.id)}
                      disabled={savingId === opportunity.id}
                    >
                      {savingId === opportunity.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isSaved ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {opportunity.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {opportunity.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{opportunity.location}</span>
                        {opportunity.is_remote && (
                          <Badge variant="outline" className="text-xs">Remote</Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {format(new Date(opportunity.deadline), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-4 border-t">
                  <Button asChild className="flex-1">
                    <Link href={`/opportunities/${opportunity.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {opportunity.application_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={opportunity.application_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show sample opportunities when no data is available */}
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}
    </div>
  )
}
