"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { signUpWithBackend } from "@/lib/backend-api"
import { AlertCircle, ArrowLeft, Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [institution, setInstitution] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (role === "student" && (!age || Number.isNaN(Number(age)))) {
      setError("Age is required for students")
      return
    }

    setLoading(true)

    try {
      await signUpWithBackend({
        fullName,
        email,
        password,
        role,
        age: role === "student" ? Number(age) : undefined,
        institution: institution || undefined,
        fieldOfStudy: role === "student" ? fieldOfStudy || undefined : undefined,
      })
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : "Unable to create account")
      setLoading(false)
      return
    }

    router.push("/auth/sign-up-success")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Logo />
          </Link>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join TrackIt and discover opportunities</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <Field>
              <FieldLabel>I am a</FieldLabel>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as "student" | "teacher")} className="grid grid-cols-2 gap-8 mt-2">
                <div>
                  <RadioGroupItem value="student" id="student" className="peer sr-only" />
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <GraduationCap className="mb-2 h-6 w-6" />
                    <span className="font-medium">Student</span>
                    <span className="text-xs text-muted-foreground">Looking for opportunities</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                  <Label
                    htmlFor="teacher"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <BookOpen className="mb-2 h-6 w-6" />
                    <span className="font-medium">Teacher</span>
                    <span className="text-xs text-muted-foreground">Posting opportunities</span>
                  </Label>
                </div>
              </RadioGroup>
            </Field>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="institution">Institution (Optional)</FieldLabel>
                <Input
                  id="institution"
                  type="text"
                  placeholder="University of Example"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  disabled={loading}
                />
              </Field>

              {role === "student" && (
                <>
                  <Field>
                    <FieldLabel htmlFor="age">Age</FieldLabel>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      placeholder="18"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required={role === "student"}
                      disabled={loading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="fieldOfStudy">Field of Study (Optional)</FieldLabel>
                    <Input
                      id="fieldOfStudy"
                      type="text"
                      placeholder="Computer Science"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      disabled={loading}
                    />
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </Button>


            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>

            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
