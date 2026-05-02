export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: April 25, 2026</p>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing and using TrackIt, you agree to be bound by these Terms of Service and all applicable laws 
            and regulations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. User Conduct</h2>
          <p>
            You agree to provide accurate information when creating an account and applying for opportunities. 
            You are responsible for maintaining the confidentiality of your account credentials.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. Intellectual Property</h2>
          <p>
            The content on TrackIt, including text, graphics, logos, and software, is the property of TrackIt or its 
            content suppliers and is protected by copyright laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Limitation of Liability</h2>
          <p>
            TrackIt provides the platform "as is" and is not responsible for the accuracy of external opportunities 
            posted by third parties or the outcome of any applications.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account for any violation of these terms or for 
            any other reason at our sole discretion.
          </p>
        </section>
      </div>
    </div>
  )
}
