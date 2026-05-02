'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
<<<<<<< HEAD
import { DashboardSidebar } from "@/components/dashboard-sidebar"
=======
import { DashboardShell } from "@/components/dashboard-shell"
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
import { SavedOpportunities } from "@/components/saved-opportunities"
import type { Opportunity, Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getStudentSavedData } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function StudentSavedPage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: Profile
    opportunities: (Opportunity & { saved_id: string })[]
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

    getStudentSavedData()
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
<<<<<<< HEAD
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={data.profile} />
      <main className="flex-1 overflow-auto">
        <SavedOpportunities opportunities={data.opportunities} userId={data.profile.id} />
      </main>
    </div>
=======
    <DashboardShell profile={data.profile} title="Saved opportunities">
      <SavedOpportunities opportunities={data.opportunities} userId={data.profile.id} />
    </DashboardShell>
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  )
}
