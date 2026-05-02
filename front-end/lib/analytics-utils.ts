import { Application, ApplicationStatus, OpportunityCategory, StudentStats, TeacherStats } from './types'

/**
 * Calculate student statistics from applications
 */
export function calculateStudentStats(applications: Application[]): Omit<StudentStats, 'user_id'> {
  const stats = {
    total_applications: applications.length,
    accepted_count: 0,
    rejected_count: 0,
    pending_count: 0,
    success_rate: 0,
    applications_by_category: {} as Record<OpportunityCategory, number>,
    applications_over_time: [] as Array<{ date: string; count: number }>
  }

  // Count by status
  applications.forEach(app => {
    if (app.status === 'accepted') stats.accepted_count++
    if (app.status === 'rejected') stats.rejected_count++
    if (app.status === 'pending' || app.status === 'under_review') stats.pending_count++
  })

  // Calculate success rate
  if (stats.total_applications > 0) {
    stats.success_rate = Math.round(
      (stats.accepted_count / stats.total_applications) * 100
    )
  }

  // Group by category
  applications.forEach(app => {
    const category = app.opportunity?.category
    if (category) {
      stats.applications_by_category[category] =
        (stats.applications_by_category[category] || 0) + 1
    }
  })

  // Group by time (group applications by week)
  const timeGroups = new Map<string, number>()
  applications.forEach(app => {
    const date = new Date(app.submitted_at)
    const weekStart = getWeekStart(date)
    const key = weekStart.toISOString().split('T')[0]
    timeGroups.set(key, (timeGroups.get(key) || 0) + 1)
  })

  stats.applications_over_time = Array.from(timeGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  return stats
}

/**
 * Calculate teacher statistics
 */
export function calculateTeacherStats(
  opportunities: any[],
  applications: any[]
): Omit<TeacherStats, 'user_id'> {
  const stats = {
    opportunities_created: opportunities.length,
    total_applications_received: applications.length,
    applications_by_status: {
      pending: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    } as Record<ApplicationStatus, number>,
    most_popular_opportunities: [] as Array<{ id: string; title: string; application_count: number }>,
    student_engagement_score: 0
  }

  // Count by status
  applications.forEach(app => {
    if (app.status in stats.applications_by_status) {
      stats.applications_by_status[app.status as ApplicationStatus]++
    }
  })

  // Group applications by opportunity
  const opportunityAppCounts = new Map<string, { title: string; count: number }>()
  applications.forEach(app => {
    const oppId = app.opportunity_id
    const title = app.opportunity?.title || 'Unknown'
    if (!opportunityAppCounts.has(oppId)) {
      opportunityAppCounts.set(oppId, { title, count: 0 })
    }
    opportunityAppCounts.get(oppId)!.count++
  })

  // Get top opportunities
  stats.most_popular_opportunities = Array.from(opportunityAppCounts.entries())
    .map(([id, data]) => ({
      id,
      title: data.title,
      application_count: data.count
    }))
    .sort((a, b) => b.application_count - a.application_count)
    .slice(0, 5)

  // Calculate engagement score (0-100)
  // Based on: application volume, acceptance rate, repeat applications
  if (opportunities.length > 0) {
    const avgAppsPerOpp = applications.length / opportunities.length
    const acceptanceRate = stats.applications_by_status.accepted /
      Math.max(1, stats.total_applications_received)
    
    stats.student_engagement_score = Math.round(
      Math.min(100,
        (avgAppsPerOpp / 10 * 50) + (acceptanceRate * 50)
      )
    )
  }

  return stats
}

/**
 * Get conversion funnel data
 */
export function getConversionFunnel(applications: Application[]) {
  return {
    applied: applications.length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    accepted: applications.filter(a => a.status === 'accepted').length
  }
}

/**
 * Calculate application stats for a single opportunity
 */
export function getOpportunityStats(applications: Application[]) {
  return {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length,
    acceptance_rate: applications.length > 0
      ? Math.round(
        (applications.filter(a => a.status === 'accepted').length / applications.length) * 100
      )
      : 0
  }
}

/**
 * Get date range statistics
 */
export function getStatsForDateRange(
  applications: Application[],
  startDate: Date,
  endDate: Date
): Omit<StudentStats, 'user_id'> {
  const filtered = applications.filter(app => {
    const date = new Date(app.submitted_at)
    return date >= startDate && date <= endDate
  })

  return calculateStudentStats(filtered)
}

/**
 * Get comparison data (this month vs last month)
 */
export function getMonthComparison(applications: Application[]) {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisMonth = applications.filter(app => {
    const date = new Date(app.submitted_at)
    return date >= thisMonthStart
  }).length

  const lastMonth = applications.filter(app => {
    const date = new Date(app.submitted_at)
    return date >= lastMonthStart && date <= lastMonthEnd
  }).length

  const change = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0

  return {
    this_month: thisMonth,
    last_month: lastMonth,
    change_percent: change,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
  }
}

/**
 * Helper function to get the start of a week (Monday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

/**
 * Format statistics for display
 */
export function formatStatistic(value: number, type: 'percentage' | 'count' | 'rate'): string {
  if (type === 'percentage') return `${Math.round(value)}%`
  if (type === 'rate') return `${(value * 100).toFixed(1)}%`
  return `${Math.round(value)}`
}

/**
 * Get insights/recommendations based on student stats
 */
export function getStudentInsights(stats: Omit<StudentStats, 'user_id'>): string[] {
  const insights: string[] = []

  if (stats.total_applications === 0) {
    insights.push('Get started! Browse opportunities and submit your first application.')
  } else if (stats.total_applications < 5) {
    insights.push(`You've applied to ${stats.total_applications} opportunity. Keep expanding your search!`)
  }

  if (stats.success_rate > 50) {
    insights.push('Great job! Your acceptance rate is above average.')
  } else if (stats.success_rate > 0) {
    insights.push('Keep applying! More opportunities will lead to better results.')
  } else if (stats.total_applications > 5) {
    insights.push('Consider updating your profile to better match opportunities.')
  }

  if (stats.pending_count > 3) {
    insights.push(`You have ${stats.pending_count} pending applications. Check back soon for updates!`)
  }

  const categories = Object.entries(stats.applications_by_category)
  if (categories.length === 1) {
    insights.push(`You're focused on ${categories[0][0]}s. Consider exploring other opportunity types!`)
  }

  return insights
}
