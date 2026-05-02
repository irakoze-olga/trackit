"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions } from "@/components/ui/empty"
import type { Opportunity } from "@/lib/types"
import { format } from "date-fns"
import { Search, Bookmark, MapPin, Calendar, Building2, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { unsaveOpportunity } from "@/lib/backend-api"

interface SavedOpportunitiesProps {
  opportunities: (Opportunity & { saved_id: string })[]
  userId: string
}

export function SavedOpportunities({ opportunities: initialOpportunities, userId }: SavedOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [searchQuery, setSearchQuery] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function removeSaved(savedId: string, opportunityId: string) {
    setRemovingId(opportunityId)
    
    try {
      await unsaveOpportunity(opportunityId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove from saved")
      setRemovingId(null)
      return
    }

    setOpportunities(opportunities.filter((o) => o.id !== opportunityId))
    toast.success("Removed from saved")
    setRemovingId(null)
  }

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Opportunities</h1>
        <p className="text-muted-foreground">Opportunities you&apos;ve bookmarked for later</p>
      </div>

      {opportunities.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved opportunities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => {
            const isExpired = new Date(opportunity.deadline) < new Date()
            
            return (
              <Card key={opportunity.id} className={isExpired ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {opportunity.category}
                        </Badge>
                        {isExpired && (
                          <Badge variant="destructive">Expired</Badge>
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
                      onClick={() => removeSaved(opportunity.saved_id, opportunity.id)}
                      disabled={removingId === opportunity.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {removingId === opportunity.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {opportunity.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {opportunity.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {format(new Date(opportunity.deadline), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button asChild className="w-full" disabled={isExpired}>
                    <Link href={`/opportunities/${opportunity.id}`}>
                      {isExpired ? "View Details" : "View & Apply"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Empty>
          <EmptyIcon>
            <Bookmark className="h-10 w-10" />
          </EmptyIcon>
          <EmptyTitle>
            {searchQuery ? "No matching saved opportunities" : "No saved opportunities"}
          </EmptyTitle>
          <EmptyDescription>
            {searchQuery
              ? "Try adjusting your search terms"
              : "Start saving opportunities to keep track of ones you're interested in"}
          </EmptyDescription>
          <EmptyActions>
            <Button asChild>
              <Link href="/dashboard/student/explore">Explore Opportunities</Link>
            </Button>
          </EmptyActions>
        </Empty>
      )}
    </div>
  )
}
