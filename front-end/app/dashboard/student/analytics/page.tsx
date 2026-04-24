'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { StudentAnalyticsDashboard } from "@/components/student-analytics-dashboard"
import type { Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getCurrentUserProfile } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function StudentAnalyticsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)

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

    getCurrentUserProfile()
      .then(setProfile)
      .catch(() => router.replace("/auth/login"))
  }, [router])

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your application progress and success metrics
          </p>
        </div>
        <StudentAnalyticsDashboard />
      </main>
    </div>
  )
}
