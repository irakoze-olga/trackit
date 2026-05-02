"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { TeacherOverview } from "@/components/teacher-overview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { getStoredUser } from "@/lib/backend-auth"
import { getTeacherOverviewData } from "@/lib/backend-api"
import type { Application, Opportunity, Profile } from "@/lib/types"

export default function MaintainerDashboardPage() {
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.replace("/auth/login")
      return
    }
    if (storedUser.role !== "maintainer") {
      router.replace("/")
      return
    }
    getTeacherOverviewData()
      .then(setData)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load maintainer dashboard"))
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <DashboardShell profile={data.profile} title="Maintainer dashboard">
      <TeacherOverview
        profile={data.profile}
        opportunities={data.opportunities}
        applications={data.applications}
        stats={data.stats}
      />
    </DashboardShell>
  )
}
