"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import type { Opportunity, Profile } from "@/lib/types"
import { format, formatDistanceToNow } from "date-fns"
import {
  MapPin,
  Calendar,
  Building2,
  User,
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  CheckCircle,
  ArrowLeft,
  Send,
  Eye,
  Globe,
  Star,
  Heart,
} from "lucide-react"
import { toast } from "sonner"
import { createApplication, saveOpportunity, saveOpportunityEngagement, unsaveOpportunity } from "@/lib/backend-api"

interface OpportunityDetailProps {
  opportunity: Opportunity
  poster?: { full_name: string; email: string; institution?: string } | null
  userProfile: Profile | null
  hasApplied: boolean
  isSaved: boolean
}

export function OpportunityDetail({
  opportunity,
  poster,
  userProfile,
  hasApplied: initialHasApplied,
  isSaved: initialIsSaved,
}: OpportunityDetailProps) {
  const [hasApplied, setHasApplied] = useState(initialHasApplied)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [interested, setInterested] = useState(false)
  const [rating, setRating] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const isExpired = new Date(opportunity.deadline) < new Date()
  const daysUntilDeadline = Math.ceil(
    (new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  async function toggleSave() {
    if (!userProfile) {
      router.push("/auth/login")
      return
    }

    setSaving(true)

    try {
      if (isSaved) {
        await unsaveOpportunity(opportunity.id)
        setIsSaved(false)
        toast.success("Removed from saved")
      } else {
        await saveOpportunity(opportunity.id)
        setIsSaved(true)
        toast.success("Saved opportunity")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update saved opportunity")
    }
    setSaving(false)
  }

  async function handleApply() {
    if (!userProfile) {
      router.push("/auth/login")
      return
    }

    if (userProfile.role !== "student") {
      toast.error("Only students can apply to opportunities")
      return
    }

    setApplying(true)

    try {
      await createApplication({
        opportunityId: opportunity.id,
        coverLetter,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application")
      setApplying(false)
      return
    }

    setHasApplied(true)
    setDialogOpen(false)
    toast.success("Application submitted successfully!")
    setApplying(false)
  }

  async function handleEngagement(next: { interested?: boolean; rating?: number }) {
    if (!userProfile) {
      router.push("/auth/login")
      return
    }
    if (userProfile.role !== "student") {
      toast.error("Only students can rate or mark interest")
      return
    }

    try {
      await saveOpportunityEngagement(opportunity.id, next)
      if (typeof next.interested === "boolean") setInterested(next.interested)
      if (typeof next.rating === "number") setRating(next.rating)
      toast.success("Preference saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save preference")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Opportunities
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {opportunity.image_url && (
              <div className="relative h-64 overflow-hidden rounded-t-lg bg-muted">
                <img src={opportunity.image_url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="capitalize">
                  {opportunity.category}
                </Badge>
                {opportunity.is_remote && (
                  <Badge variant="outline">
                    <Globe className="h-3 w-3 mr-1" />
                    Remote
                  </Badge>
                )}
                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : daysUntilDeadline <= 7 ? (
                  <Badge variant="destructive">
                    {daysUntilDeadline <= 0 ? "Last day!" : `${daysUntilDeadline} days left`}
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-2xl md:text-3xl">{opportunity.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                {opportunity.organization}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {opportunity.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {opportunity.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Deadline: {format(new Date(opportunity.deadline), "MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {opportunity.views_count || 0} views
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
              </div>

              {opportunity.eligibility && (
                <div>
                  <h3 className="font-semibold mb-3">Eligibility</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.eligibility}</p>
                </div>
              )}

              {opportunity.requirements && (
                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.requirements}</p>
                </div>
              )}

              {opportunity.benefits && (
                <div>
                  <h3 className="font-semibold mb-3">Benefits</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.benefits}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posted By */}
          {poster && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posted By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{poster.full_name}</p>
                    {poster.institution && (
                      <p className="text-sm text-muted-foreground">{poster.institution}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {hasApplied ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-green-500/10 rounded-lg text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Application Submitted</span>
                </div>
              ) : isExpired ? (
                <Button disabled className="w-full">
                  Applications Closed
                </Button>
              ) : userProfile?.role === "student" ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Send className="mr-2 h-4 w-4" />
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to {opportunity.title}</DialogTitle>
                      <DialogDescription>
                        Submit your application to {opportunity.organization}
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Cover Letter (Optional)</FieldLabel>
                        <Textarea
                          placeholder="Tell the organization why you're a great fit..."
                          rows={6}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                      </Field>
                    </FieldGroup>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApply} disabled={applying}>
                        {applying ? <Spinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : !userProfile ? (
                <Button asChild className="w-full" size="lg">
                  <Link href="/auth/login">Sign In to Apply</Link>
                </Button>
              ) : null}

              <Button
                variant="outline"
                className="w-full"
                onClick={toggleSave}
                disabled={saving}
              >
                {saving ? (
                  <Spinner className="mr-2" />
                ) : isSaved ? (
                  <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="mr-2 h-4 w-4" />
                )}
                {isSaved ? "Saved" : "Save for Later"}
              </Button>

              {opportunity.application_url && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={opportunity.application_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    External Application
                  </a>
                </Button>
              )}

              {userProfile?.role === "student" && !isExpired && (
                <div className="rounded-lg border p-3">
                  <Button
                    variant={interested ? "default" : "outline"}
                    className="mb-3 w-full"
                    onClick={() => handleEngagement({ interested: !interested })}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {interested ? "Interested" : "Mark interested"}
                  </Button>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEngagement({ rating: value })}
                        aria-label={`Rate ${value}`}
                      >
                        <Star className={value <= rating ? "h-5 w-5 fill-current text-amber-500" : "h-5 w-5 text-muted-foreground"} />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="secondary" className="capitalize">{opportunity.category}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deadline</span>
                <span className="text-sm font-medium">
                  {format(new Date(opportunity.deadline), "MMM d, yyyy")}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="text-sm font-medium">
                  {opportunity.location || "Not specified"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remote</span>
                <span className="text-sm font-medium">
                  {opportunity.is_remote ? "Yes" : "No"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Posted</span>
                <span className="text-sm font-medium">
                  {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
