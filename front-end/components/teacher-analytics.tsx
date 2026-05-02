"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Opportunity } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { FileText, Users, Eye, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react"

interface TeacherAnalyticsProps {
  opportunities: Opportunity[]
  applicationStats: {
    total: number
    pending: number
    under_review: number
    accepted: number
    rejected: number
    withdrawn: number
  }
  totalViews: number
}

const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444", "#6b7280"]

export function TeacherAnalytics({ opportunities, applicationStats, totalViews }: TeacherAnalyticsProps) {
  const acceptanceRate = applicationStats.total > 0
    ? Math.round((applicationStats.accepted / applicationStats.total) * 100)
    : 0

  // Data for category distribution
  const categoryData = opportunities.reduce((acc, opp) => {
    const existing = acc.find((item) => item.name === opp.category)
    if (existing) {
      existing.value++
    } else {
      acc.push({ name: opp.category, value: 1 })
    }
    return acc
  }, [] as { name: string; value: number }[])

  // Data for status distribution
  const statusData = [
    { name: "Pending", value: applicationStats.pending, color: "#f59e0b" },
    { name: "Under Review", value: applicationStats.under_review, color: "#3b82f6" },
    { name: "Accepted", value: applicationStats.accepted, color: "#22c55e" },
    { name: "Rejected", value: applicationStats.rejected, color: "#ef4444" },
    { name: "Withdrawn", value: applicationStats.withdrawn, color: "#6b7280" },
  ].filter((item) => item.value > 0)

  // Data for views per opportunity (top 5)
  const viewsData = opportunities
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)
    .map((opp) => ({
      name: opp.title.length > 20 ? opp.title.substring(0, 20) + "..." : opp.title,
      views: opp.views_count || 0,
    }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track the performance of your opportunities</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Opportunities
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              {opportunities.filter((o) => o.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {applicationStats.pending + applicationStats.under_review} pending review
            </p>
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
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              {opportunities.length > 0 ? Math.round(totalViews / opportunities.length) : 0} avg per opportunity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acceptance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate}%</div>
            <Progress value={acceptanceRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Distribution of application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No application data yet
              </div>
            )}
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Opportunities by Views */}
        <Card>
          <CardHeader>
            <CardTitle>Top Opportunities by Views</CardTitle>
            <CardDescription>Your most viewed opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            {viewsData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No opportunities posted yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationStats.pending}</div>
            <p className="text-sm text-muted-foreground">Applications awaiting initial review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationStats.accepted}</div>
            <p className="text-sm text-muted-foreground">Successfully accepted candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationStats.rejected}</div>
            <p className="text-sm text-muted-foreground">Applications not selected</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Opportunities by Category</CardTitle>
            <CardDescription>Distribution of your opportunities across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {cat.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
