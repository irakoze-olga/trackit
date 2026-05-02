import { Logo } from "@/components/logo"

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" showText={false} />
        <div className="h-1 w-36 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
