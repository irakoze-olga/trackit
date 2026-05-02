'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { OpportunityForm } from "@/components/opportunity-form"
import type { Opportunity, Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import { getCurrentUserProfile, getOpportunityForEdit } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function EditOpportunityPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)

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

    Promise.all([getCurrentUserProfile(), getOpportunityForEdit(params.id)])
      .then(([loadedProfile, loadedOpportunity]) => {
        setProfile(loadedProfile)
        setOpportunity(loadedOpportunity)
      })
      .catch(() => router.replace("/dashboard/teacher/opportunities"))
  }, [params.id, router])

  if (!profile || !opportunity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 overflow-auto">
        <OpportunityForm opportunity={opportunity} />
      </main>
    </div>
  )
}
