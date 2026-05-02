"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { registerTeacherWithInvite } from "@/lib/backend-api"

export default function TeacherInvitePage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [institution, setInstitution] = useState("Rwanda Coding Academy")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      await registerTeacherWithInvite({
        fullName,
        email,
        password,
        institution,
        inviteToken: params.token,
      })
      router.push("/auth/login")
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Unable to complete registration")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-flex justify-center">
            <Logo />
          </Link>
          <CardTitle>Teacher invite</CardTitle>
          <CardDescription>Complete your RCA TrackIt teacher account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="institution">Institution</FieldLabel>
                <Input id="institution" value={institution} onChange={(event) => setInstitution(event.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-5 pt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              Complete registration
            </Button>
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
