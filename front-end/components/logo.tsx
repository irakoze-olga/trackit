import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "relative overflow-hidden rounded-xl border bg-background shadow-sm",
        sizeClasses[size]
      )}>
        <Image src="/icon.svg" alt="TrackIt" fill className="object-cover p-1" sizes="56px" />
      </div>
      {showText && (
        <span className={cn(
          "font-bold tracking-tight text-foreground",
          textSizes[size]
        )}>
          Track<span className="text-primary">It</span>
        </span>
      )}
    </div>
  )
}
