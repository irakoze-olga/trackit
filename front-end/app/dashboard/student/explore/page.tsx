'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ExploreOpportunities } from "@/components/explore-opportunities"
import type { Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getStudentExploreData } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function StudentExplorePage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: Profile
    opportunities: {
      savedIds: string[]
      appliedIds: string[]
    }
    userId: string
  } | null>(null)

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

    getStudentExploreData()
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
        <ExploreOpportunities
          savedIds={data.opportunities.savedIds}
          appliedIds={data.opportunities.appliedIds}
          userId={data.userId}
        />
      </main>
    </div>
  )
}
