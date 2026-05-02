'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
<<<<<<< HEAD
import { DashboardSidebar } from "@/components/dashboard-sidebar"
=======
import { DashboardShell } from "@/components/dashboard-shell"
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
import { OpportunityForm } from "@/components/opportunity-form"
import type { Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getCurrentUserProfile } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function NewOpportunityPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      router.replace("/auth/login")
      return
    }

<<<<<<< HEAD
    if (storedUser.role !== "teacher") {
      router.replace("/dashboard/student")
=======
    if (storedUser.role !== "teacher" && storedUser.role !== "maintainer") {
      router.replace(storedUser.role === "admin" ? "/dashboard/admin" : "/dashboard/student")
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
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
<<<<<<< HEAD
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 overflow-auto">
        <OpportunityForm />
      </main>
    </div>
=======
    <DashboardShell profile={profile} title="New opportunity">
      <OpportunityForm />
    </DashboardShell>
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  )
}
