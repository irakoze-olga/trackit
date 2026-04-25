import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">About TrackIt</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          TrackIt was built to bridge the gap between ambitious students and life-changing opportunities. 
          We believe that every student deserves to know about scholarships, internships, and workshops 
          that can help them succeed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Why TrackIt?</h2>
          <p className="text-muted-foreground">
            Searching for opportunities is time-consuming and fragmented. Important deadlines are often 
            missed because they are buried in obscure websites or email threads.
          </p>
          <p className="text-muted-foreground">
            TrackIt centralizes this process, allowing you to discover, save, and track your applications 
            all in one beautiful interface.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">What We Offer</h2>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Curated list of international and local scholarships</li>
            <li>Real-time application status tracking</li>
            <li>Automated deadline reminders</li>
            <li>Direct connection between mentors and students</li>
            <li>Community-driven opportunity sharing</li>
          </ul>
        </div>
      </div>

      <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start tracking?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Join thousands of students who are already using TrackIt to manage their future.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">Create Account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/search">Browse Opportunities</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
