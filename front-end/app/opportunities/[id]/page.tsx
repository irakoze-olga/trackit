'use client'

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OpportunityDetail } from "@/components/opportunity-detail"
import type { Opportunity, Profile } from "@/lib/types"
import { getOpportunityDetailData, incrementOpportunityView } from "@/lib/backend-api"
import { Spinner } from "@/components/ui/spinner"

export default function OpportunityPage() {
  const params = useParams<{ id: string }>()
  const [data, setData] = useState<{
    opportunity: Opportunity
    poster?: { full_name: string; email: string; institution?: string } | null
    userProfile: Profile | null
    hasApplied: boolean
    isSaved: boolean
  } | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    getOpportunityDetailData(params.id)
      .then((payload) => {
        setData({
          ...payload,
          poster: payload.poster
            ? {
                full_name: payload.poster.full_name || payload.poster.name,
                email: payload.poster.email,
                institution: payload.poster.institution,
              }
            : null,
        })
        incrementOpportunityView(params.id).catch(() => undefined)
      })
      .catch(() => setMissing(true))
  }, [params.id])

  if (missing) {
    notFound()
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={data.userProfile} />
      <main className="flex-1">
        <OpportunityDetail
          opportunity={data.opportunity}
          poster={data.poster}
          userProfile={data.userProfile}
          hasApplied={data.hasApplied}
          isSaved={data.isSaved}
        />
      </main>
      <Footer />
    </div>
  )
}
