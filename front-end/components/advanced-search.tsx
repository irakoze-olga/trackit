'use client'

import { useState, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { listPublicOpportunities } from '@/lib/backend-api'

interface SearchFilters {
  q: string
  minSalary: string
  maxSalary: string
  remote: boolean
  minGpa: string
  skills: string
  category: string
  experience: string
  sortBy: string
}

interface Opportunity {
  id: string
  title: string
  company: string
  description: string
  salary_min?: number
  salary_max?: number
  location: string
  remote: boolean
  required_gpa?: number
  deadline: string
}

export function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    minSalary: '',
    maxSalary: '',
    remote: false,
    minGpa: '',
    skills: '',
    category: '',
    experience: '',
    sortBy: 'newest'
  })

  const [results, setResults] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await listPublicOpportunities({
        category: filters.category || undefined,
        search: filters.q || undefined,
      })

      let opportunities = payload.opportunities

      if (filters.remote) {
        opportunities = opportunities.filter((opportunity) => opportunity.is_remote)
      }

      if (filters.sortBy === 'deadline') {
        opportunities = [...opportunities].sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
      }

      setResults(
        opportunities.map((opportunity) => ({
          id: opportunity.id,
          title: opportunity.title,
          company: opportunity.organization,
          description: opportunity.description,
          location: opportunity.location || 'Remote',
          remote: opportunity.is_remote,
          deadline: opportunity.deadline,
        }))
      )
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const clearFilters = () => {
    setFilters({
      q: '',
      minSalary: '',
      maxSalary: '',
      remote: false,
      minGpa: '',
      skills: '',
      category: '',
      experience: '',
      sortBy: 'newest'
    })
    setResults([])
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Salary Range */}
            <div>
              <label className="text-sm font-medium">Min Salary ($K)</label>
              <Input
                type="number"
                value={filters.minSalary}
                onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Salary ($K)</label>
              <Input
                type="number"
                value={filters.maxSalary}
                onChange={(e) => setFilters({ ...filters, maxSalary: e.target.value })}
                placeholder="999"
              />
            </div>

            {/* GPA */}
            <div>
              <label className="text-sm font-medium">Minimum GPA</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="4"
                value={filters.minGpa}
                onChange={(e) => setFilters({ ...filters, minGpa: e.target.value })}
                placeholder="0.0"
              />
            </div>

            {/* Skills */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium">Required Skills (comma-separated)</label>
              <Input
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                placeholder="e.g., JavaScript, React, Python"
              />
            </div>

            {/* Remote */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Remote Only</span>
              </label>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Categories</option>
                <option value="internship">Internship</option>
                <option value="job">Job</option>
                <option value="scholarship">Scholarship</option>
                <option value="fellowship">Fellowship</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium">Experience Level</label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="newest">Newest</option>
                <option value="deadline">Deadline (Soon)</option>
                <option value="salary_high">Highest Salary</option>
                <option value="salary_low">Lowest Salary</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSearch} disabled={loading} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No opportunities found. Try adjusting your filters.</p>
          </div>
        )}

        {results.map((opportunity) => (
          <Card key={opportunity.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                <p className="text-sm text-muted-foreground">{opportunity.company}</p>
                <p className="text-sm mt-2">{opportunity.description}</p>
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                  <span>{opportunity.location}</span>
                  {opportunity.remote && <span className="bg-primary/10 text-primary px-2 py-1 rounded">Remote</span>}
                  {opportunity.salary_min && (
                    <span>${opportunity.salary_min}K - ${opportunity.salary_max}K</span>
                  )}
                </div>
              </div>
              <Button variant="outline">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
