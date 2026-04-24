"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Profile, Opportunity, Application } from "@/lib/types"
import { format } from "date-fns"
import {
  FileText,
  Users,
  Eye,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle,
} from "lucide-react"

interface TeacherOverviewProps {
  profile: Profile
  opportunities: Opportunity[]
  applications: (Application & { opportunities: { title: string }; profiles: { full_name: string; email: string } })[]
  stats: {
    totalOpportunities: number
    activeOpportunities: number
    totalApplications: number
    pendingReview: number
    totalViews: number
  }
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  under_review: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
}

export function TeacherOverview({ profile, opportunities, applications, stats }: TeacherOverviewProps) {
  const firstName = (profile.full_name || profile.name).split(" ")[0]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground">
            Manage your opportunities and review applications
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teacher/opportunities/new">
            <Plus className="mr-2 h-4 w-4" />
            Post New Opportunity
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Opportunities
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">All time posted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOpportunities}</div>
            <p className="text-xs text-muted-foreground">Currently accepting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
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
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">All opportunities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Opportunities</CardTitle>
              <CardDescription>Recently posted opportunities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/teacher/opportunities">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.slice(0, 5).map((opp) => (
                  <div
                    key={opp.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{opp.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{opp.category}</span>
                        <span>•</span>
                        <span>{opp.views_count || 0} views</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        opp.status === "active"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : opp.status === "closed"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      }
                    >
                      {opp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No opportunities posted yet</p>
                <Button asChild>
                  <Link href="/dashboard/teacher/opportunities/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Opportunity
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Applications that need review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/teacher/applications">View all</Link>
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
                      <p className="font-medium truncate">{app.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Applied to: {app.opportunities.title}
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
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applications received yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Applications will appear here once students apply to your opportunities
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/dashboard/teacher/opportunities/new">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Post Opportunity</p>
                    <p className="text-sm text-muted-foreground">Create a new listing</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/dashboard/teacher/applications">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Review Applications</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingReview} pending</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/dashboard/teacher/analytics">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-muted-foreground">Track performance</p>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
