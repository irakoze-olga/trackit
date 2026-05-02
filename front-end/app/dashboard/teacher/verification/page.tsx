'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Opportunity, Profile } from '@/lib/types'
import { getStoredUser } from '@/lib/backend-auth'
import { getTeacherOpportunitiesData } from '@/lib/backend-api'
import { Spinner } from '@/components/ui/spinner'

export default function VerificationQueuePage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: Profile
    opportunities: (Opportunity & { application_count: number })[]
  } | null>(null)

  useEffect(() => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      router.replace('/auth/login')
      return
    }

    if (storedUser.role !== 'teacher') {
      router.replace('/dashboard/student')
      return
    }

    getTeacherOpportunitiesData()
      .then(setData)
      .catch(() => router.replace('/dashboard/teacher'))
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
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Opportunity Review</h1>
          <p className="text-muted-foreground mt-2">
            Review the publishing status of your opportunities using live backend data.
          </p>
        </div>

        <div className="space-y-4">
          {data.opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                  <p className="text-sm text-muted-foreground">{opportunity.organization}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {opportunity.application_count} applications, {opportunity.views_count} views
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {opportunity.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
