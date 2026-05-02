'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
<<<<<<< HEAD
import { DashboardSidebar } from "@/components/dashboard-sidebar"
=======
import { DashboardShell } from "@/components/dashboard-shell"
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
import { StudentOverview } from "@/components/student-overview"
import type { Application, Opportunity, Profile } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { getStoredUser } from "@/lib/backend-auth"
import { getStudentDashboardData } from "@/lib/backend-api"

export default function StudentDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: Profile
    applications: (Application & { opportunities: Opportunity })[]
    recommended: Opportunity[]
    stats: {
      totalApplications: number
      pending: number
      accepted: number
      savedCount: number
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

    if (storedUser.role !== "student") {
      router.replace("/dashboard/teacher")
      return
    }

    getStudentDashboardData()
      .then(setData)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Unable to load student dashboard")
      )
      .finally(() => setLoading(false))
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
<<<<<<< HEAD
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={data.profile} />
      <main className="flex-1 overflow-auto">
        <StudentOverview
          profile={data.profile}
          applications={data.applications}
          recommended={data.recommended}
          stats={data.stats}
        />
      </main>
    </div>
=======
    <DashboardShell profile={data.profile} title="Student dashboard">
      <StudentOverview
        profile={data.profile}
        applications={data.applications}
        recommended={data.recommended}
        stats={data.stats}
      />
    </DashboardShell>
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  )
}
