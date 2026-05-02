'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TeacherAnalytics } from "@/components/teacher-analytics"
import type { Opportunity, Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getTeacherAnalyticsData } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function TeacherAnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: Profile
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
  } | null>(null)

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

    getTeacherAnalyticsData()
      .then(setData)
      .catch(() => router.replace("/auth/login"))
  }, [router])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={data.profile} />
      <main className="flex-1 overflow-auto">
        <TeacherAnalytics
          opportunities={data.opportunities}
          applicationStats={data.applicationStats}
          totalViews={data.totalViews}
        />
      </main>
    </div>
  )
}
