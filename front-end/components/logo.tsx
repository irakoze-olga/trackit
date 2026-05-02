import { cn } from "@/lib/utils"

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
        "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25",
        sizeClasses[size]
      )}>
        {/* Calendar icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[60%] h-[60%] text-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="8" cy="14" r="1" fill="currentColor" />
          <circle cx="12" cy="14" r="1" fill="currentColor" />
          <circle cx="16" cy="14" r="1" fill="currentColor" />
          <circle cx="8" cy="18" r="1" fill="currentColor" />
          <circle cx="12" cy="18" r="1" fill="currentColor" />
          <circle cx="16" cy="18" r="1" fill="currentColor" />
        </svg>
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
