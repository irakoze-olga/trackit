'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
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

    if (storedUser.role !== "teacher" && storedUser.role !== "maintainer") {
      router.replace(storedUser.role === "admin" ? "/dashboard/admin" : "/dashboard/student")
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
    <DashboardShell profile={profile} title="New opportunity">
      <OpportunityForm />
    </DashboardShell>
  )
}
