'use client'

import { AdvancedSearch } from '@/components/advanced-search'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Search Opportunities</h1>
          <p className="text-muted-foreground mt-2">
            Find the perfect opportunity that matches your skills and goals
          </p>
        </div>
        <AdvancedSearch />
      </div>
    </div>
  )
}
