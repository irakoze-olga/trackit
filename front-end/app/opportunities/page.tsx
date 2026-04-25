'use client'

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { OpportunitiesPage } from "@/components/opportunities-page"
import type { Opportunity } from "@/lib/types"
import { listPublicOpportunities } from "@/lib/backend-api"
import { getStoredUser } from "@/lib/backend-auth"

function AllOpportunitiesPageContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || undefined
  const search = searchParams.get("search") || undefined
  const [data, setData] = useState<{
    opportunities: Opportunity[]
    savedIds: string[]
    appliedIds: string[]
    userId?: string
  } | null>(null)

  useEffect(() => {
    listPublicOpportunities({
      category,
      search,
      authAware: true,
    }).then((payload) => {
      const storedUser = getStoredUser()
      setData({
        ...payload,
        userId: storedUser?.id,
      })
    })
  }, [category, search])

  return (
    <OpportunitiesPage
      opportunities={data?.opportunities || []}
      savedIds={data?.savedIds || []}
      appliedIds={data?.appliedIds || []}
      userId={data?.userId}
      initialCategory={category}
      initialSearch={search}
    />
  )
}

export default function AllOpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AllOpportunitiesPageContent />
    </Suspense>
  )
}
