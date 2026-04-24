"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import type { Profile } from "@/lib/types"
import { AlertCircle, Save, LogOut } from "lucide-react"
import { toast } from "sonner"
import { clearAuthSession } from "@/lib/backend-auth"
import { updateCurrentUserProfile } from "@/lib/backend-api"

interface ProfileSettingsProps {
  profile: Profile
}

export function ProfileSettings({ profile: initialProfile }: ProfileSettingsProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleChange(field: keyof Profile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setError(null)
    setSaving(true)

    try {
      const updatedProfile = await updateCurrentUserProfile(profile)
      setProfile(updatedProfile)
      toast.success("Profile updated successfully")
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update profile")
      setSaving(false)
      return
    }

    setSaving(false)
    router.refresh()
  }

  async function handleSignOut() {
    clearAuthSession()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and profile settings</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </Field>

            <Field>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  value={profile.full_name || profile.name || ""}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                />
            </Field>

            <Field>
              <FieldLabel htmlFor="institution">Institution</FieldLabel>
              <Input
                id="institution"
                placeholder="e.g., University of Example"
                value={profile.institution || ""}
                onChange={(e) => handleChange("institution", e.target.value)}
              />
            </Field>

            {profile.role === "student" && (
              <Field>
                <FieldLabel htmlFor="fieldOfStudy">Field of Study</FieldLabel>
                <Input
                  id="fieldOfStudy"
                  placeholder="e.g., Computer Science"
                  value={profile.field_of_study || ""}
                  onChange={(e) => handleChange("field_of_study", e.target.value)}
                />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                placeholder="Tell us a little about yourself..."
                rows={4}
                value={profile.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
              />
            </Field>
          </FieldGroup>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Role</p>
              <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
