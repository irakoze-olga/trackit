'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { StudentStats } from '@/lib/types'
import { getStudentAnalyticsData } from '@/lib/backend-api'
import {
  LineChart,
  Line,
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

interface StudentAnalyticsDashboardProps {
  userId?: string
}

export function StudentAnalyticsDashboard({ userId }: StudentAnalyticsDashboardProps) {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStudentAnalyticsData()
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

  const categoryData = Object.entries(stats.applications_by_category).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: count as number
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Applications</p>
          <p className="text-3xl font-bold">{stats.total_applications}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Accepted</p>
          <p className="text-3xl font-bold text-success">{stats.accepted_count}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Success Rate</p>
          <p className="text-3xl font-bold">{stats.success_rate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold text-warning">{stats.pending_count}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.applications_over_time}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Applications by Category */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Applications by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Application Status Breakdown */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Status Breakdown</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-1">{stats.pending_count}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{stats.accepted_count}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{stats.rejected_count}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.total_applications - stats.accepted_count - stats.rejected_count - stats.pending_count}</p>
              <p className="text-sm text-muted-foreground">Other</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
