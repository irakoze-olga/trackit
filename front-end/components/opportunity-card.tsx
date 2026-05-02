"use client"

import Link from "next/link"
import Image from "next/image"
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
  Clock
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
      "group transition-all duration-200 hover:shadow-md hover:border-primary/30 overflow-hidden",
      isExpired && "opacity-60"
    )}>
      {/* Image Section */}
      <div className="relative h-48 w-full">
        {opportunity.image_url ? (
          <Image
            src={opportunity.image_url}
            alt={opportunity.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">No image available</p>
            </div>
          </div>
        )}
        {showActions && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
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

      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
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
          {opportunity.description}
        </p>
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

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onApply?.(opportunity.id)}
            disabled={isExpired}
          >
            Apply Now
          </Button>
          {opportunity.application_url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={isExpired}
            >
              <a
                href={opportunity.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Apply
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
