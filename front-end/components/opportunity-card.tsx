"use client"

import Link from "next/link"
import { formatDistanceToNow, format, isPast } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Globe, 
  Bookmark, 
  BookmarkCheck,
  ExternalLink,
  Clock,
  Star,
  Users,
} from "lucide-react"
import { 
  type Opportunity, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS 
} from "@/lib/types"
import { cn } from "@/lib/utils"

interface OpportunityCardProps {
  opportunity: Opportunity
  isSaved?: boolean
  onSave?: (id: string) => void
  onUnsave?: (id: string) => void
  showActions?: boolean
  onApply?: (id: string) => void
}

export function OpportunityCard({
  opportunity,
  isSaved = false,
  onSave,
  onUnsave,
  showActions = true,
  onApply
}: OpportunityCardProps) {
  const isExpired = isPast(new Date(opportunity.deadline))
  const deadlineDate = new Date(opportunity.deadline)

  return (
    <Card className={cn(
      "group transition-all duration-200 hover:shadow-md hover:border-primary/30",
      isExpired && "opacity-60"
    )}>
      {opportunity.image_url && (
        <Link href={`/opportunities/${opportunity.id}`} className="block relative h-40 overflow-hidden rounded-t-lg bg-muted">
          <img
            src={opportunity.image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Badge 
              variant="outline" 
              className={cn("mb-2 text-xs", CATEGORY_COLORS[opportunity.category])}
            >
              {CATEGORY_LABELS[opportunity.category]}
            </Badge>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/opportunities/${opportunity.id}`}>
                {opportunity.title}
              </Link>
            </h3>
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -mt-1"
              onClick={() => isSaved ? onUnsave?.(opportunity.id) : onSave?.(opportunity.id)}
              aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            <span className="truncate max-w-[150px]">{opportunity.organization}</span>
          </div>
          {opportunity.location && (
            <div className="flex items-center gap-1.5">
              {opportunity.is_remote ? (
                <Globe className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="truncate max-w-[120px]">
                {opportunity.is_remote ? "Remote" : opportunity.location}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {opportunity.preview_description || opportunity.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {(opportunity.application_count || 0) + (opportunity.interested_count || 0)} interested/applied
          </span>
          {!!opportunity.average_rating && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              {opportunity.average_rating.toFixed(1)}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className={cn(
            "flex items-center gap-1.5 text-sm",
            isExpired ? "text-destructive" : "text-muted-foreground"
          )}>
            {isExpired ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span>
              {isExpired 
                ? "Expired" 
                : `Due ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`
              }
            </span>
            <span className="text-muted-foreground/60 text-xs">
              ({format(deadlineDate, "MMM d, yyyy")})
            </span>
          </div>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/opportunities/${opportunity.id}`}>
              View Details
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        
        <Button 
          className="w-full" 
          onClick={() => onApply?.(opportunity.id)}
          disabled={isExpired}
        >
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  )
}
