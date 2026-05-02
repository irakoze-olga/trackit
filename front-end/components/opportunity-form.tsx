"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import type { Opportunity, OpportunityCategory } from "@/lib/types"
import { AlertCircle, ArrowLeft, Save, Send, Link2, Upload, Globe } from "lucide-react"
import { toast } from "sonner"
import { createOpportunity, updateOpportunity } from "@/lib/backend-api"

interface OpportunityFormProps {
  opportunity?: Opportunity
}

const categories: { value: OpportunityCategory; label: string }[] = [
  { value: "scholarship", label: "Scholarship" },
  { value: "internship", label: "Internship" },
  { value: "job", label: "Job" },
  { value: "competition", label: "Competition" },
  { value: "workshop", label: "Workshop" },
  { value: "grant", label: "Grant" },
  { value: "fellowship", label: "Fellowship" },
  { value: "other", label: "Other" },
]

export function OpportunityForm({ opportunity }: OpportunityFormProps) {
  const router = useRouter()
  const isEditing = !!opportunity

  const [formData, setFormData] = useState({
    application_url: opportunity?.application_url || "",
    category: opportunity?.category || ("scholarship" as OpportunityCategory),
    deadline: opportunity?.deadline ? new Date(opportunity.deadline).toISOString().split("T")[0] : "",
    image_url: opportunity?.image_url || "",
    scrapedData: {
      title: opportunity?.title || "",
      description: opportunity?.description || "",
      organization: opportunity?.organization || "",
      location: opportunity?.location || "",
      eligibility: opportunity?.eligibility || "",
      requirements: opportunity?.requirements || "",
      benefits: opportunity?.benefits || "",
    }
  })

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(opportunity?.image_url || null)

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleScrapedDataChange(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      scrapedData: { ...prev.scrapedData, [field]: value }
    }))
  }

  async function scrapeLinkData(url: string) {
    if (!url.trim()) return

    setScraping(true)
    try {
      // Create a simple scraper function
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          handleScrapedDataChange('title', data.title || '')
          handleScrapedDataChange('description', data.description || '')
          handleScrapedDataChange('organization', data.organization || '')
          setImagePreview(data.image || null)
          handleChange('image_url', data.image || '')
          toast.success('Link data scraped successfully!')
        }
      }
    } catch (error) {
      toast.error('Failed to scrape link data')
    } finally {
      setScraping(false)
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      // For now, create a preview URL (in production, upload to cloud storage)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        handleChange('image_url', result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(status: "draft" | "active") {
    setError(null)

    if (!formData.application_url.trim()) {
      setError("Application URL is required")
      return
    }
    if (!formData.deadline) {
      setError("Deadline is required")
      return
    }
    if (!formData.scrapedData.title.trim()) {
      setError("Title is required (scraped from link or entered manually)")
      return
    }
    if (!formData.scrapedData.description.trim()) {
      setError("Description is required (scraped from link or entered manually)")
      return
    }

    const isPublishing = status === "active"
    if (isPublishing) {
      setPublishing(true)
    } else {
      setSaving(true)
    }

    try {
      const submissionData = {
        ...formData.scrapedData,
        category: formData.category,
        deadline: formData.deadline,
        application_url: formData.application_url,
        image_url: formData.image_url,
        is_remote: formData.scrapedData.location === "Remote" || !formData.scrapedData.location,
        status,
      }

      if (isEditing && opportunity) {
        await updateOpportunity(opportunity.id, submissionData)
        toast.success(isPublishing ? "Opportunity published!" : "Changes saved")
      } else {
        await createOpportunity(submissionData)
        toast.success(isPublishing ? "Opportunity published!" : "Draft saved")
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save opportunity")
      setSaving(false)
      setPublishing(false)
      return
    }

    router.push("/dashboard/teacher/opportunities")
    router.refresh()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/teacher/opportunities"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Opportunities
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Opportunity" : "Post New Opportunity"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing
            ? "Update the opportunity details"
            : "Paste a link to automatically extract opportunity details"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
          <CardDescription>
            Paste a link to automatically extract opportunity information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="application_url">Opportunity Link *</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="application_url"
                  type="url"
                  placeholder="https://example.com/opportunity"
                  value={formData.application_url}
                  onChange={(e) => handleChange("application_url", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => scrapeLinkData(formData.application_url)}
                  disabled={scraping || !formData.application_url.trim()}
                >
                  {scraping ? <Spinner className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  {scraping ? "Scraping..." : "Extract"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste the link to the opportunity page and we'll extract the details automatically
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category *</FieldLabel>
              <Select
                value={formData.category}
                onValueChange={(v) => handleChange("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="deadline">Application Deadline *</FieldLabel>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="title">Title *</FieldLabel>
              <Textarea
                id="title"
                placeholder="Opportunity title (will be auto-extracted from link)"
                rows={2}
                value={formData.scrapedData.title}
                onChange={(e) => handleScrapedDataChange("title", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="organization">Organization *</FieldLabel>
              <Input
                id="organization"
                placeholder="Organization name (will be auto-extracted from link)"
                value={formData.scrapedData.organization}
                onChange={(e) => handleScrapedDataChange("organization", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <Textarea
                id="description"
                placeholder="Detailed description (will be auto-extracted from link)"
                rows={5}
                value={formData.scrapedData.description}
                onChange={(e) => handleScrapedDataChange("description", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                placeholder="e.g., Kigali, Rwanda or Remote"
                value={formData.scrapedData.location}
                onChange={(e) => handleScrapedDataChange("location", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="eligibility">Eligibility</FieldLabel>
              <Textarea
                id="eligibility"
                placeholder="Who can apply? (will be auto-extracted from link)"
                rows={3}
                value={formData.scrapedData.eligibility}
                onChange={(e) => handleScrapedDataChange("eligibility", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="requirements">Requirements</FieldLabel>
              <Textarea
                id="requirements"
                placeholder="What are the requirements? (will be auto-extracted from link)"
                rows={3}
                value={formData.scrapedData.requirements}
                onChange={(e) => handleScrapedDataChange("requirements", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="benefits">Benefits</FieldLabel>
              <Textarea
                id="benefits"
                placeholder="What does the candidate get? (will be auto-extracted from link)"
                rows={3}
                value={formData.scrapedData.benefits}
                onChange={(e) => handleScrapedDataChange("benefits", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Cover Image</FieldLabel>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Opportunity cover"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImagePreview(null)
                      handleChange('image_url', '')
                    }}
                    disabled={!imagePreview}
                  >
                    Remove
                  </Button>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a cover image for the opportunity. Recommended size: 1200x630px
                </p>
              </div>
            </Field>
          </FieldGroup>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={saving || publishing}
              className="flex-1"
            >
              {saving ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("active")}
              disabled={saving || publishing}
              className="flex-1"
            >
              {publishing ? <Spinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              {isEditing ? "Update & Publish" : "Publish Opportunity"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
