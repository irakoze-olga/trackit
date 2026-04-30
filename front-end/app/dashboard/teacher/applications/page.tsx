'use client'

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { TeacherApplications } from "@/components/teacher-applications"
import type { Application, Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getTeacherApplicationsData } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

function TeacherApplicationsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get("opportunity") || undefined
  const [data, setData] = useState<{
    profile: Profile
    applications: (Application & {
      opportunities: { id: string; title: string; category: string }
      profiles: {
        id: string
        full_name: string
        email: string
        institution: string
        field_of_study: string
      }
    })[]
    opportunities: { id: string; title: string }[]
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

    getTeacherApplicationsData(filter)
      .then(setData)
      .catch(() => router.replace("/auth/login"))
  }, [filter, router])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <DashboardShell profile={data.profile} title="Applications">
      <TeacherApplications
        applications={data.applications}
        opportunities={data.opportunities}
        currentFilter={filter}
      />
    </DashboardShell>
  )
}

export default function TeacherApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Spinner className="h-5 w-5" />
        </div>
      }
    >
      <TeacherApplicationsPageContent />
    </Suspense>
  )
}
