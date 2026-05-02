"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, RefreshCw, Shield, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OTPVerificationProps {
  email: string
  purpose?: "verification" | "login"
  onSuccess?: (data: any) => void
  onCancel?: () => void
  className?: string
}

export function OTPVerification({
  email,
  purpose = "verification",
  onSuccess,
  onCancel,
  className
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [otpId, setOtpId] = useState("")
  const [remainingTime, setRemainingTime] = useState(600) // 10 minutes
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    // Request OTP on component mount
    requestOTP()
  }, [])

  useEffect(() => {
    // Countdown timer
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [remainingTime])

  const requestOTP = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/v1/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          purpose: purpose === "login" ? "login" : "verification"
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOtpId(data.otpId)
        setRemainingTime(data.expiresIn || 600)
        setSuccess("OTP sent to your email. Please check your inbox.")
        // Focus first input
        setTimeout(() => inputRefs[0].current?.focus(), 100)
      } else {
        setError(data.message || "Failed to send OTP")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    // Only allow 6-digit numbers
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      // Focus last input
      inputRefs[5].current?.focus()
    }
  }

  const verifyOTP = async () => {
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/v1/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otpId,
          otp: otpString,
          email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("OTP verified successfully!")
        if (onSuccess) {
          onSuccess(data)
        }
      } else {
        setError(data.message || "Invalid OTP")
        setAttemptsRemaining(prev => Math.max(0, prev - 1))

        // Clear OTP inputs on error
        setOtp(["", "", "", "", "", ""])
        inputRefs[0].current?.focus()
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/v1/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          purpose: purpose === "login" ? "login" : "verification"
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOtpId(data.otpId)
        setRemainingTime(data.expiresIn || 600)
        setSuccess("OTP resent to your email")
        setOtp(["", "", "", "", "", ""])
        inputRefs[0].current?.focus()
      } else {
        setError(data.message || "Failed to resend OTP")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const isOtpComplete = otp.every(digit => digit !== "")

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">
          {purpose === "login" ? "Login with OTP" : "Verify Your Email"}
        </CardTitle>
        <CardDescription>
          We've sent a 6-digit code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="otp" className="text-sm font-medium">
            Enter verification code
          </Label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={cn(
                  "w-12 h-12 text-center text-lg font-semibold",
                  digit && "border-primary"
                )}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Time remaining: {formatTime(remainingTime)}</span>
          {attemptsRemaining < 3 && (
            <span className="text-orange-600">
              {attemptsRemaining} attempts left
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          onClick={verifyOTP}
          disabled={!isOtpComplete || isLoading || remainingTime === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>

        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={resendOTP}
            disabled={isResending || remainingTime > 540} // Don't allow resend until 1 minute passed
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Code
              </>
            )}
          </Button>

          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </CardFooter>
    </Card>
  )
}
