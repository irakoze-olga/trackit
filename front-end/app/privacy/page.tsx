export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: April 25, 2026</p>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            When you register for TrackIt, we collect information such as your name, email address, and role (student or teacher). 
            If you apply for opportunities, we may collect additional information required for the application.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide and improve our services, communicate with you about your account, 
            and send you notifications regarding your applications and new opportunities.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. Information Sharing</h2>
          <p>
            We do not sell your personal information to third parties. We may share your information with institutions 
            offering opportunities only when you explicitly apply to those opportunities.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. However, no method 
            of transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time through your account 
            settings or by contacting us.
          </p>
        </section>
      </div>
    </div>
  )
}
