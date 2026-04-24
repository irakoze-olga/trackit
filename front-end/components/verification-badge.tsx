'use client'

import { Badge } from '@/components/ui/badge'
import { Check, AlertCircle } from 'lucide-react'
import { Verification, VerificationStatus } from '@/lib/types'

interface VerificationBadgeProps {
  verification?: Verification
  className?: string
}

export function VerificationBadge({ verification, className }: VerificationBadgeProps) {
  if (!verification || verification.status === 'unverified') {
    return (
      <Badge variant="outline" className={className}>
        Unverified
      </Badge>
    )
  }

  if (verification.status === 'verified') {
    return (
      <Badge variant="default" className="bg-success text-white gap-1" title={verification.notes}>
        <Check className="h-3 w-3" />
        Verified
      </Badge>
    )
  }

  if (verification.status === 'flagged') {
    return (
      <Badge variant="destructive" className="gap-1" title={verification.notes}>
        <AlertCircle className="h-3 w-3" />
        Flagged
      </Badge>
    )
  }

  return null
}
