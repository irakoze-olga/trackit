"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { AlertCircle, ArrowLeft, Save, Send } from "lucide-react"
import { toast } from "sonner"
import { createOpportunity, updateOpportunity } from "@/lib/backend-api"
import { getStoredUser } from "@/lib/backend-auth"

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
    title: opportunity?.title || "",
    description: opportunity?.description || "",
    category: opportunity?.category || ("scholarship" as OpportunityCategory),
    organization: opportunity?.organization || "",
    location: opportunity?.location || "",
    is_remote: opportunity?.is_remote || false,
    deadline: opportunity?.deadline ? new Date(opportunity.deadline).toISOString().split("T")[0] : "",
    eligibility: opportunity?.eligibility || "",
    requirements: opportunity?.requirements || "",
    benefits: opportunity?.benefits || "",
    application_url: opportunity?.application_url || "",
  })

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(status: "draft" | "active") {
    setError(null)

    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return
    }
    if (!formData.organization.trim()) {
      setError("Organization is required")
      return
    }
    if (!formData.deadline) {
      setError("Deadline is required")
      return
    }

    const isPublishing = status === "active"
    if (isPublishing) {
      setPublishing(true)
    } else {
      setSaving(true)
    }

    try {
      if (isEditing && opportunity) {
        await updateOpportunity(opportunity.id, {
          ...formData,
          status,
        })
        toast.success(isPublishing ? "Opportunity published!" : "Changes saved")
      } else {
        await createOpportunity({
          ...formData,
          status,
        })
        toast.success(isPublishing ? "Opportunity published!" : "Draft saved")
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save opportunity")
        setSaving(false)
        setPublishing(false)
        return
    }

    const storedUser = getStoredUser()
    router.push(storedUser?.role === "student" ? "/dashboard/student" : "/dashboard/teacher/opportunities")
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
            ? "Update the details of your opportunity"
            : "Fill in the details to create a new opportunity listing"}
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
            Provide comprehensive information to attract the right candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title *</FieldLabel>
              <Input
                id="title"
                placeholder="e.g., Summer Research Internship 2024"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
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
              <FieldLabel htmlFor="organization">Organization *</FieldLabel>
              <Input
                id="organization"
                placeholder="e.g., University of Technology"
                value={formData.organization}
                onChange={(e) => handleChange("organization", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the opportunity..."
                rows={5}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  placeholder="e.g., New York, NY"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
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
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_remote"
                checked={formData.is_remote}
                onCheckedChange={(checked) => handleChange("is_remote", !!checked)}
              />
              <Label htmlFor="is_remote">This opportunity is remote-friendly</Label>
            </div>

            <Field>
              <FieldLabel htmlFor="eligibility">Eligibility</FieldLabel>
              <Textarea
                id="eligibility"
                placeholder="Who can apply? e.g., Undergraduate students in STEM fields..."
                rows={3}
                value={formData.eligibility}
                onChange={(e) => handleChange("eligibility", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="requirements">Requirements</FieldLabel>
              <Textarea
                id="requirements"
                placeholder="What are the requirements? e.g., Resume, cover letter, transcripts..."
                rows={3}
                value={formData.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="benefits">Benefits</FieldLabel>
              <Textarea
                id="benefits"
                placeholder="What does the candidate get? e.g., Stipend, mentorship, certificate..."
                rows={3}
                value={formData.benefits}
                onChange={(e) => handleChange("benefits", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="application_url">External Application URL</FieldLabel>
              <Input
                id="application_url"
                type="url"
                placeholder="https://example.com/apply"
                value={formData.application_url}
                onChange={(e) => handleChange("application_url", e.target.value)}
              />
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
