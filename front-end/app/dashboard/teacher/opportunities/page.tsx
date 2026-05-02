'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { TeacherOpportunities } from "@/components/teacher-opportunities"
import type { Opportunity, Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getTeacherOpportunitiesData } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function TeacherOpportunitiesPage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: Profile
    opportunities: (Opportunity & { application_count: number })[]
  } | null>(null)

  useEffect(() => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      router.replace("/auth/login")
      return
    }

    if (storedUser.role !== "teacher" && storedUser.role !== "maintainer") {
      router.replace("/dashboard/student")
      return
    }

    getTeacherOpportunitiesData()
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
    <DashboardShell profile={data.profile} title="Opportunities">
      <TeacherOpportunities opportunities={data.opportunities} />
    </DashboardShell>
  )
}
