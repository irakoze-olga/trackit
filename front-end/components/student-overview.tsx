"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { OpportunityCard } from "@/components/opportunity-card"
import type { Profile, Application, Opportunity } from "@/lib/types"
import { format } from "date-fns"
import {
  FileText,
  Clock,
  CheckCircle,
  Bookmark,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

interface StudentOverviewProps {
  profile: Profile
  applications: (Application & { opportunities: Opportunity })[]
  recommended: Opportunity[]
  stats: {
    totalApplications: number
    pending: number
    accepted: number
    savedCount: number
  }
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  under_review: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  withdrawn: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

export function StudentOverview({ profile, applications, recommended, stats }: StudentOverviewProps) {
  const successRate = stats.totalApplications > 0 
    ? Math.round((stats.accepted / stats.totalApplications) * 100) 
    : 0
  const firstName = (profile.full_name || profile.name).split(" ")[0]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground">
            Track your applications and discover new opportunities
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/student/explore">
            Explore Opportunities
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accepted
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Successful applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saved
            </CardTitle>
            <Bookmark className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedCount}</div>
            <p className="text-xs text-muted-foreground">Bookmarked opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Success Rate
          </CardTitle>
          <CardDescription>Your application success rate based on accepted applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={successRate} className="flex-1" />
            <span className="text-2xl font-bold">{successRate}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest submissions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/applications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{app.opportunities.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {app.opportunities.organization}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Badge variant="outline" className={statusColors[app.status]}>
                        {app.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(app.submitted_at), "MMM d")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No applications yet</p>
                <Button asChild>
                  <Link href="/dashboard/student/explore">Find Opportunities</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Based on your profile</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/explore">Browse all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recommended.length > 0 ? (
              <div className="space-y-4">
                {recommended.slice(0, 4).map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{opp.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {opp.organization}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-4 capitalize">
                      {opp.category}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recommendations available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
