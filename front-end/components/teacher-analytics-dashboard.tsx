'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { TeacherStats } from '@/lib/types'
import { getTeacherAnalyticsChartData } from '@/lib/backend-api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  pending: '#3b82f6',
  under_review: '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#6b7280'
}

interface TeacherAnalyticsDashboardProps {
  userId?: string
}

export function TeacherAnalyticsDashboard({ userId }: TeacherAnalyticsDashboardProps) {
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getTeacherAnalyticsChartData()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>
  }

  if (!stats) {
    return <div className="p-6 text-center text-muted-foreground">No analytics data available</div>
  }

  const statusData = Object.entries(stats.applications_by_status).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: count as number,
    fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#000'
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Opportunities Created</p>
          <p className="text-3xl font-bold">{stats.opportunities_created}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Applications</p>
          <p className="text-3xl font-bold">{stats.total_applications_received}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Engagement Score</p>
          <p className="text-3xl font-bold">{stats.student_engagement_score}/10</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Acceptance Rate</p>
          <p className="text-3xl font-bold">
            {stats.total_applications_received > 0
              ? Math.round((stats.applications_by_status.accepted / stats.total_applications_received) * 100)
              : 0}
            %
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Applications by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(stats.applications_by_status).map(([status, count]) => ({
                name: status.replace('_', ' '),
                count
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Most Popular Opportunities */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Most Popular Opportunities</h3>
          <div className="space-y-3">
            {stats.most_popular_opportunities.length === 0 ? (
              <p className="text-muted-foreground">No opportunities yet</p>
            ) : (
              stats.most_popular_opportunities.map((opp, index) => (
                <div key={opp.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{opp.title}</p>
                    <p className="text-sm text-muted-foreground">
                      #{index + 1} Most Popular
                    </p>
                  </div>
                  <p className="text-lg font-bold">{opp.application_count} applications</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
