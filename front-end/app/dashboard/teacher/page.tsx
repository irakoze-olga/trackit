'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TeacherOverview } from "@/components/teacher-overview"
import type { Profile, Opportunity, Application } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { getStoredUser } from "@/lib/backend-auth"
import { getTeacherOverviewData } from "@/lib/backend-api"
import { AlertCircle } from "lucide-react"

export default function TeacherDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: Profile
    opportunities: Opportunity[]
    applications: (Application & {
      opportunities: { title: string }
      profiles: { full_name: string; email: string }
    })[]
    stats: {
      totalOpportunities: number
      activeOpportunities: number
      totalApplications: number
      pendingReview: number
      totalViews: number
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      router.replace("/auth/login")
      return
    }

    if (storedUser.role !== "teacher") {
      router.replace("/dashboard/student")
      return
    }

    async function loadDashboard() {
      try {
        const payload = await getTeacherOverviewData()
        setData(payload)
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load teacher dashboard"
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Spinner className="h-5 w-5" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Unable to load dashboard data."}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={data.profile} />
      <main className="flex-1 overflow-auto">
        <TeacherOverview
          profile={data.profile}
          opportunities={data.opportunities}
          applications={data.applications}
          stats={data.stats}
        />
      </main>
    </div>
  )
}
